import { fut, futbin } from '../api';
import { getLogger } from './../logger';

const logger = getLogger('InvestService');

export namespace investService {
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
}
