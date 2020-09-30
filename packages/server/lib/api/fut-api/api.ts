import { getLogger } from '@futbot/logger';
import Axios, { AxiosRequestConfig } from 'axios';
import { SessionInjector } from '../../auth';
import { envConfig } from '../../config';
import { Job } from '../../jobs';
import { ApiError, logErrorResponse, logResponse } from '../api';
import { ApiQueue } from '../api-queue';

const logger = getLogger('FutApi');

export const futApi = Axios.create({
  baseURL: envConfig().FUTBOT_FUT_API_ENDPOINT_OVERWRITE,
  timeout: 30000,
  headers: {
    'User-Agent':
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.120 Safari/537.36'
  }
});

const requestsPerSec = envConfig().FUTBOT_FUT_REQUESTS_PER_SEC;
logger.info(`There will be maximum ${requestsPerSec} requests per sec`);

const queue = new ApiQueue(requestsPerSec, 'fut', eaConfigResolver);
// let slowedDownAfterTooManyRequests = false;

function eaConfigResolver(config: AxiosRequestConfig): AxiosRequestConfig {
  config.headers.Origin = 'https://www.easports.com';
  config.headers.Referer =
    'https://www.easports.com/fifa/ultimate-team/web-app/';
  config.headers['X-UT-SID'] = SessionInjector.sid;

  return config;
}

futApi.interceptors.request.use(async config => {
  if (!SessionInjector.sid) {
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
        'stopped all jobs: Session expired or verification required or temporary ban. Status: ' +
          status +
          '. Refresh fut web app and login to continue'
      );

      queue.clear();
      Job.stopAllJobs();
      queue.clear();
    }

    // if ([426, 249].indexOf(status) > -1 && !slowedDownAfterTooManyRequests) {
    //   slowedDownAfterTooManyRequests = true;
    //   logger.warn('will slow down all jobs by 1/3 for next 30 mins');
    //   queue.changeRequestsPerSec(requestsPerSec / 3);
    //   queue.clear();
    //   setTimeout(() => {
    //     queue.changeRequestsPerSec(requestsPerSec);
    //     slowedDownAfterTooManyRequests = false;
    //   }, 1000 * 60 * 30);
    // }

    return Promise.reject(new ApiError(status, config, message));
  }
);
