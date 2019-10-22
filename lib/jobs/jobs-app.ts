import Axios from 'axios';
import * as express from 'express';
import { envConfig } from '../config';
import { Job } from './job';

export const jobsApp = express();

jobsApp.get('/list', (req, res) => {
  res.send(Job.report());
});

jobsApp.get('/resume-all', async (req, res) => {
  res.send(Job.resumeAllJobs());
});

jobsApp.get('/stop-all', async (req, res) => {
  res.send(Job.stopAllJobs());
});

jobsApp.get('/start-favourites', async (req, res) => {
  const selfAddress = `http://localhost:${process.env.PORT || 9999}`;
  const endpointsStr = envConfig().FUTBOT_FAVOURITE_JOBS;
  const endpoints = endpointsStr.split(',');
  endpoints.map(async s => await Axios.get(`${selfAddress}${s}`));
  res.send(Job.report());
});
