import Vue from 'vue';
import VueCollapse from 'vue2-collapse';
import Collapsible from './components/collapsible.vue';
import { watchSessionData } from './auth';
import { overwriteFutClasses, handleVueAppQueue } from './drawer';
import { setupXMLInterceptors } from './utils';

setupXMLInterceptors();
watchSessionData();
handleVueAppQueue();
overwriteFutClasses();

Vue.config.productionTip = false;
Vue.use(VueCollapse);
Vue.use(Collapsible);
