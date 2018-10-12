import * as express from 'express';
import { getPlayersToSell, tradePrice } from './trade-utils';
import * as sleep from 'sleep-promise';
import { logger } from '../logger';
import { fut } from '../api';

export const tradeBot = express();

tradeBot.get('/sell', async function(req, res) {
  try {
    let players = await getPlayersToSell(req.query);
    players = players.map(p => {
      const quickSellPrice = Math.max(p.minBuyNow, p.averageStartingBid);
      let buyNowPrice = tradePrice(quickSellPrice * 1.10);
      const startingBid = tradePrice(quickSellPrice * 0.9);
      if (buyNowPrice === startingBid) {
        buyNowPrice = tradePrice(quickSellPrice * 1.2);
      }
      
      return {
        ...p,
        buyNowPrice,
        startingBid
      };
    })

    for(let i=0; i<players.length; i++) {
      const player = players[i];
      try {
        logger.info(`${i} of ${players.length}`);
        const res = await fut.sellPlayer({
          buyNowPrice: player.buyNowPrice,
          duration: 3600,
          itemData: { id: player.id },
          startingBid: player.startingBid
        })
        if (res.id) {
          logger.info(`\t\tplayer ${player.name} (${player.rating}) put on transfer list`);
          player.listed = true;
        } else {
          logger.error(`\t\tplayer ${player.name} (${player.rating}) couldnt be put on list. ${res}`);
          player.listed = false;
        }
        await sleep(1000);
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
    let players = await fut.getTradePile();
    players = players.filter(p => (p.tradeId === 0 || p.tradeState === 'expired'));
    for (let i=0; i<players.length; i++) {
      const res = await fut.sendToClub(players[i].itemData.id)
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
