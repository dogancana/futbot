import { envConfig } from '../config';
import { getLogger } from '../logger';
import { Job } from './job';

const logger = getLogger('SlowDownJob');

interface Props {
  min?: number;
  max?: number;
}

export class SlowDownJob extends Job {
  private min: number;
  private max: number;
  constructor(p?: Props) {
    if (p) {
      const { min, max } = p;
      if (!min || !max) {
        throw new Error(
          `You have to define both min and max. ${JSON.stringify({ min, max })}`
        );
      }
      if (min < 0 || max < 0) {
        throw new Error(
          `Min or max cannot be smaller than 0. ${JSON.stringify({ min, max })}`
        );
      }
      if (max <= min) {
        throw new Error(
          `Max has to be bigger than min. ${JSON.stringify({ min, max })}`
        );
      }
    }

    super('SlowDownJob', envConfig().FUTBOT_JOB_IMP_SLOW_DOWN);
    Object.assign(this, p);
    this.setTask(this.sleep);
  }

  private async sleep(): Promise<void> {
    let duration: number;
    if (this.min && this.max) {
      duration = (Math.random() * (this.max - this.min) + this.min) * 1000;
    } else {
      duration = envConfig().FUTBOT_SLOW_DOWN_JOB_DURATION * 1000;
    }
    logger.info(`Sleeping for ${(duration / 1000).toFixed(0)} seconds`);
    await new Promise(resolve => {
      setTimeout(() => resolve(), duration);
    });
  }
}
