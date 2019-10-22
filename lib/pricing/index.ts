import * as NodeCache from 'node-cache';
import { fut, futbin } from '../api';
import { envConfig } from '../config';
import { getLogger } from '../logger';
import { playerService } from '../player';
import { tradePrice } from '../trader/trade-utils';
import { SellPrice } from './index';

const logger = getLogger('Pricing');
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
    const futbinPrices = await futbin.getPrice(resourceId);
    const platform = await fut.getPlatform();
    const futbinPrice = futbinPrices[platform];

    // ignore price, when data is missing
    if (futbinPrice.prices.length < 5 || futbinPrice.prices[0] === 0) {
      return null;
    }

    // ignore old prices
    if (futbinPrice.updatedMinsAgo === -1 || futbinPrice.updatedMinsAgo > 60) {
      return null;
    }

    const graph = await futbin.getGraph(resourceId);
    const graphPrices = graph[platform];
    const l = graphPrices.length;
    const lastPriceChange = Math.abs(graphPrices[l - 1] - graphPrices[l - 2]);
    if (
      lastPriceChange / graphPrices[l - 1] >
      ALLOWED_FUTBIN_PRICE_VOLATALITY
    ) {
      logger.warn(
        `Futbin price for ${playerService.readable({
          resourceId
        })} was too volatile, skipping. ` +
          `Price changed from ${graphPrices[l - 2]} to ${graphPrices[l - 1]}`
      );
      cache.set(cacheKey, null);
      return null;
    }
    const res: SellPrice = {
      startingBid: tradePrice(futbinPrice.LCPrice, 'floor'),
      buyNowPrice: futbinPrice.LCPrice
    };
    cache.set(cacheKey, res);
    return res;
  } catch (e) {
    logger.error(
      `Couldn't get optimal futbin price for ${playerService.readable({
        resourceId
      })}. Reason: ${e}`
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
        `Skipping market price for ${playerService.readable({
          resourceId
        })} because of low market samples(${marketPrice.sampleCount})`
      );
      cache.set(cacheKey, null);
      return null;
    }
    const res = {
      startingBid: tradePrice(marketPrice.buyNow - 1, 'floor'),
      buyNowPrice: marketPrice.buyNow
    };
    cache.set(cacheKey, res);
    return res;
  } catch (e) {
    logger.error(
      `Couldn't get optimal market price for ${playerService.readable({
        resourceId
      })}. Reason: ${e}`
    );
  }
}
