import { ClearPile, SellXPlayers } from './trade-jobs';
import { fut } from "../api";
import { playerService } from '../player';
import { logger } from '../logger';
import { SellPrice, getOptimalSellPrice } from './trade-utils';

export namespace tradeService {
  let clearPileJob: ClearPile
  let sellXPlayersJob: SellXPlayers

  export interface SellingReport {
    cleared: number
  }
  export function startSelling() {
    if (!clearPileJob) clearPileJob = new ClearPile()
    if (!sellXPlayersJob) sellXPlayersJob = new SellXPlayers(5)

    return sellReport()
  }

  export function stopSelling() {
    clearPileJob && clearPileJob.stop()
    clearPileJob = null

    sellXPlayersJob && sellXPlayersJob.stop()
    sellXPlayersJob = null

    return sellReport()
  }

  function sellReport() {
    return {
      timesClearedPile: clearPileJob && clearPileJob.execTime,
      timesSellBatch: sellXPlayersJob && sellXPlayersJob.execTime,
      soldPlayers: sellXPlayersJob && sellXPlayersJob.soldPlayers.map(p => ({
        player: playerService.readable({ assetId: p.assetId }),
        ...(p.price)
      }))
    }
  }

  export async function sellPlayerCheap(player: fut.ItemData): Promise<fut.ItemData & { price: SellPrice }> {
    let price: SellPrice = await getOptimalSellPrice(player.resourceId)
    if (!price) {
      logger.error(`No price information for ${playerService.readable(player)}`);
      return null
    }
    price.buyNowPrice = Math.min(price.buyNowPrice, player.marketDataMaxPrice)
    const resp = await fut.sellPlayer({
      ...price,
      duration: 3600,
      itemData: { id: player.id, assetId: player.assetId }
    })
    if (resp) {
      return ({
        ...player,
        price
      })
    }
  }

  export async function clearPile(): Promise<string[]> {
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
      if (relatedResult && !relatedResult.success) {
        logger.error(`${playerService.readable({ assetId: player.itemData.assetId })} couldnt be moved to club. Reason: ${relatedResult.reason}(${relatedResult.errorCode})`)
        await sellPlayerCheap(player.itemData)
      }
    }

    return players.map(p => playerService.readable({ assetId: p.itemData.assetId }))
  }
}
