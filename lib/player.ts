import * as sleep from 'sleep-promise';
import { getPlayerTransferData } from './api';

export async function getPlayerAuctions (id) {
  let auctions = [];
  for (let i=0; i<3; i++) {
    try {
      auctions = auctions.concat(await getPlayerTransferData(id, i));
      await sleep(500);
    } catch (e) {
      break;
    }
  }
  return auctions;
}

interface IPriceInfo {
  minBuyNow: number;
  minStartingBid: number;
  averageBuyNow: number;
  averageStartingBid: number;
  samplecount: number;
}
export async function getPlayerPriceInfo (id) {
  const auctions = await getPlayerAuctions(id);
  const prices: IPriceInfo = {
    minBuyNow: Number.MAX_VALUE,
    minStartingBid: Number.MAX_VALUE,
    averageBuyNow: 0,
    averageStartingBid: 0,
    samplecount: 0
  }
  auctions.forEach(a => {
    if (a.buyNowPrice < prices.minBuyNow) prices.minBuyNow = a.buyNowPrice;
    if (a.startingBid < prices.minStartingBid) prices.minStartingBid = a.startingBid;
    prices.averageBuyNow += a.buyNowPrice;
    prices.averageStartingBid += a.startingBid;
    prices.samplecount++
  });
  prices.averageBuyNow /= prices.samplecount;
  prices.averageStartingBid /= prices.samplecount;
  return prices;
}

