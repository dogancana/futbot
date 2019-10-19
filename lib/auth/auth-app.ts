import * as express from 'express';
import { Job } from '../jobs';
import { logger } from './../logger';
import { SessionInjector } from './session-injector';

export const authApp = express();

async function setAuthSession(
  req: express.Request,
  res: express.Response
): Promise<void> {
  const { auth, lastStamp } = req.body;

  if (auth) {
    SessionInjector.auth = auth;
    if (auth.sid) {
      logger.info(`Received auth token fron extension!`);
      SessionInjector.lastStamp = parseInt(lastStamp, 10);
      logger.info(
        `New auth token received. Will resume all stopped jobs if any`
      );
      Job.resumeAllJobs();
      res.send('OK');
    } else {
      logger.error('Couldnt receive auth token from extension.');
    }
  } else {
    logger.error('Couldnt receive auth token from extension.');
  }
}

async function getAuthSession(
  req: express.Request,
  res: express.Response
): Promise<void> {
  res.send(
    JSON.stringify({
      auth: SessionInjector.auth,
      lastStamp: SessionInjector.lastStamp
    })
  );
}

authApp.post('', setAuthSession);
authApp.get('', getAuthSession);
