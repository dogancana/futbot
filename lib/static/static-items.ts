import { logger } from './../logger';
import * as express from 'express';

export let itemData = {};

export const staticItems = express();

staticItems.get('/need-data', (req, res) => {
  if (Object.keys(itemData).length > 1) res.status(500).send('NO');
  else res.status(200).send('YES');
});

staticItems.post('/push-data', (req, res) => {
  logger.info(`extension sent ${Object.keys(req.body).length} data`);
  itemData = {
    ...itemData,
    ...req.body
  }
  res.send('OK');
});
