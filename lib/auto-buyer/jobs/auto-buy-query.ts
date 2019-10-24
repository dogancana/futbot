import { fut } from '../../api';
import { envConfig } from '../../config';
import { Job } from '../../jobs';
import { getLogger } from '../../logger';
import { playerService } from '../../player';
import { tradePrice } from '../../trader/trade-utils';
import { AutoBuyerService } from '../auto-buyer.service';

const TARGET_BATCH_TO_CHECK = 5;
const QUERY_TRY_COUNT = 4;
const logger = getLogger('AutoBuyQuery');

export class AutoBuyQuery extends Job {
  private spent = 0;
  private listedFor = 0;
  private targetsBought: Array<fut.AuctionInfo & { price: number }> = [];
  private lastTargetIndex = 0;

  constructor() {
    super('AutoBuyQuery', envConfig().FUTBOT_JOB_IMP_AUTO_BUY_QUERY);
    this.setTask(this.loop);
  }

  public report() {
    return {
      targets: AutoBuyerService.targetQueries,
      spent: this.spent,
      listedItemsValue: this.listedFor,
      targetsBought: this.targetsBought.map(
        t => `${playerService.readable(t.itemData)} bought for ${t.price}`
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
        logger.info(
          `Executing query ${target.query}. Sell price: ${target.sellPrice}`
        );
        await this.execQuery(target);
      }
    }
  }

  private async execQuery(target: AutoBuyerService.TargetQuery) {
    const { query } = target;
    const auctions = await fut.searchTransferMarketByQuery(query);

    // Found some, go parallel
    auctions.forEach(async auction => {
      const playerStr = playerService.readable(auction.itemData);
      logger.info(`Found ${playerStr} for ${auction.buyNowPrice}, buying.`);
      try {
        await fut.bidToTrade(auction.tradeId, auction.buyNowPrice);
      } catch (e) {
        logger.error(`Error buying ${playerStr}, Reason: ${e.message}`);
        return;
      }

      // Leave the job queue, don't await
      setTimeout(() => {
        this.handleBought(target, auction);
      }, 1000);
    });
  }

  private async handleBought(
    target: AutoBuyerService.TargetQuery,
    auction: fut.AuctionInfo
  ) {
    const { sellPrice } = target;
    const playerStr = playerService.readable(auction.itemData);
    try {
      this.spent += auction.buyNowPrice;
      this.targetsBought.push({
        ...auction,
        price: auction.buyNowPrice
      });
      const bought = await fut.waitAndGetPurchasedItem(
        auction.itemData.resourceId
      );
      if (sellPrice) {
        await this.sell(target, bought);
      } else {
        logger.info(`Sending ${playerStr} to club`);
        try {
          await fut.sendToClub(bought.id);
        } catch (e) {
          logger.error(`Error sending ${playerStr} to club. Reason: ${e}`);
        }
      }
    } catch (e) {
      logger.error(`Error handling ${playerStr}, Reason: ${e.message}`);
    }
  }

  private async sell(
    target: AutoBuyerService.TargetQuery,
    bought: fut.ItemData
  ) {
    const { sellPrice } = target;
    try {
      logger.info(
        `Trying to sell ${playerService.readable(bought)} for ${sellPrice}`
      );
      const buyNowPrice = tradePrice(sellPrice);
      const startingBid = tradePrice(buyNowPrice - 1, 'floor');
      await fut.sellPlayer({
        buyNowPrice,
        startingBid,
        itemData: bought,
        duration: 3600
      });
      this.listedFor += buyNowPrice;
    } catch (e) {
      logger.error(
        `Couldn't sell ${playerService.readable(bought)}. Reason: ${e}`
      );
    }
  }
}
