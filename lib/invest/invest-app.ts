import * as express from 'express';
import { defineJobEndpoints } from '../jobs';
import { playerService } from '../player';
import { investService } from './invest-service';
import { InvestorAutoBuy } from './jobs';

export const investApp = express();

// defineJobEndpoints<GoodAuctionInvestor>(investApp, 'good-auctions', q => {
//   const { budget, min, max } = getBudgetMinMax(q);
//   budgetMinMaxQueryCheck(budget, min, max);
//   return new GoodAuctionInvestor({ budget, min, max });
// });

const autoBuyDef = defineJobEndpoints<InvestorAutoBuy>(
  investApp,
  'auto-buy',
  q => new InvestorAutoBuy()
);

investApp.get('/add-target-page', async (req, res) => {
  const { futbinPage } = req.query;
  try {
    const targets = await investService.addTargetPage(futbinPage);

    if (!autoBuyDef.job) {
      autoBuyDef.job = new InvestorAutoBuy();
      autoBuyDef.job.start();
    }

    res.send({
      targets: targets.map(t => playerService.readable(t))
    });
  } catch (e) {
    res.send(e.message);
  }
});
