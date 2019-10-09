import { pick } from "lodash";
import { Job } from "../../job";
import { AutoBuyerService } from "../auto-buyer.service";
import { playerService } from "../../player";
import { fut } from "../../api";
import { logger } from "../../logger";

const WAIT_TRANSFER_PROCESSING_TIME = 5000;

export class AutoBuyBuyNow extends Job {
  constructor() {
    const jobName = "AutoBuyer::BuyNow";

    super(jobName, 2);
    this.start(this.loopOverTargets);
  }

  private async loopOverTargets() {
    const targets = AutoBuyerService.targets;

    for (const target of targets) {
      const playerStr = playerService.readable({ assetId: target.resourceId });
      const auctions = (await fut.getPlayerTransferData(target.resourceId, 0, {
        maxb: target.maxPrice
      }))
        .filter(a => !a.tradeOwner)
        .map(a =>
          pick(
            a,
            "tradeId",
            "buyNowPrice",
            "currentBid",
            "startingBid",
            "expires"
          )
        )
        .sort((a, b) => a.buyNowPrice - b.buyNowPrice);
      const lowest = auctions[0];
      if (!lowest) continue;
      if (lowest.buyNowPrice <= target.maxPrice) {
        logger.info(`Found ${playerStr} for ${lowest.buyNowPrice}, buying.`);
        try {
          await fut.bid(lowest.tradeId, lowest.buyNowPrice);
          setTimeout(async () => {
            const purchased = await fut.getPurchasedItems();
            this.futRequests++;

            const justBoughtTarget = purchased.filter(
              p => p.resourceId === target.resourceId
            )[0];
            await fut.sendToClub(justBoughtTarget.id);
          }, WAIT_TRANSFER_PROCESSING_TIME);
        } catch (e) {
          logger.error(`Error buying ${playerStr}, ${e.message}`);
        }
      }
    }
  }
}
