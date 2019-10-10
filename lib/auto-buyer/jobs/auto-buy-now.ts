import { Job } from "../../job";
import { AutoBuyerService } from "../auto-buyer.service";
import { playerService } from "../../player";
import { fut } from "../../api";
import { logger } from "../../logger";

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
        .sort((a, b) => a.buyNowPrice - b.buyNowPrice);

      const lowest = auctions[0];
      if (!lowest) continue;
      if (lowest.buyNowPrice <= target.maxPrice) {
        logger.info(`Found ${playerStr} for ${lowest.buyNowPrice}, buying.`);
        try {
          await fut.bid(lowest.tradeId, lowest.buyNowPrice);
          const justBoughtTarget = await fut.waitAndGetPurchasedItem(
            target.resourceId
          );
          await fut.sendToClub(justBoughtTarget.id);
        } catch (e) {
          logger.error(`Error buying ${playerStr}, ${e.message}`);
        }
      }
    }
  }
}
