import * as express from 'express';
import { futbin } from '../api';
import { defineJobEndpoints } from '../jobs';
import { GoodAuctionInvestor, LowPlayerInvestor } from './jobs';

export const investApp = express();

defineJobEndpoints<GoodAuctionInvestor>(investApp, 'good-auctions', q => {
  const { budget, min, max } = getBudgetMinMax(q);
  budgetMinMaxQueryCheck(budget, min, max);
  return new GoodAuctionInvestor({ budget, min, max });
});

defineJobEndpoints<LowPlayerInvestor>(investApp, 'low-players', q => {
  const { maxTargetPool } = q;
  const { budget, min, max } = getBudgetMinMax(q);
  budgetMinMaxQueryCheck(budget, min, max);
  return new LowPlayerInvestor({ budget, min, max, maxTargetPool });
});

investApp.get('/add-target-page', async (req, res) => {
  const { futbinPage } = req.query;
  try {
    const result = await futbin.getAssetIDsFromPage(futbinPage);
    res.send(result);
  } catch (e) {
    res.send(e.message);
  }
});

function getBudgetMinMax(query: any) {
  const { budget, min, max } = query;
  return {
    budget: budget && parseInt(budget, 10),
    min: min && parseInt(min, 10),
    max: max && parseInt(max, 10)
  };
}

function budgetMinMaxQueryCheck(budget: number, min: number, max: number) {
  if (!budget) {
    throw new Error('Send budget in query');
  }

  if ((min && budget < min) || budget < max) {
    throw new Error(
      `Budget ${budget} is lower then min/max limit (${min}-${max})`
    );
  }

  if (min && max && min > max) {
    throw new Error(`Min is greater than max. ${min} > ${max}`);
  }
}
