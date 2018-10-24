import { logger } from './../logger';
import { ItemData, StaticItems, StaticPlayerData } from './../static/static-items';
import { playerService } from "../player";
import { club } from "../club/club-service";
import { fut } from "../api";
import { pick, cloneDeep } from "lodash";

export namespace tradeService {
  let sellQueue: fut.ItemData[] = [];
  let sold: ListedPlayer[] = [];


  export function getSellQueue (): fut.ItemData[] {
    return cloneDeep(sellQueue)
  } 


  export async function getPlayersToSellWithPrices(limit: number = Number.MAX_VALUE): Promise<playerService.Details[]> {
    const players = await club.getPlayersToSell();
    const result: playerService.Details[] = []

    for (const player of players.slice(0, limit)) {
      result.push(await getPlayerDetails(player))
    }

    return result
  }


  export function putPlayersToQueue(players: fut.ItemData[]): void {
    sellQueue = sellQueue.concat(players);
    logger.info(`
    ${players.length} players added to sell queue. Total queue: ${sellQueue.length}
    `)
  }


  export async function sellAPlayer(player: fut.ItemData): Promise<void> {
    const details = await getPlayerDetails(player)

  }


  export async function getPlayerDetails (player: fut.ItemData): Promise<playerService.Details> {
    const DISABLE_MARKET_PRICE = true;
    return await playerService.getPlayerDetails(player.assetId, player.resourceId, DISABLE_MARKET_PRICE)
  }


  interface ReportPlayer {
    commonName: string
    rating: number
  }
  interface ListedPlayer extends ReportPlayer {
    listed: {
      starting: number
      buyNow: number
    }
  }
  interface SellReport {
    queue: ReportPlayer[]
    sold: ListedPlayer[]
  }
  export function getSellingReport (): SellReport {
    return {
      queue: sellQueue.map(p => pick(StaticItems.itemData[p.assetId.toString()], 'name', 'rating')),
      sold
    }
  }
}
