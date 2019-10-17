import { flatten } from 'lodash';

export class AvgStat {
  private samples: number[][];

  constructor(private sampleSetCount: number = 5) {
    this.samples = new Array(sampleSetCount);
    for (let i = 0; i < sampleSetCount; i++) {
      this.samples[i] = [];
    }

    // TODO won't be GCed
    setInterval(() => this.clearOldSamples(), 60 * 1000);
  }

  public addSample(x: number) {
    if (x == null || x === undefined) {
      return;
    }
    this.samples[this.sampleSetCount - 1].push(x);
  }

  public avg() {
    const samples = flatten(this.samples).filter(
      s => s != null && s !== undefined
    );
    return samples.reduce((prev, curr) => prev + curr, 0) / samples.length;
  }

  private clearOldSamples() {
    this.samples.shift();
    this.samples.push([]);
  }
}
