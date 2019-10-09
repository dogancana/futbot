import { resolve } from "path";
import { writeFileSyncSafe, readFileIfRecent } from "../utils";

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
  lastStamp?: number;
}

const fileName = resolve(__dirname, "../..", "local/fut-session.json");
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

  static get lastStamp(): number {
    return apiSession.lastStamp;
  }

  static set lastStamp(lastStamp: number) {
    apiSession.lastStamp = lastStamp;
    write(apiSession);
  }
}
