import { AxiosRequestConfig } from 'axios';
import { interval, Subscription } from 'rxjs';
import { envConfig } from '../config';
import { Job } from '../jobs';
import { AvgStat } from '../utils';
import { logger } from './../logger';
import { cacheEntry } from './cache-adapter';

type ConfigResolver = (c: AxiosRequestConfig) => AxiosRequestConfig;
const MAX_OPTIMUM_QUEUE_LENGTH = 10;
const QUEUE_SIZE_CHECK_FREQUENCY_MS = 60 * 1000;
const QUEUE_SPEED_UP_THRESHOLD = 5;
const SPEED_UP_FACTOR = envConfig().FUTBOT_API_QUEUE_SPEED_UP_FACTOR;
const FAST_LINE_REQUEST_PER_MIN_WARNING = 30;

if (SPEED_UP_FACTOR > 0.4 || SPEED_UP_FACTOR < 0.1) {
  throw new Error(
    `Speed up factor cannot be outside of range 0.1 - 0.4. Set as ${SPEED_UP_FACTOR}`
  );
}

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
    requestsPerSec: number,
    apiName: string,
    configResolver?: ConfigResolver
  ) {
    this.apiName = apiName;
    this.interval = interval(Math.ceil(1000 / requestsPerSec)).subscribe(() => {
      if (this.queue.length > 0) {
        const { resolve } = this.queue.shift();
        resolve();
      }
    });
    this.averageQueueTimeStat = new AvgStat(5);
    this.averageRTTimeStat = new AvgStat(5);
    this.requestsPerSecondStat = new AvgStat(5);
    this.fastLineRequestStat = new AvgStat(5);
    this.configResolver = configResolver;
    this.cacheHitCount = 0;
    ApiQueue.apiQueues.push(this);
    // TODO won't be GCed
    setInterval(
      () => this.checkHandleQueueBloating(),
      QUEUE_SIZE_CHECK_FREQUENCY_MS
    );
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

  private checkHandleQueueBloating() {
    if (this.queue.length > MAX_OPTIMUM_QUEUE_LENGTH) {
      this.queueCheckOptimalCount = 0;
      logger.warn(
        `Queue for ${this.apiName} is bloated (${this.queue.length} requests waiting). Pausing jobs for a minute and slowing by ${SPEED_UP_FACTOR}`
      );
      Job.stopAllJobs();
      Job.changeJobSpeedsBy(1 - SPEED_UP_FACTOR);
      setTimeout(() => {
        Job.resumeAllJobs();
      }, 60 * 1000);
    } else if (
      this.queue.length > 1 &&
      ++this.queueCheckOptimalCount > QUEUE_SPEED_UP_THRESHOLD
    ) {
      this.queueCheckOptimalCount = 0;
      logger.warn(
        `Queue for ${this.apiName} was working inefficiently. Speeding up ${SPEED_UP_FACTOR}`
      );
      Job.stopAllJobs();
      Job.changeJobSpeedsBy(1 + SPEED_UP_FACTOR);
      setTimeout(() => {
        Job.resumeAllJobs();
      }, 30 * 1000);
    }
  }
}
