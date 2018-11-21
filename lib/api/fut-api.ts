import { logger } from "../logger";
import { api } from "./api";
import { playerService } from "../player";
import * as querystring from 'querystring';

const API_URL = 'https://utas.external.s2.fut.ea.com/ut/game/fifa19';

export namespace fut {
  export interface ItemData {
    assetId: number
    cardsubtypeid: number
    discardValue: number
    id: number
    itemState: "free" | undefined
    itemType: "player" | undefined
    lastSalePrice: number
    leagueId: number
    marketDataMaxPrice: number
    marketDataMinPrice: number
    pile: number
    rareflag: number
    rating: number
    resourceId: number
    timestamp: number
    untradeable: boolean
  }
  
  export type Platform = 'pc' | 'ps' | 'xbox'
  export type Quality = 'bronze' | 'silver' | 'gold' | 'special'

  export async function getClubPlayers(page = 0): Promise<ItemData[]> {
    const response = await api.get(`${API_URL}/club?sort=desc&type=player&start=${page * 100}&count=100`);
    return response.data.itemData;
  }
  
  export interface AuctionInfo {
    tradeId: number
    bidState: string
    buyNowPrice: number
    currentBit: number
    expires: number
    itemData: ItemData
    startingBid: number
    tradeState: 'active' | 'closed' | 'expired' | string
    watched: boolean
    tradeOwner: boolean
  }
  export async function getPlayerTransferData(assetId: number, batch: number, query?: any): Promise<AuctionInfo[]> {
    const defaultQuery = {
      start: batch * 20,
      num: 21,
      type: 'player',
      definitionId: assetId,
    }
    const response = await api.get(`${API_URL}/transfermarket?${querystring.stringify({
      ...defaultQuery,
      ...query
    })}`);
    return response.data.auctionInfo;
  }
  
  export async function getSquadPlayerIds(): Promise<fut.ItemData[]> {
    const response = await api.get(`${API_URL}/squad/active`, {}, { cachable: true });
    const players: any[] = response.data.players;
    return players.map(p => p.itemData);
  }
  
  interface AuctionRequest {
    buyNowPrice: number;
    duration: number;
    itemData: { id: number, assetId?: number };
    startingBid: number;
  }
  export async function sellPlayer(req: AuctionRequest) {
    const playerStr = playerService.readable({ assetId: req.itemData.assetId })
    logger.info(`${playerStr} will be sold for ${req.startingBid}/${req.buyNowPrice}`);
    const pileResponse = await api.put(`${API_URL}/item`, {
      data: {
        itemData: [ { id: req.itemData.id, pile: 'trade'} ] 
      }
    });
    if (pileResponse) {
      const response = await api.post(`${API_URL}/auctionhouse`, { data: req });
      return response.data;
    } else {
      throw new Error('couldnt move to trade pile')
    }
  }
  
  interface PutItemData {
    id: number,
    reason?: string,
    pile: 'club' |  string,
    success: boolean,
    errorCode?: number
  }
  export interface PutItemResult {
    itemData: PutItemData[]
  }
  export async function sendToClub(id: number): Promise<PutItemResult> {
    const pileResponse = await api.put(`${API_URL}/item`, { 
      data: {
        itemData: [ { id, pile: 'club'} ] 
      }
    });
    return pileResponse.data
  }
  
  export async function clearSold() {
    return await api.del(`${API_URL}/trade/sold`)
  }

  export async function getTradePile(): Promise<AuctionInfo[]> {
    const resp = await api.get(`${API_URL}/tradepile`);
    return resp.data && resp.data.auctionInfo
  }

  export interface ClubItemMeta {
    type: 'kits' | 'balls' | 'players' | 'stadia' | 'staff' | 'trophies'
    contextId: number
    contextValue: number
    typeValue: number
  }
  export async function getClubItemMeta (): Promise<ClubItemMeta[]> {
    const resp = await api.get(`${API_URL}/club/stats/club`);
    return resp.data.stat;
  }

  export async function getPlatform (): Promise<Platform> {
    const resp = await api.get(`${API_URL}/user/accountinfo?filterConsoleLogin=true&sku=FUT19WEB`, {}, { cachable: true })
    return resp.data.userAccountInfo.personas[0].userClubList.filter(
      c => c.year === '2019'
    )[0].platform
  }

  export async function bid (tradeId: number, bid: number): Promise<void> {
    const resp = await api.put(`${API_URL}/trade/${tradeId}/bid`, {
      data: {
        bid
      }
    })
    return resp.data
  }

  export async function getPurchasedItems (): Promise<ItemData[]> {
    const resp = await api.get(`${API_URL}/purchased/items`)
    return resp.data.itemData
  }
}
