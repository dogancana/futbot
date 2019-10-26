import { fut } from '../api';
import { filterPlayers } from '../player/player-utils';

export namespace club {
  export async function getNonSquadPlayers(
    maxAmount?: number
  ): Promise<fut.ItemData[]> {
    const batch = 100;
    const squadPlayerIDs = (await fut.getSquadPlayerIds()).map(p => p.id);
    const playerCount = (await fut.getClubItemMeta()).filter(
      d => d.type === 'players'
    )[0].typeValue;
    let players: fut.ItemData[] = [];
    for (let i = 0; i < playerCount / batch; i++) {
      if (maxAmount && players.length >= maxAmount) {
        break;
      }
      players = players.concat(await fut.getClubPlayers(i, batch));
    }

    if (!players) {
      return null;
    }

    return players.filter(p => squadPlayerIDs.indexOf(p.id) === -1);
  }

  export async function getNonSquadTradeablePlayers(
    maxAmount?: number
  ): Promise<fut.ItemData[]> {
    const players = await getNonSquadPlayers(maxAmount);
    return filterPlayers(players, { tradeableOnly: true }).filter(
      p => p.itemState === 'free'
    );
  }
}
