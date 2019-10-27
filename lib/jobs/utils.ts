import * as express from 'express';
import { getLogger } from '../logger';
import { Job } from './job';

const logger = getLogger('JobUtils');

export function defineJobEndpoints<T extends Job>(
  app: ReturnType<typeof express>,
  jobName: string,
  jobFactory: (props: any) => T
) {
  let job: T;

  app.get(`/start-${jobName}`, (req, res) => {
    logger.info(
      `Starting job ${jobName} with query ${JSON.stringify(req.query)}`
    );
    try {
      if (!job || job.isFinished()) {
        job = jobFactory(req.query);
      }

      job.start(true);
      res.send(job.report());
    } catch (e) {
      res.send(e.message);
    }
  });

  app.get(`/stop-${jobName}`, (req, res) => {
    logger.info(`Stoping job ${jobName}`);
    try {
      if (!job) {
        res.send('Nothing to do');
        return;
      }

      const report = job.report();
      job.stop(true);
      res.send(report);
    } catch (e) {
      res.send(e.message);
    }
  });

  app.get(`/finish-${jobName}`, (req, res) => {
    logger.info(`Finishing job ${jobName}`);
    try {
      if (!job || job.isFinished()) {
        res.send('Nothing to do');
        return;
      }

      const report = job.report();
      job.finish();
      job = undefined;
      res.send(report);
    } catch (e) {
      res.send(e.message);
    }
  });

  app.get(`/restart-${jobName}`, (req, res) => {
    logger.info(
      `Restarting job ${jobName} with query ${JSON.stringify(req.query)}`
    );
    try {
      if (job) {
        job.finish();
      }

      job = jobFactory(req.query);
      job.start(true);

      res.send(job.report());
    } catch (e) {
      res.send(e.message);
    }
  });
}
