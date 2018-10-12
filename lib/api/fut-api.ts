import Axios from "axios";
import { logger } from "../logger";
import * as sleep from 'sleep-promise';

const API_URL = 'https://utas.external.s2.fut.ea.com/ut/game/fifa19';

export namespace fut {
  export async function getClubPlayers(page = 0) {
    const response = await Axios.get(`${API_URL}/club?sort=desc&type=player&start=${page * 100}&count=100`);
    return response.data.itemData;
  }
  
  export async function getPlayerTransferData(id, batch) {
    const response = await Axios.get(`${API_URL}/transfermarket?start=${batch * 20}&num=21&type=player&definitionId=${id}`);
    return response.data.auctionInfo;
  }
  
  export async function getSquadPlayerIds() {
    const response = await Axios.get(`${API_URL}/squad/active`);
    return response.data.players.map(p => p.itemData.id);
  }
  
  interface IAuction {
    buyNowPrice: number;
    duration: number;
    itemData: { id: number | string };
    startingBid: number;
  }
  export async function sellPlayer(data: IAuction) {
    logger.info(`selling player ${JSON.stringify(data)}`);
    const pileResponse = await Axios.put(`${API_URL}/item`, { 
      itemData: [ { id: data.itemData.id, pile: 'trade'} ] 
    });
    if (pileResponse) {
      await sleep(300);
      logger.info(`\t\titem pushed to trade pile ${pileResponse}`);
      const response = await Axios.post(`${API_URL}/auctionhouse`, data);
      return response.data;
    } else {
      throw new Error('couldnt move to trade pile')
    }
  }
  
  export async function sendToClub(id) {
    const pileResponse = await Axios.put(`${API_URL}/item`, { 
      itemData: [ { id, pile: 'club'} ] 
    });
    return pileResponse
  }
  
  export async function getTradePile() {
    const resp = await Axios.get(`${API_URL}/tradepile`);
    return resp.data.auctionInfo
  }
}
