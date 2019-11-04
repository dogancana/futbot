import { getLogger } from '@futbot/logger';
import e = require('express');
import { playerService } from '../player';
import { StaticItems } from './../static/static-items';

const logger = getLogger('AutoBuyerService');

export namespace AutoBuyerService {
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

    if (target.sellPrice && target.sellPrice < target.maxPrice) {
      throw new Error(
        `Sell price (${target.sellPrice}) cannot be smaller than target buy price ${target.maxPrice}`
      );
    }

    const duped: Target = targets.find(t => t.resourceId === target.resourceId);
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

    return targetQueries;
  }
}
