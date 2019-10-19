import { fut } from '../api';
import { club } from '../club/club-service';
import { Job } from '../jobs';
import { playerService } from '../player';
import { StaticItems } from '../static';
import { logger } from './../logger';
import { tradeService } from './trade-service';
import { SellPrice } from './trade-utils';
import { uniqBy } from 'lodash';

const TRADE_PILE_FULL_ERROR_CODES = [461, 403];
const PASS_THROUGH_SELL_ERROR_CODES = [];

export class ClearPile extends Job {
  constructor() {
    super(
      'Trade:ClearPile',
      1 / 5 // every 5 mins
    );

    this.start(async () => {
      try {
        await tradeService.clearPile();
      } catch (e) {
        logger.error(`Error while clearing trade pile: ${e}`);
      }
    });
  }
}

export interface PlayerSellReport extends fut.ItemData {
  price: SellPrice;
}
export class SellXPlayers extends Job {
  private static jobName: string = 'Trade:SellAPlayer';
  public soldPlayers: Array<{ price: SellPrice } & fut.ItemData>;
  private amount: number;
  private maxRating: number;

  constructor(amount: number = 10, maxRating: number = 84) {
    super(
      SellXPlayers.jobName,
      1 // per min avg exec time: 29s
    );

    this.amount = amount;
    this.maxRating = maxRating;
    this.soldPlayers = [];
    this.start(this.sellPlayers);
  }

  public report() {
    return {
      soldPlayers: this.soldPlayers.map(
        a =>
          `${playerService.readable(a)} listed for ${a.price.startingBid}/${
            a.price.buyNowPrice
          }`
      )
    };
  }

  private async sellPlayers() {
    const players = (await club.getPlayersToSell()).slice(0, this.amount);
    for (const player of players) {
      try {
        const data = StaticItems.itemData[player.assetId] || { rating: 999 };
        if (data.rating > this.maxRating) {
          continue;
        }
        const sellResult = await tradeService.sellPlayerCheap(player);
        if (sellResult) {
          this.soldPlayers.push(sellResult);
          this.soldPlayers = uniqBy(this.soldPlayers, p => p.id);
        }
      } catch (e) {
        const response = e.response || {};
        const status = response.status || 500;
        logger.error(
          `${SellXPlayers.jobName}; couldnt sell ${playerService.readable(
            player
          )} because of error:${e.message}}`
        );
        if (TRADE_PILE_FULL_ERROR_CODES.indexOf(status) > -1) {
          logger.info(
            `${SellXPlayers.jobName} will restart after 15mins. Waiting to sell some players`
          );
        } else if (PASS_THROUGH_SELL_ERROR_CODES.indexOf(status) > -1) {
          continue;
        }
        break;
      }
    }
  }
}
