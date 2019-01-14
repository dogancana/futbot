import { debounce } from '../utils/debounce'
import { addVueApp } from '.'
import Player from './player.vue'
import FutbotView from './futbot-view.vue'
import { uid } from '../utils/uid'
import { request } from '../utils/request'

let isServerAvailable = false

function watchViewChanges (handler) {
  const targetNode = document.getElementsByClassName('view-root')[0]
  const config = { attributes: false, childList: true, subtree: true }
  const observer = new MutationObserver(handler)
  observer.observe(targetNode, config)
}

function addPlayerDetails () {
  const players = document.getElementsByClassName('listFUTItem')
  for (const player of players) {
    if (isElementPlayer(player)) {
      if (player.getElementsByClassName('vue-marker').length === 0) {
        const playerInfo = player.self ? player.self.data : {}
        addVueChildToElm(player, Player, { item: playerInfo })
      }
    }
  }
}

function addFutbotView () {
  const container = document.getElementsByClassName('FUINavigationContent')[0]
  if (container) {
    const tabMenu = container.getElementsByClassName('tab-menu')[0]
    const root = container.firstElementChild
    const addBefore = tabMenu ? tabMenu.nextElementSibling : root.firstElementChild
    addVueChildToElm(container.firstElementChild, FutbotView, {}, addBefore)
  }
}

function isElementPlayer (elm) {
  return elm.getElementsByClassName('player').length > 0
}

function addVueChildToElm (elm, comp, data, insertBefore) {
  if (elm.getElementsByClassName('vue-marker').length === 0) {
    const marker = document.createElement('div')
    marker.classList = 'vue-marker'
    elm.appendChild(marker)
    const appRoot = document.createElement('div')
    const appClassName = `app-root${uid()}`
    appRoot.className = appClassName

    if (insertBefore) {
      elm.insertBefore(appRoot, insertBefore)
    } else {
      elm.appendChild(appRoot)
    }

    setTimeout(() => {
      addVueApp(`.${appClassName}`, comp, data)
    }, 100)
  }
}

function handleViewChange () {
  if (!isServerAvailable) return

  addFutbotView()
  addPlayerDetails()
}

window.addEventListener('load', loadEvent => {
  setInterval(async () => {
    const resp = await request('http://localhost:9999/auth')
    isServerAvailable = !!resp.auth
  }, 1000 * 30)

  watchViewChanges(debounce(handleViewChange, 500))
})
