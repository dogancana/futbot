import { ClearPile, SellXPlayers } from './trade-jobs';
import { fut } from "../api";
import { playerService } from '../player';

export namespace tradeService {
  let clearPileJob: ClearPile
  let sellXPlayersJob: SellXPlayers

  export interface SellingReport {
    cleared: number
  }
  export function startSelling() {
    if (!clearPileJob) clearPileJob = new ClearPile()
    if (!sellXPlayersJob) sellXPlayersJob = new SellXPlayers(5)

    return {
      timesClearedPile: clearPileJob.execTime,
      timesSellBatch: sellXPlayersJob.execTime,
      soldPlayers: sellXPlayersJob.soldPlayers.map(p => ({
        player: playerService.readable({ assetId: p.assetId }),
        ...(p.price)
      }))
    }
  }

  export async function clearPile(): Promise<string[]> {
    let players = await fut.getTradePile()
    players = players.filter(p => (p.tradeId === 0 || p.tradeState !== 'active'));
    const expired = players.filter(p => (p.tradeId === 0 || p.tradeState === 'expired'))
    const sold = players.filter(p => (p.tradeId === 0 || p.tradeState === 'closed'))

    if (sold.length > 0) {
      await fut.clearSold()
    }

    for (const player of expired) {
      await fut.sendToClub(player.itemData.id)
    }

    return players.map(p => playerService.readable({ assetId: p.itemData.assetId }))
  }
}
