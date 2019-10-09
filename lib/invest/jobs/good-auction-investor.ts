import { Job } from "./../../job";
import { fut } from "../../api";

export interface GoodAuctionInvestorProps {
  budget: number;
  min?: number;
  max?: number;
}

export class GoodAuctionInvestor extends Job {
  private budget: number;
  private min: number = 1000;
  private max: number = 10000;

  constructor(p: GoodAuctionInvestorProps) {
    super("Invest:GoodAuction", 5);

    Object.assign(this, p);

    this.start(this.loopMarket);
  }

  private async loopMarket() {
    const players = await fut.searchTransferMarket(0);
    players
      .filter(p => !p.watched)
      .filter(p => !p.tradeOwner)
  }

  public report() {
    return "Working";
  }
}
