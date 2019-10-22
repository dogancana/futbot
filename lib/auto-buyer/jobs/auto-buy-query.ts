import { fut } from '../../api';
import { Job } from '../../jobs';
import { getLogger } from '../../logger';
import { playerService } from '../../player';
import { tradePrice } from '../../trader/trade-utils';

const QUERY_TRY_COUNT = 15;
const logger = getLogger('AutoBuyQuery');

export class AutoBuyQuery extends Job {
  private spent = 0;
  private listedFor = 0;
  private targetsBought: Array<fut.AuctionInfo & { price: number }> = [];

  constructor(private query: string, private sellPrice?: number) {
    super('AutoBuyQuery', 1);
    this.setTask(this.loop);
  }

  public report() {
    return {
      query: this.query,
      spent: this.spent,
      sellPrice: this.sellPrice,
      listedItemsValue: this.listedFor,
      targetsBought: this.targetsBought.map(
        t => `${playerService.readable(t.itemData)} bought for ${t.price}`
      )
    };
  }

  private async loop() {
    for (let i = 0; i < QUERY_TRY_COUNT; i++) {
      logger.info(`Executing query ${this.query}`);
      await this.execQuery(i);
    }
  }

  private async execQuery(i: number) {
    const extra = {
      micr: i < 7 ? 200 + 100 * i : null,
      minb: i >= 7 ? 200 + 100 * (i % 7) : null
    };
    const extraStr = Object.keys(extra)
      .filter(e => !!extra[e])
      .map(k => `&${k}=${extra[k]}`);
    const auctions = await fut.searchTransferMarketByQuery(
      this.query + extraStr
    );

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
        this.handleBought(auction);
      }, 1000);
    });
  }

  private async handleBought(auction: fut.AuctionInfo) {
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
      if (this.sellPrice) {
        await this.sell(bought);
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

  private async sell(bought: fut.ItemData) {
    try {
      logger.info(
        `Trying to sell ${playerService.readable(bought)} for ${this.sellPrice}`
      );
      const buyNowPrice = tradePrice(this.sellPrice);
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
