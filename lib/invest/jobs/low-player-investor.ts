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
const MIN_TARGET_PRICE = 1000;
const MAX_TARGET_PRICE = 5000;
const MAX_TARGET_POOL = 150;
const TARGETS_TO_CHECK = 5;
const MAX_TRY_PER_TARGET = 4;

let targets: investService.TargetInfo[] = [];
let isSettingUp = false;

export interface LowPlayerInvestorProps {
  budget: number;
  min?: number;
  max?: number;
  maxTargetPool?: number;
}

export class LowPlayerInvestor extends Job {
  private spent: number = 0;
  private budget: number = 50000;
  private boughtAuctions: fut.AuctionInfo[] = [];
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

    this.setTask(this.loopOverTargets);
  }

  public report() {
    return {
      min: this.min,
      max: this.max,
      profitMargin: envConfig().FUTBOT_PROFIT_MARGIN,
      budget: this.budget,
      spent: this.spent,
      targetCount: targets.length,
      boughtAuctions: this.boughtAuctions.map(
        a => `${playerService.readable(a.itemData)} bought for ${a.buyNowPrice}`
      )
    };
  }

  private async loopOverTargets() {
    if (!targets || targets.length === 0) {
      // no need to await for setup targets
      setupTargets(
        `${this.min}-${this.max}`,
        this.maxTargetPool || MAX_TARGET_POOL
      );
      return;
    }

    if (this.budget < this.min) {
      this.stop();
      this.finished = true;
      this.finish();
      return;
    }

    for (let i = 0; i < TARGETS_TO_CHECK; i++) {
      const target = targets.shift();
      const playerStr = playerService.readable({ assetId: target.assetId });
      const sellPrice = await getOptimalSellPrice(target.resourceId);
      if (!sellPrice) {
        logger.info(`Skipping ${playerStr}: missing price information`);
        return;
      }

      const safeBuyValue = tradePrice(
        sellPrice.startingBid * BUY_REFERENCE_PERCT,
        'floor'
      );

      logger.info(
        `Trying to find ${playerStr} for cheaper than ${safeBuyValue} buy now price.`
      );

      for (let j = 0; j < MAX_TRY_PER_TARGET; j++) {
        const auctions = await playerService.searchBuyableItem(
          target.resourceId,
          safeBuyValue
        );

        if (auctions.length === 0) {
          continue;
        }

        const boughtItems = await playerService.buyNowAndHandleAuctions(
          auctions,
          sellPrice.buyNowPrice
        );

        for (const bought of boughtItems) {
          this.boughtAuctions.push(bought);
          this.budget -= bought.buyNowPrice;
          this.spent += bought.buyNowPrice;
        }
      }
    }
  }
}

async function setupTargets(price: string, maxTargets: number) {
  if (isSettingUp) {
    return;
  }

  try {
    isSettingUp = true;
    const pageLimit = Math.ceil(maxTargets / 30);
    const platform = await fut.getPlatform();
    const priceKey = `${platform.toLowerCase()}_price`;
    const prpKey = `${platform.toLowerCase()}_prp`;

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
    logger.info(`${targets.length} targets set up`);
    isSettingUp = false;
  } catch (e) {
    logger.error(`setup targets error: ${e}`);
  }
}
