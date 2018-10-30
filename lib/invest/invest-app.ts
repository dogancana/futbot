import * as express from 'express'
import { investService } from './invest-service';

export const investApp = express();

investApp.get('/players', async (req, res) => {
  res.send(await investService.getTargets({ page: 1 }))
})

investApp.get('/low-players', async (req, res) => {
  let { budget, min, max } = req.query
  min = min && parseInt(min, 10)
  max = max && parseInt(max, 10)

  if (!budget) {
    res.status(500).send('Send budget in query')
    return
  }

  if (min && budget < min || budget < max) {
    res.status(500).send(`Budget ${budget} is lower then min/max limit (${min}-${max})`)
    return
  }

  if (min && max && min > max) {
    res.status(500).send(`Min is greater than max. ${min} > ${max}`)
  }

  res.send(investService.startLowPlayerInvvest({ budget, min, max }))
})