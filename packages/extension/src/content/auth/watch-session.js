import { interceptXHRResponse, interceptXHRRequest } from '../utils';
// import { mobileAppAuthConfig } from './mobile-app-auth-config';

const SERVER_HREF = 'http://localhost:9999';
const repositories = window.repositories;
const authData = {};
let serverEventS = 0;

export function watchSessionData() {
  interceptXHRResponse('fut.ea.com/ut/auth', scrapAuthData);
  // interceptXHR('web-app/config/config.json', overwriteAsMobileAuth);
  interceptXHRRequest('ea.com/pinEvents', readPinEvent);
}

setTimeout(() => {
  const fn = window.PINEventDTO;
  window.PINEventDTO = function() {
    const s = arguments[1];
    if (serverEventS >= s) {
      arguments[1] = serverEventS + 1;
    }
    return fn.apply(this, arguments);
  };
}, 5000);

pushDataToServer();
setInterval(pushDataToServer, 30 * 60 * 1000);

// function overwriteAsMobileAuth(event) {
//   alert('Before: ' + event.responseText);
//   event.responseText = JSON.stringify(mobileAppAuthConfig);
//   alert('After: ' + event.responseText);
// }
function readPinEvent(xhr, body) {
  const pinEvent = JSON.parse(body);
  registerEvent(pinEvent);
}

function scrapAuthData(res) {
  const data = JSON.parse(res.responseText);
  storeEndpoint(data.ipPort);
  authData.auth = data;
  feedServer();
}

// ipPort: 'utas\.external\.s.\.fut\.ea\.com'
function storeEndpoint(ipPort) {
  const res = /utas\.external\.(s.)\.fut\.ea\.com/g.exec(ipPort);
  const instance = res ? res[1] : null;
  const endpoint = 'https://utas.external.<instance>.fut.ea.com/ut/game/fifa20'.replace(
    '<instance>',
    instance
  );
  if (instance) {
    localStorage.setItem('futbot_endpoint', endpoint);
  }
}

async function registerEvent(e) {
  const resp = await fetch(`${SERVER_HREF}/auth/register-event`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pinEvent: e })
  });
  const data = await resp.json();
  serverEventS = data.s;
}

function feedServer() {
  fetch(`${SERVER_HREF}/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(authData)
  });
}

function pushDataToServer() {
  fetch(`${SERVER_HREF}/static/need-data`).then(resp => {
    if (resp.status !== 200) return;

    const data = repositories.Item.getStaticData().map(i => {
      const {
        id,
        name = 'undefined',
        rating,
        firstName,
        lastName,
        commonName
      } = i;
      const actualName = [firstName, lastName].filter(v => !!v).join(' ');
      return {
        id,
        rating,
        name:
          name.indexOf('undefined') > -1
            ? `${commonName ? commonName + ', ' : ''}${actualName}`
            : i.name
      };
    });
    if (data.length < 16000) {
      setTimeout(pushDataToServer, 2000);
      return;
    }
    const batch = 150;
    for (let i = 0; i < data.length; i += batch) {
      const obj = {};
      const items = data.slice(i, i + batch);
      for (const item of items) {
        obj[item.id] = item;
      }
      setTimeout(() => {
        fetch(`${SERVER_HREF}/static/push-data`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(obj)
        });
      }, 300);
    }
  });
}
