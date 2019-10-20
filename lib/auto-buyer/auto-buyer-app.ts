import * as express from 'express';
import { AutoBuyerService } from './auto-buyer.service';

export const autoBuyerApp = express();

autoBuyerApp.get('/add-target', (req, res) => {
  let { assetId, resourceId, maxPrice } = req.query;
  assetId = parseInt(assetId, 10);
  resourceId = parseInt(resourceId, 10);
  maxPrice = parseInt(maxPrice, 10);

  try {
    AutoBuyerService.addTarget({
      assetId,
      resourceId,
      maxPrice
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
