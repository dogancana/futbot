import { debounce } from '../utils/debounce'
import { addVueApp } from '.'
import Player from './player.vue'
import FutbotView from './futbot-view.vue'
import { uid } from '../utils/uid'

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
    addVueChildToElm(container.firstElementChild, FutbotView, {}, true)
  }
}

function isElementPlayer (elm) {
  return elm.getElementsByClassName('player').length > 0
}

function addVueChildToElm (elm, comp, data, isBefore = false) {
  if (elm.getElementsByClassName('vue-marker').length === 0) {
    const marker = document.createElement('div')
    marker.classList = 'vue-marker'
    elm.appendChild(marker)
    const appRoot = document.createElement('div')
    const appClassName = `app-root${uid()}`
    appRoot.className = appClassName

    if (isBefore) {
      elm.insertBefore(appRoot, elm.firstElementChild)
    } else {
      elm.appendChild(appRoot)
    }

    setTimeout(() => {
      addVueApp(`.${appClassName}`, comp, data)
    }, 100)
  }
}

function handleViewChange () {
  addFutbotView()
  addPlayerDetails()
}

window.addEventListener('load', loadEvent => {
  watchViewChanges(debounce(handleViewChange, 500))
})
