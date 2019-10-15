import * as express from 'express';
import { AutoBuyerService } from './auto-buyer.service';

export const autoBuyerApp = express();

autoBuyerApp.get('/add-target', function(req, res) {
  const { assetId, resourceId, maxPrice } = req.query;

  try {
    AutoBuyerService.addTarget({
      assetId: parseInt(assetId),
      resourceId: parseInt(resourceId),
      maxPrice: maxPrice ? parseInt(maxPrice) : undefined
    });
    res.send(AutoBuyerService.targets);
  } catch (e) {
    res.status(500).send(e.message);
  }
});

autoBuyerApp.get('/start-jobs', function(req, res) {
  res.send(AutoBuyerService.startJobs());
});

autoBuyerApp.get('/jobs', function(req, res) {
  res.send(AutoBuyerService.report());
});

autoBuyerApp.get('/stop-jobs', function(req, res) {
  res.send(AutoBuyerService.stopJobs());
});
