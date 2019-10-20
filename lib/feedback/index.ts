import Axios from 'axios';
import * as express from 'express';
import { envConfig } from '../config';

export const feedbackApp = express();

feedbackApp.get('', async (req, res) => {
  const selfAddress = `http://localhost:${process.env.PORT || 9999}`;
  const stats = (await Axios.get(`${selfAddress}/stats`)).data;
  const jobs = (await Axios.get(`${selfAddress}/jobs/list`)).data;
  const config = envConfig();

  res.send(JSON.stringify({ stats, jobs, config }, null, 2));
});
