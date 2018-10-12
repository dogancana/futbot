import Axios from 'axios';
import { URL } from 'url';
import { logger } from '../logger';
import { SessionInjector } from '../auth';

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
  Axios.interceptors.request.use(config => {
    // Do something before request is sent
    if (!SessionInjector.auth) {
      throw new Error('Session not copied!. First load Fut Web App with extension');
    }
  
    if (config.url.indexOf('ea.com') > -1) {
      return eaConfig(config);
    } else {
      return config;
    }
  }, function (error) {
    logger.error('Interceptor error: ' + error.message);
    return null;
  });
}
