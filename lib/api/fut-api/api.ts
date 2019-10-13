import {logger} from "../../logger";
import {Job} from "../../job";
import Axios, {AxiosRequestConfig} from "axios";
import {ApiQueue} from "../api-queue";
import {SessionInjector} from "../../auth";
import {ApiError, logResponse, logErrorResponse} from "../api";

export const futApi = Axios.create({
  baseURL:
    process.env.FUTBOT_FUT_API_ENDPOINT_OVERWRITE ||
    "https://utas.external.s2.fut.ea.com/ut/game/fifa20",
  timeout: 30000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML like Gecko) Chrome/51.0.2704.79 Safari/537.36 Edge/14.14931'
  }
});
const requestsPerSec = parseFloat(process.env.FUTBOT_FUT_REQUESTS_PER_SEC) || 0.7;

const queue = new ApiQueue(requestsPerSec, "fut", eaConfigResolver);

function eaConfigResolver(config: AxiosRequestConfig): AxiosRequestConfig {
  config.headers.Origin = "https://www.easports.com";
  config.headers.Referer = "https://www.easports.com/fifa/ultimate-team/web-app/";
  config.headers["X-UT-SID"] = SessionInjector.auth.sid;

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
      "Session not copied!. First load Fut Web App with extension"
    );
  }
  return await queue.addRequestToQueue(config);
});

futApi.interceptors.response.use(
  // success
  value => {
    logResponse("FUT", value);
    return value;
  },
  // error
  value => {
    const {config, response = {}, message} = value;
    const {status = 500} = response;

    logErrorResponse("FUT", value);

    if ([401, 403, 458].indexOf(status) > -1) {
      logger.error("[FUT] stopped all jobs for critical auth error");
      Job.stopAllJobs();
    }

    if (status === 429) {
      logger.warn("[FUT] will slow down all jobs by 1/3 for next 30 mins");
      Job.slowDownAllJobsForNextMins(30);
    }
    return Promise.reject(new ApiError(status, config, message));
  }
);
