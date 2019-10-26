import { uniq, uniqBy } from 'lodash';
import { club } from '../../club/club-service';
import { envConfig } from '../../config';
import { Job } from '../../jobs';
import { getLogger } from '../../logger';
import { playerService } from '../../player';
import { StaticItems } from '../../static';
import { tradeService } from '../trade-service';
import { calculatePossibleRevenue } from '../trade-utils';

const logger = getLogger('SellUnusedJob');
const TRADE_PILE_FULL_ERROR_CODES = [461, 403];
const PASS_THROUGH_SELL_ERROR_CODES = [];
const PLAYER_COUNT_TO_SELL_AT_ONCE = 5;

export class SellUnusedPlayers extends Job {
  public playersListed: tradeService.PlayerSellConf[];
  private maxRating: number;
  private playersToSkip: number[] = [];

  constructor(maxRating: number = 84) {
    super('SellUnusedPlayers', envConfig().FUTBOT_JOB_IMP_SELL_UNUSED);

    this.maxRating = maxRating;
    this.playersListed = [];
    this.setTask(this.loop);
  }

  public report() {
    return {
      possibleProfitExcludingEATax: calculatePossibleRevenue(
        this.playersListed
      ).toFixed(0),
      playersListed: this.playersListed.map(
        p =>
          `${playerService.readable(p)} listed for ${p.sellPrice.startingBid}/${
            p.sellPrice.buyNowPrice
          }.` + `${p.lastSalePrice ? 'Bought for ' + p.lastSalePrice : ''}`
      )
    };
  }

  private async loop() {
    this.playersToSkip = uniq(this.playersToSkip);

    const players = (await club.getNonSquadTradeablePlayers(100))
      .filter(p => this.playersToSkip.indexOf(p.resourceId) === -1)
      .slice(0, PLAYER_COUNT_TO_SELL_AT_ONCE);

    logger.info(
      `${players.length} players will be sold. Max rating: ${this.maxRating}`
    );
    for (const player of players) {
      try {
        const data = StaticItems.itemData[player.assetId] || {
          rating: 999
        };
        if (data.rating > this.maxRating) {
          this.playersToSkip.push(player.resourceId);
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
          `couldnt sell ${playerService.readable(
            player
          )} because of error:${e}}`
        );
        this.playersToSkip.push(player.resourceId);
        if (TRADE_PILE_FULL_ERROR_CODES.indexOf(status) > -1) {
          logger.info(`Trade pile is full.`);
        } else if (PASS_THROUGH_SELL_ERROR_CODES.indexOf(status) > -1) {
          continue;
        }
        break;
      }
    }
  }
}
