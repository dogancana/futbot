import { logger } from './../logger';
import { Job } from './../job';
import { tradeService } from './trade-service';
import { club } from '../club/club-service';
import { getOptimalSellPrice, SellPrice } from './trade-utils';
import { fut } from '../api';
import { playerService } from '../player';

const TRADE_PILE_FULL_ERROR_CODES = [ 461, 403 ]
const PASS_THROUGH_SELL_ERROR_CODES = []

export class ClearPile extends Job {
  constructor () {
    super(
      'Trade:ClearPile',
      1/5,    // every 5 mins
      tradeService.clearPile
    )
  }
}

export interface PlayerSellReport extends fut.ItemData {
  price: SellPrice
}
export class SellXPlayers extends Job {
  public soldPlayers: ({ price: SellPrice } & fut.ItemData)[]

  constructor (amount: number = 10) {
    const jobName = `Trade:SellAPlayer`;
    const sellPlayers = async () => {
      const players = (await club.getPlayersToSell()).slice(0, amount)
      for (const player of players) {
        let price: SellPrice = await getOptimalSellPrice(player.assetId)
        price.buyNowPrice = Math.min(price.buyNowPrice, player.marketDataMaxPrice)
        try {
          const resp = await fut.sellPlayer({
            ...price,
            duration: 3600,
            itemData: { id: player.id, assetId: player.assetId }
          })
          if (resp) {
            this.soldPlayers.push({
              ...player,
              price
            })
          }
        } catch (e) {
          logger.error(`${jobName}; couldnt sell ${playerService.readable(player)} because of error:${e.message}}`)
          if (TRADE_PILE_FULL_ERROR_CODES.indexOf(e.response.status) > -1) {
            logger.info(`${jobName} will restart after 15mins. Waiting to sell some players`)
            this.stop()
            setTimeout(this.start, 15 * 60 * 1000)
          } else if (PASS_THROUGH_SELL_ERROR_CODES.indexOf(e.response.status) > -1) {
            continue
          }
          break
        }
      }
    }

    super(
      jobName,
      1,    // once per min
      sellPlayers
    )

    this.soldPlayers = []
  }
}
