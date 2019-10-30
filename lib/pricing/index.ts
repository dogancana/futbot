import { uniqBy } from 'lodash';
import * as NodeCache from 'node-cache';
import { fut, futbin } from '../api';
import { envConfig } from '../config';
import { getLogger } from '../logger';
import { playerService } from '../player';
import { tradePrice } from '../trader/trade-utils';
import { mode } from '../utils';
import { ItemValue } from './index';

const logger = getLogger('Pricing');
const AUCTION_MAX_SAMPLES_FOR_PRICE = 5;
const cache = new NodeCache({
  stdTTL: 5 * 60,
  checkperiod: 60,
  useClones: true,
  deleteOnExpire: true
});

export interface ItemValue {
  futbinPrice: number;
  samples: fut.AuctionInfo[];
  price: number;
}

export interface SellPrice {
  buyNowPrice: number;
  startingBid: number;
}

export async function analyzeItemValue(resourceId: number): Promise<ItemValue> {
  const cacheKey = `price-${resourceId}`;

  try {
    const cached = cache.get(cacheKey) as ItemValue;
    if (cached) {
      return cached;
    }
  } catch {
    // noop
  }

  const playerStr = await playerService.readable({ resourceId });
  const futbinPrices = await futbin.getPrice(resourceId);
  const platform = await fut.getPlatform();
  const futbinPrice = futbinPrices ? futbinPrices[platform].LCPrice : null;

  let maxb = null;
  if (futbinPrice) {
    maxb = tradePrice(futbinPrice * 1.15, 'ceil');
  }

  let auctionSamples: fut.AuctionInfo[] = [];
  const lastSearches: number[] = [];

  for (let i = 0; i < envConfig().FUTBOT_MAX_PRICING_SEARCH_TRY; i++) {
    const auctions = await fut.queryMarket({
      maskedDefId: resourceId,
      maxb
    });

    let newMaxb: number;
    auctionSamples = uniqBy([...auctionSamples, ...auctions], a => a.tradeId);

    lastSearches.push(maxb);
    if (auctions.length > 13) {
      newMaxb = auctions.sort((a, b) => a.buyNowPrice - b.buyNowPrice)[1]
        .buyNowPrice;

      if (maxb === newMaxb) {
        newMaxb = tradePrice(newMaxb + 1, 'ceil');
      }
    } else if (
      auctions.length < envConfig().FUTBOT_FUT_MINIMUM_AUCTION_SAMPLES
    ) {
      newMaxb = tradePrice(maxb * 1.3, 'ceil');
    } else {
      return determineResult(auctions);
    }

    if (lastSearches.indexOf(newMaxb) > -1) {
      return determineResult(auctionSamples);
    }

    maxb = newMaxb;
  }

  logger.warn(
    `Price information for ${playerStr} couldn't be found in ${
      envConfig().FUTBOT_MAX_PRICING_SEARCH_TRY
    } market queries. Price might be wrong`
  );

  return determineResult(auctionSamples);

  function determineResult(
    arr: fut.AuctionInfo[],
    sampleCount: number = AUCTION_MAX_SAMPLES_FOR_PRICE
  ): ItemValue {
    let res: number;

    const sorted = arr.sort((a, b) => a.buyNowPrice - b.buyNowPrice);
    if (sorted[0] && sorted[0].expires < 52 * 60) {
      res = sorted[0].buyNowPrice;
    } else {
      res = mode(sorted.slice(0, sampleCount).map(a => a.buyNowPrice));
    }

    if (!res) {
      logger.error(`Couldn't determine price for ${playerStr}`);
      cache.set(cacheKey, null);
      return null;
    }

    if (
      auctionSamples.length < envConfig().FUTBOT_FUT_MINIMUM_AUCTION_SAMPLES
    ) {
      logger.error(
        `Skipping price for ${playerStr}. Low sample count: ${auctionSamples.length}`
      );
      cache.set(cacheKey, null);
      return null;
    }

    const result = {
      futbinPrice,
      samples: auctionSamples,
      price: res
    };

    cache.set(cacheKey, result);
    return result;
  }
}

export function mapValueToSellPrice(value: ItemValue): SellPrice {
  if (!value) {
    return null;
  }

  const lowerPrice = tradePrice(value.price - 1, 'floor');
  const upperPrice = tradePrice(value.price + 1, 'ceil');

  switch (envConfig().FUTBOT_SELL_PRICING_MODEL) {
    case 'slow':
      return {
        startingBid: value.price,
        buyNowPrice: Math.max(upperPrice, value.futbinPrice)
      };
    case 'normal':
      return {
        startingBid: lowerPrice,
        buyNowPrice: value.price
      };
    case 'fast':
      return {
        startingBid: tradePrice(lowerPrice - 1, 'floor'),
        buyNowPrice: lowerPrice
      };
    default:
      return null;
  }
}
