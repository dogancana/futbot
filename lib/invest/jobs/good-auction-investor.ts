import { Job } from "./../../job";
import { fut } from "../../api";
import { logger } from "../../logger";
import { playerService } from "../../player";
import { tradePrice } from "../../trader/trade-utils";
import { AxiosResponse } from "axios";

const BATCH_START_PAGE = 10; // Better for checking transfer with >1 min remaining
const BATCH_PAGES_TO_SEE = 5;
const PROFIT_MARGIN_PERCT = 15;

export interface GoodAuctionInvestorProps {
  budget: number;
  min?: number;
  max?: number;
  profitMargin?: number;
}

interface AuctionTarget extends fut.AuctionInfo {
  maxBuyPrice: number;
}

let auctionsToWatch: AuctionTarget[] = [];

export class GoodAuctionInvestor extends Job {
  private budget: number;
  private min: number = 1000;
  private max: number = 10000;
  private profitMargin: number = PROFIT_MARGIN_PERCT;

  constructor(p: GoodAuctionInvestorProps) {
    super("Invest:GoodAuction", 1);
    Object.assign(this, p);
    this.start(this.tick);
  }

  private async tick() {
    this.loopMarket();
  }

  private async loopMarket() {
    for (
      let i = BATCH_START_PAGE;
      i < BATCH_START_PAGE + BATCH_PAGES_TO_SEE;
      i++
    ) {
      const players = await fut.searchTransferMarket(i, this.min, this.max);
      const possibleTargets = players
        .filter(p => !p.watched)
        .filter(p => !p.tradeOwner);

      for (let j = 0; j < possibleTargets.length; j++) {
        const a = possibleTargets[j];
        const {
          goodBuy,
          sellPrice,
          askingPrice,
          profitMargin,
          maxBuyPrice
        } = await this.analyzePrice(a);
        if (goodBuy) {
          logger.info(
            `[Invest:GoodAuction]: ${playerService.readable(
              a.itemData
            )} can be bought for ${askingPrice}, which is less than optimal price ${sellPrice}. Profit margin ${profitMargin}. Budget: ${
              this.budget
            }`
          );
          if (!auctionsToWatch.find(v => v.tradeId == a.tradeId)) {
            auctionsToWatch.push({
              ...a,
              maxBuyPrice
            });
            const bidPrice = tradePrice(maxBuyPrice - 1);
            if (bidPrice < this.budget) {
              logger.info(
                `[Invest:GoodAuction]: ${playerService.readable(
                  a.itemData
                )} bidding for ${bidPrice}`
              );
              try {
                await fut.bid(a.tradeId, bidPrice);
                this.budget -= bidPrice;
              } catch (e) {
                logger.error(
                  `[Invevst:GoodAuction]: bid failed for ${playerService.readable(
                    a.itemData
                  )} with bid amount ${bidPrice}. Reason: ${
                    (e as AxiosResponse).data
                  }`
                );
              }
            }
          }
        }
      }
    }
  }

  private async analyzePrice(a: fut.AuctionInfo) {
    let futbinSellPrice: number;
    try {
      futbinSellPrice = (await playerService.getFutbinPrice(
        a.itemData.resourceId
      )).LCPrice;
    } catch {
      futbinSellPrice = 0;
    }
    const askingPrice = a.currentBid || a.startingBid;
    let marketSellPrice: number;

    if (!futbinSellPrice) {
      marketSellPrice = (await playerService.getMarketPrice(
        a.itemData.resourceId
      )).minBuyNow;
    }

    let profitMargin: number, goodBuy: boolean;
    let sellPrice = futbinSellPrice || marketSellPrice;
    const calculateResult = () => {
      profitMargin = ((sellPrice - askingPrice) / sellPrice) * 100;
      goodBuy = profitMargin > this.profitMargin;
    };
    calculateResult();
    if (goodBuy && !marketSellPrice) {
      marketSellPrice = (await playerService.getMarketPrice(
        a.itemData.resourceId
      )).minBuyNow;
      sellPrice = marketSellPrice;
      calculateResult();
    }

    return {
      goodBuy,
      askingPrice,
      sellPrice,
      profitMargin,
      maxBuyPrice: sellPrice * ((100 - this.profitMargin) / 100)
    };
  }

  public report() {
    return {
      targets: auctionsToWatch.map(
        a => `${playerService.readable(a.itemData)} for max ${a.maxBuyPrice}`
      )
    };
  }
}
