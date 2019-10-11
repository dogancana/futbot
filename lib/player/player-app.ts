import * as express from "express";
import { playerService } from "./player-service";
import { futbin } from "../api";

export const playerApp = express();

playerApp.get("", async function(req, res) {
  const { assetId, resourceId } = req.query;

  if (!resourceId || !assetId) {
    res.status(500).send("Provide assetId and resourceId in query params");
    return;
  }

  let futbinPrice: futbin.Price, marketPrice: playerService.MarketPrice;
  try {
    futbinPrice = await playerService.getFutbinPrice(resourceId);
  } catch {}
  try {
    marketPrice = await playerService.getMarketPrice(resourceId);
  } catch {}
  res.send({
    name: playerService.readable({ assetId }),
    futbinPrice,
    marketPrice
  });
});
