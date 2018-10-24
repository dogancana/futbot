import { playerService } from "../player"
import { fut } from '../api'

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


interface SellPrice {
  buyNowPrice: number
  startingBid: number
  itemData: { id: number }
  duration: number
}
export async function getFutbinPrice (player: playerService.Details): Promise<SellPrice> {
  const platform = await fut.getPlatform()
  const prices = player.futbinPrices[platform].prices

  if (prices.length < 2) {
    return null
  }

  const firstPriceDiffPerct = 100 * Math.abs(prices[0] - prices[1]) / prices[0]
  if (firstPriceDiffPerct > 5) {
    return null
  }

  return {
    buyNowPrice: tradePrice(prices[0] * 1.05),
    startingBid: tradePrice(prices[0] * 0.95),
    itemData: { id: player.id },
    duration: 3600
  }
}
