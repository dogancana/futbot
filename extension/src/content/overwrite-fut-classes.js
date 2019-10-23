/* eslint-disable */
import { addPlayerApp, addSearchResultsApp } from './drawer';

_0x19fdd6 = () => {};

// wait some time for framework to load
setTimeout(() => {
  const overwriteGenerator = ({ prototype, handler }) => {
    const fn = prototype._generate;
    prototype._generate = function() {
      const res = fn.apply(this, ...arguments);
      if (this.__root) this.__root.self = this;
      !!handler && setImmediate(() => handler(this.__root, ...arguments));
      return res;
    };
  };

  const generators = [
    {
      prototype: components.ListRowItem.prototype,
      handler: addPlayerApp
    },
    {
      prototype: UTListNoResultsView.prototype,
      handler: addSearchResultsApp
    },
    {
      prototype: UTMarketSearchView.prototype,
      handler: addSearchResultsApp
    }
  ];
  generators.forEach(overwriteGenerator);
}, 1000);

/* eslint-enable */
