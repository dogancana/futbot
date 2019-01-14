import Vue from "vue";
import VueCollapse from "vue2-collapse";
import Collapsible from "./collapsible";
import AutoBuyList from "./auto-buy-list";

import "./auth";
import "./view-watcher";
import "./hijack-player-generation";

Vue.config.productionTip = false;
Vue.use(VueCollapse);
Vue.use(Collapsible);
Vue.use(AutoBuyList);

export function addVueApp(elementSelector, component, data) {
  /* eslint-disable no-new */
  return new Vue({
    el: elementSelector,
    render: h => h(component, { props: data })
  });
}
