import { logger } from "./../logger";
import { Job } from "./../job";
import { tradeService } from "./trade-service";
import { club } from "../club/club-service";
import { SellPrice } from "./trade-utils";
import { fut } from "../api";
import { playerService } from "../player";
import { StaticItems } from "../static";

const TRADE_PILE_FULL_ERROR_CODES = [461, 403];
const PASS_THROUGH_SELL_ERROR_CODES = [];

export class ClearPile extends Job {
  constructor() {
    super(
      "Trade:ClearPile",
      1 / 5 // every 5 mins
    );

    this.start(tradeService.clearPile);
  }
}

export interface PlayerSellReport extends fut.ItemData {
  price: SellPrice;
}
export class SellXPlayers extends Job {
  public soldPlayers: ({ price: SellPrice } & fut.ItemData)[];
  private amount: number;
  private maxRating: number;
  private static jobName: string = "Trade:SellAPlayer";

  constructor(amount: number = 10, maxRating: number = 84) {
    super(
      SellXPlayers.jobName,
      1 // once per min
    );

    this.amount = amount;
    this.maxRating = maxRating;
    this.soldPlayers = [];
    this.start(this.sellPlayers);
  }

  private async sellPlayers() {
    const players = (await club.getPlayersToSell()).slice(0, this.amount);
    for (const player of players) {
      try {
        const data = StaticItems.itemData[player.assetId] || { rating: 999 };
        if (data.rating > this.maxRating) continue;
        const sellResult = await tradeService.sellPlayerCheap(player);
        if (sellResult) this.soldPlayers.push(sellResult);
      } catch (e) {
        logger.error(
          `${SellXPlayers.jobName}; couldnt sell ${playerService.readable(
            player
          )} because of error:${e.message}}`
        );
        if (TRADE_PILE_FULL_ERROR_CODES.indexOf(e.response.status) > -1) {
          logger.info(
            `${SellXPlayers.jobName} will restart after 15mins. Waiting to sell some players`
          );
          this.stop();
          setTimeout(this.start, 15 * 60 * 1000);
        } else if (
          PASS_THROUGH_SELL_ERROR_CODES.indexOf(e.response.status) > -1
        ) {
          continue;
        }
        break;
      }
    }
  }
}
