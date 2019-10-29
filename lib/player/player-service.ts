import { fut, futbin } from '../api';
import { StaticItems } from '../static';

export namespace playerService {
  export async function getFutbinPrice(resourceId: number) {
    const prices = await futbin.getPrice(resourceId);
    const platform = await fut.getPlatform();
    return prices[platform];
  }

  export function readable(player: {
    assetId?: number;
    resourceId?: number;
  }): string {
    const id = player.assetId || player.resourceId || -1;
    const data = StaticItems.itemData[id] || {
      name: '?????',
      rating: 0
    };

    return `${data.name}, (${data.rating})`;
  }
}
