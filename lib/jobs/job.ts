import { pick } from 'lodash';
import { interval, Observable, Subscription } from 'rxjs';
import { startWith } from 'rxjs/operators';
import { logger } from './../logger';
const min = 60 * 1000;

const jobs: Job[] = [];

export class Job {
  public static stopAllJobs() {
    jobs.forEach(j => j.stop());
    return Job.list();
  }

  public static resumeAllJobs() {
    jobs.forEach(j => {
      try {
        j.start();
      } catch (e) {
        logger.error(`JOB[${j.id}] couldn't be resumed because of error: ${e}`);
      }
    });
    return Job.list();
  }

  public static changeJobSpeedsBy(multFactor: number) {
    for (const job of jobs) {
      job.stop();
      job.timesPerMin = job.timesPerMin * multFactor;
      setTimeout(job.start, job.timesPerMin);
    }
  }

  public static list() {
    return Object.keys(jobs).map(key => {
      const job = jobs[key];
      return {
        ...pick(
          job,
          'id',
          'execTime',
          'timesPerMin',
          'avgExecTimeMS',
          'finished'
        ),
        stopped: job.sub.closed,
        report: job.report()
      };
    });
  }

  public execTime = 0;
  protected finished: boolean;
  private source: Observable<any>;
  private sub: Subscription;
  private id: string;
  private task: () => Promise<void>;
  private avgExecTimeMS: number = 0;

  constructor(protected name: string, private timesPerMin: number) {
    this.start = this.start.bind(this);
    this.stop = this.stop.bind(this);

    this.id = `${name}_${new Date().getTime()}`;

    jobs[this.id] = this;
  }

  public report(): any {
    return 'Not implemented';
  }

  public stop(): void {
    this.sub.unsubscribe();
  }

  public isFinished(): boolean {
    return this.finished;
  }

  public start(task?: () => Promise<void>): void {
    this.task = task || this.task;
    if (!this.task) {
      logger.error(`JOB[${this.id}] couldn't be started. No task found`);
      return;
    }

    this.source = interval(min / this.timesPerMin).pipe(startWith(null));
    this.sub = this.source.subscribe(async () => {
      const start = new Date().getTime();
      this.execTime++;
      logger.info(`Executing JOB[${this.id}]`);
      try {
        await this.task();
      } catch (e) {
        logger.error(`JOB[${this.id}] had and execution error: ${e}`);
      }
      const t = new Date().getTime() - start;
      logger.info(`JOB[${this.id}] execution finished in ${t}`);
      this.avgExecTimeMS =
        ((this.execTime - 1) * this.avgExecTimeMS + t) / this.execTime;
    });
  }
}
