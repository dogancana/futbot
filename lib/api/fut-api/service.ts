import {logger} from "../../logger";
import {playerService} from "../../player";
import * as querystring from "querystring";
import {futApi} from "./api";
import {simpleCacheAdapter} from "../cache-adapter";

export namespace fut {
  export interface ItemData {
    assetId: number;
    cardsubtypeid: number;
    discardValue: number;
    id: number;
    itemState: "free" | undefined;
    itemType: "player" | undefined;
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
  }

  export type Platform = "pc" | "ps" | "xbox";
  export type Quality = "bronze" | "silver" | "gold" | "special";

  export async function getClubPlayers(page = 0): Promise<ItemData[]> {
    const response = await futApi.get(
      `/club?sort=desc&type=player&start=${page * 100}&count=100`
    );
    return response.data.itemData;
  }

  export interface AuctionInfo {
    tradeId: number;
    bidState: "none" | "highest" | "outbid";
    buyNowPrice: number;
    currentBid: number;
    expires: number;
    itemData: ItemData;
    startingBid: number;
    tradeState: "active" | "closed" | "expired";
    watched: boolean;
    tradeOwner: boolean;
  }

  export async function getPlayerTransferData(
    assetId: number,
    batch: number,
    query?: any
  ): Promise<AuctionInfo[]> {
    const defaultQuery = {
      start: batch * 20,
      num: 21,
      type: "player",
      maskedDefId: assetId
    };
    const response = await futApi.get(
      `/transfermarket?${querystring.stringify({
        ...defaultQuery,
        ...query
      })}`
    );
    return response.data.auctionInfo;
  }

  export async function searchTransferMarket(
    batch: number,
    minBid?: number,
    maxBid?: number,
    minBnow?: number,
    maxBnow?: number
  ): Promise<AuctionInfo[]> {
    const q = {
      start: batch * 20,
      num: 21,
      type: "player",
      lev: "gold",
      micr: minBid,
      macr: maxBid,
      minb: minBnow,
      maxb: maxBnow
    };
    Object.keys(q).forEach(key => {
      if (!q[key]) delete q[key];
    });
    const response = await futApi.get(
      `/transfermarket?${querystring.stringify({...q})}`
    );
    return response.data.auctionInfo;
  }

  export async function checkAuctionStatus(
    transferIds: ReadonlyArray<number>
  ): Promise<ReadonlyArray<AuctionInfo>> {
    if (!transferIds || transferIds.length === 0) {
      throw new Error("Please provide transferIds");
    }

    const response = await futApi.get(
      `/trade/status/lite?tradeIds=${transferIds.join(",")}`
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

  interface AuctionRequest {
    buyNowPrice: number;
    duration: number;
    itemData: { id: number; assetId?: number };
    startingBid: number;
  }

  export async function sellPlayer(req: AuctionRequest) {
    const playerStr = playerService.readable({assetId: req.itemData.assetId});
    logger.info(
      `${playerStr} will be sold for ${req.startingBid}/${req.buyNowPrice}`
    );
    const pileResponse = await futApi.put(`/item`, {
      itemData: [{id: req.itemData.id, pile: "trade"}]
    });
    if (pileResponse) {
      const response = await futApi.post(`/auctionhouse`, req);
      return response.data;
    } else {
      throw new Error("couldnt move to trade pile");
    }
  }

  interface PutItemData {
    id: number;
    reason?: string;
    pile: "club" | string;
    success: boolean;
    errorCode?: number;
  }

  export interface PutItemResult {
    itemData: PutItemData[];
  }

  export async function sendToClub(id: number): Promise<PutItemResult> {
    const pileResponse = await futApi.put(`/item`, {
      itemData: [{id, pile: "club"}]
    });
    return pileResponse.data;
  }

  export async function clearSold() {
    return await futApi.request({url: "/trade/sold", method: "DELETE"});
  }

  export async function getTradePile(): Promise<AuctionInfo[]> {
    const resp = await futApi.get(`/tradepile`);
    return resp.data && resp.data.auctionInfo;
  }

  export interface ClubItemMeta {
    type: "kits" | "balls" | "players" | "stadia" | "staff" | "trophies";
    contextId: number;
    contextValue: number;
    typeValue: number;
  }

  export async function getClubItemMeta(): Promise<ClubItemMeta[]> {
    const resp = await futApi.get(`/club/stats/club`);
    return resp.data.stat;
  }

  let platform: Platform = null;

  export async function getPlatform(): Promise<Platform> {
    if (platform) return platform;

    const resp = await futApi.get(
      `/user/accountinfo?filterConsoleLogin=true&sku=FUT20WEB`,
      {adapter: simpleCacheAdapter}
    );
    platform = resp.data.userAccountInfo.personas[0].userClubList.filter(
      c => c.year === "2020"
    )[0].platform.replace(/\d/gi, '');
    return platform;
  }

  export async function bid(tradeId: number, bid: number): Promise<void> {
    await futApi.put(`/trade/${tradeId}/bid`, {
      bid
    });
  }

  export async function getPurchasedItems(): Promise<ItemData[]> {
    const resp = await futApi.get(`/purchased/items`);
    return resp.data.itemData;
  }

  export async function waitAndGetPurchasedItem(
    resourceId: number
  ): Promise<ItemData> {
    return new Promise<ItemData>((resolve, reject) => {
      setTimeout(async () => {
        try {
          const purchased = await getPurchasedItems();
          const sellTarget = purchased.filter(
            p => p.resourceId === resourceId
          )[0];
          resolve(sellTarget);
        } catch (e) {
          reject(e);
        }
      }, 5000);
    });
  }
}
