import { getLogger } from '@futbot/logger';
import { fut } from '../api';
import { StaticItems } from '../static';
import { tradePrice } from '../trader/trade-utils';
import { ItemValue, mapValueToSellPrice, SellPrice } from './../pricing';

const logger = getLogger('PlayerService');

interface SellConfig {
  sellPrice?: SellPrice;
  value?: ItemValue;
}

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
    const isSpecial =
      player.assetId &&
      player.resourceId &&
      player.assetId !== player.resourceId;

    return `${data.name}, ${isSpecial ? '*' : ''}(${data.rating})`;
  }

  export async function searchBuyableItem(
    ids: {
      assetId: number;
      resourceId: number;
    },
    maxb: number
  ): Promise<fut.AuctionInfo[]> {
    const { assetId, resourceId } = ids;
    const searchingForBase = assetId === resourceId;
    return (await fut.queryMarket({
      maskedDefId: assetId,
      maxb: tradePrice(maxb, 'floor')
    }))
      .filter(a => !a.watched)
      .filter(a => !a.tradeOwner)
      .filter(a =>
        searchingForBase ? true : a.itemData.resourceId === resourceId
      )
      .sort((a, b) => a.buyNowPrice - b.buyNowPrice);
  }

  export async function buyNowAndHandleAuctions(
    auctions: fut.AuctionInfo[],
    sellConfig?: SellConfig
  ): Promise<fut.AuctionInfo[]> {
    if (!auctions || auctions.length === 0) {
      return [];
    }

    const bought: fut.AuctionInfo[] = [];
    // Go parallel to not miss anyone
    await Promise.all(
      auctions.map(async (auction, i) => {
        await new Promise(resolve => setTimeout(resolve, i * 300));
        const playerStr = readable({ resourceId: auction.itemData.resourceId });
        logger.info(`Buying ${playerStr} for ${auction.buyNowPrice}.`);
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
        handleBought(auction, sellConfig);
      });
    }, 1000);

    return bought;
  }

  export async function handleBought(
    auction: fut.AuctionInfo,
    sellConfig: SellConfig
  ) {
    sellConfig = sellConfig || {};

    const playerStr = readable(auction.itemData);
    const boughtItems = await fut.waitAndGetPurchasedItems(
      auction.itemData.resourceId
    );
    const { sellPrice, value } = sellConfig;
    for (const bought of boughtItems) {
      if (sellPrice || value) {
        const price = sellPrice || mapValueToSellPrice(value);
        logger.info(
          `Trying to sell ${readable(bought)} for ${price.startingBid}/${
            price.buyNowPrice
          }`
        );
        await fut.sellPlayer({
          ...price,
          itemData: bought,
          duration: 3600
        });
      } else {
        logger.info(`Sending ${playerStr} to trade pile`);
        await fut.sendToTradePile(bought.id);
      }
    }
  }

  export function userDefinedPriceToSellConfig(price: number): SellConfig {
    const buyNowPrice = price ? tradePrice(price, 'ceil') : null;
    return buyNowPrice
      ? {
          sellPrice: {
            buyNowPrice,
            startingBid: tradePrice(buyNowPrice - 1, 'floor')
          }
        }
      : null;
  }
}
