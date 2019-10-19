import { existsSync } from 'fs';
import { resolve } from 'path';
import { logger } from './logger';

export interface EnvConfig {
  FUTBOT_FUT_API_ENDPOINT_OVERWRITE: string;
  FUTBOT_FUT_MAX_AUCTION_TRY_PER_PLAYER: number;
  FUTBOT_FUT_MINIMUM_AUCTION_SAMPLES: number;
  FUTBOT_FUT_REQUESTS_PER_SEC: number;
  FUTBOT_FUTBIN_REQUESTS_PER_SEC: number;
  FUTBOT_LOG_LEVEL: 'error' | 'warn' | 'info' | 'debug';
  FUTBOT_FAVOURITE_JOBS: string;
  FUTBOT_API_QUEUE_SPEED_UP_FACTOR: number;
  FUTBOT_PROFIT_MARGIN: number;
}

const defaultConf: EnvConfig = {
  FUTBOT_FUT_API_ENDPOINT_OVERWRITE: null,
  FUTBOT_FUT_MAX_AUCTION_TRY_PER_PLAYER: 1,
  FUTBOT_FUT_MINIMUM_AUCTION_SAMPLES: 3,
  FUTBOT_FUT_REQUESTS_PER_SEC: 0.5,
  FUTBOT_FUTBIN_REQUESTS_PER_SEC: 1.5,
  FUTBOT_LOG_LEVEL: 'info',
  FUTBOT_FAVOURITE_JOBS:
    '/trade-bot/start-selling?maxRating=83,/invest/low-players?budget=70000&min=1000&max=10000&maxTargetPool=100,/invest/good-auctions?budget=40000&min=5000&max=20000',
  FUTBOT_API_QUEUE_SPEED_UP_FACTOR: 0.2,
  FUTBOT_PROFIT_MARGIN: 15
};

let conf: EnvConfig;
setup();

export function envConfig(): EnvConfig {
  return { ...conf };
}

function setup() {
  checkConfigExists();

  conf = {} as any;
  const env = process.env || {};
  const numberKeys = [
    'FUTBOT_FUT_MAX_AUCTION_TRY_PER_PLAYER',
    'FUTBOT_FUT_MINIMUM_AUCTION_SAMPLES',
    'FUTBOT_FUT_REQUESTS_PER_SEC',
    'FUTBOT_FUTBIN_REQUESTS_PER_SEC',
    'FUTBOT_API_QUEUE_SPEED_UP_FACTOR',
    'FUTBOT_PROFIT_MARGIN'
  ];
  const stringKeys = [
    'FUTBOT_FUT_API_ENDPOINT_OVERWRITE',
    'FUTBOT_LOG_LEVEL',
    'FUTBOT_FAVOURITE_JOBS'
  ];
  numberKeys.forEach(key => {
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
