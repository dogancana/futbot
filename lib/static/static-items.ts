import { logger } from './../logger';
import * as express from 'express';

export interface StaticPlayerData {
  commonName: string
  firstName: string
  id: number
  lastName: string
  nationId: number
  rating: number
}

export interface ItemData {
  [key: number]: StaticPlayerData
}

let itemData: ItemData = {};

export const staticItemsApp = express();

export class StaticItems {
  static get itemData () {
    return itemData
  }
}

staticItemsApp.get('/need-data', (req, res) => {
  if (Object.keys(itemData).length > 1) res.status(500).send('NO');
  else res.status(200).send('YES');
});

staticItemsApp.post('/push-data', (req, res) => {
  logger.info(`extension sent ${Object.keys(req.body).length} data`);
  itemData = {
    ...itemData,
    ...req.body
  }
  res.send('OK');
});
