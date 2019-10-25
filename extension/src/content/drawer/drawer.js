import Vue from 'vue';
import Item from '../components/item.vue';
import SearchResults from '../components/search-results.vue';
import { uid } from '../utils';

const vueAppQueue = [];

export function handleVueAppQueue() {
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
}

export function addPlayerApp(itemNode) {
  if (itemNode.getElementsByClassName('player').length > 0) {
    const data = itemNode.self ? itemNode.self.data : {};
    addVueChildToElm(itemNode, Item, { item: data });
  }
}

export function addSearchResultsApp(searchResultsNode) {
  if (!!searchResultsNode.closest('.SearchResults')) {
    addVueChildToElm(searchResultsNode, SearchResults);
  }
}

export function addVueApp(elementSelector, component, data) {
  return new Vue({
    el: elementSelector,
    render: h => h(component, { props: data })
  });
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
