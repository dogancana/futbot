import * as express from "express";
import { getQueueCount } from "../api";

interface RequestStats {
  futRequests: number;
  cachedFutResponse: number;
  futbinRequests: number;
  cachedFutbinResponse: number;
}

interface Stats extends RequestStats {
  started: Date;
}

type IncOne = keyof RequestStats;

let stats: Stats = {
  started: new Date(),
  futRequests: 0,
  cachedFutResponse: 0,
  futbinRequests: 0,
  cachedFutbinResponse: 0
};

export class StatsService {
  static increment(key: IncOne) {
    stats[key]++;
  }
}

export const statsApp = express();

statsApp.get("", (req, res) => {
  const currentStats = stats;
  const now = new Date();
  const timeSpent =
    Math.floor((now.getTime() - currentStats.started.getTime()) / 1000 / 60) +
    1;
  const desc = `${currentStats.futRequests} requests made in ${timeSpent} minutes`;
  res.send(
    JSON.stringify({
      ...currentStats,
      desc,
      timePassedSeconds: Math.floor(
        (new Date().getTime() - currentStats.started.getTime()) / 1000
      ),
      queues: getQueueCount()
    })
  );
});
