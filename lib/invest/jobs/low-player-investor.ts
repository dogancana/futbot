import { AxiosError } from 'axios';
import { uniqBy } from 'lodash';
import { fut } from '../../api';
import { envConfig } from '../../config';
import { Job } from '../../jobs';
import { logger } from '../../logger';
import { playerService } from '../../player';
import { getOptimalSellPrice } from '../../pricing';
import { tradePrice } from '../../trader/trade-utils';
import { investService } from '../invest-service';

const BUY_REFERENCE_PERCT = (100 - envConfig().FUTBOT_PROFIT_MARGIN) / 100;
const MAX_AUCTION_TRY = envConfig().FUTBOT_FUT_MAX_AUCTION_TRY_PER_PLAYER;
const MIN_TARGET_PRICE = 1000;
const MAX_TARGET_PRICE = 4000;
const MAX_TARGET_POOL = 30;

// calculate the number of jobs per minute: fut-requests per sec / auctions & price-queries
const TIMES_PER_MIN = Math.floor(
  (parseFloat(process.env.FUTBOT_FUT_REQUESTS_PER_SEC) * 60) /
    (2 + MAX_AUCTION_TRY)
);

let targets: investService.TargetInfo[] = [];
let setingUp = false;

export interface LowPlayerInvestorProps {
  budget: number;
  min?: number;
  max?: number;
  maxTargetPool?: number;
  player?: number;
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
  private player: number = 0;

  constructor({
    budget,
    min,
    max,
    maxTargetPool,
    player
  }: LowPlayerInvestorProps) {
    super(LowPlayerInvestor.jobName, TIMES_PER_MIN);

    Object.assign(this, {
      min,
      max,
      budget,
      maxTargetPool,
      player
    });

    this.boughtPlayers = [];
    this.start(this.loopOverTargets);
  }

  public report() {
    return {
      min: this.min,
      max: this.max,
      profitMargin: envConfig().FUTBOT_PROFIT_MARGIN,
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
    if (!targets || targets.length === 0) {
      setupTargets(
        `${this.min}-${this.max}`,
        this.maxTargetPool || MAX_TARGET_POOL,
        this.player
      );
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
    if (!sellPrice) {
      logger.info(
        `${LowPlayerInvestor.jobName} Skipping ${playerStr}: missing price information`
      );
      return;
    }

    const maxAuctionTry = !this.player ? MAX_AUCTION_TRY : MAX_AUCTION_TRY * 2;
    const safeBuyValue = sellPrice.buyNowPrice * BUY_REFERENCE_PERCT;

    let batch = 0;
    while (true) {
      if (batch >= maxAuctionTry) {
        break;
      }

      logger.info(
        `Trying to find ${playerService.readable(
          target
        )} for cheaper than ${safeBuyValue} buy now price.`
      );

      batch++;
      let auctions = (await fut.getPlayerTransferData(target.resourceId, 0, {
        maxb: tradePrice(safeBuyValue)
      }))
        .filter(a => !a.watched)
        .filter(a => !a.tradeOwner)
        .filter(a => a.buyNowPrice <= safeBuyValue)
        .filter(a => a.expires > 1800);

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
      }
    }
  }
}

async function setupTargets(
  price: string,
  maxTargets: number,
  player?: number
) {
  if (setingUp) {
    return;
  }

  try {
    setingUp = true;
    const pageLimit = Math.ceil(maxTargets / 30);
    const platform = await fut.getPlatform();
    const priceKey = `${platform.toLowerCase()}_price`;
    const prpKey = `${platform.toLowerCase()}_prp`;
    const clubPlayers = await fut.getClubPlayers();
    const isInClubPlayers = (resourceId: number) =>
      clubPlayers.filter(p => p.resourceId === resourceId).length > 0;

    for (let i = 1; i <= pageLimit; i++) {
      logger.info(
        `[${LowPlayerInvestor.jobName}]: Setting up targets ${targets.length}/${maxTargets}`
      );
      targets = targets.concat(
        await investService.getTargets(
          {
            page: i,
            [priceKey]: price,
            [prpKey]: '20,100'
          },
          player
        )
      );
    }

    targets = uniqBy(targets, t => t.resourceId);
    targets = targets.filter(t => !isInClubPlayers(t.resourceId));
    logger.info(
      `${LowPlayerInvestor.jobName} ${targets.length} targets set up`
    );
    setingUp = false;
  } catch (e) {
    logger.error(`${LowPlayerInvestor.jobName} setup targets error: ${e}`);
  }
}
