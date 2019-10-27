import { AxiosRequestConfig } from 'axios';
import { interval, Subscription } from 'rxjs';
import { AvgStat } from '../utils';
import { getLogger } from './../logger';
import { cacheEntry } from './cache-adapter';

const logger = getLogger('ApiQueue');

type ConfigResolver = (c: AxiosRequestConfig) => AxiosRequestConfig;
const FAST_LINE_REQUEST_PER_MIN_WARNING = 30;

export class ApiQueue {
  public static getApiQueueStats() {
    return ApiQueue.apiQueues.map(q => q.stats());
  }
  private static apiQueues: ApiQueue[] = [];
  public averageRTTimeStat: AvgStat;
  public cacheHitCount;
  private queue: Array<{ resolve: () => void; reject: () => void }> = [];
  private interval: Subscription;
  private apiName: string;
  private requestCount = 0;
  private fastLineRequestCount = 0;
  private configResolver: ConfigResolver;
  private queueCheckOptimalCount: number = 0;
  private averageQueueTimeStat: AvgStat;
  private requestsPerSecondStat: AvgStat;
  private fastLineRequestStat: AvgStat;

  constructor(
    private requestsPerSec: number,
    apiName: string,
    configResolver?: ConfigResolver
  ) {
    this.apiName = apiName;
    this.averageQueueTimeStat = new AvgStat(5);
    this.averageRTTimeStat = new AvgStat(5);
    this.requestsPerSecondStat = new AvgStat(5);
    this.fastLineRequestStat = new AvgStat(5);
    this.configResolver = configResolver;
    this.cacheHitCount = 0;
    ApiQueue.apiQueues.push(this);
    this.startInterval();
  }

  public addRequestToQueue(
    config: AxiosRequestConfig
  ): Promise<AxiosRequestConfig> {
    if (cacheEntry(config)) {
      return Promise.resolve(config);
    }
    // fast-track for bids
    if (config.url.match(/\/bid$/gi)) {
      this.fastLineRequestCount++;
      this.fastLineRequestStat.addSample(1);

      const counts = this.fastLineRequestStat.sampleCounts();
      const count = counts.reduce((prev, curr) => prev + curr, 0);
      const hasTooManyFastLines =
        counts[counts.length - 1] > FAST_LINE_REQUEST_PER_MIN_WARNING;
      if (hasTooManyFastLines) {
        logger.warn(
          `In last minute you made ${count} bids. You might get banned soon, slow down!`
        );
      }

      return Promise.resolve(
        !!this.configResolver ? this.configResolver(config) : config
      );
    }

    return new Promise(async (resolve, reject) => {
      const queueTime = new Date().getTime();
      this.queue.push({
        reject,
        resolve: () => {
          this.requestCount++;
          this.requestsPerSecondStat.addSample(1); // value doesn't matter
          const c = !!this.configResolver
            ? this.configResolver(config)
            : config;
          const resolveTimeMS = new Date().getTime() - queueTime;
          this.averageQueueTimeStat.addSample(resolveTimeMS);

          resolve(c);
        }
      });
    });
  }

  public stats() {
    const requestsPerSecond = (
      this.requestsPerSecondStat
        .sampleCounts()
        .reduce((prev, curr) => prev + curr, 0) /
      (5 * 60)
    ).toFixed(1);

    return {
      name: this.apiName,
      requestsPerSecond,
      requestCount: this.requestCount,
      cacheHitCount: this.cacheHitCount,
      queueCount: this.queue.length,
      averageQueueTimeMS: this.averageQueueTimeStat.avg().toFixed(0),
      averageRTTimeMS: this.averageRTTimeStat.avg().toFixed(0)
    };
  }

  public clear() {
    this.queue.forEach(({ reject }) => reject());
    this.queue = [];
  }

  public changeRequestsPerSec(requestsPerSec: number) {
    if (requestsPerSec === this.requestsPerSec) {
      return;
    }

    logger.info(
      `Changing requestsPerSec value for ${this.apiName} to ${requestsPerSec}.` +
        `Old value was ${this.requestsPerSec}`
    );

    this.interval.unsubscribe();
    this.interval = undefined;
    this.requestsPerSec = requestsPerSec;
    this.startInterval();
  }

  private startInterval() {
    this.interval = interval(Math.ceil(1000 / this.requestsPerSec)).subscribe(
      () => {
        if (this.queue.length > 0) {
          const { resolve } = this.queue.shift();
          resolve();
        }
      }
    );
  }
}
