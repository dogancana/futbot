import { logger } from './../logger';
import * as objectHash from 'object-hash'
import Axios, { AxiosRequestConfig } from 'axios';
import { StatsService } from '../stats';

const memCache = {}

export namespace api {
  export interface ApiConfig {
    cachable?: boolean
  }

  const deafultConf: ApiConfig = {
    cachable: false
  }

  export async function get(url: string, rest: AxiosRequestConfig = {}, apiConfig: ApiConfig = {}) {
    return request({
      url,
      method: 'GET',
      ...rest
    }, apiConfig)
  }

  export async function post(url: string, rest: AxiosRequestConfig = {}, apiConfig: ApiConfig = {}) {
    return request({
      url,
      method: 'POST',
      ...rest
    }, apiConfig)
  }

  export async function put(url: string, rest: AxiosRequestConfig = {}, apiConfig: ApiConfig = {}) {
    return request({
      url,
      method: 'PUT',
      ...rest
    }, apiConfig)
  }

  export async function del(url: string, rest: AxiosRequestConfig = {}, apiConfig: ApiConfig = {}) {
    return request({
      url,
      method: 'DELETE',
      ...rest
    }, apiConfig)
  }

  export async function request(axiosConfig: AxiosRequestConfig, apiConfig) {
    const conf = { ...deafultConf, ...apiConfig }
    const key = objectHash(axiosConfig)
    const cached = memCache[key]
    const url = axiosConfig.url || ''

    if (url.indexOf('futbin') > -1) {
      StatsService.increment('cachedFutbinResponse')
    } else if (url.indexOf('fut.ea')) {
      StatsService.increment('cachedFutResponse')
    }

    if (conf.cachable && cached) {
      return cached
    } else {
      logger.info(url)
      const response = await Axios(axiosConfig)
      memCache[key] = response
      return response
    }
  }

  export class ApiError extends Error {
    constructor(
      public status: number,
      public config: AxiosRequestConfig,
      public message: string) {
      super(message)
    }

    public toString(): string {
      return `STATUS[${this.status}] from '${this.config.url}' as \n${this.message}`
    }
  }
}
