import { logger } from './../logger';
import { Job } from './../job';
import { tradeService } from './trade-service';
import { club } from '../club/club-service';
import { SellPrice } from './trade-utils';
import { fut } from '../api';
import { playerService } from '../player';
import { StaticItems } from '../static';

const TRADE_PILE_FULL_ERROR_CODES = [ 461, 403 ]
const PASS_THROUGH_SELL_ERROR_CODES = []

export class ClearPile extends Job {
  constructor (maxRating: number = 70) {
    const clearPile = async () => {
      let players = await fut.getTradePile()
      players = players.filter(p => (p.tradeId === 0 || p.tradeState !== 'active'));
      const expired = players.filter(p => (p.tradeId === 0 || p.tradeState === 'expired'))
      const sold = players.filter(p => (p.tradeId === 0 || p.tradeState === 'closed'))

      if (sold.length > 0) {
        try {
          await fut.clearSold()
        } catch (e) {
          // noop
        }
      }

      for (const player of expired) {
        const result = await fut.sendToClub(player.itemData.id)
        const relatedResult = result.itemData.filter(i => i.id === player.itemData.id)[0]
        const data = StaticItems.itemData[player.itemData.assetId] || { rating: 999 }
        if (relatedResult && !relatedResult.success) {
          logger.error(`${playerService.readable({ assetId: player.itemData.assetId })} couldnt be moved to club. Reason: ${relatedResult.reason}(${relatedResult.errorCode})`)
          if (data.rating > maxRating) {
            logger.info(`${playerService.readable({ assetId: player.itemData.assetId })} will stay in pile due to the high rating`)
            continue
          }
          await tradeService.sellPlayerCheap(player.itemData)
        }
      }

      return players.map(p => playerService.readable({ assetId: p.itemData.assetId }))
    }
    super(
      'Trade:ClearPile',
      1/5,    // every 5 mins
      clearPile
    )
  }
}

export interface PlayerSellReport extends fut.ItemData {
  price: SellPrice
}
export class SellXPlayers extends Job {
  public soldPlayers: ({ price: SellPrice } & fut.ItemData)[]

  constructor (amount: number = 10, maxRating: number = 84) {
    const jobName = `Trade:SellAPlayer`;
    const sellPlayers = async () => {
      const players = (await club.getPlayersToSell()).slice(0, amount)
      logger.info(`${jobName}: start to sell ${amount} players under ${maxRating} rating`)
      for (const player of players) {
        try {
          const data = StaticItems.itemData[player.assetId] || { rating: 999 }
          if (data.rating > maxRating) continue
          const sellResult = await tradeService.sellPlayerCheap(player)
          if (sellResult) this.soldPlayers.push(sellResult)
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
