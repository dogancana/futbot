import { existsSync } from 'fs';
import { resolve } from 'path';
import { getLogger } from './logger';

const logger = getLogger('Config');

export interface EnvConfig {
  FUTBOT_FUT_API_ENDPOINT_OVERWRITE: string;
  FUTBOT_FUT_MAX_AUCTION_TRY_PER_PLAYER: number;
  FUTBOT_FUT_MINIMUM_AUCTION_SAMPLES: number;
  FUTBOT_FUT_REQUESTS_PER_SEC: number;
  FUTBOT_FUTBIN_REQUESTS_PER_SEC: number;
  FUTBOT_FAVOURITE_JOBS: string;
  FUTBOT_PROFIT_MARGIN: number;
  FUTBOT_MAX_PRICING_SEARCH_TRY: number;
  FUTBOT_FUT_PLATFORM_OVERWRITE?: 'xbox' | 'pc' | 'ps';
  FUTBOT_QUICK_SELL_MARGIN: number;
  FUTBOT_JOB_IMP_INVEST_LOW_PLAYERS: number;
  FUTBOT_JOB_IMP_INVEST_GOOD_AUCTIONS: number;
  FUTBOT_JOB_IMP_AUTO_BUY_NOW: number;
  FUTBOT_JOB_IMP_AUTO_BUY_BID: number;
  FUTBOT_JOB_IMP_AUTO_BUY_QUERY: number;
  FUTBOT_JOB_IMP_SELL_UNUSED: number;
  FUTBOT_JOB_IMP_SELL_TRADE_PILE: number;
  FUTBOT_JOB_IMP_SLOW_DOWN: number;
}

const defaultConf: EnvConfig = {
  FUTBOT_FUT_API_ENDPOINT_OVERWRITE: null,
  FUTBOT_FUT_MAX_AUCTION_TRY_PER_PLAYER: 1,
  FUTBOT_FUT_MINIMUM_AUCTION_SAMPLES: 3,
  FUTBOT_FUT_REQUESTS_PER_SEC: 0.5,
  FUTBOT_FUTBIN_REQUESTS_PER_SEC: 1.5,
  FUTBOT_FAVOURITE_JOBS:
    '/trade-bot/start-selling?maxRating=83,/invest/low-players?budget=70000&min=1000&max=10000&maxTargetPool=100,/invest/good-auctions?budget=40000&min=5000&max=20000',
  FUTBOT_PROFIT_MARGIN: 15,
  FUTBOT_MAX_PRICING_SEARCH_TRY: 3,
  FUTBOT_QUICK_SELL_MARGIN: 200,
  FUTBOT_JOB_IMP_INVEST_LOW_PLAYERS: 5,
  FUTBOT_JOB_IMP_INVEST_GOOD_AUCTIONS: 5,
  FUTBOT_JOB_IMP_AUTO_BUY_NOW: 1,
  FUTBOT_JOB_IMP_AUTO_BUY_BID: 2,
  FUTBOT_JOB_IMP_AUTO_BUY_QUERY: 1,
  FUTBOT_JOB_IMP_SELL_UNUSED: 10,
  FUTBOT_JOB_IMP_SELL_TRADE_PILE: 10,
  FUTBOT_JOB_IMP_SLOW_DOWN: 3
};

let conf: EnvConfig;
const numberKeys = [
  'FUTBOT_FUT_MAX_AUCTION_TRY_PER_PLAYER',
  'FUTBOT_FUT_MINIMUM_AUCTION_SAMPLES',
  'FUTBOT_FUT_REQUESTS_PER_SEC',
  'FUTBOT_FUTBIN_REQUESTS_PER_SEC',
  'FUTBOT_PROFIT_MARGIN',
  'FUTBOT_QUICK_SELL_MARGIN',
  'FUTBOT_MAX_PRICING_SEARCH_TRY'
];
const stringKeys = [
  'FUTBOT_FUT_API_ENDPOINT_OVERWRITE',
  'FUTBOT_FAVOURITE_JOBS',
  'FUTBOT_FUT_PLATFORM_OVERWRITE'
];
const impOrderKeys = [
  'FUTBOT_JOB_IMP_INVEST_LOW_PLAYERS',
  'FUTBOT_JOB_IMP_INVEST_GOOD_AUCTIONS',
  'FUTBOT_JOB_IMP_AUTO_BUY_NOW',
  'FUTBOT_JOB_IMP_AUTO_BUY_BID',
  'FUTBOT_JOB_IMP_SELL_UNUSED',
  'FUTBOT_JOB_IMP_SELL_TRADE_PILE',
  'FUTBOT_JOB_IMP_AUTO_BUY_QUERY',
  'FUTBOT_JOB_IMP_SLOW_DOWN'
];
setup();

