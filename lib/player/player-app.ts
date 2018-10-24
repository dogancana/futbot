import { logger } from '../logger';
import * as express from 'express';
import { playerService } from './player-service';

export const playerApp = express();

playerApp.get('', async function(req, res) {
  const { assetId, resourceId } = req.query;

  if (!resourceId || !assetId) {
    res.status(500).send('Provide assetId and resourceId in query params');
    return
  }

  try {
    const details = await playerService.getPlayerDetails(assetId, resourceId);
    res.send(details);
  } catch (e) {
    logger.error(`Error retrieving player details\n\t${e.message}`)
    console.error('\t', e, '\n')
    res.status(500).send(e.message)
  }
});
