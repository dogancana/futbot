import {AxiosRequestConfig} from "axios";
import {interval, Subscription} from "rxjs";
import {cacheEntry} from "./cache-adapter";

type ConfigResolver = (c: AxiosRequestConfig) => AxiosRequestConfig;

export class ApiQueue {
  private static apiQueues: ApiQueue[] = [];
  private queue: (() => void)[] = [];
  private interval: Subscription;
  private apiName: string;
  private requestCount = 0;
  private cacheHitCount = 0;
  private configResolver: ConfigResolver;
  private queueStart: number;

  constructor(
    requestsPerSec: number,
    apiName: string,
    configResolver?: ConfigResolver
  ) {
    this.apiName = apiName;
    this.interval = interval(Math.ceil(1000 / requestsPerSec)).subscribe(() => {
      if (this.queue.length > 0) {
        const fn = this.queue.shift();
        fn();
      }
    });
    this.configResolver = configResolver;
    this.queueStart = new Date().getTime();
    ApiQueue.apiQueues.push(this);
  }

  public static getApiQueueStats() {
    return ApiQueue.apiQueues.map(q => q.stats());
  }

  public addRequestToQueue(
    config: AxiosRequestConfig
  ): Promise<AxiosRequestConfig> {
    if (cacheEntry(config)) {
      this.cacheHitCount++;
      return Promise.resolve(config);
    }
    return new Promise((resolve, reject) => {
      this.queue.push(() => {
        this.requestCount++;
        const c = !!this.configResolver ? this.configResolver(config) : config;
        resolve(c);
      });
    });
  }

  public stats() {
    const now = new Date().getTime();
    const timeSpent = (now - this.queueStart) / 1000;
    return {
      name: this.apiName,
      requestCount: this.requestCount,
      cacheHitCount: this.cacheHitCount,
      queueCount: this.queue.length,
      requestsPerSecond: (this.requestCount / timeSpent).toFixed(1)
    };
  }
}
