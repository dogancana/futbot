import { fut } from '../api';
import { playerService } from '../player';
import { filterPlayers } from '../player/player-utils';

export namespace club {
  export async function getPlayersToSell() {
    const batch = 100;
    const squadPlayers = await fut.getSquadPlayerIds();
    const squadPlayerIDs = squadPlayers.map(p => p.id);
    const playerCount = (await fut.getClubItemMeta()).filter(
      d => d.type === 'players'
    )[0].typeValue;
    let players: fut.ItemData[] = [];
    for (let i = 0; i < playerCount / batch; i++) {
      players = players.concat(await fut.getClubPlayers(i));
    }

    if (!players) {
      return null;
    }

    players = players.filter(p => squadPlayerIDs.indexOf(p.id) === -1);
    players = players.filter(p => p.itemState === 'free');
    players = filterPlayers(players, {
      tradeableOnly: true
    });

    return players;
  }
}
