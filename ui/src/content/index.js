import Vue from 'vue'
import VueCollapse from 'vue2-collapse'
import Collapsible from './collapsible'

import './auth'
import './view-watcher'
import '../components/vue-collapse.scss'
import './hijack-player-generation'

Vue.config.productionTip = false
Vue.use(VueCollapse)
Vue.use(Collapsible)

export function addVueApp (elementSelector, component, data) {
  /* eslint-disable no-new */
  return new Vue({
    el: elementSelector,
    render: h => h(component, { props: data })
  })
}
