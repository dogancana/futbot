import { ApiError, logResponse, logErrorResponse } from "./../api";
import Axios from "axios";
import { ApiQueue } from "../api-queue";
import { logger } from "../../logger";

export const futbinApi = Axios.create({
  baseURL: "https://www.futbin.com/20/",
  timeout: 30000,
  headers: []
});
const requestsPerSec =
  parseFloat(process.env.FUTBOT_FUTBIN_REQUESTS_PER_SEC) || 5;

const queue = new ApiQueue(requestsPerSec, "futbin");
let futbinStopped = false;

futbinApi.interceptors.request.use(async config => {
  if (futbinStopped) return Promise.reject(config);
  return await queue.addRequestToQueue(config);
});

futbinApi.interceptors.response.use(
  value => {
    logResponse("FUTBIN", value);
    return value;
  },
  value => {
    const { config, data, response = {}, message } = value;
    const { status } = response;
    logErrorResponse("FUTBIN", value);
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
