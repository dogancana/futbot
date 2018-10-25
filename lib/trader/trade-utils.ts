import { playerService } from "../player"
import { fut, futbin } from '../api'

const HIGHER_PRICE_BOUNDRY = 1.05
const LOWER_PRIVE_BOUNDRY = 0.95
const FUTBIN_PRICE_DIFF_MARGIN_PERCT = 10

export function tradePrice (price: number): number {
  // 0-1000 50
  // 1k-10k 100
  // 10k-50k 250
  // 50k-100k 500
  // 100k-    1000
  if (price < 1000) {
    return Math.floor(price / 50) * 50
  } else if (price < 10 * 1000) {
    return Math.floor(price / 100) * 100
  } else if (price < 50 * 1000) {
    return Math.floor(price / 250) * 250
  } else if (price < 100 * 1000) {
    return Math.floor(price / 500) * 500
  } else {
    return Math.floor(price / 1000) * 1000
  }
}


export interface SellPrice {
  buyNowPrice: number
  startingBid: number
}
export async function getFutbinSellPrice (price: futbin.Prices): Promise<SellPrice> {
  const platform = await fut.getPlatform()
  const prices = price[platform].prices

  if (prices.length < 2 || prices[0] === 0) {
    return null
  }

  const firstPriceDiffPerct = 100 * Math.abs(prices[0] - prices[1]) / prices[0]
  let referencePrice = prices[0]
  if (firstPriceDiffPerct > FUTBIN_PRICE_DIFF_MARGIN_PERCT) {
    referencePrice = prices[1]
  }

  return {
    buyNowPrice: tradePrice(referencePrice * HIGHER_PRICE_BOUNDRY),
    startingBid: tradePrice(referencePrice * LOWER_PRIVE_BOUNDRY),
  }
}

export function getMarketSellPrice (price: playerService.MarketPrice): SellPrice {
  if (!price) {
    return null
  }

  if (price.samplecount <= 3) {
    return null
  }

  return {
    buyNowPrice: tradePrice(price.minBuyNow * HIGHER_PRICE_BOUNDRY),
    startingBid: tradePrice(price.minBuyNow * LOWER_PRIVE_BOUNDRY),
  }
}

export async function getOptimalSellPrice (player: fut.ItemData): Promise<SellPrice> {
  const futbinPrice: futbin.Prices = await playerService.getFutbinPrice(player.assetId, player.resourceId)
  const futbinSellPrice: SellPrice = await getFutbinSellPrice(futbinPrice)
  const marketPrice: playerService.MarketPrice = futbinSellPrice ? null : await playerService.getMarketPrice(player.assetId, player.resourceId)
  const marketSellPrice: SellPrice = getMarketSellPrice(marketPrice)

  return futbinSellPrice || marketSellPrice
}
