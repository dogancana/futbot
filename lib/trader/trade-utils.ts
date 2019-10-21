import { futbin } from '../api';
import { envConfig } from '../config';
import { playerService } from '../player';
import { SellPrice } from '../pricing';
import { tradeService } from './trade-service';

const HIGHER_PRICE_BOUNDRY = 1.05;
const LOWER_PRICE_BOUNDRY = 0.95;

export function tradePrice(
  price: number,
  roundingFunction: 'ceil' | 'floor' = 'ceil'
): number {
  // 0-1000 50
  // 1k-10k 100
  // 10k-50k 250
  // 50k-100k 500
  // 100k-    1000
  if (price < 1000) {
    return Math[roundingFunction](price / 50) * 50;
  } else if (price < 10 * 1000) {
    return Math[roundingFunction](price / 100) * 100;
  } else if (price < 50 * 1000) {
    return Math[roundingFunction](price / 250) * 250;
  } else if (price < 100 * 1000) {
    return Math[roundingFunction](price / 500) * 500;
  } else {
    return Math[roundingFunction](price / 1000) * 1000;
  }
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

  const referencePrice = prices[0] * 1.05;
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
  const auctionCount = envConfig().FUTBOT_FUT_MINIMUM_AUCTION_SAMPLES;
  if (price.sampleCount <= auctionCount) {
    return null;
  }

  return {
    buyNowPrice: tradePrice(price.minBuyNow * HIGHER_PRICE_BOUNDRY),
    startingBid: tradePrice(price.minBuyNow * LOWER_PRICE_BOUNDRY)
  };
}

export function calculatePossibleRevenue(
  players: tradeService.PlayerSellConf[]
): number {
  const cost = players.reduce((prev, p) => prev + p.lastSalePrice || 0, 0);
  const revenue = players.reduce(
    (prev, p) => prev + (p.sellPrice.startingBid + p.sellPrice.buyNowPrice) / 2,
    0
  );
  return revenue - cost;
}
