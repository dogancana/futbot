import { Job } from '../../jobs';

export class AutoBuyBidder extends Job {
  constructor() {
    const jobName = 'AutoBuyer::Bidder';

    super(jobName, 3);
  }
}
