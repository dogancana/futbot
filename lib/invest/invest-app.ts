import * as express from 'express'
import { futbin } from '../api';
import { investService } from './invest-service';

export const investApp = express();

investApp.get('/players', async (req, res) => {
  res.send(await investService.getTargets({ page: 1 }))
})
