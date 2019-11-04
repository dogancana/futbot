import { getLogger } from '@futbot/logger';
import * as express from 'express';
import { fut } from '../api';
import { tradePrice } from '../trader/trade-utils';
import { analyzeItemValue, ItemValue } from './../pricing/index';
import { playerService } from './player-service';

const logger = getLogger('PlayerApp');
export const playerApp = express();

playerApp.get('', async (req, res) => {
  let { assetId, resourceId } = req.query;
  assetId = parseInt(assetId, 10);
  resourceId = parseInt(resourceId, 10);

  if (!resourceId || !assetId) {
    res.status(500).send('Provide assetId and resourceId in query params');
    return;
  }

  try {
    res.send({
      value: await analyzeItemValue(resourceId),
      name: playerService.readable({ assetId })
    });
  } catch (e) {
    logger.error(
      `error while retrieving market price for ${playerService.readable({
        resourceId
      })}. Reason: ${e}`
    );
  }
});

playerApp.get('/bid', async (req, res) => {
  const { tradeId } = req.query;
  let { bid } = req.query;
  bid = parseInt(bid, 10);

  if (!tradeId || !bid) {
    res.send('Please provide tradeId and bid');
    return;
  }

  try {
    res.send(await fut.bidToTrade(tradeId, tradePrice(bid + 1)));
  } catch (e) {
    res.send(e);
  }
});
