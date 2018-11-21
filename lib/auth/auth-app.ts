import { logger } from './../logger';
import * as express from 'express';
import { SessionInjector } from './session-injector';

export const authApp = express();

async function setAuthSession (req: express.Request, res: express.Response): Promise<void> {
  const { auth, lastStamp } = req.body;
  logger.info(`
  auth
  ${JSON.stringify(auth.sid)}
  ${JSON.stringify(lastStamp)}
  `);

  if (auth) SessionInjector.auth = auth;
  SessionInjector.lastStamp = parseInt(lastStamp, 10);
  res.send('OK');
}

async function getAuthSession (req: express.Request, res: express.Response): Promise<void> {
  res.send(JSON.stringify({
    auth: SessionInjector.auth,
    lastStamp: SessionInjector.lastStamp
  }));
}

authApp.post('', setAuthSession);
authApp.get('', getAuthSession);
