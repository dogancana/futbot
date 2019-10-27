import { tmpdir } from 'os';
import { resolve } from 'path';
import { readFileIfRecent, writeFileSyncSafe } from '../utils';

export interface Auth {
  ipPort: string;
  lastOnlineTime: Date;
  phishingToken: string;
  protocol: string;
  serverTime: Date;
  sid: string;
}

export interface Session {
  auth?: Auth;
}

const fileName = resolve(tmpdir(), 'futbot-session.json');
const write = (s: Session) => writeFileSyncSafe<Session>(fileName, s);

let apiSession: Session = {};
readFileIfRecent<Session>(fileName).then(s => (apiSession = s || {}));

export class SessionInjector {
  static get auth(): Auth {
    return apiSession.auth;
  }

  static set auth(auth: Auth) {
    apiSession.auth = auth;
    write(apiSession);
  }
}
