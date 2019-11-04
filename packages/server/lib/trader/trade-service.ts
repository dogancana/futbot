import { getLogger } from '@futbot/logger';
import { fut } from '../api';
import { envConfig } from '../config';
import { playerService } from '../player';
import { analyzeItemValue, mapValueToSellPrice } from '../pricing';
import { SellPrice } from './../pricing/index';

const logger = getLogger('TradeService');

export namespace tradeService {
  export type PlayerSellConf = fut.ItemData & { sellPrice: SellPrice };

  export async function sellPlayerOptimal(
    player: fut.ItemData
  ): Promise<PlayerSellConf> {
    const value = await analyzeItemValue(player.resourceId);
    const price = mapValueToSellPrice(value);
    const quickSellPrice = player.discardValue;
    if (!value || !price) {
      logger.error(
        `No price information for ${playerService.readable(
          player
        )}. Not selling.`
      );
      return null;
    }
    // TODO this can be configurable
    // if (sellPrice.startingBid <= player.itemData.lastSalePrice) {
    //   logger.info(
    //     `Selling of ${playerString} skipped. Sell-Price too low: ${sellPrice.startingBid}/${sellPrice.buyNowPrice}`
    //   );
    //   continue;
    // }

    price.buyNowPrice = Math.min(price.buyNowPrice, player.marketDataMaxPrice);
    if (
      quickSellPrice + envConfig().FUTBOT_QUICK_SELL_MARGIN >
      price.buyNowPrice
    ) {
      try {
        logger.info(
          `Discarding ${playerService.readable(
            player
          )} for ${quickSellPrice}. ` +
            `Better than selling for ${price.buyNowPrice}`
        );
        fut.discardPlayer(player.id);
      } catch (e) {
        logger.error(`Couldn't be discarded. Reason: ${e}`);
      }
      return {
        ...player,
        sellPrice: {
          startingBid: quickSellPrice,
          buyNowPrice: quickSellPrice
        }
      };
    }

    try {
      logger.info(
        `Selling ${playerService.readable(player)} for ${price.startingBid}/${
          price.buyNowPrice
        }`
      );
      await fut.sellPlayer({
        ...price,
        duration: 3600,
        itemData: player
      });
      return {
        ...player,
        sellPrice: price
      };
    } catch (e) {
      logger.error(
        `Couldn't sell ${playerService.readable(player)}. Reason: ${e}`
      );
      return null;
    }
  }

  export async function clearPile(): Promise<string[]> {
    let players = await fut.getTradePile();
    players = players.filter(p => p.tradeId === 0 || p.tradeState !== 'active');
    const expired = players.filter(
      p => p.tradeId === 0 || p.tradeState === 'expired'
    );
    const sold = players.filter(
      p => p.tradeId === 0 || p.tradeState === 'closed'
    );

    if (sold.length > 0) {
      try {
        await fut.clearSold();
      } catch (e) {
        // noop
      }
    }

    logger.info(`Clearing transfer pile for ${expired.length} players`);

    for (const player of expired) {
      const result = await fut.sendToClub(player.itemData.id);
      const relatedResult = result.itemData.filter(
        i => i.id === player.itemData.id
      )[0];
      if (relatedResult && !relatedResult.success) {
        logger.error(
          `${playerService.readable({
            assetId: player.itemData.assetId
          })} couldnt be moved to club. Reason: ${relatedResult.reason}(${
            relatedResult.errorCode
          }). Selling him.`
        );
        await sellPlayerOptimal(player.itemData);
      } else {
        logger.info(
          `${playerService.readable(player.itemData)} is sent to club`
        );
      }
    }

    return players.map(p =>
      playerService.readable({ assetId: p.itemData.assetId })
    );
  }
}
