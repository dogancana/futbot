import { Job } from "../../job";
import { investService } from "../invest-service";
import { playerService } from "../../player";
import { uniq } from "lodash";
import { fut } from "../../api";
import { getOptimalSellPrice, tradePrice } from "../../trader/trade-utils";
import { logger } from "../../logger";
import { AxiosError } from "axios";

const BUY_REFERENCE_PERCT = 0.7;
const MAX_AUCTION_TRY = process.env.FUTBOT_FUT_MAX_AUCTION_TRY_PER_PLAYER || 3;
const MIN_TARGET_PRICE = 1000;
const MAX_TARGET_PRICE = 4000;
const MAX_TARGET_POOL = 30;

let targets: investService.TargetInfo[] = [];
let setingUp = false;

export interface LowPlayerInvestorProps {
  budget: number;
  min?: number;
  max?: number;
  maxTargetPool?: number;
}

export class LowPlayerInvestor extends Job {
  private static jobName = "Invest:LowPlayerInvestor";
  private spent: number = 0;
  private budget: number = 20000;
  private boughtPlayers: ({
    price: number;
    assetId: number;
    buyNowPrice: number;
    startingBid: number;
  })[];
  private min: number = MIN_TARGET_PRICE;
  private max: number = MAX_TARGET_POOL;
  private maxTargetPool: number = MAX_TARGET_POOL;

  constructor({budget, min, max, maxTargetPool}: LowPlayerInvestorProps) {
    super(LowPlayerInvestor.jobName, 5);

    Object.assign(this, {
      min,
      max,
      budget,
      maxTargetPool
    });

    this.boughtPlayers = [];
    this.start(this.buyTargets);
  }

  private async buyTargets() {
    const minPrice = this.min || MIN_TARGET_PRICE;
    const maxPrice = this.max || MAX_TARGET_PRICE;
    const pcPrice = `${minPrice}-${maxPrice}`;

    if (!targets || targets.length === 0) {
      await setupTargets(pcPrice, this.maxTargetPool || MAX_TARGET_POOL);
      return;
    }

    if (this.budget < minPrice) {
      investService.clearLowPlayerInvest();
      return;
    }

    const target = targets.shift();
    const playerStr = playerService.readable({assetId: target.assetId});
    const sellPrice = await getOptimalSellPrice(target.resourceId);
    if (!sellPrice.buyNowPrice || !sellPrice.startingBid) {
      return;
    }

    const safeBuyValue = sellPrice.startingBid * BUY_REFERENCE_PERCT;
    const price = p => (p.currentBid != 0 ? p.currentBid : p.startingBid);
    let batch = 0;
    while (true) {
      let auctions = (await fut.getPlayerTransferData(
        target.resourceId,
        batch++,
        {maxb: tradePrice(safeBuyValue)}
      ))
        .filter(a => !a.watched)
        .filter(a => !a.tradeOwner);

      auctions = auctions.sort((a, b) => a.buyNowPrice - b.buyNowPrice);
      if (auctions.length === 0) {
        continue;
      }

      const lowest = auctions[0];
      const lowestTargetPrice = price(lowest);
      if (lowestTargetPrice <= safeBuyValue) {
        if (this.budget <= lowest.buyNowPrice) {
          break;
        }

        try {
          await fut.bid(lowest.tradeId, lowest.buyNowPrice);
          logger.info(
            `${LowPlayerInvestor.jobName} bid ${playerStr} with ${lowest.buyNowPrice}`
          );

          const sellTarget = await fut.waitAndGetPurchasedItem(
            target.resourceId
          );
          if (sellTarget) {
            this.boughtPlayers.push({
              ...sellPrice,
              price: lowest.buyNowPrice,
              assetId: target.assetId,
            });
            this.spent += lowest.buyNowPrice;
            this.budget -= lowest.buyNowPrice;

            await fut.sellPlayer({
              ...sellPrice,
              duration: 3600,
              itemData: {id: sellTarget.id, assetId: sellTarget.assetId}
            });
          } else {
            logger.info(`${playerStr} was not found in purchased list`);
          }
        } catch (e) {
          const err: AxiosError = e;
          logger.error(
            `[Invest:LowPlayer]: bid error for ${playerService.readable(
              lowest.itemData
            )} with bid ${lowest.buyNowPrice}. Reason: ${
              err.response.status
            }, ${err.response.data}`
          );
        }
        break;
      }

      if (batch > MAX_AUCTION_TRY) break;
    }
  }

  public report() {
    return {
      budget: this.budget,
      spent: this.spent,
      boughtPlayers: this.boughtPlayers.map(p => ({
        price: p.price,
        sell: `${p.startingBid}/${p.buyNowPrice}`,
        name: playerService.readable({assetId: p.assetId})
      }))
    };
  }

  public targetCount() {
    return {
      count: targets.length
    }
  }
}

async function setupTargets(price: string, maxTargets: number) {
  if (setingUp) return;

  setingUp = true;
  const pageLimit = Math.ceil(maxTargets / 30);
  const platform = await fut.getPlatform();
  const priceKey = `${platform.toLowerCase()}_price`;
  const clubPlayers = await fut.getClubPlayers();
  const isInClubPlayers = (resourceId: number) => clubPlayers.filter(p => p.resourceId === resourceId).length > 0;

  for (let i = 0; i < pageLimit; i++) {
    targets = targets.concat(
      await investService.getTargets({
        page: i,
        [priceKey]: price
      })
    );
  }

  targets = uniq(targets);
  targets = targets.filter(t => !isInClubPlayers(t.resourceId));
  setingUp = false;
}
