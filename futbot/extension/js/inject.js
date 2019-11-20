var inject = (function(t) {
  function n(c) {
    if (e[c]) return e[c].exports;
    var u = (e[c] = { i: c, l: !1, exports: {} });
    return t[c].call(u.exports, u, u.exports, n), (u.l = !0), u.exports;
  }
  var e = {};
  return (
    (n.m = t),
    (n.c = e),
    (n.d = function(t, e, c) {
      n.o(t, e) ||
        Object.defineProperty(t, e, {
          configurable: !1,
          enumerable: !0,
          get: c
        });
    }),
    (n.n = function(t) {
      var e =
        t && t.__esModule
          ? function() {
              return t.default;
            }
          : function() {
              return t;
            };
      return n.d(e, 'a', e), e;
    }),
    (n.o = function(t, n) {
      return Object.prototype.hasOwnProperty.call(t, n);
    }),
    (n.p = '/'),
    n((n.s = '8Cie'))
  );
})({
  '8Cie': function(module, exports) {
    eval(
      "var content = chrome.extension.getURL('js/content.js');\nvar script = document.createElement('script');\nscript.setAttribute('type', 'text/javascript');\nscript.setAttribute('src', content);\ndocument.body.appendChild(script);\n\nchrome.storage.sync.set({\n  futbot_endpoint: localStorage.getItem('futbot_endpoint')\n});\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiOENpZS5qcyIsInNvdXJjZXMiOlsid2VicGFjazovLy9zcmMvY29udGVudC9pbmplY3QuanM/YjdmZCJdLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgY29udGVudCA9IGNocm9tZS5leHRlbnNpb24uZ2V0VVJMKCdqcy9jb250ZW50LmpzJyk7XG52YXIgc2NyaXB0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2NyaXB0Jyk7XG5zY3JpcHQuc2V0QXR0cmlidXRlKCd0eXBlJywgJ3RleHQvamF2YXNjcmlwdCcpO1xuc2NyaXB0LnNldEF0dHJpYnV0ZSgnc3JjJywgY29udGVudCk7XG5kb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHNjcmlwdCk7XG5cbmNocm9tZS5zdG9yYWdlLnN5bmMuc2V0KHtcbiAgZnV0Ym90X2VuZHBvaW50OiBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnZnV0Ym90X2VuZHBvaW50Jylcbn0pO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIHNyYy9jb250ZW50L2luamVjdC5qcyJdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQURBIiwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///8Cie\n"
    );
  }
});
