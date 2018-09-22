import { filterPlayers } from './player-utils';
import { logger } from './logger';
import { getPlayerPriceInfo } from './player';
import * as sleep from 'sleep-promise';
import { getClubPlayers, getSquadPlayerIds } from './api';
import { itemData } from './static-items';

export async function getPlayersToSell (query) {
  const batchCount = Math.min(parseInt(query.batch, 10) || 10, 20); // 20 max
  const quality = query.quality;
  try {
    let squadPlayers = await getSquadPlayerIds();
    await sleep(200);
    let players = await getClubPlayers();
    let result = [];

    if (!players) {
      return null;
    }

    players = players.filter(p => squadPlayers.indexOf(p.id) === -1);
    players = players.filter(p => p.itemState === 'free');
    players = filterPlayers(players, { 
      tradeableOnly: true,
      quality
    });

    for (let i=0; i<batchCount && i<players.length; i++) {
      const player = players[i];
      logger.info(`getting data for ${player.id}`);
      result.push({
        id: player.id,
        assetId: player.assetId,
        name: itemData[player.assetId] || 'error',
        rating: player.rating,
        ...(await getPlayerPriceInfo(player.assetId)),
      });
      logger.info(`\t\t complete: ${player.id}`);
      await sleep(500);
    }

    return result;
  } catch (e) {
    return null;
  }
};

export function tradePrice (price: number): number {
  // 0-1000 50
  // 1k-10k 100
  // 10k-50k 250
  // 50k-100k 500
  // 100k-    1000
  if (price < 1000) {
    return Math.floor(price / 50) * 50
  } else if (price < 10 * 1000) {
    return Math.floor(price / 100) * 100
  } else if (price < 50 * 1000) {
    return Math.floor(price / 250) * 250
  } else if (price < 100 * 1000) {
    return Math.floor(price / 500) * 500
  } else {
    return Math.floor(price / 1000) * 1000
  }
}