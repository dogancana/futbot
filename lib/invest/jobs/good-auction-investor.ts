import { fut } from '../../api';
import { envConfig } from '../../config';
import { Job } from '../../jobs';
import { getLogger } from '../../logger';
import { playerService } from '../../player';
import { getOptimalFutbinPrice, getOptimalMarketPrice } from '../../pricing';
import { tradePrice } from '../../trader/trade-utils';
import { investService } from '../invest-service';

const logger = getLogger('GoodAuctionsJob');

// Don't touch below 4
const BATCH_START_PAGE = 5;
const BATCH_PAGES_TO_SEE = 1;
const MAX_TARGETS_TO_SEE_ON_PAGE = 6;

const PROFIT_MARGIN_PERCT = envConfig().FUTBOT_PROFIT_MARGIN;
const EXPIRE_TIME_LIMIT = 180; // seconds
const MAX_BID_TRIES = 3;

export interface GoodAuctionInvestorProps {
  budget: number;
  min?: number;
  max?: number;
  profitMargin?: number;
}

interface AuctionAnalysis {
  goodBuy: boolean;
  askingPrice?: number;
  profitMargin?: number;
  sellPrice?: number;
  maxBuyPrice?: number;
}

interface AuctionTarget extends fut.AuctionInfo {
  analysis?: AuctionAnalysis;
}

export class GoodAuctionInvestor extends Job {
  private budget: number;
  private min: number = 1000;
  private max: number = 10000;
  private boughtItems: AuctionTarget[] = [];
  private lostItems: AuctionTarget[] = [];
  private auctionsToWatch: AuctionTarget[] = [];

  constructor(p: GoodAuctionInvestorProps) {
    super('GoodAuctions', envConfig().FUTBOT_JOB_IMP_INVEST_GOOD_AUCTIONS);
    Object.assign(this, p);
    this.setTask(this.loop);
  }

