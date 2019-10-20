import { fut } from '../../api';
import { Job } from '../../jobs';
import { logger } from '../../logger';
import { playerService } from '../../player';
import { AutoBuyerService } from '../auto-buyer.service';

const TARGET_BATCH_TO_CHECK = 5;
const BUY_QUERY_TRIES = 3;

export class AutoBuyBuyNow extends Job {
  private lastTargetId = 0;
  private targetsBought: Array<
    AutoBuyerService.Target & { price: number }
  > = [];

  constructor() {
    super('AutoBuyer:BuyNow', 2);
    this.start(this.loopOverTargets);
  }

  public report() {
    return {
      targetsBought: this.targetsBought.map(
        t => `${playerService.readable(t)} bought for ${t.price}`
      ),
      totalMoneySpent: this.targetsBought.reduce((prev, p) => prev + p.price, 0)
    };
  }

  private async loopOverTargets() {
    const targets = AutoBuyerService.targets;
    if (this.lastTargetId >= targets.length) {
      this.lastTargetId = 0;
    }

    if (!targets || targets.length === 0) {
      logger.warn(`[AutoBuyer:BuyNow]: No targets to check.`);
      return;
    }

    for (
      let i = this.lastTargetId;
      i < TARGET_BATCH_TO_CHECK && i < targets.length;
      i++, this.lastTargetId++
    ) {
      this.tryToBuy(targets[i]);
    }
  }

  private async tryToBuy(target: AutoBuyerService.Target): Promise<void> {
    const playerStr = playerService.readable({ assetId: target.resourceId });
    logger.info(`Checking for ${playerStr} with max price ${target.maxPrice}`);
    for (let i = 0; i < BUY_QUERY_TRIES; i++) {
      const auctions = (await fut.getPlayerTransferData(target.resourceId, 0, {
        maxb: target.maxPrice + i
      }))
        .filter(a => !a.tradeOwner)
        .sort((a, b) => a.buyNowPrice - b.buyNowPrice);

      const lowest = auctions[0];
      if (!lowest) {
        continue;
      }
      if (lowest.buyNowPrice <= target.maxPrice) {
        logger.info(
          `[AutoBuyer:BuyNow] Found ${playerStr} for ${lowest.buyNowPrice}, buying.`
        );
        try {
          await fut.bidToTrade(lowest.tradeId, lowest.buyNowPrice);
          this.targetsBought.push({ ...target, price: lowest.buyNowPrice });
        } catch (e) {
          logger.error(
            `[AutoBuyer:BuyNow] Error buying ${playerStr}, ${e.message}`
          );
        }
      }
    }
  }
}