export function envConfig(): EnvConfig {
  return { ...conf };
}

function setup() {
  checkConfigExists();

  conf = {} as any;
  const env = process.env || {};

  [...numberKeys, ...impOrderKeys].forEach(key => {
    conf[key] = parseFloat(env[key]) || defaultConf[key];
  });

  stringKeys.forEach(key => {
    conf[key] = env[key] || defaultConf[key];
  });

  validateConfig(conf);
  // tslint:disable-next-line
  console.log(`\nApplication config set as below:\n`);
  // tslint:disable-next-line
  console.log(
    Object.keys(conf)
      .map(key => `${key} = ${conf[key]}`)
      .join('\n')
  );
}

export function updateConfig(u: Partial<EnvConfig>) {
  const updated = { ...conf, ...u };
  try {
    validateConfig(updated);
    conf = updated;
  } catch (e) {
    logger.error(`Couldn't update config. Reaosn: ${e}`);
  }
}

function validateConfig(c: EnvConfig) {
  if (!c.FUTBOT_FUT_API_ENDPOINT_OVERWRITE) {
    throw new Error(
      'FUTBOT_FUT_API_ENDPOINT_OVERWRITE should be defined in .env'
    );
  }
  if (c.FUTBOT_FUT_REQUESTS_PER_SEC > 2) {
    logger.warn(
      `FUTBOT_FUT_REQUESTS_PER_SEC=${c.FUTBOT_FUT_REQUESTS_PER_SEC} is too high, you'll require verification really soon`
    );
  }
  if (c.FUTBOT_FUT_REQUESTS_PER_SEC < 0.1) {
    throw new Error('FUTBOT_FUT_REQUESTS_PER_SEC cannot be smaller than 0.1');
  }
  if (c.FUTBOT_FUTBIN_REQUESTS_PER_SEC > 3) {
    logger.warn(
      `FUTBOT_FUTBIN_REQUESTS_PER_SEC=${c.FUTBOT_FUTBIN_REQUESTS_PER_SEC} is too high, you'll get temporary ban really soon`
    );
  }
  if (c.FUTBOT_FUTBIN_REQUESTS_PER_SEC < 0.1) {
    throw new Error(
      'FUTBOT_FUTBIN_REQUESTS_PER_SEC cannot be smaller than 0.1'
    );
  }
  if (c.FUTBOT_PROFIT_MARGIN < 5 || c.FUTBOT_PROFIT_MARGIN > 20) {
    throw new Error('FUTBOT_PROFIT_MARGIN has to be between 5 and 20');
  }
  if (c.FUTBOT_FUT_PLATFORM_OVERWRITE) {
    if (['xbox', 'pc', 'ps'].indexOf(c.FUTBOT_FUT_PLATFORM_OVERWRITE) === -1) {
      throw new Error(
        'FUTBOT_FUT_PLATFORM_OVERWRITE has to be one of pc, ps or xbox. Please fix in .env file.'
      );
    }
  }

  impOrderKeys.forEach(key => {
    if (c[key] < 1 || c[key] > 20) {
      throw new Error(`${key} should be between 1-20. Cannot be ${c[key]}`);
    }
  });
}

function checkConfigExists() {
  try {
    if (!existsSync(resolve(process.cwd(), '.env'))) {
      throw new Error();
    }
  } catch (err) {
    // tslint:disable-next-line
    console.error(
      '.env file not found. Copy .env.local file as .env file and restart.'
    );
    process.exit(-1);
  }
}
