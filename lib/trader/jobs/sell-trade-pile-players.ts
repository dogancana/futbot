import { uniq, uniqBy } from 'lodash';
import { fut } from '../../api';
import { envConfig } from '../../config';
import { Job } from '../../jobs';
import { getLogger } from '../../logger';
import { playerService } from '../../player';
import { tradeService } from '../trade-service';
import { calculatePossibleRevenue } from '../trade-utils';

const logger = getLogger('SellTradePileJob');
const PLAYERS_TO_SELL_AT_ONCE = 5;

export class SellTradePilePlayers extends Job {
  private playersListed: tradeService.PlayerSellConf[];
  private skipPlayers: number[] = [];

  constructor() {
    super('SellTradePilePlayers', envConfig().FUTBOT_JOB_IMP_SELL_TRADE_PILE);
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
    this.skipPlayers = uniq(this.skipPlayers);

    const players = (await fut.getTradePile())
      .filter(p => p.tradeState !== 'active')
      .filter(p => this.skipPlayers.indexOf(p.itemData.resourceId) === -1)
      .slice(0, PLAYERS_TO_SELL_AT_ONCE);

    if (players.length === 0) {
      logger.info(`nothing to sell.`);
      return;
    }

    logger.info(`${players.length} will be sold.`);
    for (const player of players) {
      const result = await tradeService.sellPlayerOptimal(player.itemData);
      if (result) {
        this.playersListed.push(result);
      } else {
        this.skipPlayers.push(player.itemData.resourceId);
      }
    }

    this.playersListed = uniqBy(this.playersListed, p => p.id);
  }
}
