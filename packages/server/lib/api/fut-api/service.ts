import { getLogger } from '@futbot/logger';
import * as querystring from 'querystring';
import { PinEventsService } from '../../auth/pin-events';
import { envConfig } from '../../config';
import { playerService } from '../../player';
import { simpleCacheAdapter } from '../cache-adapter';
import { futApi } from './api';
import { mapMarketQueryToBypassCache } from './bypass-market-cache';

const logger = getLogger('FutService');

export namespace fut {
  export interface ItemData {
    assetId: number;
    cardsubtypeid: number;
    discardValue: number;
    id: number;
    itemState: 'free' | undefined;
    itemType: 'player' | undefined;
    lastSalePrice: number;
    leagueId: number;
    marketDataMaxPrice: number;
    marketDataMinPrice: number;
    pile: number;
    rareflag: number;
    rating: number;
    resourceId: number;
    timestamp: number;
    untradeable: boolean;
    playStyle: number;
  }

  export type Platform = 'pc' | 'ps' | 'xbox';
  export type Quality = 'bronze' | 'silver' | 'gold' | 'special';

  export async function getClubPlayers(
    page = 0,
    count = 100
  ): Promise<ItemData[]> {
    const response = await futApi.get(
      `/club?sort=desc&type=player&start=${page * count}&count=${count}`
    );
    return response.data.itemData;
  }

  export interface AuctionInfo {
    tradeId: number;
    bidState: 'none' | 'highest' | 'outbid';
    buyNowPrice: number;
    currentBid: number;
    expires: number;
    itemData: ItemData;
    startingBid: number;
    tradeState: 'active' | 'closed' | 'expired';
    watched: boolean;
    tradeOwner: boolean;
  }

  export interface MarketQueryFilter {
    type?: 'player';
    maskedDefId?: number;
    start?: number;
    num?: number;
    micr?: number;
    macr?: number;
    minb?: number;
    maxb?: number;
  }

  export async function queryMarket(
    filter: MarketQueryFilter,
    batch: number = 0
  ): Promise<fut.AuctionInfo[]> {
    const q: MarketQueryFilter = {
      start: batch * 21,
      num: 21,
      ...filter
    };
    for (const key of Object.keys(q)) {
      if (q[key] === undefined) {
        delete q[key];
      }
    }

    PinEventsService.pushEvent('searchView');
    const results = (await futApi.get(
      `/transfermarket?${querystring.stringify(mapMarketQueryToBypassCache(q))}`
    )).data.auctionInfo;

    setTimeout(() => {
      PinEventsService.pushEvent('transferMarketResults');
      if (results.length > 0) {
        PinEventsService.pushEvent('itemView');
      }
    }, Math.random() * (300 - 50) + 50);
    return results;
  }

  export async function checkAuctionStatus(
    transferIds: ReadonlyArray<number>
  ): Promise<ReadonlyArray<AuctionInfo>> {
    if (!transferIds || transferIds.length === 0) {
      throw new Error('Please provide transferIds');
    }

    const response = await futApi.get(
      `/trade/status/lite?tradeIds=${transferIds.join(',')}`
    );
    return response.data.auctionInfo;
  }

  export async function getSquadPlayerIds(): Promise<fut.ItemData[]> {
    const response = await futApi.get(`/squad/active`, {
      adapter: simpleCacheAdapter
    });
    const players: any[] = response.data.players;
    return players.map(p => p.itemData);
  }

  export async function sendToTradePile(id: number) {
    return await futApi.put(`/item`, {
      itemData: [{ id, pile: 'trade' }]
    });
  }

  interface AuctionRequest {
    buyNowPrice: number;
    duration: number;
    itemData: fut.ItemData;
    startingBid: number;
  }

  export async function sellPlayer(req: AuctionRequest) {
    const playerStr = playerService.readable({ assetId: req.itemData.assetId });
    logger.info(
      `${playerStr} will be sold for ${req.startingBid}/${req.buyNowPrice}`
    );
    try {
      const { marketDataMaxPrice, marketDataMinPrice } = req.itemData;
      await sendToTradePile(req.itemData.id);
      await futApi.post(`/auctionhouse`, {
        ...req,
        startingBid: Math.max(req.startingBid, marketDataMinPrice),
        buyNowPrice: Math.min(req.buyNowPrice, marketDataMaxPrice)
      });
    } catch (e) {
      logger.error(`Couldn't sell player ${playerStr}. Reason: ${e}`);
    }
  }

  interface PutItemData {
    id: number;
    reason?: string;
    pile: 'club' | string;
    success: boolean;
    errorCode?: number;
  }

  export interface PutItemResult {
    itemData: PutItemData[];
  }

  export async function sendToClub(id: number): Promise<PutItemResult> {
    const pileResponse = await futApi.put(`/item`, {
      itemData: [{ id, pile: 'club' }]
    });
    return pileResponse.data;
  }

  export function clearSold() {
    return futApi.request({ url: '/trade/sold', method: 'DELETE' });
  }

  export async function getTradePile(): Promise<AuctionInfo[]> {
    const resp = await futApi.get(`/tradepile`);
    return resp.data && resp.data.auctionInfo;
  }

  export interface ClubItemMeta {
    type: 'kits' | 'balls' | 'players' | 'stadia' | 'staff' | 'trophies';
    contextId: number;
    contextValue: number;
    typeValue: number;
  }

  export async function getClubItemMeta(): Promise<ClubItemMeta[]> {
    const resp = await futApi.get(`/club/stats/club`);
    return resp.data.stat;
  }

  let platform: Platform = envConfig().FUTBOT_FUT_PLATFORM_OVERWRITE;

  export async function getPlatform(): Promise<Platform> {
    if (platform) {
      return platform;
    }

    try {
      const resp = await futApi.get(
        `/user/accountinfo?filterConsoleLogin=true&sku=FUT20WEB`,
        { adapter: simpleCacheAdapter }
      );

      if (resp.data.userAccountInfo.personas.length > 1) {
        logger.warn(
          `Found ${resp.data.userAccountInfo.personas.length} personas on your origin account.` +
            ` It's better to set FUTBOT_FUT_PLATFORM_OVERWRITE variable in .env file for your platfomr.`
        );
      }

      platform = resp.data.userAccountInfo.personas[0].userClubList
        .filter(c => c.year === '2020')[0]
        .platform.replace(/\d/gi, '');
    } catch (e) {
      logger.error(`Error while getting platform: ${e}`);
      return null;
    }

    return platform;
  }

  const bidHistory: number[] = [];

  export async function bidToTrade(
    tradeId: number,
    bid: number
  ): Promise<void> {
    if (-1 !== bidHistory.indexOf(tradeId)) {
      throw new Error(`Skipped bid ${tradeId} (dupe).`);
    }

    bidHistory.push(tradeId);
    await futApi.put(`/trade/${tradeId}/bid`, {
      bid
    });
  }

  export async function getPurchasedItems(): Promise<ItemData[]> {
    const resp = await futApi.get(`/purchased/items`);
    return resp.data.itemData;
  }

  export async function waitAndGetPurchasedItems(
    resourceId: number
  ): Promise<ItemData[]> {
    return new Promise<ItemData[]>((resolve, reject) => {
      setTimeout(async () => {
        try {
          const purchased = (await getPurchasedItems()) || [];
          const newPlayers = purchased.filter(p => p.resourceId === resourceId);
          resolve(newPlayers);
        } catch (e) {
          reject(e);
        }
      }, 5000);
    });
  }

  export async function discardPlayer(id: number) {
    await futApi.delete('/item/' + id);
  }
}
