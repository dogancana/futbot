import * as express from 'express';
import { playerService } from '../player';
import { club } from './club-service';

export const clubApp = express();

clubApp.get('/non-squad-players', async (req, res) => {
  try {
    let players: any = await club.getNonSquadTradeablePlayers();
    players = players.map(p => playerService.readable(p));
    res.send(players);
  } catch (e) {
    res.status(500).send(e.message);
  }
});
