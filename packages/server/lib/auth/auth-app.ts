import { getLogger } from '@futbot/logger';
import * as express from 'express';
import { envConfig } from '../config';
import { Job } from '../jobs';
import { PinEvent, PinEventsService } from './pin-events';
import { SessionInjector } from './session-injector';

const logger = getLogger('AuthApp');
export const authApp = express();
PinEventsService.setupPinEventHandler();

authApp.post('/register-event', (req, res) => {
  const pinEvent: PinEvent = req.body.pinEvent;
  if (pinEvent) {
    res.send(
      JSON.stringify({
        s: PinEventsService.registerPinEvent(pinEvent)
      })
    );
    handleSID(pinEvent.sid);
  } else {
    res.status(500);
  }
});

authApp.post('', (req, res) => {
  const { auth } = req.body;

  if (auth) {
    validateEndpoint(auth.ipPort);
    handleSID(auth.sid);
  }
  res.send('OK');
});

function handleSID(sid: string) {
  if (sid && SessionInjector.sid !== sid) {
    PinEventsService.handleNewSID();
    SessionInjector.sid = sid;
    logger.info(`Received auth token fron extension!`);
    logger.info(`New auth token received. Will resume all stopped jobs if any`);
    Job.resumeAllJobs();
  }
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
