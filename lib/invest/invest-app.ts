import * as express from 'express'
import { investService } from './invest-service';
import { fut } from '../api';

export const investApp = express();


investApp.get('/players', async (req, res) => {
  const { budget, min, max } = getBudgetMinMax(req.query)
  const platform = await fut.getPlatform()
  const priceKey = `${platform.toLowerCase()}_price`
  if (!budgetMinMaxQueryCheck(res, Number.MAX_VALUE, min, max)) return

  res.send(await investService.getTargets({ 
    page: 1,
    [priceKey]: `${min}-${max}`
  }))
})

investApp.get('/low-players', async (req, res) => {
  const { maxTargetPool } = req.query
  const { budget, min, max } = getBudgetMinMax(req.query)
  if (!budgetMinMaxQueryCheck(res, budget, min, max)) return

  res.send(investService.startLowPlayerInvvest({ budget, min, max, maxTargetPool }))
})

function getBudgetMinMax (query: any) {
  let { budget, min, max } = query
  return {
    budget: budget && parseInt(budget, 10),
    min: min && parseInt(min, 10),
    max: max && parseInt(max, 10),
  }
}

function budgetMinMaxQueryCheck (res, budget: number, min: number, max: number): boolean {
  if (!budget) {
    res.status(500).send('Send budget in query')
    return false
  }

  if (min && budget < min || budget < max) {
    res.status(500).send(`Budget ${budget} is lower then min/max limit (${min}-${max})`)
    return false
  }

  if (min && max && min > max) {
    res.status(500).send(`Min is greater than max. ${min} > ${max}`)
    return false
  }

  return true
}