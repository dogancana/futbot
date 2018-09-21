import * as express from 'express';
import { getClubPlayers } from './api';

export const club = express();

club.get('/players', async function(req, res) {
  const players = await getClubPlayers();
  res.send(players);
});