import { playerService } from "../player";
import { futbin } from "../api";

const HIGHER_PRICE_BOUNDRY = 1.05;
const LOWER_PRICE_BOUNDRY = 0.95;

export function tradePrice(price: number): number {
  // 0-1000 50
  // 1k-10k 100
  // 10k-50k 250
  // 50k-100k 500
  // 100k-    1000
  if (price < 1000) {
    return Math.ceil(price / 50) * 50;
  } else if (price < 10 * 1000) {
    return Math.ceil(price / 100) * 100;
  } else if (price < 50 * 1000) {
    return Math.ceil(price / 250) * 250;
  } else if (price < 100 * 1000) {
    return Math.ceil(price / 500) * 500;
  } else {
    return Math.ceil(price / 1000) * 1000;
  }
}

export interface SellPrice {
  buyNowPrice: number;
  startingBid: number;
}

export function getFutbinSellPrice(price: futbin.Price): SellPrice {
  const prices = price.prices;

  // ignore price, when data is missing
  if (prices.length < 5 || prices[0] === 0) {
    return null;
  }

  // ignore old prices
  if (price.updatedMinsAgo === -1 || price.updatedMinsAgo > 60) {
    return null;
  }

  // ignore low price-range percentage (https://www.futbin.com/prp)
  if (price.prp < 25) {
    return null;
  }

  let referencePrice = prices[0] * 1.05;
  return {
    buyNowPrice: tradePrice(referencePrice * HIGHER_PRICE_BOUNDRY),
    startingBid: tradePrice(referencePrice * LOWER_PRICE_BOUNDRY)
  };
}

export function getMarketSellPrice(
  price: playerService.MarketPrice
): SellPrice {
  if (!price) {
    return null;
  }

  // if there are less then x active auctions, skip the player
  const auctionCount = process.env.FUTBOT_FUT_MINIMUM_AUCTION_SAMPLES || 3;
  if (price.sampleCount <= auctionCount) {
    return null;
  }

  return {
    buyNowPrice: tradePrice(price.minBuyNow * HIGHER_PRICE_BOUNDRY),
    startingBid: tradePrice(price.minBuyNow * LOWER_PRICE_BOUNDRY)
  };
}

export async function getOptimalSellPrice(
  resourceId: number,
  forceMarket = false
): Promise<SellPrice> {
  let futbinSellPrice: SellPrice = null;
  if (false === forceMarket) {
    const futbinPrice: futbin.Price = await playerService.getFutbinPrice(resourceId);
    futbinSellPrice = getFutbinSellPrice(futbinPrice);
  }

  const marketPrice: playerService.MarketPrice = futbinSellPrice
    ? null
    : await playerService.getMarketPrice(resourceId);
  const marketSellPrice: SellPrice = getMarketSellPrice(marketPrice);

  return (
    futbinSellPrice ||
    marketSellPrice || {
      startingBid: NaN,
      buyNowPrice: NaN
    }
  );
}
