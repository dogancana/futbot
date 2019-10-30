import { fut } from '../../api';
import { envConfig } from '../../config';
import { Job } from '../../jobs';
import { getLogger } from '../../logger';
import { playerService } from '../../player';
import { tradePrice } from '../../trader/trade-utils';
import { AutoBuyerService } from '../auto-buyer.service';

const logger = getLogger('AutoBuyNowJob');
const TARGET_BATCH_TO_CHECK = 5;
const BUY_QUERY_TRIES = 4;

export class AutoBuyBuyNow extends Job {
  private lastTargetId = 0;
  private targetsBought: fut.AuctionInfo[] = [];
  private spent: number = 0;
  private listedFor: number = 0;

  constructor() {
    super('AutoBuyer:BuyNow', envConfig().FUTBOT_JOB_IMP_AUTO_BUY_NOW);
    this.setTask(this.loopOverTargets);
  }

  public report() {
    return {
      spent: this.spent,
      listedItemsValue: this.listedFor,
      targetsBought: this.targetsBought.map(
        t => `${playerService.readable(t.itemData)} bought for ${t.buyNowPrice}`
      )
    };
  }

  private async loopOverTargets() {
    const targets = AutoBuyerService.targets;
    if (this.lastTargetId >= targets.length) {
      this.lastTargetId = 0;
    }

    if (!targets || targets.length === 0) {
      logger.warn(`No targets to check.`);
      return;
    }

    for (
      let i = 0;
      i < TARGET_BATCH_TO_CHECK;
      i++, this.lastTargetId = (this.lastTargetId + 1) % targets.length
    ) {
      await this.searchTarget(targets[this.lastTargetId]);
    }
  }

  private async searchTarget(target: AutoBuyerService.Target): Promise<void> {
    const playerStr = playerService.readable(target);
    logger.info(`Searching for ${playerStr} with max price ${target.maxPrice}`);

    for (let i = 0; i < BUY_QUERY_TRIES; i++) {
      const auctions = await playerService.searchBuyableItem(
        target.resourceId,
        target.maxPrice
      );

      const boughtitems = await playerService.buyNowAndHandleAuctions(
        auctions,
        target.sellPrice
      );
      this.targetsBought = [...this.targetsBought, ...boughtitems];
    }
  }
}
