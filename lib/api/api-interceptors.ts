import { StatsService } from './../stats/stats-app';
import Axios from 'axios';
import { URL } from 'url';
import { logger } from '../logger';
import { SessionInjector } from '../auth';
import * as sleep from 'sleep-promise';

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
        throw new Error('Session not copied!. First load Fut Web App with extension');
      }
      await sleep(250);
      StatsService.requestMade();
      return eaConfig(config);
    } else {
      await sleep(50);
      return config;
    }
  }, function (error) {
    logger.error('Interceptor error: ' + error.message);
    return null;
  });
}
