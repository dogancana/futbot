import { StatsService } from './../stats/stats-app';
import Axios, { AxiosResponse } from 'axios';
import { URL } from 'url';
import { logger } from '../logger';
import { SessionInjector } from '../auth';
import { api } from './api';
import { interval } from 'rxjs'

const FUT_REQUESTS_PER_SEC = 1
const futConfigQueue = []
interval(1000 / FUT_REQUESTS_PER_SEC).subscribe(() => {
  if (futConfigQueue.length > 0) {
    futConfigQueue.shift()()
  }
})

const FUTBIN_REQUESTS_PER_SEC = 20
const futbinConfigQueue = []
interval(1000 / FUTBIN_REQUESTS_PER_SEC).subscribe(() => {
  if (futbinConfigQueue.length > 0) {
    futbinConfigQueue.shift()()
  }
})

Axios.interceptors.response.use(
  (response: any) => response,
  (error: any | api.ApiError) => {
    const response = error.response || { config: {} }
    logger.error(`[${response.status}] ${response.config.url} : ${JSON.stringify(response.data)}`)
    throw error;
  },
)

export function eaConfig (config) {
  config.headers.Origin = 'https://www.easports.com';
  config.headers.Referer = 'https://www.easports.com/fifa/ultimate-team/web-app/';
  config.headers['X-UT-SID'] = SessionInjector.auth.sid;

  const url = new URL(config.url);
  let next = SessionInjector.lastStamp + 1;
  if (!next || next === NaN) next = new Date().getTime()

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

      return new Promise((resolve, reject) => {
        futConfigQueue.push(() => {
          StatsService.increment('futRequests');
          resolve(eaConfig(config))
        })
      });
    } else {
      StatsService.increment('futbinRequests');
      return new Promise((resolve, reject) => {
        futbinConfigQueue.push(() => {
          StatsService.increment('futRequests');
          resolve(config)
        })
      });
    }
  }, function (error) {
    logger.error('Interceptor error: ' + error.message);
    return null;
  });
}
