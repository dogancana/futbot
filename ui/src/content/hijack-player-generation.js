/* eslint-disable */
// wait some time for framework to load
setTimeout(() => {
  const fn = components.ListRowItem.prototype._generate
  components.ListRowItem.prototype._generate = function () {
    fn.apply(this, ...arguments)
    this.__root.self = this
  }
}, 1000)
/* eslint-enable */
