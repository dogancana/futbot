var devtools = (function(n) {
  function e(c) {
    if (o[c]) return o[c].exports;
    var t = (o[c] = { i: c, l: !1, exports: {} });
    return n[c].call(t.exports, t, t.exports, e), (t.l = !0), t.exports;
  }
  var o = {};
  return (
    (e.m = n),
    (e.c = o),
    (e.d = function(n, o, c) {
      e.o(n, o) ||
        Object.defineProperty(n, o, {
          configurable: !1,
          enumerable: !0,
          get: c
        });
    }),
    (e.n = function(n) {
      var o =
        n && n.__esModule
          ? function() {
              return n.default;
            }
          : function() {
              return n;
            };
      return e.d(o, 'a', o), o;
    }),
    (e.o = function(n, e) {
      return Object.prototype.hasOwnProperty.call(n, e);
    }),
    (e.p = '/'),
    e((e.s = '2Iwv'))
  );
})({
  '2Iwv': function(module, exports) {
    eval(
      "chrome.devtools.panels.create('panel', 'img/logo.png', 'pages/panel.html', function (panel) {\n  console.log('hello from callback');\n});\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiMkl3di5qcyIsInNvdXJjZXMiOlsid2VicGFjazovLy9zcmMvZGV2dG9vbHMvaW5kZXguanM/MjY4NyJdLCJzb3VyY2VzQ29udGVudCI6WyJjaHJvbWUuZGV2dG9vbHMucGFuZWxzLmNyZWF0ZShcbiAgJ3BhbmVsJyxcbiAgJ2ltZy9sb2dvLnBuZycsXG4gICdwYWdlcy9wYW5lbC5odG1sJyxcbiAgZnVuY3Rpb24ocGFuZWwpIHtcbiAgICBjb25zb2xlLmxvZygnaGVsbG8gZnJvbSBjYWxsYmFjaycpO1xuICB9XG4pO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIHNyYy9kZXZ0b29scy9pbmRleC5qcyJdLCJtYXBwaW5ncyI6IkFBQUE7QUFLQTtBQUNBIiwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///2Iwv\n"
    );
  }
});
