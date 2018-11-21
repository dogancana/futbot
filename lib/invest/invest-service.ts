import * as cheerio from 'cheerio'
import { futbin, fut } from '../api';
import { LowPlayerInvestor, LowPlayerInvestorProps } from './invest-jobs';

export namespace investService {
  let lowPlayerInvestJob: LowPlayerInvestor

  export interface TargetInfo {
    resourceId: number
    futbinId: number
    assetId: number
  }
  export async function getTargets (query: futbin.PlayersQuery): Promise<TargetInfo[]> {
    const platform = await fut.getPlatform()
    const priceKey = `${platform.toLowerCase()}_price`
    const defaultQuery = {
      page: 1,
      [priceKey]: '1000-2500',
      sort: 'likes',
      order: 'desc'
    }
    const playerIds = await futbin.getPlayerIDs({
      ...defaultQuery,
      ...query
    })

    const playerInfos: TargetInfo[] = []
    for (const playerId of playerIds) {
      const info = await futbin.getPlayer(playerId)
      playerInfos.push(info)
    }

    return playerInfos
  }

  export function startLowPlayerInvvest (props: LowPlayerInvestorProps) {
    if (!lowPlayerInvestJob) lowPlayerInvestJob = new LowPlayerInvestor(props)

    return {
      timesTargetBought: lowPlayerInvestJob.execTime,
      report: lowPlayerInvestJob.report()
    }
  }

  export function clearLowPlayerInvest () {
    if (lowPlayerInvestJob) lowPlayerInvestJob.stop()
    lowPlayerInvestJob = null
  }
}
