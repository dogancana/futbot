import Axios, { AxiosAdapter, AxiosRequestConfig } from 'axios';
import { logger } from './../logger';

const memory = {};

export const simpleCacheAdapter: AxiosAdapter = async function adapter(
  req: AxiosRequestConfig
) {
  const value = memory[key(req)];
  if (value) {
    return value;
  }

  const res = await Axios.request({ ...req, adapter: null });
  memory[key(req)] = { ...res, fromCache: true };
  return res;
};

export function cacheEntry(request: AxiosRequestConfig) {
  return memory[key(request)];
}

export function cacheSize() {
  return Object.keys(memory).length;
}

function key(request: AxiosRequestConfig): string {
  let dataStr = '';
  let url = request.url;
  if (url.indexOf(request.baseURL) === -1) {
    url = request.baseURL + url;
  }
  try {
    dataStr = JSON.stringify(request.data);
  } catch {
    logger.debug(`[Cache Adapter]: Coulnt stringfy object ${request.data}`);
  }

  return `${url}${dataStr}`;
}
