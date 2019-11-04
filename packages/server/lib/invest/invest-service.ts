import { uniqBy } from 'lodash';
import { futbin } from '../api';

export namespace investService {
  export let targets: futbin.FutbinIDs[] = [];
  export const targetPages: string[] = [];
  export let originalTargets: futbin.FutbinIDs[] = [];

  export async function addTargetPage(page: string) {
    let players = uniqTargets(await futbin.getAssetIDsFromPage(page));
    players = await Promise.all(
      players.map(async p => {
        const { assetId, futbinId, resourceId } = p;
        if (!assetId || !resourceId) {
          return await futbin.getPlayer(futbinId);
        }
        return p;
      })
    );

    originalTargets = uniqTargets([...originalTargets, ...players]);

    reloadTargets();

    return players;
  }

  export function reloadTargets() {
    targets = uniqTargets([...targets, ...originalTargets]);
  }

  function uniqTargets(t: futbin.FutbinIDs[]): futbin.FutbinIDs[] {
    return uniqBy(t, v => `${v.resourceId}${v.assetId}`);
  }
}
