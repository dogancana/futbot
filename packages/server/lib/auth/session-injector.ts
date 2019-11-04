import { readFileIfRecent, writeFileSyncSafe } from '@futbot/utils';
import { tmpdir } from 'os';
import { resolve } from 'path';

const fileName = resolve(tmpdir(), 'futbot-session.json');
const write = (s: string) => writeFileSyncSafe<string>(fileName, s);

let sid: string = null;
readFileIfRecent<string>(fileName).then(s => (sid = s));

export class SessionInjector {
  static get sid(): string {
    return sid;
  }

  static set sid(s: string) {
    sid = s;
    write(s);
  }
}
