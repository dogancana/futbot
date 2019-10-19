import * as express from 'express';
import { futbin } from '../api';
import { logger } from './../logger';
import { playerService } from './player-service';

export const playerApp = express();

playerApp.get('', async (req, res) => {
  let { assetId, resourceId } = req.query;
  assetId = parseInt(assetId, 10);
  resourceId = parseInt(resourceId, 10);

  if (!resourceId || !assetId) {
    res.status(500).send('Provide assetId and resourceId in query params');
    return;
  }

  let futbinPrice: futbin.Price;
  let marketPrice: playerService.MarketPrice;
  try {
    futbinPrice = await playerService.getFutbinPrice(resourceId);
  } catch {
    logger.error(
      `[Player App] error while retrieving futbin price for ${playerService.readable(
        { resourceId }
      )}`
    );
  }
  try {
    marketPrice = await playerService.getMarketPrice(resourceId);
  } catch {
    logger.error(
      `[Player App] error while retrieving market price for ${playerService.readable(
        { resourceId }
      )}`
    );
  }
  res.send({
    name: playerService.readable({ assetId }),
    futbinPrice,
    marketPrice
  });
});
