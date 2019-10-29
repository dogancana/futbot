import { AxiosError } from 'axios';
import { uniqBy } from 'lodash';
import { fut } from '../../api';
import { envConfig } from '../../config';
import { Job } from '../../jobs';
import { getLogger } from '../../logger';
import { playerService } from '../../player';
import { getOptimalSellPrice } from '../../pricing';
import { tradePrice } from '../../trader/trade-utils';
import { investService } from '../invest-service';

const logger = getLogger('LowPlayersJob');

const BUY_REFERENCE_PERCT = (100 - envConfig().FUTBOT_PROFIT_MARGIN) / 100;
const MAX_AUCTION_TRY = envConfig().FUTBOT_FUT_MAX_AUCTION_TRY_PER_PLAYER;
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
    super('LowPlayerInvestor', envConfig().FUTBOT_JOB_IMP_INVEST_LOW_PLAYERS);

    Object.assign(this, {
      min,
      max,
      budget,
      maxTargetPool
    });

    this.boughtPlayers = [];
    this.setTask(this.loopOverTargets);
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
      // no need to await for setup targets
      setupTargets(
        `${this.min}-${this.max}`,
        this.maxTargetPool || MAX_TARGET_POOL
      );
      // dummy execution time
      await new Promise(resolve => setTimeout(resolve, 5000));
      return;
    }

    if (this.budget < this.min) {
      this.stop();
      this.finished = true;
      this.finish();
      return;
    }

    const target = targets.shift();
    const playerStr = playerService.readable({ assetId: target.assetId });
    const sellPrice = await getOptimalSellPrice(target.resourceId);
    if (!sellPrice) {
      logger.info(`Skipping ${playerStr}: missing price information`);
      return;
    }

    const triedAuctions = [];
    const safeBuyValue = tradePrice(
      sellPrice.startingBid * BUY_REFERENCE_PERCT
    );

    let batch = 0;
    while (true) {
      if (batch >= MAX_AUCTION_TRY) {
        break;
      }

      logger.info(
        `Trying to find ${playerStr} for cheaper than ${safeBuyValue} buy now price.`
      );

      batch++;
      let auctions = (await fut.queryMarket(
        {
          resourceId: target.resourceId,
          maxb: tradePrice(safeBuyValue, 'floor')
        },
        batch
      ))
        .filter(a => !a.watched)
        .filter(a => !a.tradeOwner)
        .filter(a => a.buyNowPrice <= safeBuyValue)
        .filter(a => a.expires > 1800)
        .filter(a => -1 === triedAuctions.indexOf(a.tradeId));

      auctions = auctions.sort((a, b) => a.buyNowPrice - b.buyNowPrice);
      if (auctions.length === 0) {
        continue;
      }

      const lowest = auctions[0];
      if (lowest.buyNowPrice <= safeBuyValue) {
        if (this.budget <= lowest.buyNowPrice) {
          break;
        }

        triedAuctions.push(lowest.tradeId);
        try {
          logger.info(`bid ${playerStr} with ${lowest.buyNowPrice}`);
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
            `bid error for ${playerStr} with bid ${lowest.buyNowPrice}. Reason: ${err}`
          );
        }
      }
    }
  }
}

async function setupTargets(price: string, maxTargets: number) {
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
      logger.info(`Setting up targets ${targets.length}/${maxTargets}`);
      targets = targets.concat(
        await investService.getTargets({
          page: i,
          [priceKey]: price,
          [prpKey]: '20,100'
        })
      );
    }

    targets = uniqBy(targets, t => t.resourceId);
    targets = targets.filter(t => !isInClubPlayers(t.resourceId));
    logger.info(`${targets.length} targets set up`);
    setingUp = false;
  } catch (e) {
    logger.error(`setup targets error: ${e}`);
  }
}
