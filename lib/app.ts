import { logger } from './logger';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as http from 'http';
import * as cors from 'cors';
import { clubApp } from './club/club-app';
import { tradeBotApp } from './trader/trade-bot-app';
import { playerApp } from './player/player-app';
import { authApp } from './auth';
import { staticItemsApp } from './static';
import { setUpInterceptors } from './api';

const app = express();
setUpInterceptors();

app.set('port', process.env.PORT || 9999)

app.use(cors());
app.use(bodyParser.json())

app.use('/club', clubApp);
app.use('/trade-bot', tradeBotApp);
app.use('/static', staticItemsApp);
app.use('/player', playerApp);
app.use('/auth', authApp);

const server = http.createServer(app)
server.listen(app.get('port'), function () {
  logger.info('Express server listening on port ' + app.get('port'))
})
