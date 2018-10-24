import { pick } from 'lodash';
import * as express from 'express';
import { tradePrice, getFutbinPrice } from './trade-utils';
import { logger } from '../logger';
import { fut, futbin } from '../api';
import { club } from '../club/club-service';
import { tradeService } from './trade-service';
import { playerService } from '../player';
import { StaticItems } from '../static';

export const tradeBotApp = express();

tradeBotApp.get('/start-selling', async function (req, res) {
  let report = tradeService.getSellingReport();
  if (report.queue.length === 0) {
    const players = await club.getPlayersToSell();
    tradeService.putPlayersToQueue(players)
    report = tradeService.getSellingReport();
  }
  res.send(report)
});

tradeBotApp.get('/sell-potential', async function(req, res) {
  const players = tradeService.getSellQueue();
  const result = [];

  for (const player of players) {
    const price = await tradeService.getPlayerDetails(player)
    const sellPrice = await getFutbinPrice(price)
    console.log('wtf', sellPrice)
    result.push(
      {
        ...sellPrice,
        ...(StaticItems.itemData[player.assetId.toString()])
      }
    )
  }

  res.send(result)
  // try {
  //   let players = await club.getPlayersToSell();
  //   players = players.map(p => {
  //     const quickSellPrice = Math.max(p.minBuyNow, p.averageStartingBid);
  //     let buyNowPrice = tradePrice(quickSellPrice * 1.10);
  //     const startingBid = tradePrice(quickSellPrice * 0.9);
  //     if (buyNowPrice === startingBid) {
  //       buyNowPrice = tradePrice(quickSellPrice * 1.2);
  //     }
      
  //     return {
  //       ...p,
  //       buyNowPrice,
  //       startingBid
  //     };
  //   })

  //   for(let i=0; i<players.length; i++) {
  //     const player = players[i];
  //     try {
  //       logger.info(`${i} of ${players.length}`);
  //       const res = await fut.sellPlayer({
  //         buyNowPrice: player.buyNowPrice,
  //         duration: 3600,
  //         itemData: { id: player.id },
  //         startingBid: player.startingBid
  //       })
  //       if (res.id) {
  //         logger.info(`\t\tplayer ${player.name} (${player.rating}) put on transfer list`);
  //         player.listed = true;
  //       } else {
  //         logger.error(`\t\tplayer ${player.name} (${player.rating}) couldnt be put on list. ${res}`);
  //         player.listed = false;
  //       }
  //     } catch (e) {
  //       logger.error(`\t\tplayer ${player.name} (${player.rating}) couldnt be put on list. Error! ${e.description}`)
  //     }
  //   }

  //   res.send(JSON.stringify(players));
  // } catch (e) {
  //   res.status(500).send(e);
  // }
});

tradeBotApp.get('/clear-pile', async function (req, res) {
  try {
    let players = await fut.getTradePile();
    players = players.filter(p => (p.tradeId === 0 || p.tradeState === 'expired'));
    for (let i=0; i<players.length; i++) {
      await fut.sendToClub(players[i].itemData.id)
    }
    res.send(JSON.stringify(players));
  } catch (e) {
    res.status(500).send(e.message);
  }
});
