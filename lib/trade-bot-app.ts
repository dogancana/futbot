import * as express from 'express';
import { getPlayersToSell, tradePrice } from './trade-utils';
import { sellPlayer, getTradePile, sendToClub } from './api';
import * as sleep from 'sleep-promise';
import { logger } from './logger';

export const tradeBot = express();

tradeBot.get('/sell', async function(req, res) {
  try {
    let players = await getPlayersToSell(req.query);
    players = players.map(p => ({
      ...p,
      buyNowPrice: Math.max(p.minBuyNow, p.averageStartingBid) * 1.20,
      startingBid: Math.max(p.minBuyNow, p.averageStartingBid)
    }))

    for(let i=0; i<players.length; i++) {
      const player = players[i];
      try {
        const res = await sellPlayer({
          buyNowPrice: tradePrice(player.buyNowPrice),
          duration: 3600,
          itemData: { id: player.id },
          startingBid: tradePrice(player.startingBid)
        })
        if (res.id) {
          logger.info(`\t\tplayer ${player.name} (${player.rating}) put on transfer list`);
          player.listed = true;
        } else {
          logger.error(`\t\tplayer ${player.name} (${player.rating}) couldnt be put on list. ${res}`);
          player.listed = false;
        }
        await sleep(500);
      } catch (e) {
        logger.error(`\t\tplayer ${player.name} (${player.rating}) couldnt be put on list. Error! ${e.description}`)
      }
    }

    res.send(JSON.stringify(players));
  } catch (e) {
    res.status(500).send(e);
  }
});

tradeBot.get('/clear-pile', async function (req, res) {
  try {
    let players = await getTradePile();
    players = players.filter(p => (p.tradeId === 0 || p.tradeState === 'expired'));
    for (let i=0; i<players.length; i++) {
      const res = await sendToClub(players[i].itemData.id)
      await sleep(200);
      if (res) {
        players[i].sentToClub = true
      }
    }
    res.send(JSON.stringify(players));
  } catch (e) {
    res.status(500).send(e.message);
  }
});
