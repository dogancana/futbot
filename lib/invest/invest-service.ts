import { GoodAuctionInvestorProps } from "./jobs/good-auction-investor";
import { futbin, fut } from "../api";
import {
  LowPlayerInvestor,
  LowPlayerInvestorProps,
  GoodAuctionInvestor
} from "./jobs";
import { logger } from "../logger";
import { playerService } from "../player";
import { getOptimalSellPrice } from "../trader/trade-utils";

export namespace investService {
  let lowPlayerInvestJob: LowPlayerInvestor;
  let goodAuctionInvestor: GoodAuctionInvestor;

  export interface TargetInfo {
    resourceId: number;
    futbinId: number;
    assetId: number;
  }

  export async function getTargets(
    query: futbin.PlayersQuery
  ): Promise<TargetInfo[]> {
    const platform = await fut.getPlatform();
    const priceKey = `${platform.toLowerCase()}_price`;
    const prpKey = `${platform.toLowerCase()}_prp`;
    const defaultQuery = {
      page: 1,
      [priceKey]: "1000-2500",
      [prpKey]: "25,100",
      sort: "likes",
      order: "desc"
    };
    const playerIds = await futbin.getPlayerIDs({
      ...defaultQuery,
      ...query
    });

    const playerInfos: TargetInfo[] = [];
    for (const playerId of playerIds) {
      const info = await futbin.getPlayer(playerId);
      playerInfos.push(info);
    }

    return playerInfos;
  }

  export async function reListLowPlayer(): Promise<string[]> {
    let players = await fut.getTradePile(),
      response = [];

    players = players.filter(p => p.tradeId === 0 || p.tradeState !== "active");
    const expired = players.filter(
      p => p.tradeState === "expired"
    );

    for (const player of expired) {
      const playerString = `${playerService.readable({
        assetId: player.itemData.assetId
      })} (bought: ${player.itemData.lastSalePrice})`;

      const sellPrice = await getOptimalSellPrice(player.itemData.resourceId, true);
      if (!sellPrice.buyNowPrice || !sellPrice.startingBid) {
        logger.info(`No price for ${playerString}`);
        continue;
      }

      if (sellPrice.startingBid <= player.itemData.lastSalePrice) {
        logger.info(`Re-listing of ${playerString} skipped. Sell-Price too low: ${sellPrice.startingBid}/${sellPrice.buyNowPrice}`);
        continue;
      }

      response.push(`${playerString} for ${sellPrice.startingBid}/${sellPrice.buyNowPrice}`);
      await fut.sellPlayer({
        ...sellPrice,
        duration: 3600,
        itemData: {id: player.itemData.id, assetId: player.itemData.assetId}
      });
    }

    return response;
  }

  export function startLowPlayerInvvest(props: LowPlayerInvestorProps) {
    if (!lowPlayerInvestJob) {
      lowPlayerInvestJob = new LowPlayerInvestor(props);
    }

    return {
      timesTargetBought: lowPlayerInvestJob.execTime,
      report: lowPlayerInvestJob.report(),
      target: lowPlayerInvestJob.targetCount()
    };
  }

  export function clearLowPlayerInvest() {
    if (lowPlayerInvestJob) {
      lowPlayerInvestJob.stop();
    }

    lowPlayerInvestJob = null;
  }

  export function startGoodAuctionInvest(props: GoodAuctionInvestorProps) {
    if (!goodAuctionInvestor) {
      goodAuctionInvestor = new GoodAuctionInvestor(props);
    }

    return {
      timesMarketChecked: goodAuctionInvestor.execTime,
      report: goodAuctionInvestor.report()
    };
  }

  export function clearGoodAuctionInvest() {
    if (goodAuctionInvestor) {
      goodAuctionInvestor.stop();
    }

    goodAuctionInvestor = null;
  }
}
