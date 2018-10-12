import * as express from 'express';
import { fut } from '../api';

export const clubApp = express();

clubApp.get('/players', async function(req, res) {
  const players: fut.ItemData[] = await fut.getClubPlayers(req.query.page);
  res.send(players);
});
