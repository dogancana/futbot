import { getLogger } from '@futbot/logger';
import * as express from 'express';
import { isArray } from 'util';
import { Job } from './job';
import { loadJobs, saveJobs } from './jobs-service';
import { SlowDownJob } from './slow-down-job';
import { defineJobEndpoints } from './utils';

export const jobsApp = express();
const logger = getLogger('JobsApp');

jobsApp.get('/list', (req, res) => {
  res.send(Job.report());
});

jobsApp.get('/resume-all', async (req, res) => {
  res.send(Job.resumeAllJobs(true));
});

jobsApp.get('/stop-all', async (req, res) => {
  res.send(Job.stopAllJobs(true));
});

jobsApp.get('/save-jobs', (req, res) => {
  try {
    const savedJobs = saveJobs();
    if (isArray(savedJobs)) {
      res.send({ savedJobs });
    } else {
      res.send(savedJobs);
    }
  } catch (e) {
    logger.error(`Error saving jobs: ${e}`);
    res.status(500).send(e.message);
  }
});

jobsApp.get('/load-jobs', async (req, res) => {
  try {
    const loadedJobs = await loadJobs();
    if (isArray(loadedJobs)) {
      res.send({ savedJobs: loadedJobs });
    } else {
      res.send(loadedJobs);
    }
  } catch (e) {
    logger.error(`Error loading jobs: ${e}`);
    res.status(500).send(e.message);
  }
});

defineJobEndpoints(jobsApp, 'slow-down', q => {
  const { min, max } = q;
  const props =
    min && max ? { min: parseInt(min, 10), max: parseInt(max, 10) } : null;

  return new SlowDownJob(props);
});
