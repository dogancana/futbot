import Axios, { AxiosRequestConfig } from 'axios';
import { SessionInjector } from '../../auth';
import { Job } from '../../jobs';
import { logger } from '../../logger';
import { ApiError, logErrorResponse, logResponse } from '../api';
import { ApiQueue } from '../api-queue';

export const futApi = Axios.create({
  baseURL:
    process.env.FUTBOT_FUT_API_ENDPOINT_OVERWRITE ||
    'https://utas.external.s2.fut.ea.com/ut/game/fifa20',
  timeout: 30000,
  headers: {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML like Gecko) Chrome/51.0.2704.79 Safari/537.36 Edge/14.14931'
  }
});

const requestsPerSec = parseFloat(process.env.FUTBOT_FUT_REQUESTS_PER_SEC);
if (!requestsPerSec) {
  throw new Error('Invalid request-speed limit');
}
logger.info(`[FUT]: There will be maximum ${requestsPerSec} requests per sec`);

const queue = new ApiQueue(requestsPerSec, 'fut', eaConfigResolver);
let slowedDownAfterTooManyRequests = false;

function eaConfigResolver(config: AxiosRequestConfig): AxiosRequestConfig {
  config.headers.Origin = 'https://www.easports.com';
  config.headers.Referer =
    'https://www.easports.com/fifa/ultimate-team/web-app/';
  config.headers['X-UT-SID'] = SessionInjector.auth.sid;

  // const url = new URL(config.url);
  // let next = SessionInjector.lastStamp + 1;
  // if (!next || next === NaN) next = new Date().getTime();

  // url.searchParams.set("_", `${next}`);
  // SessionInjector.lastStamp = next;
  // config.url = url.href;

  return config;
}

futApi.interceptors.request.use(async config => {
  if (!SessionInjector.auth) {
    throw new ApiError(
      401,
      config,
      'Session not copied!. First load Fut Web App with extension'
    );
  }
  const c = await queue.addRequestToQueue(config);
  c.metaData = {
    startTime: new Date()
  };
  return c;
});

futApi.interceptors.response.use(
  // success
  value => {
    logResponse('FUT', value, queue);
    return value;
  },
  // error
  value => {
    const { config, response = {}, message } = value;
    const { status = 500 } = response;

    logErrorResponse('FUT', value, queue);

    if ([401, 403, 458, 512, 521].indexOf(status) > -1) {
      logger.error(
        '[FUT] stopped all jobs: Temporary ban or just too many requests. Status: ' +
          status
      );

      queue.clear();
      Job.stopAllJobs();
      queue.clear();
    }

    if ([426, 249].indexOf(status) > -1 && !slowedDownAfterTooManyRequests) {
      slowedDownAfterTooManyRequests = true;
      logger.warn('[FUT] will slow down all jobs by 1/3 for next 30 mins');
      Job.changeJobSpeedsBy(1 / 3);
      setTimeout(() => {
        Job.changeJobSpeedsBy(3);
        slowedDownAfterTooManyRequests = false;
      }, 1000 * 60 * 30);
    }

    return Promise.reject(new ApiError(status, config, message));
  }
);
