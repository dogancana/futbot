import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { logger } from '../logger';

export class ApiError extends Error {
  constructor(
    public status: number,
    public config: AxiosRequestConfig,
    public message: string
  ) {
    super(message);
  }

  public toString(): string {
    return `STATUS[${this.status}] from '${this.config.url}' as \n${this.message}`;
  }
}

export function logResponse(apiName: string, r: AxiosResponse) {
  const { config, data, status, fromCache } = r;
  const cachedStr: string = fromCache ? '[Cached]' : '';
  logger.debug(`[${apiName}]: ${status}${cachedStr} ${config.url}`);
}

export function logErrorResponse(apiName: string, v: any) {
  const { config, response = {}, message } = v;
  const { status = 500, data } = response;

  logger.error(
    `[${apiName}]: ${status} ${config.method} ${config.url} ${
      config.data
    } ${message} ${JSON.stringify(data)}`
  );
}
