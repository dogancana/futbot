import { AxiosResponse } from 'axios';
import { fut } from '../../api';
import { Job } from '../../jobs';
import { logger } from '../../logger';
import { playerService } from '../../player';
import { tradePrice } from '../../trader/trade-utils';
import { investService } from '../invest-service';
import { envConfig } from '../../config';

const BATCH_START_PAGE = 5; // Better for checking transfer with >1 min remaining
const BATCH_PAGES_TO_SEE = 1; // Setting it more would result on bloating futbin queue
const PROFIT_MARGIN_PERCT = envConfig().FUTBOT_PROFIT_MARGIN;
const EXPIRE_TIME_LIMIT = 180; // seconds
const MIN_MARKET_SAMPLE_COUNT = 10;

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
  private boughtItems: AuctionTarget[] = [];
  private lostItems: AuctionTarget[] = [];

  constructor(p: GoodAuctionInvestorProps) {
    super(
      'Invest:GoodAuction',
      4 // per min. Avg ex time 29s
    );
    Object.assign(this, p);
    this.start(this.loop);
  }

  public report() {
    return {
      targets: auctionsToWatch.map(
        a =>
          `${playerService.readable(a.itemData)} for max ${
            a.maxBuyPrice
          }. Expires in ${a.expires}seconds`
      ),
      bought: this.boughtItems.map(
        a => `${playerService.readable(a.itemData)} bought for ${a.currentBid}.`
      ),
      budget: this.budget,
      profitMargin: PROFIT_MARGIN_PERCT
    };
  }

  private async loop() {
    if (this.budget < this.min) {
      this.stop();
      this.finished = true;
      investService.clearGoodAuctionInvest();
      return;
    }

    this.bidTargets(); // don't await to not miss auctions
    await this.loopMarket();
  }

  private async updateAuctionsToWatch() {
    const auctions = await fut.checkAuctionStatus(
      auctionsToWatch.map(a => a.tradeId)
    );

    auctionsToWatch = auctionsToWatch.map(a => ({
      ...a,
      ...auctions.find(b => b.tradeId === a.tradeId),
      itemData: a.itemData // auction status object clears out item data. We put it back
    }));

    const boughtItems = auctionsToWatch.filter(
      a => a.bidState === 'highest' && a.expires < 1
    );
    this.boughtItems = [...this.boughtItems, ...boughtItems];
    boughtItems.forEach(i => (this.budget -= i.currentBid));
    const lostItems = auctionsToWatch.filter(
      a => a.bidState === 'outbid' && a.expires < 1
    );
    this.lostItems = [...this.lostItems, ...lostItems];

    auctionsToWatch = auctionsToWatch.filter(a => a.expires > 0);
  }

  private async bidTargets() {
    if (!auctionsToWatch || auctionsToWatch.length === 0) {
      return;
    }
    await this.updateAuctionsToWatch();

    const targets = auctionsToWatch.filter(a => a.bidState !== 'highest');

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

      for (const possibleTarget of possibleTargets) {
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
          if (
            !auctionsToWatch.find(v => v.tradeId === possibleTarget.tradeId)
          ) {
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
        await fut.bidToTrade(a.tradeId, bidPrice);
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
    let marketSellPrice: number;
    let profitMargin: number;
    let goodBuy: boolean;
    let sellPrice = futbinSellPrice || marketSellPrice;

    try {
      futbinSellPrice = (await playerService.getFutbinPrice(
        a.itemData.resourceId
      )).LCPrice;
    } catch {
      futbinSellPrice = 0;
    }
    const askingPrice = a.currentBid || a.startingBid;

    if (!futbinSellPrice) {
      const marketPrice = await playerService.getMarketPrice(
        a.itemData.resourceId
      );
      if (marketPrice.sampleCount < MIN_MARKET_SAMPLE_COUNT) {
        goodBuy = false;
      } else {
        marketSellPrice = marketPrice.minBuyNow;
      }
    }

    const calculateResult = () => {
      profitMargin = ((sellPrice - askingPrice) / sellPrice) * 100;
      goodBuy = profitMargin > PROFIT_MARGIN_PERCT;
    };
    calculateResult();
    // use futbin to prices as a filter to avoid requests to fut
    if (goodBuy && !marketSellPrice) {
      const { minBuyNow, sampleCount } = await playerService.getMarketPrice(
        a.itemData.resourceId
      );
      sellPrice = minBuyNow;
      if (sampleCount < MIN_MARKET_SAMPLE_COUNT) {
        goodBuy = false;
      }
      calculateResult();
    }

    return {
      goodBuy,
      askingPrice,
      sellPrice,
      profitMargin,
      maxBuyPrice: sellPrice * ((100 - PROFIT_MARGIN_PERCT) / 100)
    };
  }
}
