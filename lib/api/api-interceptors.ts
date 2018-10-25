import { StatsService } from './../stats/stats-app';
import Axios, { AxiosResponse } from 'axios';
import { URL } from 'url';
import { logger } from '../logger';
import { SessionInjector } from '../auth';
import * as sleep from 'sleep-promise';
import { api } from './api';

const FUT_REQUESTS_PER_SEC = 1
const FUTBIN_REQUESTS_PER_SEC = 20

Axios.interceptors.response.use(
  (response: AxiosResponse<any>) => response,
  (error: AxiosResponse<any> | api.ApiError) => {
    if (error.toString) {
      logger.error(error.toString())
    }
    throw error;
  },
)

export function eaConfig (config) {
  config.headers.Origin = 'https://www.easports.com';
  config.headers.Referer = 'https://www.easports.com/fifa/ultimate-team/web-app/';
  config.headers['X-UT-SID'] = SessionInjector.auth.sid;

  const url = new URL(config.url);
  const next = SessionInjector.lastStamp + 1;
  url.searchParams.set('_', `${next}`);
  SessionInjector.lastStamp = next;
  config.url = url.href;

  return config;
}

export function setUpInterceptors () {
  Axios.interceptors.request.use(async (config) => {
    if (config.url.indexOf('ea.com') > -1) {
      // Do something before request is sent
      if (!SessionInjector.auth) {
        throw new api.ApiError(
          401,
          config,
          'Session not copied!. First load Fut Web App with extension'
        );
      }
      await sleep(1000 / FUT_REQUESTS_PER_SEC);
      StatsService.increment('futRequests');
      return eaConfig(config);
    } else {
      StatsService.increment('futbinRequests');
      await sleep(1000 / FUTBIN_REQUESTS_PER_SEC);
      return config;
    }
  }, function (error) {
    logger.error('Interceptor error: ' + error.message);
    return null;
  });
}
