import * as express from 'express';
import { Job } from '../jobs';
import { logger } from './../logger';
import { SessionInjector } from './session-injector';
import { envConfig } from '../config';

export const authApp = express();

async function setAuthSession(
  req: express.Request,
  res: express.Response
): Promise<void> {
  const { auth, lastStamp } = req.body;

  validateEndpoint(auth.ipPort);

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

function validateEndpoint(ipPort: string) {
  const res = /utas\.external\.(s.)\.fut\.ea\.com/g.exec(ipPort);
  const instance = res ? res[1] : null;
  const endpoint = 'https://utas.external.<instance>.fut.ea.com/ut/game/fifa20'.replace(
    '<instance>',
    instance
  );
  if (endpoint !== envConfig().FUTBOT_FUT_API_ENDPOINT_OVERWRITE) {
    logger.error(
      `Your endpoint send from extension and .env file are not matching!.\n` +
        `Change FUTBOT_FUT_API_ENDPOINT_OVERWRITE value to ${endpoint} in .env file, restart the app refresh fut web app and login again.\n`
    );
    process.exit(-1);
  }
}

authApp.post('', setAuthSession);
authApp.get('', getAuthSession);
