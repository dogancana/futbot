import * as express from 'express';
import { pick } from 'lodash';
import { futbin } from '../api';
import { itemData } from '../static';
import { playerService } from './player-service';

export const playerApp = express();

playerApp.get('/price', async function(req, res) {
  const { assetId, resourceId, platform } = req.query;

  if (!resourceId || !assetId) {
    res.status(500).send('Provide assetId and resourceId in query params');
    return
  }

  let futbinPrice, price = {};

  const platforms = platform ? [ platform ] : ['pc', 'xbox', 'ps'];
  futbinPrice = await futbin.getPrice(resourceId);

  if (futbinPrice && futbinPrice[platforms[0]].LCPrice2 === 0) {
    // dont trust futbin without 2 prices
    price = await playerService.getPriceInfo(assetId, resourceId);
  }

  const extra = itemData[assetId] || {};
  res.send({ ...extra, ...price, futbinPrice: pick(futbinPrice, platforms) })
});
