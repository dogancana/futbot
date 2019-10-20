import * as express from 'express';
import { tradeService } from './trade-service';

export const tradeBotApp = express();

tradeBotApp.get('/start-selling-unused', async (req, res) => {
  const { maxRating } = req.query;
  res.send(tradeService.startSellUnusedPlayers(parseInt(maxRating, 10)));
});

tradeBotApp.get('/stop-selling-unused', async (req, res) => {
  res.send(tradeService.stopSellingUnusedPlayers());
});

tradeBotApp.get('/start-selling-trade-pile', (req, res) => {
  res.send(tradeService.startSellingTradePile());
});

tradeBotApp.get('/stop-selling-trade-pile', (req, res) => {
  res.send(tradeService.stopSellingTradePile());
});

tradeBotApp.get('/clear-pile', async (req, res) => {
  try {
    const resp = await tradeService.clearPile();
    res.send(resp);
  } catch (e) {
    res.status(500).send(e.message);
  }
});
