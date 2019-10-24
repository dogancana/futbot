import { envConfig } from '../config';
import { getLogger } from '../logger';
import { Job } from './job';

const logger = getLogger('SlowDownJob');

export class SlowDownJob extends Job {
  constructor() {
    super('SlowDownJob', envConfig().FUTBOT_JOB_IMP_SLOW_DOWN);
    this.setTask(this.sleep);
  }

  private async sleep(): Promise<void> {
    logger.info('Sleeping for 30 seconds');
    await new Promise(resolve => {
      setTimeout(() => resolve(), 30000);
    });
  }
}
