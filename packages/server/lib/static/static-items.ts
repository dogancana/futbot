import { getLogger } from '@futbot/logger';
import { deleteFile, readFileIfRecent, writeFileSyncSafe } from '@futbot/utils';
import * as express from 'express';
import { tmpdir } from 'os';
import { resolve } from 'path';
import { ItemData } from './static-items';

const logger = getLogger('StaticItems');

export interface StaticPlayerData {
  commonName: string;
  firstName: string;
  id: number;
  lastName: string;
  name: string;
  nationId: number;
  rating: number;
}

export interface ItemData {
  [key: number]: StaticPlayerData;
}

const fileName = resolve(tmpdir(), 'futbot-static-data.json');
const write = (s: ItemData) => writeFileSyncSafe<ItemData>(fileName, s);
let itemData: ItemData = {};
readFileIfRecent<ItemData>(fileName).then(i => (itemData = i || {}));
let fileWriterTimeout: ReturnType<typeof setTimeout>;

export const staticItemsApp = express();

export class StaticItems {
  static get itemData() {
    return itemData;
  }
}

staticItemsApp.get('/need-data', (req, res) => {
  if (Object.keys(itemData).length > 1) {
    res.status(500).send('NO');
  } else {
    res.status(200).send('YES');
  }
});

staticItemsApp.get('/delete-data', (req, res) => {
  try {
    itemData = {};
    deleteFile(fileName);
    res.send('OK');
  } catch (e) {
    res.send(e);
  }
});

staticItemsApp.post('/push-data', (req, res) => {
  logger.info(`extension sent ${Object.keys(req.body).length} data`);

  itemData = {
    ...itemData,
    ...req.body
  };

  if (fileWriterTimeout) {
    clearTimeout(fileWriterTimeout);
  }
  fileWriterTimeout = setTimeout(() => {
    write(itemData);
  }, 2000);

  res.send('OK');
});
