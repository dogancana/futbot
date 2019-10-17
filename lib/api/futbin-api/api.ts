import Axios from 'axios';
import { ApiQueue } from '../api-queue';
import { logger } from './../../logger';
import { ApiError, logErrorResponse, logResponse } from './../api';

export const futbinApi = Axios.create({
  baseURL: 'https://www.futbin.com/20/',
  timeout: 30000,
  headers: {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML like Gecko) Chrome/51.0.2704.79 Safari/537.36 Edge/14.14931'
  }
});
const requestsPerSec =
  parseFloat(process.env.FUTBOT_FUTBIN_REQUESTS_PER_SEC) || 2;

const queue = new ApiQueue(requestsPerSec, 'futbin');
let futbinStopped = false;
logger.info(
  `[FUTBIN]: There will be maximum ${requestsPerSec} requests per sec`
);

futbinApi.interceptors.request.use(async config => {
  if (futbinStopped) {
    return Promise.reject(config);
  }
  return await queue.addRequestToQueue(config);
});

futbinApi.interceptors.response.use(
  value => {
    logResponse('FUTBIN', value);
    return value;
  },
  value => {
    const { config, data, response = {}, message } = value;
    const { status } = response;
    logErrorResponse('FUTBIN', value);
    if (status === 403) {
      futbinStopped = true;
      logger.warn(
        `[FUTBIN] Requests stopped for next 30 mins because of 403 error`
      );
      setTimeout(() => (futbinStopped = false), 30 * 60 * 60 * 1000);
    }

    return Promise.reject(new ApiError(status, config, message));
  }
);
