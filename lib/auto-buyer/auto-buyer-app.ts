import * as express from 'express';
import { playerService } from '../player';
import { AutoBuyerService } from './auto-buyer.service';

export const autoBuyerApp = express();

autoBuyerApp.get('/targets', (req, res) => {
  res.send({
    autoBuy: AutoBuyerService.targets.map(
      t =>
        `${playerService.readable(t)}, max buy: ${t.maxPrice}, sell: ${
          t.sellPrice
        }`
    ),
    autoBuyQuery: AutoBuyerService.targetQueries
  });
});

autoBuyerApp.get('/add-target', (req, res) => {
  let { assetId, resourceId, maxPrice, discardValue } = req.query;
  assetId = parseInt(assetId, 10);
  resourceId = parseInt(resourceId, 10);
  maxPrice = parseInt(maxPrice, 10);
  discardValue = parseInt(discardValue, 10);

  let { sellPrice } = req.query;
  sellPrice = parseInt(sellPrice, 10);
  sellPrice = !isNaN(sellPrice) ? sellPrice : null;

  try {
    AutoBuyerService.addTarget({
      assetId,
      resourceId,
      maxPrice,
      sellPrice,
      discardValue
    });
    res.send(AutoBuyerService.targets);
  } catch (e) {
    res.status(500).send(e.message);
  }
});

autoBuyerApp.get('/add-query-target', (req, res) => {
  const { query } = req.query;
  let { sellPrice } = req.query;
  sellPrice = parseInt(sellPrice, 10);
  sellPrice = !isNaN(sellPrice) ? sellPrice : null;
  try {
    res.send(AutoBuyerService.addQueryTarget(decodeURI(query), sellPrice));
  } catch (e) {
    res.status(500).send(e.message);
  }
});

autoBuyerApp.get('/start-auto-buy-now', (req, res) => {
  res.send(AutoBuyerService.startAutoBuyNow());
});

autoBuyerApp.get('/start-query', async (req, res) => {
  res.send(AutoBuyerService.startQueryJob());
});

autoBuyerApp.get('/jobs', (req, res) => {
  res.send(AutoBuyerService.report());
});

autoBuyerApp.get('/stop-jobs', (req, res) => {
  res.send(AutoBuyerService.stopJobs());
});
