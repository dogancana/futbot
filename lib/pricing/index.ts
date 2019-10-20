import * as NodeCache from 'node-cache';
import { fut, futbin } from '../api';
import { envConfig } from '../config';
import { logger } from '../logger';
import { playerService } from '../player';
import { getFutbinSellPrice, tradePrice } from '../trader/trade-utils';

const MINIMUM_MARKET_SAMPLES = envConfig().FUTBOT_FUT_MINIMUM_AUCTION_SAMPLES;
const ALLOWED_FUTBIN_PRICE_VOLATALITY = 15;
const cache = new NodeCache({
  stdTTL: 10 * 60,
  checkperiod: 10 * 10,
  useClones: true,
  deleteOnExpire: true
});

export interface SellPrice {
  buyNowPrice: number;
  startingBid: number;
}

// TODO cache this for 30 mins
export async function getOptimalSellPrice(
  resourceId: number,
  goToMarket = false
): Promise<SellPrice> {
  let futbinSellPrice: SellPrice = null;
  let marketSellPrice: SellPrice = null;

  if (goToMarket) {
    marketSellPrice = await getOptimalMarketPrice(resourceId);
  }

  if (!marketSellPrice) {
    futbinSellPrice = await getOptimalFutbinPrice(resourceId);
    if (!futbinSellPrice) {
      marketSellPrice = await getOptimalMarketPrice(resourceId);
    }
  }

  return marketSellPrice || futbinSellPrice;
}

export async function getOptimalFutbinPrice(
  resourceId: number
): Promise<SellPrice> {
  const cacheKey = `futbin-price-${resourceId}`;
  try {
    const cached = cache.get(cacheKey) as SellPrice;
    if (cached) {
      return cached;
    }
  } catch {
    // noop
  }

  try {
    const futbinPrice: futbin.Price = await playerService.getFutbinPrice(
      resourceId
    );
    const platform = await fut.getPlatform();
    const graph = await futbin.getGraph(resourceId);
    const prices = graph[platform];
    const l = prices.length;
    const lastPriceChange = Math.abs(prices[l - 1] - prices[l - 2]);
    if (lastPriceChange / prices[l - 1] > ALLOWED_FUTBIN_PRICE_VOLATALITY) {
      logger.warn(
        `[Pricing] Futbin price for ${playerService.readable({
          resourceId
        })} was too volatile, skipping. ` +
          `Price changed from ${prices[l - 2]} to ${prices[l - 1]}`
      );
      cache.set(cacheKey, null);
      return null;
    }
    const res = getFutbinSellPrice(futbinPrice);
    cache.set(cacheKey, res);
    return res;
  } catch (e) {
    logger.error(
      `[Pricing] Couldn't get optimal futbin price for ${playerService.readable(
        {
          resourceId
        }
      )}. Reason: ${e}`
    );
    return null;
  }
}

export async function getOptimalMarketPrice(
  resourceId: number
): Promise<SellPrice> {
  const cacheKey = `market-price-${resourceId}`;
  try {
    const cached = cache.get(cacheKey) as SellPrice;
    if (cached) {
      return cached;
    }
  } catch {
    // noop
  }

  try {
    const marketPrice = await playerService.getMarketPrice(resourceId);
    if (marketPrice.sampleCount < MINIMUM_MARKET_SAMPLES) {
      logger.warn(
        `[Pricing] Skipping market price for ${playerService.readable({
          resourceId
        })} because of low market samples(${marketPrice.sampleCount})`
      );
      cache.set(cacheKey, null);
      return null;
    }
    const res = {
      startingBid: marketPrice.minBuyNow,
      buyNowPrice: tradePrice(marketPrice.minBuyNow + 1)
    };
    cache.set(cacheKey, res);
    return res;
  } catch (e) {
    logger.error(
      `[Pricing] Couldn't get optimal market price for ${playerService.readable(
        {
          resourceId
        }
      )}. Reason: ${e}`
    );
  }
}
