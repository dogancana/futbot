import * as express from 'express';
import {
  defineJobEndpoints,
  registerSaveableQuery,
  reqToSaveableQuery
} from '../jobs';
import { playerService } from '../player';
import { AutoBuyerService } from './auto-buyer.service';
import { AutoBuyBuyNow, AutoBuyQuery } from './jobs';

export const autoBuyerApp = express();

const autoBuyNowDef = defineJobEndpoints(
  autoBuyerApp,
  'auto-buy-now',
  () => new AutoBuyBuyNow()
);
const autoBuyQueryDef = defineJobEndpoints(
  autoBuyerApp,
  'auto-buy-query',
  () => new AutoBuyQuery()
);

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
    if (!autoBuyNowDef.job) {
      autoBuyNowDef.job = new AutoBuyBuyNow();
      autoBuyNowDef.job.start(true);
    }

    res.send(AutoBuyerService.targets);

    registerSaveableQuery({
      name: `auto-buy-target-${resourceId}`,
      query: reqToSaveableQuery(req)
    });
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
    if (!autoBuyQueryDef.job) {
      autoBuyQueryDef.job = new AutoBuyQuery();
      autoBuyQueryDef.job.start(true);
    }

    res.send(AutoBuyerService.addQueryTarget(decodeURI(query), sellPrice));

    registerSaveableQuery({
      name: `auto-buy-query-${query}`,
      query: reqToSaveableQuery(req)
    });
  } catch (e) {
    res.status(500).send(e.message);
  }
});
