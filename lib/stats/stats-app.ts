import * as express from 'express';
import { ApiQueue } from '../api';

export const statsApp = express();
const started = new Date();

statsApp.get('', (req, res) => {
  const now = new Date();
  const timeSpentSeconds = Math.ceil(
    (now.getTime() - started.getTime()) / 1000
  );
  res.send(
    JSON.stringify({
      timeSpentSeconds: timeSpentSeconds.toFixed(0),
      timeSpentMinutes: (timeSpentSeconds / 60).toFixed(0),
      apiQueues: ApiQueue.getApiQueueStats()
    })
  );
});
