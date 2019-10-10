// Leave this at top
require("dotenv").config();
import "./custom-types";

import { autoBuyerApp } from "./auto-buyer/auto-buyer-app";
import { logger } from "./logger";
import * as express from "express";
import * as bodyParser from "body-parser";
import * as http from "http";
import * as cors from "cors";
import { clubApp } from "./club/club-app";
import { tradeBotApp } from "./trader/trade-bot-app";
import { playerApp } from "./player/player-app";
import { authApp } from "./auth";
import { staticItemsApp } from "./static";
import { statsApp } from "./stats";
import { investApp } from "./invest/invest-app";
import { startCorsProxy } from "./cors-proxy";

const app = express();
startCorsProxy();

app.set("port", process.env.PORT || 9999);

app.use(cors());
app.use(bodyParser.json());

app.use("/club", clubApp);
app.use("/trade-bot", tradeBotApp);
app.use("/static", staticItemsApp);
app.use("/player", playerApp);
app.use("/auth", authApp);
app.use("/stats", statsApp);
app.use("/invest", investApp);
app.use("/auto-buyer", autoBuyerApp);

app.get("/ping", (req, res) => res.send("pong"));

const server = http.createServer(app);
server.listen(app.get("port"), function() {
  logger.info("Express server listening on port " + app.get("port"));
});
