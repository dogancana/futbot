import { fut } from '../api';
import { getLogger } from '../logger';
import { StaticItems } from '../static';
import { tradePrice } from '../trader/trade-utils';

const logger = getLogger('PlayerService');

export namespace playerService {
  export function readable(player: {
    assetId?: number;
    resourceId?: number;
  }): string {
    const id = player.assetId || player.resourceId || -1;
    const data = StaticItems.itemData[id] || {
      name: '?????',
      rating: 0
    };

    return `${data.name}, (${data.rating})`;
  }

  export async function searchBuyableItem(
    resourceId: number,
    maxb: number
  ): Promise<fut.AuctionInfo[]> {
    return (await fut.queryMarket({
      maskedDefId: resourceId,
      maxb: tradePrice(maxb, 'floor')
    }))
      .filter(a => !a.watched)
      .filter(a => !a.tradeOwner)
      .sort((a, b) => a.buyNowPrice - b.buyNowPrice);
  }

  export async function buyNowAndHandleAuctions(
    auctions: fut.AuctionInfo[],
    sellPrice?: number
  ): Promise<fut.AuctionInfo[]> {
    if (!auctions || auctions.length === 0) {
      return [];
    }

    const playerStr = readable({ resourceId: auctions[0].itemData.resourceId });
    const bought: fut.AuctionInfo[] = [];
    // Go parallel to not miss anyone
    await Promise.all(
      auctions.map(async auction => {
        logger.info(`Buying ${playerStr} for ${auction.buyNowPrice}, buying.`);
        try {
          await fut.bidToTrade(auction.tradeId, auction.buyNowPrice);
          bought.push(auction);
        } catch (e) {
          logger.error(`Error buying ${playerStr}, Reason: ${e.message}`);
        }
      })
    );

    // Leave the job queue, don't await
    setTimeout(() => {
      bought.forEach(auction => {
        handleBought(auction, sellPrice);
      });
    }, 1000);

    return bought;
  }

  export async function handleBought(
    auction: fut.AuctionInfo,
    sellPrice?: number
  ) {
    const playerStr = readable(auction.itemData);
    const boughtItems = await fut.waitAndGetPurchasedItems(
      auction.itemData.resourceId
    );
    for (const bought of boughtItems) {
      if (sellPrice) {
        logger.info(`Trying to sell ${readable(bought)} for ${sellPrice}`);
        const buyNowPrice = tradePrice(sellPrice);
        const startingBid = tradePrice(buyNowPrice - 1, 'floor');
        await fut.sellPlayer({
          buyNowPrice,
          startingBid,
          itemData: bought,
          duration: 3600
        });
      } else {
        logger.info(`Sending ${playerStr} to trade pile`);
        await fut.sendToTradePile(bought.id);
      }
    }
  }
}
