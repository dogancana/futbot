import { fut } from '../../api';
import { Job } from '../../jobs';
import { logger } from '../../logger';
import { playerService } from '../../player';
import { tradePrice } from '../../trader/trade-utils';
import { AutoBuyerService } from '../auto-buyer.service';

const TARGET_BATCH_TO_CHECK = 5;
const BUY_QUERY_TRIES = 3;

export class AutoBuyBuyNow extends Job {
  private lastTargetId = 0;
  private targetsBought: Array<
    AutoBuyerService.Target & { price: number }
  > = [];
  private spent: number = 0;
  private listedFor: number = 0;

  constructor() {
    super('AutoBuyer:BuyNow', 2);
    this.start(this.loopOverTargets);
  }

  public report() {
    return {
      spent: this.spent,
      listedItemsValue: this.listedFor,
      targetsBought: this.targetsBought.map(
        t => `${playerService.readable(t)} bought for ${t.price}`
      )
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
    const playerStr = playerService.readable(target);
    logger.info(`Checking for ${playerStr} with max price ${target.maxPrice}`);
    for (
      let i = 0, micr = tradePrice(target.discardValue);
      i < BUY_QUERY_TRIES;
      i++, micr = tradePrice(micr + 1, 'ceil')
    ) {
      let auctions: fut.AuctionInfo[];
      try {
        auctions = (await fut.getPlayerTransferData(target.resourceId, 0, {
          micr: Math.min(micr, target.maxPrice),
          maxb: target.maxPrice
        }))
          .filter(a => !a.tradeOwner)
          .sort((a, b) => a.buyNowPrice - b.buyNowPrice);
      } catch (e) {
        logger.error(`[AutoBuyer:BuyNow] Error while searching. Reason: ${e}`);
        continue;
      }

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
        } catch (e) {
          logger.error(
            `[AutoBuyer:BuyNow] Error buying ${playerStr}, Reason: ${e.message}`
          );
          continue;
        }

        try {
          this.spent += lowest.buyNowPrice;
          this.targetsBought.push({ ...target, price: lowest.buyNowPrice });
          const bought = await fut.waitAndGetPurchasedItem(target.resourceId);
          if (target.sellPrice) {
            await this.sell(target, bought);
          } else {
            logger.info(`[AutoBuyer:BuyNow]: Sending ${playerStr} to club`);
            try {
              await fut.sendToClub(bought.id);
            } catch (e) {
              logger.error(
                `[AutoBuyer:BuyNow]: Error sending ${playerStr} to club. Reason: ${e}`
              );
              continue;
            }
          }
        } catch (e) {
          logger.error(
            `[AutoBuyer:BuyNow] Error handling ${playerStr}, Reason: ${e.message}`
          );
          continue;
        }
      }
    }
  }

  private async sell(target: AutoBuyerService.Target, bought: fut.ItemData) {
    try {
      logger.info(
        `Trying to sell ${playerService.readable(target)} for ${
          target.sellPrice
        }`
      );
      const buyNowPrice = tradePrice(target.sellPrice);
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
        `[AutoBuyer:BuyNow]: Couldn't sell ${playerService.readable(
          target
        )}. Reason: ${e}`
      );
    }
  }
}
