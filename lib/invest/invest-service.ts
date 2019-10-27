import { fut, futbin } from '../api';
import { getLogger } from './../logger';
import {
  GoodAuctionInvestor,
  LowPlayerInvestor,
  LowPlayerInvestorProps
} from './jobs';
import { GoodAuctionInvestorProps } from './jobs/good-auction-investor';

const logger = getLogger('InvestService');

export namespace investService {
  let lowPlayerInvestJob: LowPlayerInvestor;
  let goodAuctionInvestor: GoodAuctionInvestor;

  export interface TargetInfo {
    resourceId: number;
    futbinId: number;
    assetId: number;
  }

  export async function getTargets(
    query: futbin.PlayersQuery
  ): Promise<TargetInfo[]> {
    const platform = await fut.getPlatform();
    const priceKey = `${platform.toLowerCase()}_price`;
    const prpKey = `${platform.toLowerCase()}_prp`;
    const defaultQuery = {
      page: 1,
      [priceKey]: '1000-2500',
      [prpKey]: '20,100',
      sort: 'likes',
      // version: 'gold',
      order: 'desc'
    };
    const q = {
      ...defaultQuery,
      ...query
    };

    // futbin gives 404 with prp
    if (platform === 'xbox') {
      delete q[prpKey];
    }

    const playerIds = await futbin.getPlayerIDs(q as any);
    logger.debug(`Target ids: ${playerIds}`);

    const playerInfos: TargetInfo[] = [];
    for (const playerId of playerIds) {
      const info = await futbin.getPlayer(playerId);
      playerInfos.push(info);
    }

    return playerInfos;
  }

  export function startLowPlayerInvest(props: LowPlayerInvestorProps) {
    if (!lowPlayerInvestJob) {
      lowPlayerInvestJob = new LowPlayerInvestor(props);
    }

    return {
      timesTargetBought: lowPlayerInvestJob.execTime,
      report: lowPlayerInvestJob.report(),
      target: lowPlayerInvestJob.targetCount()
    };
  }

  export function clearLowPlayerInvest() {
    if (lowPlayerInvestJob) {
      lowPlayerInvestJob.stop();
    }
    lowPlayerInvestJob = null;
  }

  export function startGoodAuctionInvest(props: GoodAuctionInvestorProps) {
    if (!goodAuctionInvestor) {
      goodAuctionInvestor = new GoodAuctionInvestor(props);
    }

    return {
      timesMarketChecked: goodAuctionInvestor.execTime,
      report: goodAuctionInvestor.report()
    };
  }

  export function clearGoodAuctionInvest() {
    if (goodAuctionInvestor) {
      goodAuctionInvestor.stop();
    }
    goodAuctionInvestor = null;
  }
}
