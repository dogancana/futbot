import { fut, futbin } from '../api';
import { StaticItems } from '../static';

export namespace playerService {
  export async function getFutbinPrice(resourceId: number) {
    const prices = await futbin.getPrice(resourceId);
    const platform = await fut.getPlatform();
    return prices[platform];
  }

  export interface MarketPrice {
    minBuyNow: number;
    minStartingBid: number;
    averageBuyNow: number;
    averageStartingBid: number;
    sampleCount: number;
  }

  export async function getMarketPrice(
    resourceId: number
  ): Promise<MarketPrice> {
    let invalidSamples = 0;
    const auctions = await getAuctions(resourceId);
    const price: MarketPrice = {
      minBuyNow: Number.MAX_VALUE,
      minStartingBid: Number.MAX_VALUE,
      averageBuyNow: 0,
      averageStartingBid: 0,
      sampleCount: 0
    };

    auctions.forEach(a => {
      if (a.itemData.resourceId !== resourceId) {
        return;
      }

      if (a.buyNowPrice < price.minBuyNow) {
        price.minBuyNow = a.buyNowPrice;
      }
      if (a.startingBid < price.minStartingBid) {
        price.minStartingBid = a.startingBid;
      }
      price.averageBuyNow += a.buyNowPrice;
      price.averageStartingBid += a.startingBid;
      price.sampleCount++;
    });

    // prevent division by zero
    if (price.sampleCount > 0) {
      price.averageBuyNow /= price.sampleCount;
      price.averageStartingBid /= price.sampleCount;
    }

    price.minBuyNow = price.minBuyNow === Number.MAX_VALUE ? 0 : price.minBuyNow;
    return price;
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
    id?: number;
    assetId?: number;
    resourceId?: number;
  }): string {
    const id = player.assetId || player.id || -1;
    const data = StaticItems.itemData[id] || {
      name: '?????',
      rating: 0
    };
    // if (data.name === "?????") console.log("readable", { player, StaticItems });

    return `${data.name}, (${data.rating})`;
  }
}
