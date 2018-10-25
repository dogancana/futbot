import * as express from 'express'
import { investService } from './invest-service';

export const investApp = express();

investApp.get('/players', async (req, res) => {
  res.send(await investService.getTargets({ page: 1 }))
})

investApp.get('/low-players', async (req, res) => {
  const { budget } = req.query

  if (!budget) {
    res.status(500).send('Send budget in query')
    return
  }

  res.send(investService.startLowPlayerInvvest(budget))
})