import * as express from 'express';
import { BehaviorSubject } from 'rxjs';

interface Stats {
  started: Date,
  futRequests: number
}

const stats: BehaviorSubject<Stats> = new BehaviorSubject({
  started: new Date(),
  futRequests: 0
});

export class StatsService {
  static requestMade () {
    stats.next({
      ...(stats.value),
      futRequests: stats.value.futRequests + 1
    })
  }
}

export const statsApp = express();

statsApp.get('', (req, res) => {
  const currentStats = stats.value
  const now = new Date();
  const timeSpent = Math.floor((now.getTime() - currentStats.started.getTime()) / 1000 / 60) + 1
  const desc = `${currentStats.futRequests} requests made in ${timeSpent} minutes`
  res.send(JSON.stringify({
    ...currentStats,
    desc
  }))
})
