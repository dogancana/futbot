import { logger } from "./logger";
import { interval, Observable, Subscription } from "rxjs";
import { startWith } from "rxjs/operators";
const min = 60 * 1000;

const jobs: {
  [key: string]: Job;
} = {};

export class Job {
  public static stopAllJobs(): number {
    let stopped = 0;
    const keys = Object.keys(jobs);
    for (const key of keys) {
      const job = jobs[key];
      job.stop();
      stopped++;
    }
    return stopped;
  }

  private source: Observable<any>;
  private sub: Subscription;
  public execTime = 0;
  private id: string;
  private task: () => void;

  constructor(protected name: string, private timesPerMin: number) {
    this.start = this.start.bind(this);
    this.stop = this.stop.bind(this);

    this.id = `${name}_${new Date().getTime()}`;

    jobs[this.id] = this;
  }

  public stop(): void {
    this.sub.unsubscribe();
  }

  public start(task: () => void): void {
    this.task = task;
    this.source = interval(min / this.timesPerMin).pipe(startWith(null));
    this.sub = this.source.subscribe(() => {
      this.execTime++;
      logger.info(`Executing JOB[${this.id}]`);
      this.task();
      logger.info(`JOB[${this.id}] execution finished`);
    });
  }
}
