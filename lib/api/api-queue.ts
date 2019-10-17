import { AxiosRequestConfig } from 'axios';
import { interval, Subscription } from 'rxjs';
import { Job } from '../jobs';
import { logger } from './../logger';
import { cacheEntry } from './cache-adapter';

type ConfigResolver = (c: AxiosRequestConfig) => AxiosRequestConfig;
const MAX_OPTIMUM_QUEUE_LENGTH = 10;
const QUEUE_SIZE_CHECK_FREQUENCY_MS = 60 * 1000;

export class ApiQueue {
  public static getApiQueueStats() {
    return ApiQueue.apiQueues.map(q => q.stats());
  }
  private static apiQueues: ApiQueue[] = [];
  private queue: Array<() => void> = [];
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
    this.cacheHitCount = 0;
    ApiQueue.apiQueues.push(this);
    setInterval(
      () => this.checkHandleQueueBloating(),
      QUEUE_SIZE_CHECK_FREQUENCY_MS
    );
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

  private checkHandleQueueBloating() {
    if (this.queue.length > MAX_OPTIMUM_QUEUE_LENGTH) {
      logger.warn(
        `Queue for ${this.apiName} is bloated(${this.queue.length} requests waiting). Pausing jobs for a minute and slowing by 20%`
      );
      Job.changeJobSpeedsBy(0.8);
      Job.stopAllJobs();
      setTimeout(() => {
        Job.resumeAllJobs();
      }, 1000);
    }
  }
}
