import { pick } from 'lodash';
import { interval, Observable, Subscription } from 'rxjs';
import { startWith } from 'rxjs/operators';
import { logger } from './../logger';
const min = 60 * 1000;

const jobs: Job[] = [];

export class Job {
  public static stopAllJobs() {
    logger.info('Stopping all running jobs');
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
      job.timesPerMin = job.timesPerMin * multFactor;
    }
  }

  public static list() {
    return jobs.map(job => ({
      ...pick(job, 'id', 'execTime', 'timesPerMin', 'avgExecTimeS', 'finished'),
      stopped: !job.sub || job.sub.closed,
      report: job.report()
    }));
  }

  public execTime = 0;
  protected finished: boolean;
  private source: Observable<any>;
  private sub: Subscription;
  private id: string;
  private task: () => Promise<void>;
  private avgExecTimeS: number = 0;

  constructor(protected name: string, private timesPerMin: number) {
    this.start = this.start.bind(this);
    this.stop = this.stop.bind(this);

    this.id = `${name}_${new Date().getTime()}`;
    jobs.push(this);

    setImmediate(() => {
      if (jobs.length > 1) {
        const jobSlowDownPerct = 1 / jobs.length;
        logger.info(
          `A new job ${name} added. Slowing down all other jobs by ${jobSlowDownPerct}`
        );

        Job.stopAllJobs();
        Job.changeJobSpeedsBy(jobSlowDownPerct);
        Job.resumeAllJobs();
      }
    });
  }

  public report(): any {
    return 'Not implemented';
  }

  public stop(): void {
    if (!this.sub || this.sub.closed) {
      return;
    }

    logger.debug(`Stoping job ${this.id}`);
    this.sub.unsubscribe();
    delete this.sub;
  }

  public isFinished(): boolean {
    return this.finished;
  }

  public start(task?: () => Promise<void>): void {
    if (this.finished || !!this.sub) {
      return;
    }

    this.task = task || this.task;
    if (!this.task) {
      logger.error(`JOB[${this.id}] couldn't be started. No task found`);
      return;
    }

    this.source = interval(min / this.timesPerMin).pipe(startWith(null));
    this.sub = this.source.subscribe(async () => {
      const start = new Date().getTime();
      this.execTime++;
      logger.debug(`Executing JOB[${this.id}]`);
      try {
        await this.task();
      } catch (e) {
        logger.error(`JOB[${this.id}] had and execution error: ${e}`);
      }
      const t = new Date().getTime() - start;
      logger.debug(`JOB[${this.id}] execution finished in ${t}`);
      this.avgExecTimeS =
        ((this.execTime - 1) * this.avgExecTimeS + t) / this.execTime;
    });
  }
}
