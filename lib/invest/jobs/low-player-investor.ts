import { AxiosError } from 'axios';
import { uniq } from 'lodash';
import { fut } from '../../api';
import { Job } from '../../jobs';
import { logger } from '../../logger';
import { playerService } from '../../player';
import { getOptimalSellPrice, tradePrice } from '../../trader/trade-utils';
import { investService } from '../invest-service';

const BUY_REFERENCE_PERCT = 0.8;
const MAX_AUCTION_TRY =
  parseInt(process.env.FUTBOT_FUT_MAX_AUCTION_TRY_PER_PLAYER, 10) || 3;
const MIN_TARGET_PRICE = 1000;
const MAX_TARGET_PRICE = 4000;
const MAX_TARGET_POOL = 30;

let targets: investService.TargetInfo[] = [];
let setingUp = false;

export interface LowPlayerInvestorProps {
  budget: number;
  min?: number;
  max?: number;
  maxTargetPool?: number;
}

export class LowPlayerInvestor extends Job {
  public static jobName = 'Invest:LowPlayerInvestor';
  private spent: number = 0;
  private budget: number = 20000;
  private boughtPlayers: Array<{
    price: number;
    assetId: number;
    buyNowPrice: number;
    startingBid: number;
  }>;
  private min: number = MIN_TARGET_PRICE;
  private max: number = MAX_TARGET_PRICE;
  private maxTargetPool: number = MAX_TARGET_POOL;

  constructor({ budget, min, max, maxTargetPool }: LowPlayerInvestorProps) {
    super(
      LowPlayerInvestor.jobName,
      1 // per min. Avg ex time 16s
    );

    Object.assign(this, {
      min,
      max,
      budget,
      maxTargetPool
    });

    this.boughtPlayers = [];
    this.start(this.loopOverTargets);
  }

  public report() {
    return {
      budget: this.budget,
      spent: this.spent,
      boughtPlayers: this.boughtPlayers.map(p => ({
        price: p.price,
        sell: `${p.startingBid}/${p.buyNowPrice}`,
        name: playerService.readable({ assetId: p.assetId })
      }))
    };
  }

  public targetCount() {
    return {
      count: targets.length
    };
  }

  private async loopOverTargets() {
    const pcPrice = `${this.min}-${this.max}`;

    if (!targets || targets.length === 0) {
      // no need to await for setup targets
      setupTargets(pcPrice, this.maxTargetPool || MAX_TARGET_POOL);
      return;
    }

    if (this.budget < this.min) {
      this.stop();
      this.finished = true;
      investService.clearLowPlayerInvest();
      return;
    }

    const target = targets.shift();
    const playerStr = playerService.readable({ assetId: target.assetId });
    const sellPrice = await getOptimalSellPrice(target.resourceId);
    if (!sellPrice.buyNowPrice || !sellPrice.startingBid) {
      logger.info(
        `${LowPlayerInvestor.jobName} Skipping ${playerStr}: missing price-samples`
      );
      return;
    }

    const safeBuyValue = sellPrice.startingBid * BUY_REFERENCE_PERCT;

    let batch = 0;
    while (true) {
      if (batch >= MAX_AUCTION_TRY) {
        break;
      }

      batch++;
      let auctions = (await fut.getPlayerTransferData(target.resourceId, 0, {
        maxb: tradePrice(safeBuyValue)
      }))
        .filter(a => !a.watched)
        .filter(a => !a.tradeOwner);

      auctions = auctions.sort((a, b) => a.buyNowPrice - b.buyNowPrice);
      if (auctions.length === 0) {
        continue;
      }

      const lowest = auctions[0];
      if (lowest.buyNowPrice <= safeBuyValue) {
        if (this.budget <= lowest.buyNowPrice) {
          break;
        }

        try {
          logger.info(
            `${LowPlayerInvestor.jobName} bid ${playerStr} with ${lowest.buyNowPrice}`
          );
          await fut.bidToTrade(lowest.tradeId, lowest.buyNowPrice);

          const sellTarget = await fut.waitAndGetPurchasedItem(
            target.resourceId
          );
          if (sellTarget) {
            this.boughtPlayers.push({
              ...sellPrice,
              price: lowest.buyNowPrice,
              assetId: target.assetId
            });
            this.spent += lowest.buyNowPrice;
            this.budget -= lowest.buyNowPrice;

            await fut.sellPlayer({
              ...sellPrice,
              duration: 3600,
              itemData: { id: sellTarget.id, assetId: sellTarget.assetId }
            });
          } else {
            logger.info(`${playerStr} was not found in purchased list`);
          }
        } catch (e) {
          const err: AxiosError = e;
          logger.error(
            `[Invest:LowPlayer]: bid error for ${playerStr} with bid ${lowest.buyNowPrice}. Reason: ${err.response.status}, ${err.response.data}`
          );
        }
        break;
      }
    }
  }
}

async function setupTargets(price: string, maxTargets: number) {
  if (setingUp) {
    return;
  }

  setingUp = true;
  const pageLimit = Math.ceil(maxTargets / 30);
  const platform = await fut.getPlatform();
  const priceKey = `${platform.toLowerCase()}_price`;
  const clubPlayers = await fut.getClubPlayers();
  const isInClubPlayers = (resourceId: number) =>
    clubPlayers.filter(p => p.resourceId === resourceId).length > 0;

  for (let i = 1; i <= pageLimit; i++) {
    targets = targets.concat(
      await investService.getTargets({
        page: i,
        [priceKey]: price
      })
    );
  }

  targets = uniq(targets);
  targets = targets.filter(t => !isInClubPlayers(t.resourceId));
  logger.info(`${LowPlayerInvestor.jobName} ${targets.length} targets set up`);
  setingUp = false;
}
