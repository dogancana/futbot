import Axios from "axios";
import { logger } from "./logger";

export async function getClubPlayers() {
  try {
    const response = await Axios.get(`https://utas.external.s2.fut.ea.com/ut/game/fifa19/club?sort=desc&type=player&start=0`);
    return response.data.itemData;
  } catch (e) {
    logger.error(e.message);
    return null;
  }
}

export async function getClubConsumables() {
  try {
    const response = await Axios.get(`https://utas.external.s2.fut.ea.com/ut/game/fifa19/club/consumables/development`);
    return response.data.itemData;
  } catch (e) {
    logger.error(e.message);
    return null;
  }
}

export async function getPlayerTransferData(id, batch) {
  try {
    const response = await Axios.get(`https://utas.external.s2.fut.ea.com/ut/game/fifa19/transfermarket?start=${batch * 20}&num=21&type=player&definitionId=${id}`);
    return response.data.auctionInfo;
  } catch (e) {
    logger.error(e.message);
    return null;
  }
}

export async function getSquadPlayerIds() {
  try {
    const response = await Axios.get(`https://utas.external.s2.fut.ea.com/ut/game/fifa19/squad/active`);
    return response.data.players.map(p => p.itemData.id);
  } catch (e) {
    logger.error(e.message);
    return null;
  }
}

interface IAuction {
  buyNowPrice: number;
  duration: number;
  itemData: { id: number | string };
  startingBid: number;
}
export async function sellPlayer(data: IAuction) {
  try {
    logger.info(`selling player ${JSON.stringify(data)}`);
    const pileResponse = await Axios.put('https://utas.external.s2.fut.ea.com/ut/game/fifa19/item', { 
      itemData: [ { id: data.itemData.id, pile: 'trade'} ] 
    });
    if (pileResponse) {
      logger.info(`\t\titem pushed to trade pile ${pileResponse}`);
      const response = await Axios.post('https://utas.external.s2.fut.ea.com/ut/game/fifa19/auctionhouse', data);
      return response.data;
      }
  } catch (e) {
    logger.error(`\t\tsellPlayer error ${e.message} ${e}`);
    return null;
  }
}