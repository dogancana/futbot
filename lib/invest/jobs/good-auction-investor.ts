import { Job } from "./../../job";
import { fut } from "../../api";
import { logger } from "../../logger";
import { playerService } from "../../player";
import { tradePrice } from "../../trader/trade-utils";
import { AxiosResponse } from "axios";

const BATCH_START_PAGE = 5; // Better for checking transfer with >1 min remaining
const BATCH_PAGES_TO_SEE = 3; // Setting it more would result on bloating futbin queue
const PROFIT_MARGIN_PERCT = 20;
const EXPIRE_TIME_LIMIT = 180; // seconds

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
    super("Invest:GoodAuction", 2);
    Object.assign(this, p);
    this.start(this.loop);
  }

  private async loop() {
    this.bidTargets(); // don't wait to not miss auctions
    await this.loopMarket();
  }

  private async updateAuctionsToWatch() {
    const auctions = await fut.checkAuctionStatus(
      auctionsToWatch.map(a => a.tradeId)
    );
    auctionsToWatch = auctionsToWatch
      .map(a => ({
        ...a,
        ...auctions.find(b => b.tradeId === a.tradeId),
        itemData: a.itemData // auction status object clears out item data. We put it back
      }))
      .filter(a => a.expires > 0);
  }

  private async bidTargets() {
    if (!auctionsToWatch || auctionsToWatch.length === 0) return;
    await this.updateAuctionsToWatch();

    const targets = auctionsToWatch.filter(a => a.bidState !== "highest");

    // create new event handling point to ignore job task execution
    targets.forEach(async t => await this.bidAuction(t));
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
        .filter(p => !p.tradeOwner)
        .filter(p => p.expires < EXPIRE_TIME_LIMIT);

      for (let j = 0; j < possibleTargets.length; j++) {
        const possibleTarget = possibleTargets[j];
        const {
          goodBuy,
          sellPrice,
          askingPrice,
          profitMargin,
          maxBuyPrice
        } = await this.analyzePrice(possibleTarget);
        if (goodBuy) {
          logger.info(
            `[Invest:GoodAuction]: ${playerService.readable(
              possibleTarget.itemData
            )} can be bought for ${askingPrice}, which is less than optimal price ${sellPrice}. Profit margin ${profitMargin}. Budget: ${
              this.budget
            }`
          );
          if (!auctionsToWatch.find(v => v.tradeId == possibleTarget.tradeId)) {
            const auction = {
              ...possibleTarget,
              maxBuyPrice
            };
            auctionsToWatch.push(auction);
            this.bidAuction(auction);
          }
        }
      }
    }
  }

  private async bidAuction(a: fut.AuctionInfo) {
    const { askingPrice } = await this.analyzePrice(a);
    const bidPrice = tradePrice(askingPrice + 1);
    if (bidPrice < this.budget) {
      logger.info(
        `[Invest:GoodAuction]: ${playerService.readable(
          a.itemData
        )} bidding for ${bidPrice}, Expires ${a.expires}, Buynow ${
          a.buyNowPrice
        }`
      );
      try {
        await fut.bid(a.tradeId, bidPrice);
        this.budget -= bidPrice;
      } catch (e) {
        logger.error(
          `[Invevst:GoodAuction]: bid failed for ${playerService.readable(
            a.itemData
          )} with bid amount ${bidPrice}. Reason: ${(e as AxiosResponse).data}`
        );
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
    // use futbin to prices as a filter to avoid requests to fut
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
        a =>
          `${playerService.readable(a.itemData)} for max ${
            a.maxBuyPrice
          }. Expires in ${a.expires}seconds`
      )
    };
  }
}
