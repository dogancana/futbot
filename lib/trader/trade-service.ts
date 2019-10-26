import { fut } from '../api';
import { envConfig } from '../config';
import { getLogger } from '../logger';
import { playerService } from '../player';
import { getOptimalSellPrice, SellPrice } from '../pricing';
import { SellTradePilePlayers, SellUnusedPlayers } from './jobs';

const logger = getLogger('TradeService');

export namespace tradeService {
  let sellUnusedPlayers: SellUnusedPlayers;
  let sellTradePilePlayers: SellTradePilePlayers;

  export type PlayerSellConf = fut.ItemData & { sellPrice: SellPrice };

  export function startSellUnusedPlayers(maxRating?: number) {
    if (!sellUnusedPlayers) {
      sellUnusedPlayers = new SellUnusedPlayers(maxRating);
    }

    return sellUnusedPlayers.report();
  }

  export function stopSellingUnusedPlayers() {
    if (!sellUnusedPlayers) {
      return null;
    }
    const report = sellUnusedPlayers.report();
    sellUnusedPlayers.stop();
    sellUnusedPlayers = null;
    return report;
  }

  export function startSellingTradePile() {
    if (!sellTradePilePlayers) {
      sellTradePilePlayers = new SellTradePilePlayers();
    }

    return sellTradePilePlayers.report();
  }

  export function stopSellingTradePile() {
    if (!sellTradePilePlayers) {
      return null;
    }
    const report = sellTradePilePlayers.report();
    sellTradePilePlayers.stop();
    sellTradePilePlayers = null;
    return report;
  }

  export async function sellPlayerOptimal(
    player: fut.ItemData
  ): Promise<PlayerSellConf> {
    const price: SellPrice = await getOptimalSellPrice(player.resourceId);
    const quickSellPrice = player.discardValue;
    if (!price) {
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
        itemData: {
          id: player.id,
          assetId: player.assetId
        }
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