  public report() {
    return {
      targets: this.auctionsToWatch.map(
        a =>
          `${playerService.readable(a.itemData)} for max ${
            a.analysis.maxBuyPrice
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
      logger.info(
        `job ran out of budget. Budget: ${this.budget}. ` +
          `Bought ${
            this.boughtItems.length
          } players for ${this.boughtItems.reduce(
            (prev, p) => prev + p.currentBid,
            0
          )} coins in total.`
      );
      return;
    }

    this.bidTargets(); // don't await to not miss auctions
    await this.loopMarket();
  }

  private async updateAuctionsToWatch() {
    const auctions = await fut.checkAuctionStatus(
      this.auctionsToWatch.map(a => a.tradeId)
    );

    this.auctionsToWatch = this.auctionsToWatch.map(a => ({
      ...a,
      ...auctions.find(b => b.tradeId === a.tradeId),
      itemData: a.itemData // auction status object clears out item data. We put it back
    }));

    const boughtItems = this.auctionsToWatch.filter(
      a => a.bidState === 'highest' && a.expires < 1
    );
    this.boughtItems = [...this.boughtItems, ...boughtItems];
    boughtItems.forEach(i => (this.budget -= i.currentBid));
    const lostItems = this.auctionsToWatch.filter(
      a => a.bidState === 'outbid' && a.expires < 1
    );
    this.lostItems = [...this.lostItems, ...lostItems];

    this.auctionsToWatch = this.auctionsToWatch.filter(a => a.expires > 0);
  }

  private async bidTargets() {
    if (!this.auctionsToWatch || this.auctionsToWatch.length === 0) {
      return;
    }
    await this.updateAuctionsToWatch();

    const targets = this.auctionsToWatch.filter(a => a.bidState !== 'highest');

    // create new event handling point (forEach) to ignore job task execution
    targets.forEach(t => this.bidAuction(t));
  }

  private async loopMarket() {
    for (
      let i = BATCH_START_PAGE;
      i < BATCH_START_PAGE + BATCH_PAGES_TO_SEE;
      i++
    ) {
      const players = await fut.searchTransferMarket(
        i,
        this.min,
        this.max / 2,
        null,
        this.max
      );
      const possibleTargets = players
        .filter(p => !p.watched)
        .filter(p => !p.tradeOwner)
        .filter(p => p.expires < EXPIRE_TIME_LIMIT)
        .slice(0, MAX_TARGETS_TO_SEE_ON_PAGE);

      logger.info(
        `Checking ${possibleTargets.length} auctions for ${PROFIT_MARGIN_PERCT}% profit margin.`
      );

      for (const possibleTarget of possibleTargets) {
        const analysis = await this.analyzePrice(possibleTarget);
        const {
          goodBuy,
          sellPrice,
          askingPrice,
          maxBuyPrice,
          profitMargin
        } = analysis;
        logger.info(
          `Analyzed ${playerService.readable(possibleTarget.itemData)}. ` +
            `Listed for: ${askingPrice}, Can be bought max: ${maxBuyPrice}, can be sold: ${sellPrice}`
        );
        if (goodBuy) {
          logger.info(
            `${playerService.readable(
              possibleTarget.itemData
            )} can be bought for ${askingPrice}, which is less than optimal price ${sellPrice}. Profit margin ${profitMargin}. Budget: ${
              this.budget
            }`
          );
          if (
            !this.auctionsToWatch.find(
              v => v.tradeId === possibleTarget.tradeId
            )
          ) {
            const auction = {
              ...possibleTarget,
              analysis
            };
            this.auctionsToWatch.push(auction);
            this.bidAuction(auction);
          }
        }
      }
    }
  }

  private async bidAuction(a: fut.AuctionInfo) {
    let tries = 0;
    while (tries < MAX_BID_TRIES) {
      const { goodBuy, askingPrice, maxBuyPrice } = await this.analyzePrice(
        a,
        tries !== 0
      );
      tries++;
      if (!goodBuy) {
        logger.info(
          `${playerService.readable(
            a.itemData
          )} is not a good auction anymore, skipping.`
        );
        return;
      }

      const bidPrice = tradePrice(askingPrice + 1);
      if (bidPrice < this.budget && bidPrice <= maxBuyPrice) {
        logger.info(
          `${playerService.readable(
            a.itemData
          )} bidding for ${bidPrice}, Expires ${
            a.expires
          }, Currentbid: ${askingPrice}, Buynow ${a.buyNowPrice}`
        );
        try {
          await fut.bidToTrade(a.tradeId, bidPrice);
        } catch (e) {
          logger.error(
            `bid failed for ${playerService.readable(
              a.itemData
            )} with bid amount ${bidPrice}. Reason: ${e}. We'll analyze and bid again.`
          );
        }
      } else {
        // no budget
        break;
      }
    }
  }

  private async analyzePrice(
    a: fut.AuctionInfo,
    forceNewAuctionCheck: boolean = false
  ): Promise<AuctionAnalysis> {
    let auction = a;
    if (forceNewAuctionCheck) {
      auction = {
        ...auction,
        ...(await fut.checkAuctionStatus([a.tradeId]))[0],
        itemData: auction.itemData // auction status object clears out item data. We put it back
      };
      if (auction.expires < 1) {
        return { goodBuy: false };
      }
    }
    let futbinSellPrice: number;
    let marketSellPrice: number;
    let profitMargin: number;
    const askingPrice = auction.currentBid || auction.startingBid;

    const futbinPrice = await getOptimalFutbinPrice(
      auction.itemData.resourceId
    );
    futbinSellPrice = !!futbinPrice ? futbinPrice.buyNowPrice : null;

    if (futbinSellPrice) {
      profitMargin = ((futbinSellPrice - askingPrice) / futbinSellPrice) * 100;
      if (profitMargin < PROFIT_MARGIN_PERCT) {
        return result(false);
      }
    }

    const marketPrice = await getOptimalMarketPrice(
      auction.itemData.resourceId
    );
    marketSellPrice = !!marketPrice ? marketPrice.buyNowPrice : null;
    if (!marketSellPrice) {
      return result(false);
    }

    profitMargin = ((marketSellPrice - askingPrice) / marketSellPrice) * 100;

    function result(overwriteGoodBuy?: boolean) {
      const sellPrice = marketSellPrice || futbinSellPrice;
      return {
        goodBuy:
          overwriteGoodBuy !== undefined
            ? overwriteGoodBuy
            : profitMargin >= PROFIT_MARGIN_PERCT,
        askingPrice,
        profitMargin,
        sellPrice,
        maxBuyPrice: sellPrice * ((100 - PROFIT_MARGIN_PERCT) / 100)
      };
    }

    return result();
  }
}
