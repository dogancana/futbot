import * as NodeCache from 'node-cache';
import { fut, futbin } from '../api';
import { envConfig } from '../config';
import { getLogger } from '../logger';
import { playerService } from '../player';
import { tradePrice } from '../trader/trade-utils';
import { mode } from '../utils';
import { SellPrice } from './index';

const logger = getLogger('Pricing');
const AUCTION_MAX_SAMPLES_FOR_PRICE = 5;
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
  resourceId: number
): Promise<SellPrice> {
  const cacheKey = `price-${resourceId}`;

  try {
    const cached = cache.get(cacheKey) as SellPrice;
    if (cached) {
      return cached;
    }
  } catch {
    // noop
  }

  const futbinPrices = await futbin.getPrice(resourceId);
  const platform = await fut.getPlatform();
  const futbinPrice = futbinPrices ? futbinPrices[platform].LCPrice : null;
  let auctionSamples: fut.AuctionInfo[] = [];
  const lastSearches: number[] = [];
  let maxb = futbinPrice;

  for (let i = 0; i < envConfig().FUTBOT_MAX_PRICING_SEARCH_TRY; i++) {
    const auctions = (await fut.getPlayerTransferData(resourceId, 0, {
      maxb
    })).filter(a => a.buyNowPrice !== a.itemData.marketDataMaxPrice);
    let newMaxb: number;
    auctionSamples = [...auctionSamples, ...auctions];

    if (futbinPrice) {
      lastSearches.push(maxb);
      if (auctions.length > 10) {
        newMaxb = auctions.sort((a, b) => a.buyNowPrice - b.buyNowPrice)[1]
          .buyNowPrice;
        if (maxb === newMaxb) {
          newMaxb = tradePrice(maxb - 1, 'floor');
        }
      } else if (auctions.length === 0) {
        newMaxb = tradePrice(maxb + 1, 'ceil');
      } else {
        return determineResult(auctions);
      }

      if (lastSearches.indexOf(newMaxb) > -1) {
        return determineResult(auctionSamples);
      }
      maxb = newMaxb;
    }
  }

  logger.warn(
    `Price information for ${playerService.readable({
      resourceId
    })} couldn't be found in ${
      envConfig().FUTBOT_MAX_PRICING_SEARCH_TRY
    } market queries. Price might be wrong`
  );

  return determineResult(auctionSamples);

  function determineResult(
    arr: fut.AuctionInfo[],
    sampleCount: number = AUCTION_MAX_SAMPLES_FOR_PRICE
  ): SellPrice {
    const res = mode(
      arr
        .sort((a, b) => a.buyNowPrice - b.buyNowPrice)
        .slice(0, sampleCount)
        .map(a => a.buyNowPrice)
    );
    if (!res) {
      logger.error(
        `Couldn't determine price for ${playerService.readable({ resourceId })}`
      );
      return null;
    }

    return {
      buyNowPrice: res,
      startingBid: tradePrice(res - 1, 'floor')
    };
  }
}
