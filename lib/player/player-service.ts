import { StaticItems } from '../static';

export namespace playerService {
  export function readable(player: {
    assetId?: number;
    resourceId?: number;
  }): string {
    const id = player.assetId || player.resourceId || -1;
    const data = StaticItems.itemData[id] || {
      name: '?????',
      rating: 0
    };
    // if (data.name === "?????") console.log("readable", { player, StaticItems });

    return `${data.name}, (${data.rating})`;
  }
}
