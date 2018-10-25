import { api } from "./api";
import * as querystring from 'querystring';

export namespace futbin {
  export interface Prices {
    pc: Price,
    xbox: Price,
    ps: Price
  }
  export interface Price {
    prices: []
    updatedMinsAgo?: number
    minPrice?: number
    maxPrice?: number
    prp?: number
  }
  export async function getPrice (resourceId): Promise<Prices> {
    const response = await api.get(`https://www.futbin.com/19/playerPrices?player=${resourceId}`);
    const apiPrices = response.data[resourceId].prices;
    const result: Prices = {
      pc: { prices: [] },
      xbox: { prices: [] },
      ps: { prices: [] },
    }
    const platforms = ['pc', 'xbox', 'ps']

    platforms.forEach(platform => {
      for (let i=1;i<6;i++) {
        const price = parseFutbinPrice(apiPrices[platform][`LCPrice${i > 1 ? i : ''}`]);
        result[platform].prices.push(price)
        result[platform].prices = result[platform].prices.filter(p => p !== 0);
      }
      result[platform].minPrice = parseFutbinPrice(apiPrices[platform].MinPrice);
      result[platform].maxPrice = parseFutbinPrice(apiPrices[platform].MaxPrice);
      result[platform].prp = parseFutbinPrice(apiPrices[platform].PRP);
      result[platform].updatedMinsAgo = parseUpdateTime(apiPrices[platform].updated);
    });

    return result
  }

  export interface PlayersQuery {
    page: number
    pc_price?: string
    sort?: 'likes' | string
    order?: 'desc' | string
  }
  export async function getPlayers (query: PlayersQuery): Promise<any> {
    const resp = await api.get(`https://www.futbin.com/19/players?${querystring.stringify(query)}`)
    return resp.data;
  }
}

function parseUpdateTime (str: string): number {
  if (str.includes('hour')) {
    return parseInt(str, 10) * 60
  } else if (str.includes('min')) {
    return parseInt(str, 10)
  } else {
    return -1
  }
}

function parseFutbinPrice (str: string | number): number {
  return parseInt(str.toString().replace(/,/g, ''), 10)
}
