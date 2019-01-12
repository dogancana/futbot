const SERVER_HREF = 'http://localhost:9999'
const repositories = window.repositories
const authData = {}

main()

function main () {
  intercept('https://utas.external.s3.fut.ea.com/ut/auth', scrapAuthData)
  intercept('https://utas.external.s3.fut.ea.com/ut/game', getLastStamp)

  window.addEventListener('load', loadEvent => {
    let window = loadEvent.currentTarget
    window.document.title = '(Futbot) FUT Web App!'
  })
}

function intercept (urlmatch, callback) {
  let send = XMLHttpRequest.prototype.send
  XMLHttpRequest.prototype.send = function () {
    this.addEventListener('readystatechange', function () {
      if (this.responseURL.includes(urlmatch) && this.readyState === 4) {
        // eslint-disable-next-line
        callback(this)
      }
    }, false)
    send.apply(this, arguments)
  }
}

function scrapAuthData (req) {
  const data = JSON.parse(req.responseText)
  authData.auth = data
  feedServer()
}

function getLastStamp (req) {
  const res = /_=([0-9]+)/.exec(req.responseURL)
  const lastStamp = res && res[1]
  if (lastStamp) {
    if (!authData.lastStamp || lastStamp > authData.lastStamp) {
      authData.lastStamp = lastStamp
      feedServer()
    }
  }
}

function feedServer () {
  fetch(`${SERVER_HREF}/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(authData)
  })
  pushDataToServer()
}

function pushDataToServer () {
  fetch(`${SERVER_HREF}/static/need-data`)
    .then(resp => {
      if (resp.status !== 200) return

      const data = repositories.Item.getStaticData()
      const batch = 150
      for (let i = 0; i < data.length; i += batch) {
        const obj = {}
        data.slice(i, i + batch).forEach(p => {
          obj[p.id] = p
        })
        setTimeout(() => {
          fetch(`${SERVER_HREF}/static/push-data`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(obj)
          })
        }, 300)
      }
    })
}
