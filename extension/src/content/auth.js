const SERVER_HREF = 'http://localhost:9999';
const repositories = window.repositories;
const authData = {};

main();

function main() {
  interceptXHR('fut.ea.com/ut/auth', scrapAuthData);
  interceptXHR('fut.ea.com/ut/game', getLastStamp);
  // interceptAndOverwriteXHR('fifa/ultimate-team/web-app/config/config.json', {
  //   requestProtocol: 'https',
  //   authURL: 'utas.mob.v2.fut.ea.com:443',
  //   eadpConnectHost: 'https://accounts.ea.com',
  //   eadpPortalHost: 'https://signin.ea.com',
  //   eadpProxyHost: 'https://gateway.ea.com',
  //   eadpClientId: 'FIFA-20-MOBILE-COMPANION',
  //   eadpClientSecret:
  //     'ewTmLjXshSDwU9jicrIhNEm1psrVWKXwKBl5aBIGNtdxzGDWrt3VpzEad9kYT0pBZR4WPMT',
  //   pinURL: 'https://pin-river.data.ea.com/pinEvents',
  //   releaseType: 'prod',
  //   showOffURL:
  //     'https://www.easports.com/fifa/ultimate-team/web-app/?showoffId=',
  //   resourceRoot: 'https://fifa20.content.easports.com',
  //   resourceBase: '/fifa/fltOnlineAssets/',
  //   changelist: '184724',
  //   requestTimeout: 30000,
  //   localStorageVersion: 1,
  //   maxConsecutive500Errors: 6,
  //   settingsRefreshInterval: 600000,
  //   verboseLogging: false,
  //   staticResponseData: {},
  //   originCss:
  //     'https://www.origin.com/store/odc/store-plugin/odc-store-plugin.min.css',
  //   originJS:
  //     'https://www.origin.com/store/odc/store-plugin/odc-store-plugin.min.js',
  //   origiHost: 'https://www.origin.com',
  //   originProfile: 'odc-fifa-20-real',
  //   originMasterTitle: 'fifa-20',
  //   funCaptchaPublicKey: 'A4EECF77-AC87-8C8D-5754-BF882F72063B'
  // });
}

// function interceptAndOverwriteXHR(urlmatch, response) {
//   let send = XMLHttpRequest.prototype.send;
//   XMLHttpRequest.prototype.send = function() {
//     this.addEventListener(
//       'readystatechange',
//       function() {
//         if (this.responseURL.includes(urlmatch) && this.readyState === 4) {
//           alert('Found it');
//           send.apply(response);
//         }
//       },
//       false
//     );
//     send.apply(this, arguments);
//   };
// }

export function interceptXHR(urlmatch, callback) {
  let send = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.send = function() {
    this.addEventListener(
      'readystatechange',
      function() {
        if (this.responseURL.includes(urlmatch) && this.readyState === 4) {
          callback(this);
        }
      },
      false
    );
    send.apply(this, arguments);
  };
}

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

function getLastStamp(req) {
  const res = /_=([0-9]+)/.exec(req.responseURL);
  const lastStamp = res && res[1];
  if (lastStamp) {
    if (!authData.lastStamp || lastStamp > authData.lastStamp) {
      authData.lastStamp = lastStamp;
      feedServer();
    }
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
