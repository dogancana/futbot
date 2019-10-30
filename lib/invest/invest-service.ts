import { uniqBy } from 'lodash';
import { futbin } from '../api';

export namespace investService {
  export let targets: futbin.FutbinIDs[] = [];
  export const targetPages: string[] = [];
  export let originalTargets: futbin.FutbinIDs[] = [];

  export async function addTargetPage(page: string) {
    let players = await futbin.getAssetIDsFromPage(page);
    players = await Promise.all(
      players.map(async p => {
        const { assetId, futbinId, resourceId } = p;
        if (!assetId || !resourceId) {
          return await futbin.getPlayer(futbinId);
        }
        return p;
      })
    );

    originalTargets = [...originalTargets, ...players];
    originalTargets = uniqBy(
      originalTargets,
      t => `${t.resourceId}${t.assetId}`
    );

    reloadTargets();

    return players;
  }

  export function reloadTargets() {
    targets = [...targets, ...originalTargets];
    targets = uniqBy(originalTargets, t => `${t.resourceId}${t.assetId}`);
  }
}
