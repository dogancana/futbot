import { debounce } from '../utils/debounce'
import { addVueApp } from '.'
import playerComp from './player.vue'
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
        addVueChildToElm(player, playerComp, { item: playerInfo })
      }
    }
  }
}

function isElementPlayer (elm) {
  return elm.getElementsByClassName('player').length > 0
}

function addVueChildToElm (elm, comp, data) {
  if (elm.getElementsByClassName('vue-marker').length === 0) {
    const marker = document.createElement('div')
    marker.classList = 'vue-marker'
    elm.appendChild(marker)
    const appRoot = document.createElement('div')
    const appClassName = `app-root${uid()}`
    appRoot.className = appClassName
    elm.appendChild(appRoot)

    setTimeout(() => {
      addVueApp(`.${appClassName}`, comp, data)
    }, 100)
  }
}

function handleViewChange () {
  addPlayerDetails()
}

window.addEventListener('load', loadEvent => {
  watchViewChanges(debounce(handleViewChange, 500))
})
