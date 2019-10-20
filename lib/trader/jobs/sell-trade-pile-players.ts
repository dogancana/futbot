import { uniqBy } from 'lodash';
import { fut } from '../../api';
import { Job } from '../../jobs';
import { logger } from '../../logger';
import { playerService } from '../../player';
import { tradeService } from '../trade-service';
import { calculatePossibleRevenue } from '../trade-utils';

const PLAYERS_TO_SELL_AT_ONCE = 5;

export class SellTradePilePlayers extends Job {
  private playersListed: tradeService.PlayerSellConf[];

  constructor() {
    super(
      'RelistExpiredPlayers',
      1 // every min
    );
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
          `${playerService.readable(p)} listed for ${p.sellPrice.startingBid}/${
            p.sellPrice.buyNowPrice
          }.` + `${p.lastSalePrice ? 'Bought for ' + p.lastSalePrice : ''}`
      )
    };
  }

  private async loop() {
    const players = (await fut.getTradePile())
      .filter(p => p.tradeState !== 'active')
      .slice(0, PLAYERS_TO_SELL_AT_ONCE);

    if (players.length === 0) {
      logger.info(`[SellTradePilePlayers] nothing to sell.`);
      return;
    }

    logger.info(`[SellTradePilePlayers] ${players.length} will be sold.`);
    for (const player of players) {
      const result = await tradeService.sellPlayerOptimal(player.itemData);
      if (result) {
        this.playersListed.push(result);
      }
    }

    this.playersListed = uniqBy(this.playersListed, p => p.id);
  }
}
