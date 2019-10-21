/* eslint-disable */
import { addPlayerApp } from './drawer';

// wait some time for framework to load
setTimeout(() => {
  const fn = components.ListRowItem.prototype._generate;
  components.ListRowItem.prototype._generate = function() {
    fn.apply(this, ...arguments);
    const self = this;
    const root = this.__root;
    this.__root.self = self;
    setImmediate(() => addPlayerApp(root));
  };
}, 1000);

/* eslint-enable */
