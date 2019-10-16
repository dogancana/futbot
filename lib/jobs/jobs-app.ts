import * as express from 'express';
import { Job } from './job';

export const jobsApp = express();

jobsApp.get('/list', (req, res) => {
  res.send(Job.list());
});

jobsApp.get('/resume-all', async (req, res) => {
  res.send(Job.resumeAllJobs());
});

jobsApp.get('/stop-all', async (req, res) => {
  res.send(Job.stopAllJobs());
});
