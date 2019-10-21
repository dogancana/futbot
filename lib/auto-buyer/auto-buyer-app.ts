import * as express from 'express';
import { playerService } from '../player';
import { AutoBuyerService } from './auto-buyer.service';

export const autoBuyerApp = express();

autoBuyerApp.get('/targets', (req, res) => {
  res.send(
    AutoBuyerService.targets.map(
      t =>
        `${playerService.readable(t)}, max buy: ${t.maxPrice}, sell: ${
          t.sellPrice
        }`
    )
  );
});

autoBuyerApp.get('/add-target', (req, res) => {
  let { assetId, resourceId, maxPrice, sellPrice, discardValue } = req.query;
  assetId = parseInt(assetId, 10);
  resourceId = parseInt(resourceId, 10);
  maxPrice = parseInt(maxPrice, 10);
  sellPrice = parseInt(sellPrice, 10);
  discardValue = parseInt(discardValue, 10);

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

autoBuyerApp.get('/start-jobs', (req, res) => {
  res.send(AutoBuyerService.startJobs());
});

autoBuyerApp.get('/jobs', (req, res) => {
  res.send(AutoBuyerService.report());
});

autoBuyerApp.get('/stop-jobs', (req, res) => {
  res.send(AutoBuyerService.stopJobs());
});
