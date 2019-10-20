import { uniqBy } from 'lodash';
import { club } from '../../club/club-service';
import { Job } from '../../jobs';
import { logger } from '../../logger';
import { playerService } from '../../player';
import { StaticItems } from '../../static';
import { tradeService } from '../trade-service';
import { calculatePossibleRevenue } from '../trade-utils';

const TRADE_PILE_FULL_ERROR_CODES = [461, 403];
const PASS_THROUGH_SELL_ERROR_CODES = [];
const PLAYER_COUNT_TO_SELL_AT_ONCE = 5;

export class SellUnusedPlayers extends Job {
  public playersListed: tradeService.PlayerSellConf[];
  private maxRating: number;

  constructor(maxRating: number = 84) {
    super(
      'Trade:SellAPlayer',
      1 // per min avg exec time: 29s
    );

    this.maxRating = maxRating;
    this.playersListed = [];
    this.start(this.loop);
  }

  public report() {
    return {
      possibleProfitExcludingEATax: calculatePossibleRevenue(
        this.playersListed
      ).toFixed(0),
      playersListed: this.playersListed.map(
        p =>
          `${playerService.readable(p)} listed for ${p.price.startingBid}/${
            p.price.buyNowPrice
          }.` + `${p.lastSalePrice ? 'Bought for ' + p.lastSalePrice : ''}`
      )
    };
  }

  private async loop() {
    const players = (await club.getNonSquadTradeablePlayers()).slice(
      0,
      PLAYER_COUNT_TO_SELL_AT_ONCE
    );
    logger.info(`[SellUnusedPlayers] ${players.length} players will be sold`);
    for (const player of players) {
      try {
        const data = StaticItems.itemData[player.assetId] || {
          rating: 999
        };
        if (data.rating > this.maxRating) {
          continue;
        }
        const sellResult = await tradeService.sellPlayerOptimal(player);
        if (sellResult) {
          this.playersListed.push(sellResult);
          this.playersListed = uniqBy(this.playersListed, p => p.id);
        }
      } catch (e) {
        const response = e.response || {};
        const status = response.status || 500;
        logger.error(
          `[SellUnusedPlayers]; couldnt sell ${playerService.readable(
            player
          )} because of error:${e}}`
        );
        if (TRADE_PILE_FULL_ERROR_CODES.indexOf(status) > -1) {
          logger.info(`[SellUnusedPlayers] Trade pile is full.`);
        } else if (PASS_THROUGH_SELL_ERROR_CODES.indexOf(status) > -1) {
          continue;
        }
        break;
      }
    }
  }
}
