import Axios from 'axios';
import * as express from 'express';
import { envConfig } from '../config';
import { Job } from './job';
import { SlowDownJob } from './slow-down-job';
import { defineJobEndpoints } from './utils';

export const jobsApp = express();

jobsApp.get('/list', (req, res) => {
  res.send(Job.report());
});

jobsApp.get('/resume-all', async (req, res) => {
  res.send(Job.resumeAllJobs(true));
});

jobsApp.get('/stop-all', async (req, res) => {
  res.send(Job.stopAllJobs(true));
});

jobsApp.get('/start-favourites', async (req, res) => {
  const selfAddress = `http://localhost:${process.env.PORT || 9999}`;
  const endpointsStr = envConfig().FUTBOT_FAVOURITE_JOBS;
  const endpoints = endpointsStr.split(',');
  endpoints.map(async s => await Axios.get(`${selfAddress}${s}`));
  res.send(Job.report());
});

defineJobEndpoints(jobsApp, 'slow-down', q => {
  const { min, max } = q;
  const props =
    min && max ? { min: parseInt(min, 10), max: parseInt(max, 10) } : null;

  return new SlowDownJob(props);
});
