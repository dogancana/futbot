const SERVER_HREF = 'http://localhost:9999';

function addScript (s) {
  var elt = window.document.createElement("script");
  elt.innerHTML = s;
  document.head.appendChild(elt);
}

function intercept(urlmatch, callback) {
  let send = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.send = function() {
    this.addEventListener('readystatechange', function() {
      if (this.responseURL.includes(urlmatch) && this.readyState === 4) {
        callback(this);
      }
    }, false);
    send.apply(this, arguments);
  };
};

function scrapAuthData (req) {
  const data = JSON.parse(req.responseText);
  console.log('auth', data);
  authData.auth = data;
  feedServer();
}

function getLastStamp (req) {
  const res = /_=([0-9]+)/.exec(req.responseURL)
  const lastStamp = res && res[1];
  if (lastStamp) {
    console.log('req', lastStamp);
    if (!authData.lastStamp || lastStamp > authData.lastStamp) {
      authData.lastStamp = lastStamp;
      feedServer();
    }
  }
}

function feedServer () {
  console.log('Auth', authData)
  fetch(`${SERVER_HREF}/auth`, {
    method: "POST",
    headers:{'Content-Type': 'application/json'},
    body: JSON.stringify(authData),
  })
  pushDataToServer();
}

function pushDataToServer () {
  fetch(`${SERVER_HREF}/static/need-data`)
    .then(resp => {
      if (resp.status !== 200) return;

      const data = repositories.Item.getStaticData();
      const batch = 150;
      for(let i=0; i<data.length; i+=batch) {
        const obj = {};
        data.slice(i, i + batch).forEach(p => obj[p.id] = p);
        console.log('sending', Object.keys(obj).length);
        setTimeout(() => {
          fetch(`${SERVER_HREF}/static/push-data`, {
            method: "POST",
            headers:{'Content-Type': 'application/json'},
            body: JSON.stringify(obj),
          })
        }, 300);
      }
    })
}

addScript(`
  var authData = {};
  var SERVER_HREF = '${SERVER_HREF}';
  ${intercept};
  ${scrapAuthData};
  ${getLastStamp};
  ${feedServer};
  ${pushDataToServer};

  intercept('https://utas.external.s2.fut.ea.com/ut/auth', scrapAuthData);
  intercept('https://utas.external.s2.fut.ea.com/ut/game', getLastStamp);
  window.clubPlayers = repositories.Item._club._players;
  window.players = repositories.Item.getStaticData;
`)

window.addEventListener('load', loadEvent => {
  let window = loadEvent.currentTarget;
  window.document.title='(FutHelper) FUT Web App!';
});
