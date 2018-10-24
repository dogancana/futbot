import { fut, futbin } from '../api';
import { StaticPlayerData, StaticItems } from '../static';

export namespace playerService {
  export interface Details extends StaticPlayerData {
    marketPrice?: MarketPrice
    futbinPrices: futbin.Prices
  }
  export async function getPlayerDetails (assetId, resourceId, disableMarketPrice: boolean = false): Promise<Details> {
    return {
      ...(StaticItems.itemData[assetId.toString()]),
      marketPrice: !disableMarketPrice ? await getMarketPrice(assetId, resourceId) : null,
      futbinPrices: await futbin.getPrice(resourceId)
    }
  }

  export interface PriceSummary {
    marketPrice?: MarketPrice,
    futbinPrices: futbin.Prices
  }
  export async function getPrice (assetId: number, resourceId: number, platform: fut.Platform = 'pc'): Promise<PriceSummary> {
    let marketPrice: MarketPrice;

    const futbinPrices = await futbin.getPrice(resourceId);
  
    if (futbinPrices && futbinPrices[platform].prices.length < 2) {
      // dont trust futbin without 2 prices
      marketPrice = await getMarketPrice(assetId, resourceId);
    }
  
    return { 
      marketPrice,
      futbinPrices
    };
  }

  export interface MarketPrice {
    minBuyNow: number;
    minStartingBid: number;
    averageBuyNow: number;
    averageStartingBid: number;
    samplecount: number;
  }
  export async function getMarketPrice (assetId, resourceId): Promise<MarketPrice> {
    const auctions = await getAuctions(assetId);
  
    const price: MarketPrice = {
      minBuyNow: Number.MAX_VALUE,
      minStartingBid: Number.MAX_VALUE,
      averageBuyNow: 0,
      averageStartingBid: 0,
      samplecount: 0
    }
  
    auctions.forEach(a => {
      if (a.itemData.resourceId != resourceId) return;
  
      if (a.buyNowPrice < price.minBuyNow) price.minBuyNow = a.buyNowPrice;
      if (a.startingBid < price.minStartingBid) price.minStartingBid = a.startingBid;
      price.averageBuyNow += a.buyNowPrice;
      price.averageStartingBid += a.startingBid;
      price.samplecount++
    });
    price.averageBuyNow /= price.samplecount;
    price.averageStartingBid /= price.samplecount;
    return price;
  }

  export async function getAuctions (id): Promise<fut.AuctionInfo[]> {
    let auctions = [];
    for (let i=0; i<3; i++) {
      try {
        auctions = auctions.concat(await fut.getPlayerTransferData(id, i));
      } catch (e) {
        break;
      }
    }
    return auctions;
  }
  
}

