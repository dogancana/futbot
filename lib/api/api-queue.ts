import { AxiosRequestConfig } from 'axios';
import { interval, Subscription } from 'rxjs';
import { Job } from '../jobs';
import { AvgStat } from '../utils';
import { logger } from './../logger';
import { cacheEntry } from './cache-adapter';

type ConfigResolver = (c: AxiosRequestConfig) => AxiosRequestConfig;
const MAX_OPTIMUM_QUEUE_LENGTH = 10;
const QUEUE_SIZE_CHECK_FREQUENCY_MS = 60 * 1000;
const QUEUE_SPEED_UP_THRESHOLD = 5;
const SPEED_UP_FACTOR =
  parseFloat(process.env.FUTBOT_API_QUEUE_SPEED_UP_FACTOR) || 0.2;

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
  private queue: Array<() => void> = [];
  private interval: Subscription;
  private apiName: string;
  private requestCount = 0;
  private configResolver: ConfigResolver;
  private queueStart: number;
  private queueCheckOptimalCount: number = 0;
  private averageQueueTimeStat: AvgStat;

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
    this.averageQueueTimeStat = new AvgStat(5);
    this.averageRTTimeStat = new AvgStat(5);
    this.configResolver = configResolver;
    this.queueStart = new Date().getTime();
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
    return new Promise(async (resolve, reject) => {
      const queueTime = new Date().getTime();
      this.queue.push(() => {
        this.requestCount++;
        const c = !!this.configResolver ? this.configResolver(config) : config;
        const resolveTimeMS = new Date().getTime() - queueTime;
        this.averageQueueTimeStat.addSample(resolveTimeMS);

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
      averageQueueTimeMS: this.averageQueueTimeStat.avg().toFixed(0),
      averageRTTimeMS: this.averageRTTimeStat.avg().toFixed(0),
      requestsPerSecond: (this.requestCount / timeSpent).toFixed(1)
    };
  }

  public clear() {
    this.queue = [];
  }

  private checkHandleQueueBloating() {
    if (this.queue.length > MAX_OPTIMUM_QUEUE_LENGTH) {
      this.queueCheckOptimalCount = 0;
      logger.warn(
        `Queue for ${this.apiName} is bloated(${this.queue.length} requests waiting). Pausing jobs for a minute and slowing by ${SPEED_UP_FACTOR}`
      );
      Job.changeJobSpeedsBy(1 - SPEED_UP_FACTOR);
      Job.stopAllJobs();
      setTimeout(() => {
        Job.resumeAllJobs();
      }, 60 * 1000);
    } else if (
      this.queue.length >= 2 &&
      ++this.queueCheckOptimalCount > QUEUE_SPEED_UP_THRESHOLD
    ) {
      this.queueCheckOptimalCount = 0;
      logger.warn(
        `Queue for ${this.apiName} was working inefficiently. Speeding up ${SPEED_UP_FACTOR}`
      );
      Job.changeJobSpeedsBy(1 + SPEED_UP_FACTOR);
    }
  }
}
