import * as express from 'express';
import { defineJobEndpoints } from '../jobs';
import { SellTradePilePlayers, SellUnusedPlayers } from './jobs';
import { tradeService } from './trade-service';

export const tradeBotApp = express();

defineJobEndpoints(tradeBotApp, 'sell-unused', q => {
  const { maxRating } = q;
  return new SellUnusedPlayers(parseInt(maxRating, 10));
});

defineJobEndpoints(
  tradeBotApp,
  'sell-trade-pile',
  q => new SellTradePilePlayers()
);

tradeBotApp.get('/clear-pile', async (req, res) => {
  try {
    const resp = await tradeService.clearPile();
    res.send(resp);
  } catch (e) {
    res.status(500).send(e.message);
  }
});
