import { stat, readFileSync, writeFileSync, unlinkSync } from "fs";
import { logger } from "./logger";

export function whenFileUpdated(fileName: string): Promise<Date> {
  return new Promise((resolve, reject) => {
    stat(fileName, (err, stats) => {
      if (err) reject(err);
      else resolve(stats.mtime);
    });
  });
}

export function writeFileSyncSafe<T>(fileName: string, s: T) {
  try {
    writeFileSync(fileName, JSON.stringify(s), {
      encoding: "utf-8"
    });
  } catch (e) {
    logger.error("[Utils] write error" + e);
  }
}

export function readFileSyncSafe<T>(fileName: string): T {
  try {
    const content = readFileSync(fileName, { encoding: "utf-8" });
    return JSON.parse(content);
  } catch (e) {
    logger.error("[Utils] read error" + e);
    return null;
  }
}

export async function readFileIfRecent<T>(fileName: string): Promise<T> {
  try {
    const modifiedTime = await whenFileUpdated(fileName);
    const lifeSpan = new Date().getTime() - modifiedTime.getTime();
    const lifeSpanHours = Math.floor(lifeSpan / (1000 * 60 * 60));
    if (lifeSpanHours > 4) unlinkSync(fileName);
    return readFileSyncSafe<T>(fileName);
  } catch {
    return null;
  }
}
