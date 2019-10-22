import { AxiosRequestConfig, AxiosResponse } from 'axios';
import '../custom-types/'; // this is weird
import { getLogger } from '../logger';
import { ApiQueue } from './api-queue';

const logger = getLogger('ApiUtils');

export class ApiError extends Error {
  constructor(
    public status: number,
    public config: AxiosRequestConfig = {},
    public message: string
  ) {
    super(message);
  }

  public toString(): string {
    return `STATUS[${this.status}] from '${this.config.url}' as \n${this.message}`;
  }
}

export function logResponse(
  apiName: string,
  r: AxiosResponse,
  queue: ApiQueue
) {
  const { config, data, status, fromCache } = r;
  const cachedStr: string = fromCache === true ? '[Cached]' : '';
  if (fromCache) {
    queue.cacheHitCount++;
  } else {
    handleRTT(apiName, config, queue);
  }

  logger.debug(`${status}${cachedStr} ${config.url}`);
}

export function logErrorResponse(apiName: string, v: any, queue: ApiQueue) {
  const { config = {}, response = {}, message } = v;
  const { status = 500, data, fromCache } = response;
  if (fromCache) {
    queue.cacheHitCount++;
  } else {
    handleRTT(apiName, config, queue);
  }

  logger.error(
    `${status} ${config.method} ${config.url} ${
      config.data
    } ${message} ${JSON.stringify(data)}`
  );
}

function handleRTT(
  apiName: string,
  config: AxiosRequestConfig,
  queue: ApiQueue
) {
  const rtt = calculateRTT(config);
  queue.averageRTTimeStat.addSample(rtt);
  if (rtt > 15000) {
    logger.debug(`request to ${config.url} took ${rtt}ms to complete`);
  }
}

function calculateRTT(config: AxiosRequestConfig): number {
  if (!config || !config.metaData || !config.metaData.startTime) {
    return null;
  }
  return new Date().getTime() - config.metaData.startTime.getTime();
}
