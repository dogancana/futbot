import { getLogger } from '@futbot/logger';
import Axios from 'axios';
import { readFileSync, writeFileSync } from 'fs';
import * as path from 'path';

interface SavedQuery {
  name: string;
  query: string;
}

const logger = getLogger('JobsService');
const JOBS_FILE_PATH = path.resolve('./jobs.json');
const savedQueries: SavedQuery[] = [];

export function registerSaveableQuery(p: SavedQuery): void {
  if (!savedQueries.find(q => q.name === p.name)) {
    savedQueries.push(p);
    logger.debug(`Query ${p.query} added to saveable queries`);
  } else {
    logger.debug(
      `Query ${p.query} couldn't be added to saveable queries. Duped!`
    );
  }
}

export function getSaveAbleQeries() {
  return savedQueries;
}

export function saveJobs() {
  const arr = savedQueries.filter(j => !!j.query);
  if (arr.length === 0) {
    logger.warn('Nothing to save, skipping.');
    return 'Nothing to save, skipping.';
  }
  logger.info(`${arr.length} jobs will be saved to ${JOBS_FILE_PATH}`);
  writeFileSync(JOBS_FILE_PATH, JSON.stringify(arr, null, 2), {
    encoding: 'utf-8'
  });
  return arr;
}

export async function loadJobs() {
  const content = readFileSync(JOBS_FILE_PATH, { encoding: 'utf-8' });
  const arr: SavedQuery[] = JSON.parse(content);
  if (arr.length === 0) {
    logger.warn(`Nothing to load in ${JOBS_FILE_PATH}.`);
    return 'Nothing to load';
  } else {
    for (const savedJob of arr) {
      const { query, name } = savedJob;
      logger.info(`Job ${name} will be loaded with query ${query}`);
      await Axios.get(query);
      await new Promise(resolve => setTimeout(resolve, 1000)); // wait a second
    }
  }
  return arr;
}
