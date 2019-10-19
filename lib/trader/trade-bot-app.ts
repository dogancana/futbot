import * as express from 'express';
import { tradeService } from './trade-service';

export const tradeBotApp = express();

tradeBotApp.get('/start-selling', async (req, res) => {
  const { maxRating } = req.query;
  res.send(tradeService.startSelling(maxRating));
});

tradeBotApp.get('/stop-selling', async (req, res) => {
  res.send(tradeService.stopSelling());
});

tradeBotApp.get('/relist-expired', async (req, res) => {
  try {
    const resp = await tradeService.relistExpired();
    res.send(resp);
  } catch (e) {
    res.status(500).send(e.message);
  }
});

tradeBotApp.get('/clear-pile', async (req, res) => {
  try {
    const resp = await tradeService.clearPile();
    res.send(resp);
  } catch (e) {
    res.status(500).send(e.message);
  }
});
