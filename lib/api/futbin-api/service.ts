import * as cheerio from 'cheerio';
import * as querystring from 'querystring';
import { simpleCacheAdapter } from '../cache-adapter';
import { FUTBIN_ENDPOINT, futbinApi } from './api';

export namespace futbin {
  export interface FutbinPlayerResponse<T> {
    pc: T;
    xbox: T;
    ps: T;
  }

  export interface FutbinIDs {
    futbinId: number;
    assetId?: number;
    resourceId: number;
  }

  export type Prices = FutbinPlayerResponse<Price>;

  export interface Price {
    LCPrice: number;
    prices: number[];
    updatedMinsAgo: number;
    minPrice: number;
    maxPrice: number;
    prp: number;
  }

  export async function getPrice(resourceId): Promise<Prices> {
    if (!resourceId) {
      return null;
    }

    const response = await futbinApi.get(`/playerPrices?player=${resourceId}`, {
      adapter: simpleCacheAdapter
    });
    const apiPrices = response.data[resourceId].prices;
    const result: Prices = {
      pc: { prices: [] },
      xbox: { prices: [] },
      ps: { prices: [] }
    } as any;
    const platforms = ['pc', 'xbox', 'ps'];

    platforms.forEach(platform => {
      for (let i = 1; i < 6; i++) {
        const price = parseFutbinPrice(
          apiPrices[platform][`LCPrice${i > 1 ? i : ''}`]
        );
        result[platform].prices.push(price);
        result[platform].prices = result[platform].prices.filter(p => p !== 0);
      }

      result[platform].minPrice = parseFutbinPrice(
        apiPrices[platform].MinPrice
      );
      result[platform].maxPrice = parseFutbinPrice(
        apiPrices[platform].MaxPrice
      );
      result[platform].prp = parseFutbinPrice(apiPrices[platform].PRP);
      result[platform].updatedMinsAgo = parseUpdateTime(
        apiPrices[platform].updated
      );
      result[platform].LCPrice = parseFutbinPrice(apiPrices[platform].LCPrice);
    });

    return result;
  }

  export async function getGraph(
    id: number
  ): Promise<FutbinPlayerResponse<number[]>> {
    const values: FutbinPlayerResponse<number[][]> = (await futbinApi.get(
      `/playerGraph?type=daily_graph&year=20&player=${id}&set_id`,
      { adapter: simpleCacheAdapter }
    )).data;

    // first elm time, second elm price
    return {
      pc: values.pc.map(arr => arr[1]),
      xbox: values.pc.map(arr => arr[1]),
      ps: values.pc.map(arr => arr[1])
    };
  }

  // price separated by -
  // prp separated by ,
  export interface PlayersQuery {
    page: number;
    pc_price?: string;
    xbox_price?: string;
    ps_price?: string;
    pc_prp?: string;
    xbox_prp?: string;
    ps_prp?: string;
    version?: 'gold' | string;
    sort?: 'likes';
    order?: 'desc' | 'asc';
  }

  export async function getAssetIDsFromPage(
    path: string
  ): Promise<FutbinIDs[]> {
    const playersPageSelector = '#repTb tbody tr';
    const sbcPageSelector = 'div[data-player-id]';
    const resp = await futbinApi.get(
      path.replace('.com/20', '.com').replace(FUTBIN_ENDPOINT, ''),
      {
        adapter: simpleCacheAdapter
      }
    );
    const html = resp.data;
    const $ = cheerio.load(html);
    const ids: FutbinIDs[] = [
      ...$(playersPageSelector)
        .map((i, elm) => {
          const tr = $(elm);
          const img = $(tr.find('.player_img'));
          const futbinId = /player\/([0-9]+)/.exec(tr.data('url'))[1];
          const resourceId = /players\/.([0-9]+)\.png/.exec(
            img.data('original')
          )[1];
          return {
            futbinId,
            resourceId,
            assetId: null
          };
        })
        .get(),
      ...$(sbcPageSelector)
        .map((i, elm) => {
          const div = $(elm);
          const futbinId = div.data('player-id');
          const resourceId = div.data('resource-id');
          const assetId = div.data('base-id');
          return {
            futbinId,
            resourceId,
            assetId
          };
        })
        .get()
    ].map((a: FutbinIDs) => {
      for (const key of Object.keys(a)) {
        const v = parseInt(a[key], 10);
        a[key] = !isNaN(v) ? v : null;
      }
      return a;
    });

    return ids;
  }

  export async function getPlayerIDs(query: PlayersQuery): Promise<number[]> {
    const resp = await futbinApi.get(
      `/players?${querystring.stringify(query, null, null, {
        encodeURIComponent: uri => uri
      })}`,
      { adapter: simpleCacheAdapter }
    );
    const html = resp.data;
    const $ = cheerio.load(html);
    const players: number[] = $('#repTb tbody tr')
      .map((i, elm) => {
        const player = $(elm);
        const execResult = /player\/([0-9]+)/.exec(player.data('url'));
        return execResult && execResult[1]; // futbinId
      })
      .get()
      .map(id => parseInt(id, 10))
      .filter((id: number) => !!id && !isNaN(id));

    return players;
  }

  export async function getPlayer(futbinId: number): Promise<FutbinIDs> {
    const resp = await futbinApi.get(`/player/${futbinId}`, {
      adapter: simpleCacheAdapter
    });
    const html = resp.data;
    const $ = cheerio.load(html);
    const info = $('#page-info');

    return {
      resourceId: parseInt(info.data('player-resource'), 10),
      futbinId: parseInt(info.data('id'), 10),
      assetId: parseInt(info.data('baseid'), 10)
    };
  }
}

function parseUpdateTime(str: string): number {
  if (!str) {
    return null;
  }

  if (
    str.includes('week') ||
    str.includes('days') ||
    str.includes('month') ||
    str.includes('year')
  ) {
    return Number.MAX_VALUE;
  } else if (str.includes('hour')) {
    return parseInt(str, 10) * 60;
  } else if (str.includes('min')) {
    return parseInt(str, 10);
  } else {
    return -1;
  }
}

function parseFutbinPrice(str: string | number): number {
  return parseInt(str.toString().replace(/,/g, ''), 10);
}
