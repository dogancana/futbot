import { getLogger } from './../logger';

const logger = getLogger('Job');
const jobs: Job[] = [];

const MAX_JOB_FREQUENCY = 20;
const MIN_JOB_FREQUENCY = 1;
const sleep = () => new Promise(resolve => setTimeout(resolve, 1500));

export class Job {
  public static stopAllJobs() {
    logger.info('Stopping all running jobs');
    jobs.forEach(j => j.stop());
    return Job.report();
  }

  public static resumeAllJobs() {
    logger.info('Resuming all running jobs');
    jobs.forEach(j => {
      try {
        j.start();
      } catch (e) {
        logger.error(`${j.name} couldn't be resumed because of error: ${e}`);
      }
    });
    return Job.report();
  }

  public static report() {
    return {
      jobQueue: Job.jobQueue.map(j => j.name),
      jobs: jobs.map(job => ({
        name: job.name,
        execTime: job.execTime,
        avgExecTimeS: job.avgExecTimeS,
        importanceOrder: job.importanceOrder,
        effectiveImportanceOrder: job.effectiveImportanceOrder,
        finished: job.finished,
        stopped: job.stopped,
        report: job.report()
      }))
    };
  }

  private static jobQueue: Job[] = [];
  private static loopRunning = false;
  private static async loop() {
    if (Job.loopRunning) {
      return;
    }

    Job.loopRunning = true;
    while (Job.jobQueue.length > 0) {
      const jobToExecute = Job.jobQueue.shift();
      await Job.executeJob(jobToExecute);
      if (!jobToExecute.stopped) {
        this.addJobToQueue(jobToExecute);
      }
    }
    Job.loopRunning = false;
  }

  private static addJobToQueue(job: Job): void {
    if (
      Job.jobQueue.find(j => j.name === job.name) ||
      job.stopped ||
      job.finished
    ) {
      return;
    }

    job.effectiveImportanceOrder--;
    Job.jobQueue.push(job);
    Job.jobQueue = Job.jobQueue.sort(
      (a, b) => a.effectiveImportanceOrder - b.effectiveImportanceOrder
    );

    if (job.effectiveImportanceOrder <= 0) {
      job.effectiveImportanceOrder = job.importanceOrder;
    }
  }

  private static async executeJob(job: Job): Promise<void> {
    const start = new Date().getTime();
    job.execTime++;
    logger.debug(`Executing ${job.name}`);
    try {
      await job.task();
    } catch (e) {
      logger.error(`${job.name} had and execution error: ${e}`);
    }
    const t = new Date().getTime() - start;
    logger.debug(`${job.name} execution finished in ${t}`);
    if (t < 500) {
      await sleep();
    }
    job.avgExecTimeS =
      ((job.execTime - 1) * job.avgExecTimeS + t) / job.execTime;
  }

  public execTime = 0;
  protected finished: boolean;
  private stopped = false;
  private avgExecTimeS: number = 0;
  private effectiveImportanceOrder: number;
  private task: () => Promise<void>;

  constructor(protected name: string, private importanceOrder: number) {
    if (
      this.importanceOrder < MIN_JOB_FREQUENCY ||
      this.importanceOrder > MAX_JOB_FREQUENCY
    ) {
      throw new Error(
        `Job importance order have to be between ${MIN_JOB_FREQUENCY}, ${MAX_JOB_FREQUENCY}.` +
          ` ${this.name} has ${this.importanceOrder}`
      );
    }
    if (jobs.find(j => j.name === name)) {
      throw new Error(`A job name ${name} is already defined.`);
    }
    this.effectiveImportanceOrder = this.importanceOrder;
  }

  public report(): any {
    return `Reporting not implemented for ${this.name}`;
  }

  public stop(): void {
    logger.debug(`Stoping job ${this.name}`);
    this.stopped = true;
    const i = Job.jobQueue.findIndex(j => j.name === this.name);
    Job.jobQueue.splice(i, 1);
  }

  public start() {
    this.stopped = false;
    Job.addJobToQueue(this);
    Job.loop();
  }

  public isFinished(): boolean {
    return this.finished;
  }

  protected setTask(task: () => Promise<void>): void {
    this.task = task;
    jobs.push(this);
    Job.addJobToQueue(this);
    Job.loop();
  }
}
