import Axios from 'axios';
import { envConfig } from '../../config';
import { ApiQueue } from '../api-queue';
import { getLogger } from './../../logger';
import { ApiError, logErrorResponse, logResponse } from './../api';

const logger = getLogger('FutbinApi');

export const futbinApi = Axios.create({
  baseURL: 'https://www.futbin.com/20/',
  timeout: 30000,
  headers: {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML like Gecko) Chrome/51.0.2704.79 Safari/537.36 Edge/14.14931'
  }
});
const requestsPerSec = envConfig().FUTBOT_FUTBIN_REQUESTS_PER_SEC;

const queue = new ApiQueue(requestsPerSec, 'futbin');
let futbinStopped = false;
logger.info(`There will be maximum ${requestsPerSec} requests per sec`);

futbinApi.interceptors.request.use(async config => {
  if (futbinStopped) {
    return Promise.reject(config);
  }
  const c = await queue.addRequestToQueue(config);
  c.metaData = {
    startTime: new Date()
  };
  return c;
});

futbinApi.interceptors.response.use(
  value => {
    logResponse('FUTBIN', value, queue);
    return value;
  },
  value => {
    const { config, data, response = {}, message } = value;
    const { status } = response;
    logErrorResponse('FUTBIN', value, queue);
    if (status === 403) {
      futbinStopped = true;
      logger.warn(
        `Requests stopped for next 6 hours because of 403 error (temporary ban by futbin)`
      );
      setTimeout(() => (futbinStopped = false), 6 * 60 * 60 * 1000);
      queue.clear();
    }

    return Promise.reject(new ApiError(status, config, message));
  }
);
