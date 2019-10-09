import { StatsService } from "./../stats/stats-app";
import Axios, { AxiosResponse, AxiosRequestConfig } from "axios";
import { URL } from "url";
import { logger } from "../logger";
import { SessionInjector } from "../auth";
import { api } from "./api";
import { interval } from "rxjs";
import { Job } from "../job";

const FUT_REQUESTS_PER_SEC =
  parseInt(process.env.FUTBOT_FUT_REQUESTS_PER_SEC, 10) || .7;
const futConfigQueue = [];
interval(Math.ceil(1000 / FUT_REQUESTS_PER_SEC)).subscribe(() => {
  if (futConfigQueue.length > 0) {
    futConfigQueue.shift()();
  }
});

const FUTBIN_REQUESTS_PER_SEC =
  parseInt(process.env.FUTBOT_FUTBIN_REQUESTS_PER_SEC, 10) || 5;
const futbinConfigQueue = [];
interval(Math.ceil(1000 / FUTBIN_REQUESTS_PER_SEC)).subscribe(() => {
  if (futbinConfigQueue.length > 0) {
    futbinConfigQueue.shift()();
  }
});

export function getQueueCount() {
  return {
    fut: futConfigQueue.length,
    futbin: futbinConfigQueue.length
  };
}

export function eaConfig(config) {
  config.headers.Origin = "https://www.easports.com";
  config.headers.Referer =
    "https://www.easports.com/fifa/ultimate-team/web-app/";
  config.headers["X-UT-SID"] = SessionInjector.auth.sid;

  const url = new URL(config.url);
  // let next = SessionInjector.lastStamp + 1;
  // if (!next || next === NaN) next = new Date().getTime();

  // url.searchParams.set("_", `${next}`);
  // SessionInjector.lastStamp = next;
  config.url = url.href;

  return config;
}

const eaStopCodes = [401, 403, 458]
export function setUpInterceptors() {
  Axios.interceptors.response.use(
    res => res,
    ({
      config,
      request,
      response: res
    }: {
      config: AxiosRequestConfig;
      response: AxiosResponse;
      request: any;
    }) => {
      logger.error(
        `[${res.status}] ${config.url} : ${JSON.stringify(res.data)}`
      );
      if (config.url.indexOf("ea.com") > -1) {
        if (eaStopCodes.indexOf(res.status) > -1) {
          logger.error(
            "AxiosInterceptor stopped all jobs for critical auth error"
          );
          Job.stopAllJobs();
        }

        if (res.status === 429) {
          logger.warn(
            "AxiosInterceptor will slow down all jobs by 1/3 for next 30 mins"
          );
          Job.slowDownAllJobsForNextMins(30);
        }
      }
      return Promise.reject(res);
    }
  );

  Axios.interceptors.request.use(
    async config => {
      if (config.url.indexOf("ea.com") > -1) {
        // Do something before request is sent
        if (!SessionInjector.auth) {
          throw new api.ApiError(
            401,
            config,
            "Session not copied!. First load Fut Web App with extension"
          );
        }

        return new Promise((resolve, reject) => {
          futConfigQueue.push(() => {
            StatsService.increment("futRequests");
            resolve(eaConfig(config));
          });
        });
      } else {
        StatsService.increment("futbinRequests");
        return new Promise((resolve, reject) => {
          futbinConfigQueue.push(() => {
            StatsService.increment("futRequests");
            resolve(config);
          });
        });
      }
    },
    function(error) {
      logger.error("Interceptor error: " + error.message);
      return null;
    }
  );
}
