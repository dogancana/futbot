import { addVueApp } from '.';
import Player from './player.vue';
import SearchResults from './search-results.vue';
import { uid } from './utils/uid';

const vueAppQueue = [];
setInterval(() => {
  let added = false;
  while (!added && vueAppQueue.length > 1) {
    let args = vueAppQueue.shift();
    if (args && document.body.contains(args.elm)) {
      const { elm, comp, data, insertBefore } = args;
      added = true;
      _addVueChildToElm(elm, comp, data, insertBefore);
    }
  }
}, 100);

export function addPlayerApp(playerNode) {
  if (playerNode.getElementsByClassName('player').length > 0) {
    const playerInfo = playerNode.self ? playerNode.self.data : {};
    addVueChildToElm(playerNode, Player, { item: playerInfo });
  }
}

export function addSearchResultsApp(searchResultsNode) {
  if (!!searchResultsNode.closest('.SearchResults')) {
    addVueChildToElm(searchResultsNode, SearchResults);
  }
}

function addVueChildToElm(elm, comp, data, insertBefore) {
  vueAppQueue.push({ elm, comp, data, insertBefore });
}

function _addVueChildToElm(elm, comp, data, insertBefore) {
  if (elm.getElementsByClassName('vue-marker').length === 0) {
    const marker = document.createElement('div');
    marker.classList = 'vue-marker';
    elm.appendChild(marker);
    const appRoot = document.createElement('div');
    const appClassName = `app-root${uid()}`;
    appRoot.className = appClassName;

    if (insertBefore) {
      elm.insertBefore(appRoot, insertBefore);
    } else {
      elm.appendChild(appRoot);
    }

    addVueApp(`.${appClassName}`, comp, data);
  }
}
