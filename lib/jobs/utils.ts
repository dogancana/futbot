import * as express from 'express';
import { getLogger } from '../logger';
import { Job } from './job';
import { registerSaveableQuery } from './jobs-service';

const logger = getLogger('JobUtils');

export interface DefinedJob<T extends Job> {
  job: T;
}

export function defineJobEndpoints<T extends Job>(
  app: ReturnType<typeof express>,
  jobName: string,
  jobFactory: (props: any) => T
): DefinedJob<T> {
  const result: DefinedJob<T> = {
    job: null
  };

  app.get(`/start-${jobName}`, (req, res) => {
    logger.info(
      `Starting job ${jobName} with query ${JSON.stringify(req.query)}`
    );
    try {
      if (!result.job || result.job.isFinished()) {
        result.job = jobFactory(req.query);
        setJobStartQuery(req);
      }

      result.job.start(true);
      res.send(result.job.report());
    } catch (e) {
      res.send(e.message);
    }
  });

  app.get(`/stop-${jobName}`, (req, res) => {
    logger.info(`Stoping job ${jobName}`);
    try {
      if (!result.job) {
        res.send('Nothing to do');
        return;
      }

      const report = result.job.report();
      result.job.stop(true);
      res.send(report);
    } catch (e) {
      res.send(e.message);
    }
  });

  app.get(`/finish-${jobName}`, (req, res) => {
    logger.info(`Finishing job ${jobName}`);
    try {
      if (!result.job || result.job.isFinished()) {
        res.send('Nothing to do');
        return;
      }

      const report = result.job.report();
      result.job.finish();
      result.job = undefined;
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
      if (result.job) {
        result.job.finish();
      }

      result.job = jobFactory(req.query);
      result.job.start(true);
      setJobStartQuery(req);

      res.send(result.job.report());
    } catch (e) {
      res.send(e.message);
    }
  });

  function setJobStartQuery(req: express.Request) {
    registerSaveableQuery({
      name: `${jobName}-start-query`,
      query: reqToSaveableQuery(req)
    });
  }

  return result;
}

export function reqToSaveableQuery(req: express.Request): string {
  return `${req.protocol}://${req.header('host')}${req.originalUrl}`;
}
