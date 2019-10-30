import { fut } from '../../api';
import { envConfig } from '../../config';
import { Job } from '../../jobs';
import { getLogger } from '../../logger';
import { playerService } from '../../player';
import { analyzeItemValue } from '../../pricing';
import { tradePrice } from '../../trader/trade-utils';
import { uniqBy } from 'lodash';
import { investService } from '../invest-service';

const logger = getLogger('LowPlayersJob');

const BUY_REFERENCE_PERCT = (100 - envConfig().FUTBOT_PROFIT_MARGIN) / 100;
const TARGETS_TO_CHECK = 5;

export class InvestorAutoBuy extends Job {
  private spent: number = 0;
  private boughtAuctions: fut.AuctionInfo[] = [];

  constructor() {
    super('InvestorAutoBuy', envConfig().FUTBOT_JOB_IMP_INVEST_LOW_PLAYERS);
    this.setTask(this.loopOverTargets);
  }

  public report() {
    return {
      profitMargin: envConfig().FUTBOT_PROFIT_MARGIN,
      spent: this.spent,
      boughtAuctions: this.boughtAuctions.map(
        a => `${playerService.readable(a.itemData)} bought for ${a.buyNowPrice}`
      )
    };
  }

  private async loopOverTargets() {
    if (!investService.targets || investService.targets.length === 0) {
      // no need to await for setup targets
      logger.warn(`No targets yet. Sleeping for 30 seconds`);
      await new Promise(resolve => {
        setTimeout(() => resolve(true), 30000);
      });

      investService.reloadTargets();
      return;
    }

    for (let i = 0; i < TARGETS_TO_CHECK; i++) {
      const target = investService.targets.shift();
      const playerStr = playerService.readable({ assetId: target.assetId });
      const value = await analyzeItemValue(target.resourceId);
      if (!value) {
        logger.info(`Skipping ${playerStr}: missing price information`);
        return;
      }

      const safeBuyValue = tradePrice(
        value.price * BUY_REFERENCE_PERCT,
        'floor'
      );

      logger.info(
        `Trying to find ${playerStr} for cheaper than ${safeBuyValue} buy now price.`
      );

      for (
        let j = 0;
        j < envConfig().FUTBOT_FUT_MAX_AUCTION_TRY_PER_PLAYER;
        j++
      ) {
        const auctions = await playerService.searchBuyableItem(
          target.resourceId,
          safeBuyValue
        );

        if (auctions.length === 0) {
          continue;
        }

        const boughtItems = await playerService.buyNowAndHandleAuctions(
          auctions,
          { value }
        );

        this.boughtAuctions = [...this.boughtAuctions, ...boughtItems];
        this.boughtAuctions = uniqBy(this.boughtAuctions, a => a.tradeId);
      }
    }
  }
}
