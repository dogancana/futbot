import { tradeService } from './trade-service';

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
    return Math.max(Math[roundingFunction](price / 50) * 50, 150);
  } else if (price < 10 * 1000) {
    return Math[roundingFunction](price / 100) * 100;
  } else if (price < 50 * 1000) {
    return Math[roundingFunction](price / 250) * 250;
  } else if (price < 100 * 1000) {
    return Math[roundingFunction](price / 500) * 500;
  } else {
    return Math.min(Math[roundingFunction](price / 1000) * 1000, 15000000);
  }
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
