import { AxiosError } from 'axios';
import { uniq } from 'lodash';
import { fut } from '../../api';
import { Job } from '../../jobs';
import { logger } from '../../logger';
import { playerService } from '../../player';
import { getOptimalSellPrice, tradePrice } from '../../trader/trade-utils';
import { investService } from '../invest-service';

const BUY_REFERENCE_PERCT = 0.8;
const MAX_AUCTION_TRY = 3;
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
  private boughtPlayers: Array<{ price: number; assetId: number }>;
  private min: number = 1000;
  private max: number = 5000;
  private maxTargetPool: number = 150;

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
        name: playerService.readable({ assetId: p.assetId })
      }))
    };
  }

  private async loopOverTargets() {
    const pcPrice = `${this.min}-${this.max}`;

    if (!targets || targets.length === 0) {
      setupTargets(pcPrice, this.maxTargetPool);
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
    const value = await getOptimalSellPrice(target.resourceId);
    if (!value) {
      return;
    }

    const safeBuyValue = value.startingBid * BUY_REFERENCE_PERCT;
    const price = (p: fut.AuctionInfo) =>
      p.currentBid !== 0 ? p.currentBid : p.startingBid;
    let batch = 0;
    while (true) {
      let auctions = (await fut.getPlayerTransferData(
        target.resourceId,
        batch++,
        { maxb: tradePrice(safeBuyValue) }
      ))
        .filter(a => !a.watched)
        .filter(a => !a.tradeOwner);
      auctions = auctions.sort((a, b) => a.buyNowPrice - b.buyNowPrice);

      if (auctions.length === 0) {
        break;
      }

      const lowest = auctions[0];
      const lowestTargetPrice = price(lowest);
      if (lowestTargetPrice <= safeBuyValue) {
        if (this.budget <= lowest.buyNowPrice) {
          break;
        }
        try {
          await fut.bidToTrade(lowest.tradeId, lowest.buyNowPrice);
          logger.info(
            `${LowPlayerInvestor.jobName} bid ${playerStr} with ${lowest.buyNowPrice}`
          );
          this.boughtPlayers.push({
            price: lowest.buyNowPrice,
            assetId: target.assetId
          });
          this.spent += lowest.buyNowPrice;
          this.budget -= lowest.buyNowPrice;

          const sellTarget = await fut.waitAndGetPurchasedItem(
            target.resourceId
          );
          if (sellTarget) {
            await fut.sellPlayer({
              ...(await getOptimalSellPrice(target.resourceId)),
              duration: 3600,
              itemData: { id: sellTarget.id, assetId: sellTarget.assetId }
            });
          } else {
            logger.info(`${playerStr} was not found in purchased list`);
          }
        } catch (e) {
          const err: AxiosError = e;
          logger.error(
            `[Invest:LowPlayer]: bid error for ${playerService.readable(
              lowest.itemData
            )} with bid ${lowest.buyNowPrice}. Reason: ${
              err.response.status
            }, ${err.response.data}`
          );
        }
        break;
      }

      if (batch > MAX_AUCTION_TRY) {
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
    clubPlayers.find(p => p.resourceId === resourceId);

  for (let i = 0; i < pageLimit; i++) {
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
