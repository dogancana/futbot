import Axios from 'axios';
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

jobsApp.get('/start-favourites', async (req, res) => {
  const selfAddress = `http://localhost:${process.env.PORT || 9999}`;
  const endpointsStr = process.env.FUTBOT_FAVOURITE_JOBS || '';
  const endpoints = endpointsStr.split(',');
  await Promise.all(endpoints.map(s => Axios.get(`${selfAddress}${s}`)));
  res.send(Job.list());
});
