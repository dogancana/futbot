import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as http from 'http';
import * as cors from 'cors';
import Axios from 'axios';
import { club } from './club-app';
import { tradeBot } from './trade-bot-app';
import { URL } from 'url';
import { logger } from './logger';
import { staticItemApp } from './static-items';

const app = express();
let apiSession: any = {};

app.set('port', process.env.PORT || 3000)

app.use(cors());
app.use(bodyParser.json())

app.post('/auth', (req: any, res) => {
  const { auth, lastStamp } = req.body;
  logger.info(`
  auth 
  ${JSON.stringify(auth.sid)}
  ${JSON.stringify(lastStamp)}
  `);
  if (auth) apiSession.auth = auth;
  if (lastStamp && 
      (!apiSession.lastStamp || lastStamp > apiSession.lastStamp)) 
      apiSession.lastStamp = lastStamp;
  res.send('OK');
});

app.get('/auth', (req, res) => {
  res.send(JSON.stringify(apiSession));
});

Axios.interceptors.request.use(config => {
  // Do something before request is sent
  if (!apiSession.auth) {
    throw new Error('Session not copied!. First load Fut Web App with extension');
  }

  config.headers.Origin = 'https://www.easports.com';
  config.headers.Referer = 'https://www.easports.com/fifa/ultimate-team/web-app/';
  config.headers['X-UT-SID'] = apiSession.auth.sid;

  const url = new URL(config.url);
  const next = parseInt(apiSession.lastStamp, 10) + 1;
  url.searchParams.set('_', `${next}`);
  apiSession.lastStamp = next;
  config.url = url.href;

  return config;
}, function (error) {
  // Do something with request error
  console.error('interceptor error')
  return null;
});

app.use('/club', club);
app.use('/trade-bot', tradeBot);
app.use('/static', staticItemApp);

const server = http.createServer(app)
server.listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'))
})