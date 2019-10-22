import { getLogger } from '../logger';
import { playerService } from '../player';
import { StaticItems } from './../static/static-items';
import { AutoBuyBuyNow } from './jobs';

const logger = getLogger('AutoBuyerService');

export namespace AutoBuyerService {
  let autoBuyBuyNowJob: AutoBuyBuyNow;

  export interface Target {
    assetId: number;
    resourceId: number;
    maxPrice: number;
    sellPrice?: number;
    discardValue: number;
    readable?: string;
  }

  export const targets: Target[] = [];

  export function addTarget(target: Target) {
    if (
      !target.maxPrice ||
      !target.discardValue ||
      !target.assetId ||
      !target.resourceId
    ) {
      throw new Error(
        'Please provide maxPrice, discardValue, assetId and resourceId'
      );
    }

    if (target.maxPrice < 0) {
      throw new Error('Max price cannot be negative');
    }

    if (target.maxPrice < target.discardValue) {
      throw new Error(
        `Max price is too big for this player. Max: ${target.maxPrice}, Quick Sell: ${target.discardValue}`
      );
    }

    if (target.sellPrice < target.maxPrice) {
      throw new Error(
        `Sell price (${target.sellPrice}) cannot be smaller than target buy price ${target.maxPrice}`
      );
    }

    const duped: Target = targets.filter(
      t => t.resourceId === target.resourceId
    )[0];
    const playerStr = playerService.readable(target);

    if (!!duped) {
      logger.warn(
        `${playerStr} is already in auto buy list. Replacing price information with` +
          ` maxPrice=${target.maxPrice}, sellPrice=${target.sellPrice}`
      );
      Object.assign(duped, target);
    } else {
      const playerItemData = StaticItems.itemData[target.assetId];
      if (!playerItemData) {
        throw new Error(
          `We couldnt find the player with assetId ${target.assetId}`
        );
      }
      logger.info(
        `${playerStr} added to list with maxPrice=${target.maxPrice}, sellPrice=${target.sellPrice}`
      );
      targets.push({
        ...target,
        readable: playerStr
      });
    }

    if (!autoBuyBuyNowJob) {
      logger.info(
        `Jobs were not running but you added a target. We are starting auto buy jobs`
      );
      startJobs();
    }
  }

  export function startJobs() {
    if (!autoBuyBuyNowJob) {
      autoBuyBuyNowJob = new AutoBuyBuyNow();
    }

    return report();
  }

  export function stopJobs() {
    if (autoBuyBuyNowJob) {
      autoBuyBuyNowJob.stop();
      autoBuyBuyNowJob = undefined;
    }

    return report();
  }

  export function report() {
    return {
      targets: targets.map(
        t => `${playerService.readable(t)} for ${t.maxPrice} max price`
      ),
      jobs: {
        autoBuyBuyNow: autoBuyBuyNowJob ? autoBuyBuyNowJob.report() : null
      }
    };
  }
}
