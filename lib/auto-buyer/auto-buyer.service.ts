import { StaticItems } from "./../static/static-items";
import { logger } from "../logger";
import { playerService } from "../player";
import { AutoBuyBidder, AutoBuyBuyNow } from "./jobs";

export namespace AutoBuyerService {
  let autoBuyBidderJob: AutoBuyBidder;
  let autoBuyBuyNowJob: AutoBuyBuyNow;

  export interface Target {
    assetId: number;
    resourceId: number;
    maxPrice: number;
    readable?: string;
  }

  export const targets: Target[] = [];

  export function addTarget(target: Target) {
    if (target.maxPrice < 0) {
      throw new Error("Max price cannot be negative");
    }

    const duped: Target = targets.filter(
      t => t.resourceId === target.resourceId
    )[0];
    const playerStr = playerService.readable({ id: target.assetId });

    if (!!duped) {
      logger.warn(
        `${playerStr} is already in auto buy list. Replacing price information with maxPrice=${target.maxPrice}`
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
        `${playerStr} added to list with maxPrice=${target.maxPrice}`
      );
      targets.push({
        ...target,
        readable: playerStr
      });
    }
  }

  export function startJobs() {
    if (!autoBuyBidderJob) autoBuyBidderJob = new AutoBuyBidder();
    if (!autoBuyBuyNowJob) autoBuyBuyNowJob = new AutoBuyBuyNow();

    return report();
  }

  export function stopJobs() {
    if (autoBuyBidderJob) {
      autoBuyBidderJob.stop();
      autoBuyBidderJob = undefined;
    }
    if (autoBuyBuyNowJob) {
      autoBuyBuyNowJob.stop();
      autoBuyBuyNowJob = undefined;
    }

    return report();
  }

  export function report() {
    return {
      targets,
      jobs: {
        autoBuyBidder: autoBuyBidderJob ? autoBuyBidderJob.execTime : null,
        autoBuyBuyNow: autoBuyBuyNowJob ? autoBuyBuyNowJob.execTime : null
      }
    };
  }
}
