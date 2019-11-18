import { getLogger } from '@futbot/logger';
import Axios from 'axios';

const logger = getLogger('PinEvents');

export interface FUTEvent {
  status?: string;
  source?: string;
  pgid?: string;
  type?: string;
  end_reason?: string;
  core: {
    s: number; // this increases by each event
    dob: string;
    en: string;
    pid: string;
    pidm: {
      nucleus: number;
    };
    pidt: string;
    ts_event: string; // date string
  };
}

export interface PinEvent {
  custom: {
    networkAccess: string;
    service_plat: string;
  };
  et: string;
  events: FUTEvent[];
  gid: number;
  is_sess: boolean;
  loc: string;
  plat: string;
  rel: string;
  sid: string;
  taxv: string;
  tid: string;
  tidt: string;
  ts_post: string; // date string
  v: string;
}

const futEvents = {
  transferMarketResults: {
    pgid: 'Transfer Market Results - List View',
    type: 'menu'
  },
  searchView: {
    pgid: 'Transfer Market Search',
    type: 'menu'
  },
  itemView: {
    pgid: 'Item - Detail View',
    type: 'menu'
  },
  transfersView: {
    pgid: 'Hub - Transfers',
    type: 'menu'
  },
  dummy: {},
  end: {
    end_reason: 'normal'
  },
  check: {
    source: '10-normal', // increases each time
    status: 'success'
  }
};

export namespace PinEventsService {
  let s = 0;
  let eventQueue: FUTEvent[] = [];
  let pinEventhandlerIntervalID: ReturnType<typeof setInterval>;
  let latestPinEvent: PinEvent = null;

  export function registerPinEvent(pin: PinEvent): number {
    const eventS: number = pin.events[pin.events.length - 1].core.s;
    if (eventS > s) {
      s = eventS;
    }
    latestPinEvent = pin;

    return s;
  }

  export function handleNewSID() {
    s = 0;
  }

  export function pushEvent(k: keyof typeof futEvents) {
    if (!latestPinEvent) {
      logger.warn(`No pin events registered. Click somewhere on webapp.`);
      return;
    }
    const latestEvent = latestPinEvent.events[0];
    const event: FUTEvent = {
      ...latestEvent,
      core: { ...latestEvent.core, ts_event: new Date().toISOString() },
      ...futEvents[k]
    };
    eventQueue.push(event);
  }

  export function setupPinEventHandler() {
    if (!pinEventhandlerIntervalID) {
      pinEventhandlerIntervalID = setInterval(() => {
        if (eventQueue.length > 0) {
          const pinEvent: PinEvent = {
            ...latestPinEvent,
            events: eventQueue.map(e => ({
              ...e,
              core: { ...e.core, s: s + 1 }
            })),
            ts_post: new Date().toISOString()
          };
          s++;
          eventQueue = [];
          logger.debug(
            `Sending pin event (${
              pinEvent.events[0].core.s
            }): ${pinEvent.events.map(e => e.pgid).join(', ')}`
          );
          Axios.post('https://pin-river.data.ea.com/pinEvents', pinEvent, {
            headers: {
              Origin: 'https://www.easports.con',
              Referer: 'https://www.easports.com/fifa/ultimate-team/web-app/',
              'x-ea-game-id': 'FUT20WEB',
              'x-ea-game-id-type': 'easku',
              'x-ea-taxv': pinEvent.taxv
            }
          }).catch(e => logger.error(`Error while pinning event: ${e}`));
        }
      }, 1000);
    }
  }
}
