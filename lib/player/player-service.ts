import { fut, futbin } from '../api';
import { StaticItems } from '../static';
import { mode } from '../utils';

export namespace playerService {
  export async function getFutbinPrice(resourceId: number) {
    const prices = await futbin.getPrice(resourceId);
    const platform = await fut.getPlatform();
    return prices[platform];
  }

  export interface MarketPrice {
    buyNow: number;
    sampleCount: number;
  }

  export async function getMarketPrice(
    resourceId: number
  ): Promise<MarketPrice> {
    const auctions = await getAuctions(resourceId);
    let buyNowPrices: number[] = [];

    for (const auction of auctions) {
      if (auction.itemData.resourceId !== resourceId) {
        continue;
      }

      // ignore the default buy-now price
      if (auction.buyNowPrice === auction.itemData.marketDataMaxPrice) {
        continue;
      }

      buyNowPrices.push(auction.buyNowPrice);
    }

    buyNowPrices = buyNowPrices.sort((a, b) => a - b);
    const cheapestValues = buyNowPrices.slice(
      0,
      Math.min(3, buyNowPrices.length)
    );

    return {
      buyNow: mode(cheapestValues),
      sampleCount: buyNowPrices.length
    };
  }

  export async function getAuctions(id): Promise<fut.AuctionInfo[]> {
    let auctions = [];

    // this should get 60 active auctions
    for (let i = 0; i < 3; i++) {
      try {
        auctions = auctions.concat(await fut.getPlayerTransferData(id, i));
      } catch (e) {
        break;
      }
    }

    return auctions;
  }

  export function readable(player: {
    assetId?: number;
    resourceId?: number;
  }): string {
    const id = player.assetId || player.resourceId || -1;
    const data = StaticItems.itemData[id] || {
      name: '?????',
      rating: 0
    };
    // if (data.name === "?????") console.log("readable", { player, StaticItems });

    return `${data.name}, (${data.rating})`;
  }
}
