import * as express from 'express';
import { AutoBuyerService } from './auto-buyer.service';

export const autoBuyerApp = express();

autoBuyerApp.get('/add-target', (req, res) => {
  const { assetId, resourceId, maxPrice } = req.query;

  try {
    AutoBuyerService.addTarget({
      assetId: parseInt(assetId, 10),
      resourceId: parseInt(resourceId, 10),
      maxPrice: maxPrice ? parseInt(maxPrice, 10) : undefined
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
