import e = require('express');
import { getLogger } from '../logger';
import { playerService } from '../player';
import { StaticItems } from './../static/static-items';
import { AutoBuyBuyNow, AutoBuyQuery } from './jobs';

const logger = getLogger('AutoBuyerService');

export namespace AutoBuyerService {
  let autoBuyBuyNowJob: AutoBuyBuyNow;
  let autoBuyQueryJob: AutoBuyQuery;

  export interface Target {
    assetId: number;
    resourceId: number;
    maxPrice: number;
    sellPrice?: number;
    discardValue: number;
    readable?: string;
  }

  export interface TargetQuery {
    query: string;
    sellPrice?: number;
  }

  export const targets: Target[] = [];
  export const targetQueries: TargetQuery[] = [];

  export function addTarget(target: Target) {
    if (
      !target.maxPrice ||
      !target.discardValue ||
      !target.assetId ||
      !target.resourceId
    ) {
      throw new Error(
        'Please provide maxPrice, discardValue, assetId and resourceId'
      );
    }

    if (target.maxPrice < 0) {
      throw new Error('Max price cannot be negative');
    }

    if (target.maxPrice < target.discardValue) {
      throw new Error(
        `Max price is too big for this player. Max: ${target.maxPrice}, Quick Sell: ${target.discardValue}`
      );
    }

    if (target.sellPrice < target.maxPrice) {
      throw new Error(
        `Sell price (${target.sellPrice}) cannot be smaller than target buy price ${target.maxPrice}`
      );
    }

    const duped: Target = targets.filter(
      t => t.resourceId === target.resourceId
    )[0];
    const playerStr = playerService.readable(target);

    if (!!duped) {
      logger.warn(
        `${playerStr} is already in auto buy list. Replacing price information with` +
          ` maxPrice=${target.maxPrice}, sellPrice=${target.sellPrice}`
      );
      Object.assign(duped, target);
    } else {
      const playerItemData = StaticItems.itemData[target.assetId];
      if (!playerItemData) {
        throw new Error(
          `We couldnt find the player with assetId ${target.assetId}`
        );
      }
      logger.info(
        `${playerStr} added to list with maxPrice=${target.maxPrice}, sellPrice=${target.sellPrice}`
      );
      targets.push({
        ...target,
        readable: playerStr
      });
    }

    if (!autoBuyBuyNowJob) {
      logger.info(
        `Jobs were not running but you added a target. We are starting auto buy jobs`
      );
      startAutoBuyNow();
    }
  }

  export function addQueryTarget(q: string, sellPrice?: number) {
    if (!q) {
      throw new Error('You should pass a query');
    }

    const duped = targetQueries.find(v => v.query === q);
    if (duped) {
      logger.info(
        `Query ${q} was already in your targets. Updating sell price as ${sellPrice}`
      );
      duped.sellPrice = sellPrice;
    } else {
      logger.info(`Adding ${q} to your targets with ${sellPrice}`);
      targetQueries.push({ query: q, sellPrice });
    }

    if (!autoBuyQueryJob) {
      logger.info(`AutoBuyQuery job was not running, starting now.`);
      startQueryJob();
    }

    return targetQueries;
  }

  export function startAutoBuyNow() {
    if (!autoBuyBuyNowJob) {
      autoBuyBuyNowJob = new AutoBuyBuyNow();
    }

    return report();
  }

  export function startQueryJob() {
    if (!autoBuyQueryJob) {
      autoBuyQueryJob = new AutoBuyQuery();
    }

    return autoBuyQueryJob.report();
  }

  export function stopJobs() {
    if (autoBuyBuyNowJob) {
      autoBuyBuyNowJob.stop();
      autoBuyBuyNowJob = undefined;
    }

    if (autoBuyQueryJob) {
      autoBuyQueryJob.stop();
      autoBuyQueryJob = undefined;
    }

    return report();
  }

  export function report() {
    return {
      targets: targets.map(
        t => `${playerService.readable(t)} for ${t.maxPrice} max price`
      ),
      targetQueries,
      jobs: {
        autoBuyBuyNow: autoBuyBuyNowJob ? autoBuyBuyNowJob.report() : null,
        autoBuyQueryJob: autoBuyQueryJob ? autoBuyQueryJob.report() : null
      }
    };
  }
}
