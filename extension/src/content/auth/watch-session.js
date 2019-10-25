import { interceptXHR } from '../utils';
// import { mobileAppAuthConfig } from './mobile-app-auth-config';

const SERVER_HREF = 'http://localhost:9999';
const repositories = window.repositories;
const authData = {};

export function watchSessionData() {
  interceptXHR('fut.ea.com/ut/auth', scrapAuthData);
  // interceptXHR('web-app/config/config.json', overwriteAsMobileAuth);
}

// function overwriteAsMobileAuth(event) {
//   alert('Before: ' + event.responseText);
//   event.responseText = JSON.stringify(mobileAppAuthConfig);
//   alert('After: ' + event.responseText);
// }

function scrapAuthData(req) {
  const data = JSON.parse(req.responseText);
  storeEndpoint(data.ipPort);
  authData.auth = data;
  setTimeout(() => {
    feedServer();
  }, 5000); // wait for webapp to get data
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

function feedServer() {
  fetch(`${SERVER_HREF}/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(authData)
  });
  pushDataToServer();
}

function pushDataToServer() {
  fetch(`${SERVER_HREF}/static/need-data`).then(resp => {
    if (resp.status !== 200) return;

    const data = repositories.Item.getStaticData();
    const batch = 150;
    for (let i = 0; i < data.length; i += batch) {
      const obj = {};
      data.slice(i, i + batch).forEach(p => {
        obj[p.id] = p;
      });
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
