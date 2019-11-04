import { getLogger } from '@futbot/logger';
import * as querystring from 'querystring';
import { fut } from '../../api';
import { envConfig } from '../../config';
import { Job } from '../../jobs';
import { playerService } from '../../player';
import { AutoBuyerService } from '../auto-buyer.service';

const TARGET_BATCH_TO_CHECK = 5;
const QUERY_TRY_COUNT = 4;
const logger = getLogger('AutoBuyQuery');

export class AutoBuyQuery extends Job {
  private targetsBought: fut.AuctionInfo[] = [];
  private lastTargetIndex = 0;

  constructor() {
    super('AutoBuyQuery', envConfig().FUTBOT_JOB_IMP_AUTO_BUY_QUERY);
    this.setTask(this.loop);
  }

  public report() {
    return {
      targetQueries: AutoBuyerService.targetQueries,
      spent: this.targetsBought.reduce(
        (prev, curr) => prev + curr.buyNowPrice,
        0
      ),
      targetsBought: this.targetsBought.map(
        t => `${playerService.readable(t.itemData)} bought for ${t.buyNowPrice}`
      )
    };
  }

  private async loop() {
    const targets = AutoBuyerService.targetQueries;
    if (this.lastTargetIndex >= targets.length) {
      this.lastTargetIndex = 0;
    }

    if (!targets || targets.length === 0) {
      logger.warn(`No targets to check.`);
      return;
    }
    for (
      let i = 0;
      i < TARGET_BATCH_TO_CHECK;
      i++, this.lastTargetIndex = (this.lastTargetIndex + 1) % targets.length
    ) {
      const target = targets[this.lastTargetIndex];
      for (let j = 0; j < QUERY_TRY_COUNT; j++) {
        await this.execQuery(target);
      }
    }
  }

  private async execQuery(target: AutoBuyerService.TargetQuery) {
    logger.info(
      `Executing query ${target.query}. Sell price: ${target.sellPrice}`
    );
    const { query } = target;
    const auctions = await fut.queryMarket(querystring.parse(query));
    const boughtItems = await playerService.buyNowAndHandleAuctions(
      auctions,
      playerService.userDefinedPriceToSellConfig(target.sellPrice)
    );
    this.targetsBought = [...this.targetsBought, ...boughtItems];
  }
}
