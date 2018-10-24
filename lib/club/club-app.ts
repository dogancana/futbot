import * as express from 'express';
import { fut } from '../api';
import { club } from './club-service';

export const clubApp = express();

clubApp.get('/players', async function(req, res) {
  const players: fut.ItemData[] = await fut.getClubPlayers(req.query.page);
  res.send(players);
});

clubApp.get('/players-to-sell', async function(req, res) {
  res.send(await club.getPlayersToSell())
})