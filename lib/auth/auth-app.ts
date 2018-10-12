import { logger } from './../logger';
import * as express from 'express';
import { SessionInjector } from './session-injector';

export const auth = express();

auth.post('', (req: any, res) => {
  const { auth, lastStamp } = req.body;
  logger.info(`
  auth
  ${JSON.stringify(auth.sid)}
  ${JSON.stringify(lastStamp)}
  `);

  if (auth) SessionInjector.auth = auth;
  if (SessionInjector.lastStamp &&
      (!SessionInjector.lastStamp || lastStamp > SessionInjector.lastStamp))
      SessionInjector.lastStamp = lastStamp;
  res.send('OK');
});

auth.get('', (req, res) => {
  res.send(JSON.stringify({
    auth: SessionInjector.auth,
    lastStamp: SessionInjector.lastStamp
  }));
});
