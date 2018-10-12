import * as express from 'express';
import { fut } from '../api';

export const club = express();

club.get('/players', async function(req, res) {
  const players = await fut.getClubPlayers(req.query.page);
  res.send(players);
});