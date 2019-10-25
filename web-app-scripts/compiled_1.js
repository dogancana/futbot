function isAndroidStockBrowser() {
  var e = navigator.userAgent,
    t =
      -1 < e.indexOf('Android') &&
      -1 < e.indexOf('Mozilla/5.0') &&
      -1 < e.indexOf('AppleWebKit'),
    n = new RegExp(/AppleWebKit\/([\d.]+)/),
    i = null === n.exec(e) ? null : parseFloat(n.exec(e)[1]);
  return t && null !== i && i < 537;
}

function isSupportedBrowser() {
  if (isAndroidStockBrowser()) return !1;
  return (function testWebGl(e) {
    try {
      return !(
        !window.WebGLRenderingContext ||
        (!e.getContext('webgl') && !e.getContext('experimental-webgl'))
      );
    } catch (e) {
      return !1;
    }
  })(document.createElement('canvas'));
}
if (!isSupportedBrowser()) throw new Error('Browser not supported');
!(function() {
  var n = /^\s*function\s+([^\(\s]*)\s*/;

  function _name() {
    var e, t;
    return (
      this === Function || this === Function.prototype.constructor
        ? (t = 'Function')
        : this !== Function.prototype &&
          (t = (e = ('' + this).match(n)) && e[1]),
      t || ''
    );
  }
  var e = !('name' in Function.prototype && 'name' in function x() {}),
    t =
      'function' == typeof Object.defineProperty &&
      (function() {
        var t;
        try {
          Object.defineProperty(Function.prototype, '_xyz', {
            get: function() {
              return 'blah';
            },
            configurable: !0
          }),
            (t = 'blah' === Function.prototype._xyz),
            delete Function.prototype._xyz;
        } catch (e) {
          t = !1;
        }
        return t;
      })(),
    i =
      'function' == typeof Object.prototype.__defineGetter__ &&
      (function() {
        var t;
        try {
          Function.prototype.__defineGetter__('_abc', function() {
            return 'foo';
          }),
            (t = 'foo' === Function.prototype._abc),
            delete Function.prototype._abc;
        } catch (e) {
          t = !1;
        }
        return t;
      })();
  (Function.prototype._name = _name),
    e &&
      (t
        ? Object.defineProperty(Function.prototype, 'name', {
            get: function() {
              var e = _name.call(this);
              return (
                this !== Function.prototype &&
                  Object.defineProperty(this, 'name', {
                    value: e,
                    configurable: !0
                  }),
                e
              );
            },
            configurable: !0
          })
        : i &&
          Function.prototype.__defineGetter__('name', function() {
            var e = _name.call(this);
            return (
              this !== Function.prototype &&
                this.__defineGetter__('name', function() {
                  return e;
                }),
              e
            );
          }));
})(),
  (function() {
    function DOMKit() {}
    (DOMKit.prototype.addClass = function addClass(n, e) {
      '' !== e &&
        e
          .trim()
          .split(' ')
          .forEach(function _addClass(e) {
            if (n instanceof HTMLCollection)
              for (var t = n.length; 0 < t--; ) n.item(t).classList.add(e);
            else n.classList.add(e);
          }, this);
    }),
      (DOMKit.prototype.removeClass = function removeClass(n, e) {
        '' !== e &&
          e
            .trim()
            .split(' ')
            .forEach(function _removeClass(e) {
              if (n instanceof HTMLCollection)
                for (var t = n.length; 0 < t--; ) n.item(t).classList.remove(e);
              else n.classList.remove(e);
            }, this);
      }),
      (DOMKit.prototype.toggleClass = function toggleClass(e, t, n) {
        utils.JS.isBoolean(n) || (n = !this.hasClass(e, t)),
          n ? this.addClass(e, t) : this.removeClass(e, t);
      }),
      (DOMKit.prototype.hasClass = function hasClass(e, t) {
        return '' !== t && e.classList.contains(t);
      }),
      (DOMKit.prototype.remove = function remove(e) {
        function _remove(e) {
          e.parentNode && e.parentNode.removeChild(e);
        }
        if (e instanceof HTMLCollection)
          for (var t = e.length; 0 < t--; ) _remove(e.item(t));
        else _remove(e);
      }),
      (DOMKit.prototype.empty = function empty(e) {
        for (; e.hasChildNodes(); ) e.removeChild(e.lastChild);
      }),
      (DOMKit.prototype.insertBefore = function insertBefore(e, t) {
        t.parentNode && t.parentNode.insertBefore(e, t);
      }),
      (DOMKit.prototype.insertAfter = function insertAfter(e, t) {
        t.parentNode && t.parentNode.insertBefore(e, t.nextSibling);
      }),
      (DOMKit.prototype.toggleDisplayStyle = function toggleDisplayStyle(e, t) {
        e.style.display = t ? '' : 'none';
      }),
      (DOMKit.prototype.findElements = function findElements(e, t) {
        return this.HTMLCollectionToArray(e.querySelectorAll(t));
      }),
      (DOMKit.prototype.HTMLCollectionToArray = function HTMLCollectionToArray(
        e
      ) {
        return Array.prototype.slice.call(e);
      }),
      (DOMKit.prototype.tokenListSupports = function tokenListSupports(e, t) {
        if (!e || !e.supports) return !1;
        try {
          return e.supports(t);
        } catch (e) {
          return (
            e instanceof TypeError &&
              console.log(
                "The DOMTokenList doesn't have a supported tokens list"
              ),
            !1
          );
        }
      }),
      window.DOMKit || (window.DOMKit = new DOMKit());
  })(),
  (function(h, C) {
    var n,
      i,
      v = typeof C,
      e = h.location,
      g = h.document,
      t = g.documentElement,
      r = h.jQuery,
      o = h.$,
      a = {},
      f = [],
      s = '1.10.1',
      m = f.concat,
      l = f.push,
      c = f.slice,
      u = f.indexOf,
      d = a.toString,
      y = a.hasOwnProperty,
      p = s.trim,
      ie = function(e, t) {
        return new ie.fn.init(e, t, i);
      },
      b = /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source,
      S = /\S+/g,
      x = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,
      w = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]*))$/,
      T = /^<(\w+)\s*\/?>(?:<\/\1>|)$/,
      E = /^[\],:{}\s]*$/,
      k = /(?:^|:|,)(?:\s*\[)+/g,
      A = /\\(?:["\\\/bfnrt]|u[\da-fA-F]{4})/g,
      N = /"[^"\\\r\n]*"|true|false|null|-?(?:\d+\.|)\d+(?:[eE][+-]?\d+|)/g,
      L = /^-ms-/,
      O = /-([\da-z])/gi,
      D = function(e, t) {
        return t.toUpperCase();
      },
      M = function(e) {
        (g.addEventListener ||
          'load' === e.type ||
          'complete' === g.readyState) &&
          (P(), ie.ready());
      },
      P = function() {
        g.addEventListener
          ? (g.removeEventListener('DOMContentLoaded', M, !1),
            h.removeEventListener('load', M, !1))
          : (g.detachEvent('onreadystatechange', M),
            h.detachEvent('onload', M));
      };

    function isArraylike(e) {
      var t = e.length,
        n = ie.type(e);
      return (
        !ie.isWindow(e) &&
        (!(1 !== e.nodeType || !t) ||
          ('array' === n ||
            ('function' !== n &&
              (0 === t || ('number' == typeof t && 0 < t && t - 1 in e)))))
      );
    }
    (ie.fn = ie.prototype = {
      jquery: s,
      constructor: ie,
      init: function(e, t, n) {
        var i, r;
        if (!e) return this;
        if ('string' != typeof e)
          return e.nodeType
            ? ((this.context = this[0] = e), (this.length = 1), this)
            : ie.isFunction(e)
            ? n.ready(e)
            : (e.selector !== C &&
                ((this.selector = e.selector), (this.context = e.context)),
              ie.makeArray(e, this));
        if (
          !(i =
            '<' === e.charAt(0) &&
            '>' === e.charAt(e.length - 1) &&
            3 <= e.length
              ? [null, e, null]
              : w.exec(e)) ||
          (!i[1] && t)
        )
          return !t || t.jquery
            ? (t || n).find(e)
            : this.constructor(t).find(e);
        if (i[1]) {
          if (
            ((t = t instanceof ie ? t[0] : t),
            ie.merge(
              this,
              ie.parseHTML(i[1], t && t.nodeType ? t.ownerDocument || t : g, !0)
            ),
            T.test(i[1]) && ie.isPlainObject(t))
          )
            for (i in t)
              ie.isFunction(this[i]) ? this[i](t[i]) : this.attr(i, t[i]);
          return this;
        }
        if ((r = g.getElementById(i[2])) && r.parentNode) {
          if (r.id !== i[2]) return n.find(e);
          (this.length = 1), (this[0] = r);
        }
        return (this.context = g), (this.selector = e), this;
      },
      selector: '',
      length: 0,
      toArray: function() {
        return c.call(this);
      },
      get: function(e) {
        return null == e
          ? this.toArray()
          : e < 0
          ? this[this.length + e]
          : this[e];
      },
      pushStack: function(e) {
        var t = ie.merge(this.constructor(), e);
        return (t.prevObject = this), (t.context = this.context), t;
      },
      each: function(e, t) {
        return ie.each(this, e, t);
      },
      ready: function(e) {
        return ie.ready.promise().done(e), this;
      },
      slice: function() {
        return this.pushStack(c.apply(this, arguments));
      },
      first: function() {
        return this.eq(0);
      },
      last: function() {
        return this.eq(-1);
      },
      eq: function(e) {
        var t = this.length,
          n = +e + (e < 0 ? t : 0);
        return this.pushStack(0 <= n && n < t ? [this[n]] : []);
      },
      map: function(n) {
        return this.pushStack(
          ie.map(this, function(e, t) {
            return n.call(e, t, e);
          })
        );
      },
      end: function() {
        return this.prevObject || this.constructor(null);
      },
      push: l,
      sort: [].sort,
      splice: [].splice
    }),
      (ie.fn.init.prototype = ie.fn),
      (ie.extend = ie.fn.extend = function() {
        var e,
          t,
          n,
          i,
          r,
          o,
          a = arguments[0] || {},
          s = 1,
          l = arguments.length,
          u = !1;
        for (
          'boolean' == typeof a && ((u = a), (a = arguments[1] || {}), (s = 2)),
            'object' == typeof a || ie.isFunction(a) || (a = {}),
            l === s && ((a = this), --s);
          s < l;
          s++
        )
          if (null != (r = arguments[s]))
            for (i in r)
              (e = a[i]),
                a !== (n = r[i]) &&
                  (u && n && (ie.isPlainObject(n) || (t = ie.isArray(n)))
                    ? ((o = t
                        ? ((t = !1), e && ie.isArray(e) ? e : [])
                        : e && ie.isPlainObject(e)
                        ? e
                        : {}),
                      (a[i] = ie.extend(u, o, n)))
                    : n !== C && (a[i] = n));
        return a;
      }),
      ie.extend({
        expando: 'jQuery' + (s + Math.random()).replace(/\D/g, ''),
        noConflict: function(e) {
          return (
            h.$ === ie && (h.$ = o), e && h.jQuery === ie && (h.jQuery = r), ie
          );
        },
        isReady: !1,
        readyWait: 1,
        holdReady: function(e) {
          e ? ie.readyWait++ : ie.ready(!0);
        },
        ready: function(e) {
          if (!0 === e ? !--ie.readyWait : !ie.isReady) {
            if (!g.body) return setTimeout(ie.ready);
            ((ie.isReady = !0) !== e && 0 < --ie.readyWait) ||
              (n.resolveWith(g, [ie]),
              ie.fn.trigger &&
                ie(g)
                  .trigger('ready')
                  .off('ready'));
          }
        },
        isFunction: function(e) {
          return 'function' === ie.type(e);
        },
        isArray:
          Array.isArray ||
          function(e) {
            return 'array' === ie.type(e);
          },
        isWindow: function(e) {
          return null != e && e == e.window;
        },
        isNumeric: function(e) {
          return !isNaN(parseFloat(e)) && isFinite(e);
        },
        type: function(e) {
          return null == e
            ? String(e)
            : 'object' == typeof e || 'function' == typeof e
            ? a[d.call(e)] || 'object'
            : typeof e;
        },
        isPlainObject: function(e) {
          var t;
          if (!e || 'object' !== ie.type(e) || e.nodeType || ie.isWindow(e))
            return !1;
          try {
            if (
              e.constructor &&
              !y.call(e, 'constructor') &&
              !y.call(e.constructor.prototype, 'isPrototypeOf')
            )
              return !1;
          } catch (e) {
            return !1;
          }
          if (ie.support.ownLast) for (t in e) return y.call(e, t);
          for (t in e);
          return t === C || y.call(e, t);
        },
        isEmptyObject: function(e) {
          var t;
          for (t in e) return !1;
          return !0;
        },
        error: function(e) {
          throw new Error(e);
        },
        parseHTML: function(e, t, n) {
          if (!e || 'string' != typeof e) return null;
          'boolean' == typeof t && ((n = t), (t = !1)), (t = t || g);
          var i = T.exec(e),
            r = !n && [];
          return i
            ? [t.createElement(i[1])]
            : ((i = ie.buildFragment([e], t, r)),
              r && ie(r).remove(),
              ie.merge([], i.childNodes));
        },
        parseJSON: function(e) {
          return h.JSON && h.JSON.parse
            ? h.JSON.parse(e)
            : null === e
            ? e
            : 'string' == typeof e &&
              (e = ie.trim(e)) &&
              E.test(
                e
                  .replace(A, '@')
                  .replace(N, ']')
                  .replace(k, '')
              )
            ? new Function('return ' + e)()
            : void ie.error('Invalid JSON: ' + e);
        },
        parseXML: function(e) {
          var t;
          if (!e || 'string' != typeof e) return null;
          try {
            h.DOMParser
              ? (t = new DOMParser().parseFromString(e, 'text/xml'))
              : (((t = new ActiveXObject('Microsoft.XMLDOM')).async = 'false'),
                t.loadXML(e));
          } catch (e) {
            t = C;
          }
          return (
            (t &&
              t.documentElement &&
              !t.getElementsByTagName('parsererror').length) ||
              ie.error('Invalid XML: ' + e),
            t
          );
        },
        noop: function() {},
        globalEval: function(e) {
          e &&
            ie.trim(e) &&
            (h.execScript ||
              function(e) {
                h.eval.call(h, e);
              })(e);
        },
        camelCase: function(e) {
          return e.replace(L, 'ms-').replace(O, D);
        },
        nodeName: function(e, t) {
          return e.nodeName && e.nodeName.toLowerCase() === t.toLowerCase();
        },
        each: function(e, t, n) {
          var i = 0,
            r = e.length,
            o = isArraylike(e);
          if (n) {
            if (o) for (; i < r && !1 !== t.apply(e[i], n); i++);
            else for (i in e) if (!1 === t.apply(e[i], n)) break;
          } else if (o) for (; i < r && !1 !== t.call(e[i], i, e[i]); i++);
          else for (i in e) if (!1 === t.call(e[i], i, e[i])) break;
          return e;
        },
        trim:
          p && !p.call('\ufeffÂ ')
            ? function(e) {
                return null == e ? '' : p.call(e);
              }
            : function(e) {
                return null == e ? '' : (e + '').replace(x, '');
              },
        makeArray: function(e, t) {
          var n = t || [];
          return (
            null != e &&
              (isArraylike(Object(e))
                ? ie.merge(n, 'string' == typeof e ? [e] : e)
                : l.call(n, e)),
            n
          );
        },
        inArray: function(e, t, n) {
          var i;
          if (t) {
            if (u) return u.call(t, e, n);
            for (
              i = t.length, n = n ? (n < 0 ? Math.max(0, i + n) : n) : 0;
              n < i;
              n++
            )
              if (n in t && t[n] === e) return n;
          }
          return -1;
        },
        merge: function(e, t) {
          var n = t.length,
            i = e.length,
            r = 0;
          if ('number' == typeof n) for (; r < n; r++) e[i++] = t[r];
          else for (; t[r] !== C; ) e[i++] = t[r++];
          return (e.length = i), e;
        },
        grep: function(e, t, n) {
          var i = [],
            r = 0,
            o = e.length;
          for (n = !!n; r < o; r++) n !== !!t(e[r], r) && i.push(e[r]);
          return i;
        },
        map: function(e, t, n) {
          var i,
            r = 0,
            o = e.length,
            a = [];
          if (isArraylike(e))
            for (; r < o; r++) null != (i = t(e[r], r, n)) && (a[a.length] = i);
          else for (r in e) null != (i = t(e[r], r, n)) && (a[a.length] = i);
          return m.apply([], a);
        },
        guid: 1,
        proxy: function(e, t) {
          var n, i, r;
          return (
            'string' == typeof t && ((r = e[t]), (t = e), (e = r)),
            ie.isFunction(e)
              ? ((n = c.call(arguments, 2)),
                ((i = function() {
                  return e.apply(t || this, n.concat(c.call(arguments)));
                }).guid = e.guid = e.guid || ie.guid++),
                i)
              : C
          );
        },
        access: function(e, t, n, i, r, o, a) {
          var s = 0,
            l = e.length,
            u = null == n;
          if ('object' === ie.type(n))
            for (s in ((r = !0), n)) ie.access(e, t, s, n[s], !0, o, a);
          else if (
            i !== C &&
            ((r = !0),
            ie.isFunction(i) || (a = !0),
            u &&
              (t = a
                ? (t.call(e, i), null)
                : ((u = t),
                  function(e, t, n) {
                    return u.call(ie(e), n);
                  })),
            t)
          )
            for (; s < l; s++) t(e[s], n, a ? i : i.call(e[s], s, t(e[s], n)));
          return r ? e : u ? t.call(e) : l ? t(e[0], n) : o;
        },
        now: function() {
          return new Date().getTime();
        },
        swap: function(e, t, n, i) {
          var r,
            o,
            a = {};
          for (o in t) (a[o] = e.style[o]), (e.style[o] = t[o]);
          for (o in ((r = n.apply(e, i || [])), t)) e.style[o] = a[o];
          return r;
        }
      }),
      (ie.ready.promise = function(e) {
        if (!n)
          if (((n = ie.Deferred()), 'complete' === g.readyState))
            setTimeout(ie.ready);
          else if (g.addEventListener)
            g.addEventListener('DOMContentLoaded', M, !1),
              h.addEventListener('load', M, !1);
          else {
            g.attachEvent('onreadystatechange', M), h.attachEvent('onload', M);
            var t = !1;
            try {
              t = null == h.frameElement && g.documentElement;
            } catch (e) {}
            t &&
              t.doScroll &&
              (function doScrollCheck() {
                if (!ie.isReady) {
                  try {
                    t.doScroll('left');
                  } catch (e) {
                    return setTimeout(doScrollCheck, 50);
                  }
                  P(), ie.ready();
                }
              })();
          }
        return n.promise(e);
      }),
      ie.each(
        'Boolean Number String Function Array Date RegExp Object Error'.split(
          ' '
        ),
        function(e, t) {
          a['[object ' + t + ']'] = t.toLowerCase();
        }
      ),
      (i = ie(g)),
      (function(n, r) {
        var e,
          h,
          w,
          T,
          o,
          i,
          g,
          C,
          u,
          m,
          S,
          a,
          v,
          y,
          s,
          c,
          b,
          x = 'sizzle' + -new Date(),
          E = n.document,
          k = 0,
          f = 0,
          l = createCache(),
          d = createCache(),
          p = createCache(),
          A = !1,
          N = function() {
            return 0;
          },
          L = typeof r,
          O = {}.hasOwnProperty,
          t = [],
          D = t.pop,
          M = t.push,
          P = t.push,
          H = t.slice,
          j =
            t.indexOf ||
            function(e) {
              for (var t = 0, n = this.length; t < n; t++)
                if (this[t] === e) return t;
              return -1;
            },
          _ =
            'checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped',
          F = '[\\x20\\t\\r\\n\\f]',
          R = '(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+',
          B = R.replace('w', 'w#'),
          z =
            '\\[' +
            F +
            '*(' +
            R +
            ')' +
            F +
            '*(?:([*^$|!~]?=)' +
            F +
            '*(?:([\'"])((?:\\\\.|[^\\\\])*?)\\3|(' +
            B +
            ')|)|)' +
            F +
            '*\\]',
          I =
            ':(' +
            R +
            ')(?:\\((([\'"])((?:\\\\.|[^\\\\])*?)\\3|((?:\\\\.|[^\\\\()[\\]]|' +
            z.replace(3, 8) +
            ')*)|.*)\\)|)',
          W = new RegExp(
            '^' + F + '+|((?:^|[^\\\\])(?:\\\\.)*)' + F + '+$',
            'g'
          ),
          q = new RegExp('^' + F + '*,' + F + '*'),
          $ = new RegExp('^' + F + '*([>+~]|' + F + ')' + F + '*'),
          U = new RegExp(F + '*[+~]'),
          V = new RegExp('=' + F + '*([^\\]\'"]*)' + F + '*\\]', 'g'),
          X = new RegExp(I),
          J = new RegExp('^' + B + '$'),
          G = {
            ID: new RegExp('^#(' + R + ')'),
            CLASS: new RegExp('^\\.(' + R + ')'),
            TAG: new RegExp('^(' + R.replace('w', 'w*') + ')'),
            ATTR: new RegExp('^' + z),
            PSEUDO: new RegExp('^' + I),
            CHILD: new RegExp(
              '^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(' +
                F +
                '*(even|odd|(([+-]|)(\\d*)n|)' +
                F +
                '*(?:([+-]|)' +
                F +
                '*(\\d+)|))' +
                F +
                '*\\)|)',
              'i'
            ),
            bool: new RegExp('^(?:' + _ + ')$', 'i'),
            needsContext: new RegExp(
              '^' +
                F +
                '*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(' +
                F +
                '*((?:-\\d)?\\d*)' +
                F +
                '*\\)|)(?=[^-]|$)',
              'i'
            )
          },
          K = /^[^{]+\{\s*\[native \w/,
          Y = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,
          Z = /^(?:input|select|textarea|button)$/i,
          Q = /^h\d$/i,
          ee = /'|\\/g,
          te = new RegExp('\\\\([\\da-f]{1,6}' + F + '?|(' + F + ')|.)', 'ig'),
          ne = function(e, t, n) {
            var i = '0x' + t - 65536;
            return i != i || n
              ? t
              : i < 0
              ? String.fromCharCode(i + 65536)
              : String.fromCharCode((i >> 10) | 55296, (1023 & i) | 56320);
          };
        try {
          P.apply((t = H.call(E.childNodes)), E.childNodes);
          t[E.childNodes.length].nodeType;
        } catch (e) {
          P = {
            apply: t.length
              ? function(e, t) {
                  M.apply(e, H.call(t));
                }
              : function(e, t) {
                  for (var n = e.length, i = 0; (e[n++] = t[i++]); );
                  e.length = n - 1;
                }
          };
        }

        function Sizzle(e, t, n, i) {
          var r, o, a, s, l, u, c, f, d, p;
          if (
            ((t ? t.ownerDocument || t : E) !== S && m(t),
            (n = n || []),
            !e || 'string' != typeof e)
          )
            return n;
          if (1 !== (s = (t = t || S).nodeType) && 9 !== s) return [];
          if (v && !i) {
            if ((r = Y.exec(e)))
              if ((a = r[1])) {
                if (9 === s) {
                  if (!(o = t.getElementById(a)) || !o.parentNode) return n;
                  if (o.id === a) return n.push(o), n;
                } else if (
                  t.ownerDocument &&
                  (o = t.ownerDocument.getElementById(a)) &&
                  b(t, o) &&
                  o.id === a
                )
                  return n.push(o), n;
              } else {
                if (r[2]) return P.apply(n, t.getElementsByTagName(e)), n;
                if (
                  (a = r[3]) &&
                  h.getElementsByClassName &&
                  t.getElementsByClassName
                )
                  return P.apply(n, t.getElementsByClassName(a)), n;
              }
            if (h.qsa && (!y || !y.test(e))) {
              if (
                ((f = c = x),
                (d = t),
                (p = 9 === s && e),
                1 === s && 'object' !== t.nodeName.toLowerCase())
              ) {
                for (
                  u = tokenize(e),
                    (c = t.getAttribute('id'))
                      ? (f = c.replace(ee, '\\$&'))
                      : t.setAttribute('id', f),
                    f = "[id='" + f + "'] ",
                    l = u.length;
                  l--;

                )
                  u[l] = f + toSelector(u[l]);
                (d = (U.test(e) && t.parentNode) || t), (p = u.join(','));
              }
              if (p)
                try {
                  return P.apply(n, d.querySelectorAll(p)), n;
                } catch (e) {
                } finally {
                  c || t.removeAttribute('id');
                }
            }
          }
          return (function select(e, t, n, i) {
            var r,
              o,
              a,
              s,
              l,
              u = tokenize(e);
            if (!i && 1 === u.length) {
              if (
                2 < (o = u[0] = u[0].slice(0)).length &&
                'ID' === (a = o[0]).type &&
                h.getById &&
                9 === t.nodeType &&
                v &&
                T.relative[o[1].type]
              ) {
                if (
                  !(t = (T.find.ID(a.matches[0].replace(te, ne), t) || [])[0])
                )
                  return n;
                e = e.slice(o.shift().value.length);
              }
              for (
                r = G.needsContext.test(e) ? 0 : o.length;
                r-- && ((a = o[r]), !T.relative[(s = a.type)]);

              )
                if (
                  (l = T.find[s]) &&
                  (i = l(
                    a.matches[0].replace(te, ne),
                    (U.test(o[0].type) && t.parentNode) || t
                  ))
                ) {
                  if ((o.splice(r, 1), !(e = i.length && toSelector(o))))
                    return P.apply(n, i), n;
                  break;
                }
            }
            return g(e, u)(i, t, !v, n, U.test(e)), n;
          })(e.replace(W, '$1'), t, n, i);
        }

        function isNative(e) {
          return K.test(e + '');
        }

        function createCache() {
          var n = [];
          return function cache(e, t) {
            return (
              n.push((e += ' ')) > T.cacheLength && delete cache[n.shift()],
              (cache[e] = t)
            );
          };
        }

        function markFunction(e) {
          return (e[x] = !0), e;
        }

        function assert(e) {
          var t = S.createElement('div');
          try {
            return !!e(t);
          } catch (e) {
            return !1;
          } finally {
            t.parentNode && t.parentNode.removeChild(t), (t = null);
          }
        }

        function addHandle(e, t, n) {
          for (var i, r = (e = e.split('|')).length, o = n ? null : t; r--; )
            ((i = T.attrHandle[e[r]]) && i !== t) || (T.attrHandle[e[r]] = o);
        }

        function boolHandler(e, t) {
          var n = e.getAttributeNode(t);
          return n && n.specified
            ? n.value
            : !0 === e[t]
            ? t.toLowerCase()
            : null;
        }

        function interpolationHandler(e, t) {
          return e.getAttribute(t, 'type' === t.toLowerCase() ? 1 : 2);
        }

        function valueHandler(e) {
          if ('input' === e.nodeName.toLowerCase()) return e.defaultValue;
        }

        function siblingCheck(e, t) {
          var n = t && e,
            i =
              n &&
              1 === e.nodeType &&
              1 === t.nodeType &&
              (~t.sourceIndex || 1 << 31) - (~e.sourceIndex || 1 << 31);
          if (i) return i;
          if (n) for (; (n = n.nextSibling); ) if (n === t) return -1;
          return e ? 1 : -1;
        }

        function createInputPseudo(t) {
          return function(e) {
            return 'input' === e.nodeName.toLowerCase() && e.type === t;
          };
        }

        function createButtonPseudo(n) {
          return function(e) {
            var t = e.nodeName.toLowerCase();
            return ('input' === t || 'button' === t) && e.type === n;
          };
        }

        function createPositionalPseudo(a) {
          return markFunction(function(o) {
            return (
              (o = +o),
              markFunction(function(e, t) {
                for (var n, i = a([], e.length, o), r = i.length; r--; )
                  e[(n = i[r])] && (e[n] = !(t[n] = e[n]));
              })
            );
          });
        }
        for (e in ((i = Sizzle.isXML = function(e) {
          var t = e && (e.ownerDocument || e).documentElement;
          return !!t && 'HTML' !== t.nodeName;
        }),
        (h = Sizzle.support = {}),
        (m = Sizzle.setDocument = function(e) {
          var l = e ? e.ownerDocument || e : E,
            t = l.parentWindow;
          return l !== S && 9 === l.nodeType && l.documentElement
            ? ((a = (S = l).documentElement),
              (v = !i(l)),
              t &&
                t.frameElement &&
                t.attachEvent('onbeforeunload', function() {
                  m();
                }),
              (h.attributes = assert(function(e) {
                return (
                  (e.innerHTML = "<a href='#'></a>"),
                  addHandle(
                    'type|href|height|width',
                    interpolationHandler,
                    '#' === e.firstChild.getAttribute('href')
                  ),
                  addHandle(_, boolHandler, null == e.getAttribute('disabled')),
                  (e.className = 'i'),
                  !e.getAttribute('className')
                );
              })),
              (h.input = assert(function(e) {
                return (
                  (e.innerHTML = '<input>'),
                  e.firstChild.setAttribute('value', ''),
                  '' === e.firstChild.getAttribute('value')
                );
              })),
              addHandle('value', valueHandler, h.attributes && h.input),
              (h.getElementsByTagName = assert(function(e) {
                return (
                  e.appendChild(l.createComment('')),
                  !e.getElementsByTagName('*').length
                );
              })),
              (h.getElementsByClassName = assert(function(e) {
                return (
                  (e.innerHTML =
                    "<div class='a'></div><div class='a i'></div>"),
                  (e.firstChild.className = 'i'),
                  2 === e.getElementsByClassName('i').length
                );
              })),
              (h.getById = assert(function(e) {
                return (
                  (a.appendChild(e).id = x),
                  !l.getElementsByName || !l.getElementsByName(x).length
                );
              })),
              h.getById
                ? ((T.find.ID = function(e, t) {
                    if (typeof t.getElementById !== L && v) {
                      var n = t.getElementById(e);
                      return n && n.parentNode ? [n] : [];
                    }
                  }),
                  (T.filter.ID = function(e) {
                    var t = e.replace(te, ne);
                    return function(e) {
                      return e.getAttribute('id') === t;
                    };
                  }))
                : (delete T.find.ID,
                  (T.filter.ID = function(e) {
                    var n = e.replace(te, ne);
                    return function(e) {
                      var t =
                        typeof e.getAttributeNode !== L &&
                        e.getAttributeNode('id');
                      return t && t.value === n;
                    };
                  })),
              (T.find.TAG = h.getElementsByTagName
                ? function(e, t) {
                    if (typeof t.getElementsByTagName !== L)
                      return t.getElementsByTagName(e);
                  }
                : function(e, t) {
                    var n,
                      i = [],
                      r = 0,
                      o = t.getElementsByTagName(e);
                    if ('*' !== e) return o;
                    for (; (n = o[r++]); ) 1 === n.nodeType && i.push(n);
                    return i;
                  }),
              (T.find.CLASS =
                h.getElementsByClassName &&
                function(e, t) {
                  if (typeof t.getElementsByClassName !== L && v)
                    return t.getElementsByClassName(e);
                }),
              (s = []),
              (y = []),
              (h.qsa = isNative(l.querySelectorAll)) &&
                (assert(function(e) {
                  (e.innerHTML =
                    "<select><option selected=''></option></select>"),
                    e.querySelectorAll('[selected]').length ||
                      y.push('\\[' + F + '*(?:value|' + _ + ')'),
                    e.querySelectorAll(':checked').length || y.push(':checked');
                }),
                assert(function(e) {
                  var t = l.createElement('input');
                  t.setAttribute('type', 'hidden'),
                    e.appendChild(t).setAttribute('t', ''),
                    e.querySelectorAll("[t^='']").length &&
                      y.push('[*^$]=' + F + '*(?:\'\'|"")'),
                    e.querySelectorAll(':enabled').length ||
                      y.push(':enabled', ':disabled'),
                    e.querySelectorAll('*,:x'),
                    y.push(',.*:');
                })),
              (h.matchesSelector = isNative(
                (c =
                  a.webkitMatchesSelector ||
                  a.mozMatchesSelector ||
                  a.oMatchesSelector ||
                  a.msMatchesSelector)
              )) &&
                assert(function(e) {
                  (h.disconnectedMatch = c.call(e, 'div')),
                    c.call(e, "[s!='']:x"),
                    s.push('!=', I);
                }),
              (y = y.length && new RegExp(y.join('|'))),
              (s = s.length && new RegExp(s.join('|'))),
              (b =
                isNative(a.contains) || a.compareDocumentPosition
                  ? function(e, t) {
                      var n = 9 === e.nodeType ? e.documentElement : e,
                        i = t && t.parentNode;
                      return (
                        e === i ||
                        !(
                          !i ||
                          1 !== i.nodeType ||
                          !(n.contains
                            ? n.contains(i)
                            : e.compareDocumentPosition &&
                              16 & e.compareDocumentPosition(i))
                        )
                      );
                    }
                  : function(e, t) {
                      if (t)
                        for (; (t = t.parentNode); ) if (t === e) return !0;
                      return !1;
                    }),
              (h.sortDetached = assert(function(e) {
                return 1 & e.compareDocumentPosition(l.createElement('div'));
              })),
              (N = a.compareDocumentPosition
                ? function(e, t) {
                    if (e === t) return (A = !0), 0;
                    var n =
                      t.compareDocumentPosition &&
                      e.compareDocumentPosition &&
                      e.compareDocumentPosition(t);
                    return n
                      ? 1 & n ||
                        (!h.sortDetached && t.compareDocumentPosition(e) === n)
                        ? e === l || b(E, e)
                          ? -1
                          : t === l || b(E, t)
                          ? 1
                          : u
                          ? j.call(u, e) - j.call(u, t)
                          : 0
                        : 4 & n
                        ? -1
                        : 1
                      : e.compareDocumentPosition
                      ? -1
                      : 1;
                  }
                : function(e, t) {
                    var n,
                      i = 0,
                      r = e.parentNode,
                      o = t.parentNode,
                      a = [e],
                      s = [t];
                    if (e === t) return (A = !0), 0;
                    if (!r || !o)
                      return e === l
                        ? -1
                        : t === l
                        ? 1
                        : r
                        ? -1
                        : o
                        ? 1
                        : u
                        ? j.call(u, e) - j.call(u, t)
                        : 0;
                    if (r === o) return siblingCheck(e, t);
                    for (n = e; (n = n.parentNode); ) a.unshift(n);
                    for (n = t; (n = n.parentNode); ) s.unshift(n);
                    for (; a[i] === s[i]; ) i++;
                    return i
                      ? siblingCheck(a[i], s[i])
                      : a[i] === E
                      ? -1
                      : s[i] === E
                      ? 1
                      : 0;
                  }),
              l)
            : S;
        }),
        (Sizzle.matches = function(e, t) {
          return Sizzle(e, null, null, t);
        }),
        (Sizzle.matchesSelector = function(e, t) {
          if (
            ((e.ownerDocument || e) !== S && m(e),
            (t = t.replace(V, "='$1']")),
            h.matchesSelector && v && (!s || !s.test(t)) && (!y || !y.test(t)))
          )
            try {
              var n = c.call(e, t);
              if (
                n ||
                h.disconnectedMatch ||
                (e.document && 11 !== e.document.nodeType)
              )
                return n;
            } catch (e) {}
          return 0 < Sizzle(t, S, null, [e]).length;
        }),
        (Sizzle.contains = function(e, t) {
          return (e.ownerDocument || e) !== S && m(e), b(e, t);
        }),
        (Sizzle.attr = function(e, t) {
          (e.ownerDocument || e) !== S && m(e);
          var n = T.attrHandle[t.toLowerCase()],
            i = n && O.call(T.attrHandle, t.toLowerCase()) ? n(e, t, !v) : r;
          return i === r
            ? h.attributes || !v
              ? e.getAttribute(t)
              : (i = e.getAttributeNode(t)) && i.specified
              ? i.value
              : null
            : i;
        }),
        (Sizzle.error = function(e) {
          throw new Error('Syntax error, unrecognized expression: ' + e);
        }),
        (Sizzle.uniqueSort = function(e) {
          var t,
            n = [],
            i = 0,
            r = 0;
          if (
            ((A = !h.detectDuplicates),
            (u = !h.sortStable && e.slice(0)),
            e.sort(N),
            A)
          ) {
            for (; (t = e[r++]); ) t === e[r] && (i = n.push(r));
            for (; i--; ) e.splice(n[i], 1);
          }
          return e;
        }),
        (o = Sizzle.getText = function(e) {
          var t,
            n = '',
            i = 0,
            r = e.nodeType;
          if (r) {
            if (1 === r || 9 === r || 11 === r) {
              if ('string' == typeof e.textContent) return e.textContent;
              for (e = e.firstChild; e; e = e.nextSibling) n += o(e);
            } else if (3 === r || 4 === r) return e.nodeValue;
          } else for (; (t = e[i]); i++) n += o(t);
          return n;
        }),
        (T = Sizzle.selectors = {
          cacheLength: 50,
          createPseudo: markFunction,
          match: G,
          attrHandle: {},
          find: {},
          relative: {
            '>': {
              dir: 'parentNode',
              first: !0
            },
            ' ': {
              dir: 'parentNode'
            },
            '+': {
              dir: 'previousSibling',
              first: !0
            },
            '~': {
              dir: 'previousSibling'
            }
          },
          preFilter: {
            ATTR: function(e) {
              return (
                (e[1] = e[1].replace(te, ne)),
                (e[3] = (e[4] || e[5] || '').replace(te, ne)),
                '~=' === e[2] && (e[3] = ' ' + e[3] + ' '),
                e.slice(0, 4)
              );
            },
            CHILD: function(e) {
              return (
                (e[1] = e[1].toLowerCase()),
                'nth' === e[1].slice(0, 3)
                  ? (e[3] || Sizzle.error(e[0]),
                    (e[4] = +(e[4]
                      ? e[5] + (e[6] || 1)
                      : 2 * ('even' === e[3] || 'odd' === e[3]))),
                    (e[5] = +(e[7] + e[8] || 'odd' === e[3])))
                  : e[3] && Sizzle.error(e[0]),
                e
              );
            },
            PSEUDO: function(e) {
              var t,
                n = !e[5] && e[2];
              return G.CHILD.test(e[0])
                ? null
                : (e[3] && e[4] !== r
                    ? (e[2] = e[4])
                    : n &&
                      X.test(n) &&
                      (t = tokenize(n, !0)) &&
                      (t = n.indexOf(')', n.length - t) - n.length) &&
                      ((e[0] = e[0].slice(0, t)), (e[2] = n.slice(0, t))),
                  e.slice(0, 3));
            }
          },
          filter: {
            TAG: function(e) {
              var t = e.replace(te, ne).toLowerCase();
              return '*' === e
                ? function() {
                    return !0;
                  }
                : function(e) {
                    return e.nodeName && e.nodeName.toLowerCase() === t;
                  };
            },
            CLASS: function(e) {
              var t = l[e + ' '];
              return (
                t ||
                ((t = new RegExp('(^|' + F + ')' + e + '(' + F + '|$)')) &&
                  l(e, function(e) {
                    return t.test(
                      ('string' == typeof e.className && e.className) ||
                        (typeof e.getAttribute !== L &&
                          e.getAttribute('class')) ||
                        ''
                    );
                  }))
              );
            },
            ATTR: function(n, i, r) {
              return function(e) {
                var t = Sizzle.attr(e, n);
                return null == t
                  ? '!=' === i
                  : !i ||
                      ((t += ''),
                      '=' === i
                        ? t === r
                        : '!=' === i
                        ? t !== r
                        : '^=' === i
                        ? r && 0 === t.indexOf(r)
                        : '*=' === i
                        ? r && -1 < t.indexOf(r)
                        : '$=' === i
                        ? r && t.slice(-r.length) === r
                        : '~=' === i
                        ? -1 < (' ' + t + ' ').indexOf(r)
                        : '|=' === i &&
                          (t === r || t.slice(0, r.length + 1) === r + '-'));
              };
            },
            CHILD: function(p, e, t, h, g) {
              var m = 'nth' !== p.slice(0, 3),
                v = 'last' !== p.slice(-4),
                y = 'of-type' === e;
              return 1 === h && 0 === g
                ? function(e) {
                    return !!e.parentNode;
                  }
                : function(e, t, n) {
                    var i,
                      r,
                      o,
                      a,
                      s,
                      l,
                      u = m !== v ? 'nextSibling' : 'previousSibling',
                      c = e.parentNode,
                      f = y && e.nodeName.toLowerCase(),
                      d = !n && !y;
                    if (c) {
                      if (m) {
                        for (; u; ) {
                          for (o = e; (o = o[u]); )
                            if (
                              y
                                ? o.nodeName.toLowerCase() === f
                                : 1 === o.nodeType
                            )
                              return !1;
                          l = u = 'only' === p && !l && 'nextSibling';
                        }
                        return !0;
                      }
                      if (((l = [v ? c.firstChild : c.lastChild]), v && d)) {
                        for (
                          s =
                            (i = (r = c[x] || (c[x] = {}))[p] || [])[0] === k &&
                            i[1],
                            a = i[0] === k && i[2],
                            o = s && c.childNodes[s];
                          (o = (++s && o && o[u]) || (a = s = 0) || l.pop());

                        )
                          if (1 === o.nodeType && ++a && o === e) {
                            r[p] = [k, s, a];
                            break;
                          }
                      } else if (
                        d &&
                        (i = (e[x] || (e[x] = {}))[p]) &&
                        i[0] === k
                      )
                        a = i[1];
                      else
                        for (
                          ;
                          (o = (++s && o && o[u]) || (a = s = 0) || l.pop()) &&
                          ((y
                            ? o.nodeName.toLowerCase() !== f
                            : 1 !== o.nodeType) ||
                            !++a ||
                            (d && ((o[x] || (o[x] = {}))[p] = [k, a]),
                            o !== e));

                        );
                      return (a -= g) === h || (a % h == 0 && 0 <= a / h);
                    }
                  };
            },
            PSEUDO: function(e, o) {
              var t,
                a =
                  T.pseudos[e] ||
                  T.setFilters[e.toLowerCase()] ||
                  Sizzle.error('unsupported pseudo: ' + e);
              return a[x]
                ? a(o)
                : 1 < a.length
                ? ((t = [e, e, '', o]),
                  T.setFilters.hasOwnProperty(e.toLowerCase())
                    ? markFunction(function(e, t) {
                        for (var n, i = a(e, o), r = i.length; r--; )
                          e[(n = j.call(e, i[r]))] = !(t[n] = i[r]);
                      })
                    : function(e) {
                        return a(e, 0, t);
                      })
                : a;
            }
          },
          pseudos: {
            not: markFunction(function(e) {
              var i = [],
                r = [],
                s = g(e.replace(W, '$1'));
              return s[x]
                ? markFunction(function(e, t, n, i) {
                    for (var r, o = s(e, null, i, []), a = e.length; a--; )
                      (r = o[a]) && (e[a] = !(t[a] = r));
                  })
                : function(e, t, n) {
                    return (i[0] = e), s(i, null, n, r), !r.pop();
                  };
            }),
            has: markFunction(function(t) {
              return function(e) {
                return 0 < Sizzle(t, e).length;
              };
            }),
            contains: markFunction(function(t) {
              return function(e) {
                return -1 < (e.textContent || e.innerText || o(e)).indexOf(t);
              };
            }),
            lang: markFunction(function(n) {
              return (
                J.test(n || '') || Sizzle.error('unsupported lang: ' + n),
                (n = n.replace(te, ne).toLowerCase()),
                function(e) {
                  var t;
                  do {
                    if (
                      (t = v
                        ? e.lang
                        : e.getAttribute('xml:lang') || e.getAttribute('lang'))
                    )
                      return (
                        (t = t.toLowerCase()) === n || 0 === t.indexOf(n + '-')
                      );
                  } while ((e = e.parentNode) && 1 === e.nodeType);
                  return !1;
                }
              );
            }),
            target: function(e) {
              var t = n.location && n.location.hash;
              return t && t.slice(1) === e.id;
            },
            root: function(e) {
              return e === a;
            },
            focus: function(e) {
              return (
                e === S.activeElement &&
                (!S.hasFocus || S.hasFocus()) &&
                !!(e.type || e.href || ~e.tabIndex)
              );
            },
            enabled: function(e) {
              return !1 === e.disabled;
            },
            disabled: function(e) {
              return !0 === e.disabled;
            },
            checked: function(e) {
              var t = e.nodeName.toLowerCase();
              return (
                ('input' === t && !!e.checked) ||
                ('option' === t && !!e.selected)
              );
            },
            selected: function(e) {
              if (e.parentNode) e.parentNode.selectedIndex;
              return !0 === e.selected;
            },
            empty: function(e) {
              for (e = e.firstChild; e; e = e.nextSibling)
                if ('@' < e.nodeName || 3 === e.nodeType || 4 === e.nodeType)
                  return !1;
              return !0;
            },
            parent: function(e) {
              return !T.pseudos.empty(e);
            },
            header: function(e) {
              return Q.test(e.nodeName);
            },
            input: function(e) {
              return Z.test(e.nodeName);
            },
            button: function(e) {
              var t = e.nodeName.toLowerCase();
              return ('input' === t && 'button' === e.type) || 'button' === t;
            },
            text: function(e) {
              var t;
              return (
                'input' === e.nodeName.toLowerCase() &&
                'text' === e.type &&
                (null == (t = e.getAttribute('type')) ||
                  t.toLowerCase() === e.type)
              );
            },
            first: createPositionalPseudo(function() {
              return [0];
            }),
            last: createPositionalPseudo(function(e, t) {
              return [t - 1];
            }),
            eq: createPositionalPseudo(function(e, t, n) {
              return [n < 0 ? n + t : n];
            }),
            even: createPositionalPseudo(function(e, t) {
              for (var n = 0; n < t; n += 2) e.push(n);
              return e;
            }),
            odd: createPositionalPseudo(function(e, t) {
              for (var n = 1; n < t; n += 2) e.push(n);
              return e;
            }),
            lt: createPositionalPseudo(function(e, t, n) {
              for (var i = n < 0 ? n + t : n; 0 <= --i; ) e.push(i);
              return e;
            }),
            gt: createPositionalPseudo(function(e, t, n) {
              for (var i = n < 0 ? n + t : n; ++i < t; ) e.push(i);
              return e;
            })
          }
        }),
        {
          radio: !0,
          checkbox: !0,
          file: !0,
          password: !0,
          image: !0
        }))
          T.pseudos[e] = createInputPseudo(e);
        for (e in {
          submit: !0,
          reset: !0
        })
          T.pseudos[e] = createButtonPseudo(e);

        function tokenize(e, t) {
          var n,
            i,
            r,
            o,
            a,
            s,
            l,
            u = d[e + ' '];
          if (u) return t ? 0 : u.slice(0);
          for (a = e, s = [], l = T.preFilter; a; ) {
            for (o in ((n && !(i = q.exec(a))) ||
              (i && (a = a.slice(i[0].length) || a), s.push((r = []))),
            (n = !1),
            (i = $.exec(a)) &&
              ((n = i.shift()),
              r.push({
                value: n,
                type: i[0].replace(W, ' ')
              }),
              (a = a.slice(n.length))),
            T.filter))
              !(i = G[o].exec(a)) ||
                (l[o] && !(i = l[o](i))) ||
                ((n = i.shift()),
                r.push({
                  value: n,
                  type: o,
                  matches: i
                }),
                (a = a.slice(n.length)));
            if (!n) break;
          }
          return t ? a.length : a ? Sizzle.error(e) : d(e, s).slice(0);
        }

        function toSelector(e) {
          for (var t = 0, n = e.length, i = ''; t < n; t++) i += e[t].value;
          return i;
        }

        function addCombinator(s, e, t) {
          var l = e.dir,
            u = t && 'parentNode' === l,
            c = f++;
          return e.first
            ? function(e, t, n) {
                for (; (e = e[l]); )
                  if (1 === e.nodeType || u) return s(e, t, n);
              }
            : function(e, t, n) {
                var i,
                  r,
                  o,
                  a = k + ' ' + c;
                if (n) {
                  for (; (e = e[l]); )
                    if ((1 === e.nodeType || u) && s(e, t, n)) return !0;
                } else
                  for (; (e = e[l]); )
                    if (1 === e.nodeType || u)
                      if ((r = (o = e[x] || (e[x] = {}))[l]) && r[0] === a) {
                        if (!0 === (i = r[1]) || i === w) return !0 === i;
                      } else if (
                        (((r = o[l] = [a])[1] = s(e, t, n) || w), !0 === r[1])
                      )
                        return !0;
              };
        }

        function elementMatcher(r) {
          return 1 < r.length
            ? function(e, t, n) {
                for (var i = r.length; i--; ) if (!r[i](e, t, n)) return !1;
                return !0;
              }
            : r[0];
        }

        function condense(e, t, n, i, r) {
          for (var o, a = [], s = 0, l = e.length, u = null != t; s < l; s++)
            (o = e[s]) && ((n && !n(o, i, r)) || (a.push(o), u && t.push(s)));
          return a;
        }

        function setMatcher(p, h, g, m, v, e) {
          return (
            m && !m[x] && (m = setMatcher(m)),
            v && !v[x] && (v = setMatcher(v, e)),
            markFunction(function(e, t, n, i) {
              var r,
                o,
                a,
                s = [],
                l = [],
                u = t.length,
                c =
                  e ||
                  (function multipleContexts(e, t, n) {
                    for (var i = 0, r = t.length; i < r; i++)
                      Sizzle(e, t[i], n);
                    return n;
                  })(h || '*', n.nodeType ? [n] : n, []),
                f = !p || (!e && h) ? c : condense(c, s, p, n, i),
                d = g ? (v || (e ? p : u || m) ? [] : t) : f;
              if ((g && g(f, d, n, i), m))
                for (r = condense(d, l), m(r, [], n, i), o = r.length; o--; )
                  (a = r[o]) && (d[l[o]] = !(f[l[o]] = a));
              if (e) {
                if (v || p) {
                  if (v) {
                    for (r = [], o = d.length; o--; )
                      (a = d[o]) && r.push((f[o] = a));
                    v(null, (d = []), r, i);
                  }
                  for (o = d.length; o--; )
                    (a = d[o]) &&
                      -1 < (r = v ? j.call(e, a) : s[o]) &&
                      (e[r] = !(t[r] = a));
                }
              } else (d = condense(d === t ? d.splice(u, d.length) : d)), v ? v(null, t, d, i) : P.apply(t, d);
            })
          );
        }

        function matcherFromTokens(e) {
          for (
            var i,
              t,
              n,
              r = e.length,
              o = T.relative[e[0].type],
              a = o || T.relative[' '],
              s = o ? 1 : 0,
              l = addCombinator(
                function(e) {
                  return e === i;
                },
                a,
                !0
              ),
              u = addCombinator(
                function(e) {
                  return -1 < j.call(i, e);
                },
                a,
                !0
              ),
              c = [
                function(e, t, n) {
                  return (
                    (!o && (n || t !== C)) ||
                    ((i = t).nodeType ? l(e, t, n) : u(e, t, n))
                  );
                }
              ];
            s < r;
            s++
          )
            if ((t = T.relative[e[s].type]))
              c = [addCombinator(elementMatcher(c), t)];
            else {
              if ((t = T.filter[e[s].type].apply(null, e[s].matches))[x]) {
                for (n = ++s; n < r && !T.relative[e[n].type]; n++);
                return setMatcher(
                  1 < s && elementMatcher(c),
                  1 < s &&
                    toSelector(
                      e.slice(0, s - 1).concat({
                        value: ' ' === e[s - 2].type ? '*' : ''
                      })
                    ).replace(W, '$1'),
                  t,
                  s < n && matcherFromTokens(e.slice(s, n)),
                  n < r && matcherFromTokens((e = e.slice(n))),
                  n < r && toSelector(e)
                );
              }
              c.push(t);
            }
          return elementMatcher(c);
        }

        function setFilters() {}
        (g = Sizzle.compile = function(e, t) {
          var n,
            i = [],
            r = [],
            o = p[e + ' '];
          if (!o) {
            for (t || (t = tokenize(e)), n = t.length; n--; )
              (o = matcherFromTokens(t[n]))[x] ? i.push(o) : r.push(o);
            o = p(
              e,
              (function matcherFromGroupMatchers(m, v) {
                var y = 0,
                  b = 0 < v.length,
                  x = 0 < m.length,
                  e = function(e, t, n, i, r) {
                    var o,
                      a,
                      s,
                      l = [],
                      u = 0,
                      c = '0',
                      f = e && [],
                      d = null != r,
                      p = C,
                      h = e || (x && T.find.TAG('*', (r && t.parentNode) || t)),
                      g = (k += null == p ? 1 : Math.random() || 0.1);
                    for (
                      d && ((C = t !== S && t), (w = y));
                      null != (o = h[c]);
                      c++
                    ) {
                      if (x && o) {
                        for (a = 0; (s = m[a++]); )
                          if (s(o, t, n)) {
                            i.push(o);
                            break;
                          }
                        d && ((k = g), (w = ++y));
                      }
                      b && ((o = !s && o) && u--, e && f.push(o));
                    }
                    if (((u += c), b && c !== u)) {
                      for (a = 0; (s = v[a++]); ) s(f, l, t, n);
                      if (e) {
                        if (0 < u)
                          for (; c--; ) f[c] || l[c] || (l[c] = D.call(i));
                        l = condense(l);
                      }
                      P.apply(i, l),
                        d &&
                          !e &&
                          0 < l.length &&
                          1 < u + v.length &&
                          Sizzle.uniqueSort(i);
                    }
                    return d && ((k = g), (C = p)), f;
                  };
                return b ? markFunction(e) : e;
              })(r, i)
            );
          }
          return o;
        }),
          (T.pseudos.nth = T.pseudos.eq),
          (setFilters.prototype = T.filters = T.pseudos),
          (T.setFilters = new setFilters()),
          (h.sortStable =
            x
              .split('')
              .sort(N)
              .join('') === x),
          m(),
          [0, 0].sort(N),
          (h.detectDuplicates = A),
          (ie.find = Sizzle),
          (ie.expr = Sizzle.selectors),
          (ie.expr[':'] = ie.expr.pseudos),
          (ie.unique = Sizzle.uniqueSort),
          (ie.text = Sizzle.getText),
          (ie.isXMLDoc = Sizzle.isXML),
          (ie.contains = Sizzle.contains);
      })(h);
    var H = {};
    (ie.Callbacks = function(i) {
      i =
        'string' == typeof i
          ? H[i] ||
            (function createOptions(e) {
              var n = (H[e] = {});
              return (
                ie.each(e.match(S) || [], function(e, t) {
                  n[t] = !0;
                }),
                n
              );
            })(i)
          : ie.extend({}, i);
      var r,
        t,
        n,
        o,
        a,
        s,
        l = [],
        u = !i.once && [],
        c = function(e) {
          for (
            t = i.memory && e, n = !0, a = s || 0, s = 0, o = l.length, r = !0;
            l && a < o;
            a++
          )
            if (!1 === l[a].apply(e[0], e[1]) && i.stopOnFalse) {
              t = !1;
              break;
            }
          (r = !1),
            l && (u ? u.length && c(u.shift()) : t ? (l = []) : f.disable());
        },
        f = {
          add: function() {
            if (l) {
              var e = l.length;
              !(function add(e) {
                ie.each(e, function(e, t) {
                  var n = ie.type(t);
                  'function' === n
                    ? (i.unique && f.has(t)) || l.push(t)
                    : t && t.length && 'string' !== n && add(t);
                });
              })(arguments),
                r ? (o = l.length) : t && ((s = e), c(t));
            }
            return this;
          },
          remove: function() {
            return (
              l &&
                ie.each(arguments, function(e, t) {
                  for (var n; -1 < (n = ie.inArray(t, l, n)); )
                    l.splice(n, 1), r && (n <= o && o--, n <= a && a--);
                }),
              this
            );
          },
          has: function(e) {
            return e ? -1 < ie.inArray(e, l) : !(!l || !l.length);
          },
          empty: function() {
            return (l = []), (o = 0), this;
          },
          disable: function() {
            return (l = u = t = C), this;
          },
          disabled: function() {
            return !l;
          },
          lock: function() {
            return (u = C), t || f.disable(), this;
          },
          locked: function() {
            return !u;
          },
          fireWith: function(e, t) {
            return (
              (t = [e, (t = t || []).slice ? t.slice() : t]),
              !l || (n && !u) || (r ? u.push(t) : c(t)),
              this
            );
          },
          fire: function() {
            return f.fireWith(this, arguments), this;
          },
          fired: function() {
            return !!n;
          }
        };
      return f;
    }),
      ie.extend({
        Deferred: function(e) {
          var a = [
              ['resolve', 'done', ie.Callbacks('once memory'), 'resolved'],
              ['reject', 'fail', ie.Callbacks('once memory'), 'rejected'],
              ['notify', 'progress', ie.Callbacks('memory')]
            ],
            r = 'pending',
            s = {
              state: function() {
                return r;
              },
              always: function() {
                return l.done(arguments).fail(arguments), this;
              },
              then: function() {
                var o = arguments;
                return ie
                  .Deferred(function(r) {
                    ie.each(a, function(e, t) {
                      var n = t[0],
                        i = ie.isFunction(o[e]) && o[e];
                      l[t[1]](function() {
                        var e = i && i.apply(this, arguments);
                        e && ie.isFunction(e.promise)
                          ? e
                              .promise()
                              .done(r.resolve)
                              .fail(r.reject)
                              .progress(r.notify)
                          : r[n + 'With'](
                              this === s ? r.promise() : this,
                              i ? [e] : arguments
                            );
                      });
                    }),
                      (o = null);
                  })
                  .promise();
              },
              promise: function(e) {
                return null != e ? ie.extend(e, s) : s;
              }
            },
            l = {};
          return (
            (s.pipe = s.then),
            ie.each(a, function(e, t) {
              var n = t[2],
                i = t[3];
              (s[t[1]] = n.add),
                i &&
                  n.add(
                    function() {
                      r = i;
                    },
                    a[1 ^ e][2].disable,
                    a[2][2].lock
                  ),
                (l[t[0]] = function() {
                  return (
                    l[t[0] + 'With'](this === l ? s : this, arguments), this
                  );
                }),
                (l[t[0] + 'With'] = n.fireWith);
            }),
            s.promise(l),
            e && e.call(l, l),
            l
          );
        },
        when: function(e) {
          var r,
            t,
            n,
            i = 0,
            o = c.call(arguments),
            a = o.length,
            s = 1 !== a || (e && ie.isFunction(e.promise)) ? a : 0,
            l = 1 === s ? e : ie.Deferred(),
            u = function(t, n, i) {
              return function(e) {
                (n[t] = this),
                  (i[t] = 1 < arguments.length ? c.call(arguments) : e),
                  i === r ? l.notifyWith(n, i) : --s || l.resolveWith(n, i);
              };
            };
          if (1 < a)
            for (
              r = new Array(a), t = new Array(a), n = new Array(a);
              i < a;
              i++
            )
              o[i] && ie.isFunction(o[i].promise)
                ? o[i]
                    .promise()
                    .done(u(i, n, o))
                    .fail(l.reject)
                    .progress(u(i, t, r))
                : --s;
          return s || l.resolveWith(n, o), l.promise();
        }
      }),
      (ie.support = (function(o) {
        var e,
          t,
          n,
          i,
          r,
          a,
          s,
          l,
          u,
          c = g.createElement('div');
        if (
          (c.setAttribute('className', 't'),
          (c.innerHTML =
            "  <link/><table></table><a href='/a'>a</a><input type='checkbox'/>"),
          (e = c.getElementsByTagName('*') || []),
          !(t = c.getElementsByTagName('a')[0]) || !t.style || !e.length)
        )
          return o;
        (a = (i = g.createElement('select')).appendChild(
          g.createElement('option')
        )),
          (n = c.getElementsByTagName('input')[0]),
          (t.style.cssText = 'top:1px;float:left;opacity:.5'),
          (o.getSetAttribute = 't' !== c.className),
          (o.leadingWhitespace = 3 === c.firstChild.nodeType),
          (o.tbody = !c.getElementsByTagName('tbody').length),
          (o.htmlSerialize = !!c.getElementsByTagName('link').length),
          (o.style = /top/.test(t.getAttribute('style'))),
          (o.hrefNormalized = '/a' === t.getAttribute('href')),
          (o.opacity = /^0.5/.test(t.style.opacity)),
          (o.cssFloat = !!t.style.cssFloat),
          (o.checkOn = !!n.value),
          (o.optSelected = a.selected),
          (o.enctype = !!g.createElement('form').enctype),
          (o.html5Clone =
            '<:nav></:nav>' !== g.createElement('nav').cloneNode(!0).outerHTML),
          (o.inlineBlockNeedsLayout = !1),
          (o.shrinkWrapBlocks = !1),
          (o.pixelPosition = !1),
          (o.deleteExpando = !0),
          (o.noCloneEvent = !0),
          (o.reliableMarginRight = !0),
          (o.boxSizingReliable = !0),
          (n.checked = !0),
          (o.noCloneChecked = n.cloneNode(!0).checked),
          (i.disabled = !0),
          (o.optDisabled = !a.disabled);
        try {
          delete c.test;
        } catch (e) {
          o.deleteExpando = !1;
        }
        for (u in ((n = g.createElement('input')).setAttribute('value', ''),
        (o.input = '' === n.getAttribute('value')),
        (n.value = 't'),
        n.setAttribute('type', 'radio'),
        (o.radioValue = 't' === n.value),
        n.setAttribute('checked', 't'),
        n.setAttribute('name', 't'),
        (r = g.createDocumentFragment()).appendChild(n),
        (o.appendChecked = n.checked),
        (o.checkClone = r.cloneNode(!0).cloneNode(!0).lastChild.checked),
        c.attachEvent &&
          (c.attachEvent('onclick', function() {
            o.noCloneEvent = !1;
          }),
          c.cloneNode(!0).click()),
        {
          submit: !0,
          change: !0,
          focusin: !0
        }))
          c.setAttribute((s = 'on' + u), 't'),
            (o[u + 'Bubbles'] = s in h || !1 === c.attributes[s].expando);
        for (u in ((c.style.backgroundClip = 'content-box'),
        (c.cloneNode(!0).style.backgroundClip = ''),
        (o.clearCloneStyle = 'content-box' === c.style.backgroundClip),
        ie(o)))
          break;
        return (
          (o.ownLast = '0' !== u),
          ie(function() {
            var e,
              t,
              n,
              i =
                'padding:0;margin:0;border:0;display:block;box-sizing:content-box;-moz-box-sizing:content-box;-webkit-box-sizing:content-box;',
              r = g.getElementsByTagName('body')[0];
            r &&
              (((e = g.createElement('div')).style.cssText =
                'border:0;width:0;height:0;position:absolute;top:0;left:-9999px;margin-top:1px'),
              r.appendChild(e).appendChild(c),
              (c.innerHTML = '<table><tr><td></td><td>t</td></tr></table>'),
              ((n = c.getElementsByTagName('td'))[0].style.cssText =
                'padding:0;margin:0;border:0;display:none'),
              (l = 0 === n[0].offsetHeight),
              (n[0].style.display = ''),
              (n[1].style.display = 'none'),
              (o.reliableHiddenOffsets = l && 0 === n[0].offsetHeight),
              (c.innerHTML = ''),
              (c.style.cssText =
                'box-sizing:border-box;-moz-box-sizing:border-box;-webkit-box-sizing:border-box;padding:1px;border:1px;display:block;width:4px;margin-top:1%;position:absolute;top:1%;'),
              ie.swap(
                r,
                null != r.style.zoom
                  ? {
                      zoom: 1
                    }
                  : {},
                function() {
                  o.boxSizing = 4 === c.offsetWidth;
                }
              ),
              h.getComputedStyle &&
                ((o.pixelPosition =
                  '1%' !== (h.getComputedStyle(c, null) || {}).top),
                (o.boxSizingReliable =
                  '4px' ===
                  (
                    h.getComputedStyle(c, null) || {
                      width: '4px'
                    }
                  ).width),
                ((t = c.appendChild(
                  g.createElement('div')
                )).style.cssText = c.style.cssText = i),
                (t.style.marginRight = t.style.width = '0'),
                (c.style.width = '1px'),
                (o.reliableMarginRight = !parseFloat(
                  (h.getComputedStyle(t, null) || {}).marginRight
                ))),
              typeof c.style.zoom !== v &&
                ((c.innerHTML = ''),
                (c.style.cssText =
                  i + 'width:1px;padding:1px;display:inline;zoom:1'),
                (o.inlineBlockNeedsLayout = 3 === c.offsetWidth),
                (c.style.display = 'block'),
                (c.innerHTML = '<div></div>'),
                (c.firstChild.style.width = '5px'),
                (o.shrinkWrapBlocks = 3 !== c.offsetWidth),
                o.inlineBlockNeedsLayout && (r.style.zoom = 1)),
              r.removeChild(e),
              (e = c = n = t = null));
          }),
          (e = i = r = a = t = n = null),
          o
        );
      })({}));
    var j = /(?:\{[\s\S]*\}|\[[\s\S]*\])$/,
      _ = /([A-Z])/g;

    function internalData(e, t, n, i) {
      if (ie.acceptData(e)) {
        var r,
          o,
          a = ie.expando,
          s = e.nodeType,
          l = s ? ie.cache : e,
          u = s ? e[a] : e[a] && a;
        if ((u && l[u] && (i || l[u].data)) || n !== C || 'string' != typeof t)
          return (
            u || (u = s ? (e[a] = f.pop() || ie.guid++) : a),
            l[u] ||
              (l[u] = s
                ? {}
                : {
                    toJSON: ie.noop
                  }),
            ('object' != typeof t && 'function' != typeof t) ||
              (i
                ? (l[u] = ie.extend(l[u], t))
                : (l[u].data = ie.extend(l[u].data, t))),
            (o = l[u]),
            i || (o.data || (o.data = {}), (o = o.data)),
            n !== C && (o[ie.camelCase(t)] = n),
            'string' == typeof t
              ? null == (r = o[t]) && (r = o[ie.camelCase(t)])
              : (r = o),
            r
          );
      }
    }

    function internalRemoveData(e, t, n) {
      if (ie.acceptData(e)) {
        var i,
          r,
          o = e.nodeType,
          a = o ? ie.cache : e,
          s = o ? e[ie.expando] : ie.expando;
        if (a[s]) {
          if (t && (i = n ? a[s] : a[s].data)) {
            r = (t = ie.isArray(t)
              ? t.concat(ie.map(t, ie.camelCase))
              : t in i
              ? [t]
              : (t = ie.camelCase(t)) in i
              ? [t]
              : t.split(' ')).length;
            for (; r--; ) delete i[t[r]];
            if (n ? !isEmptyDataObject(i) : !ie.isEmptyObject(i)) return;
          }
          (n || (delete a[s].data, isEmptyDataObject(a[s]))) &&
            (o
              ? ie.cleanData([e], !0)
              : ie.support.deleteExpando || a != a.window
              ? delete a[s]
              : (a[s] = null));
        }
      }
    }

    function dataAttr(e, t, n) {
      if (n === C && 1 === e.nodeType) {
        var i = 'data-' + t.replace(_, '-$1').toLowerCase();
        if ('string' == typeof (n = e.getAttribute(i))) {
          try {
            n =
              'true' === n ||
              ('false' !== n &&
                ('null' === n
                  ? null
                  : +n + '' === n
                  ? +n
                  : j.test(n)
                  ? ie.parseJSON(n)
                  : n));
          } catch (e) {}
          ie.data(e, t, n);
        } else n = C;
      }
      return n;
    }

    function isEmptyDataObject(e) {
      var t;
      for (t in e)
        if (('data' !== t || !ie.isEmptyObject(e[t])) && 'toJSON' !== t)
          return !1;
      return !0;
    }
    ie.extend({
      cache: {},
      noData: {
        applet: !0,
        embed: !0,
        object: 'clsid:D27CDB6E-AE6D-11cf-96B8-444553540000'
      },
      hasData: function(e) {
        return (
          !!(e = e.nodeType ? ie.cache[e[ie.expando]] : e[ie.expando]) &&
          !isEmptyDataObject(e)
        );
      },
      data: function(e, t, n) {
        return internalData(e, t, n);
      },
      removeData: function(e, t) {
        return internalRemoveData(e, t);
      },
      _data: function(e, t, n) {
        return internalData(e, t, n, !0);
      },
      _removeData: function(e, t) {
        return internalRemoveData(e, t, !0);
      },
      acceptData: function(e) {
        if (e.nodeType && 1 !== e.nodeType && 9 !== e.nodeType) return !1;
        var t = e.nodeName && ie.noData[e.nodeName.toLowerCase()];
        return !t || (!0 !== t && e.getAttribute('classid') === t);
      }
    }),
      ie.fn.extend({
        data: function(e, t) {
          var n,
            i,
            r = null,
            o = 0,
            a = this[0];
          if (e !== C)
            return 'object' == typeof e
              ? this.each(function() {
                  ie.data(this, e);
                })
              : 1 < arguments.length
              ? this.each(function() {
                  ie.data(this, e, t);
                })
              : a
              ? dataAttr(a, e, ie.data(a, e))
              : null;
          if (
            this.length &&
            ((r = ie.data(a)), 1 === a.nodeType && !ie._data(a, 'parsedAttrs'))
          ) {
            for (n = a.attributes; o < n.length; o++)
              0 === (i = n[o].name).indexOf('data-') &&
                dataAttr(a, (i = ie.camelCase(i.slice(5))), r[i]);
            ie._data(a, 'parsedAttrs', !0);
          }
          return r;
        },
        removeData: function(e) {
          return this.each(function() {
            ie.removeData(this, e);
          });
        }
      }),
      ie.extend({
        queue: function(e, t, n) {
          var i;
          if (e)
            return (
              (t = (t || 'fx') + 'queue'),
              (i = ie._data(e, t)),
              n &&
                (!i || ie.isArray(n)
                  ? (i = ie._data(e, t, ie.makeArray(n)))
                  : i.push(n)),
              i || []
            );
        },
        dequeue: function(e, t) {
          t = t || 'fx';
          var n = ie.queue(e, t),
            i = n.length,
            r = n.shift(),
            o = ie._queueHooks(e, t);
          'inprogress' === r && ((r = n.shift()), i--),
            r &&
              ('fx' === t && n.unshift('inprogress'),
              delete o.stop,
              r.call(
                e,
                function() {
                  ie.dequeue(e, t);
                },
                o
              )),
            !i && o && o.empty.fire();
        },
        _queueHooks: function(e, t) {
          var n = t + 'queueHooks';
          return (
            ie._data(e, n) ||
            ie._data(e, n, {
              empty: ie.Callbacks('once memory').add(function() {
                ie._removeData(e, t + 'queue'), ie._removeData(e, n);
              })
            })
          );
        }
      }),
      ie.fn.extend({
        queue: function(t, n) {
          var e = 2;
          return (
            'string' != typeof t && ((n = t), (t = 'fx'), e--),
            arguments.length < e
              ? ie.queue(this[0], t)
              : n === C
              ? this
              : this.each(function() {
                  var e = ie.queue(this, t, n);
                  ie._queueHooks(this, t),
                    'fx' === t && 'inprogress' !== e[0] && ie.dequeue(this, t);
                })
          );
        },
        dequeue: function(e) {
          return this.each(function() {
            ie.dequeue(this, e);
          });
        },
        delay: function(i, e) {
          return (
            (i = (ie.fx && ie.fx.speeds[i]) || i),
            (e = e || 'fx'),
            this.queue(e, function(e, t) {
              var n = setTimeout(e, i);
              t.stop = function() {
                clearTimeout(n);
              };
            })
          );
        },
        clearQueue: function(e) {
          return this.queue(e || 'fx', []);
        },
        promise: function(e, t) {
          var n,
            i = 1,
            r = ie.Deferred(),
            o = this,
            a = this.length,
            s = function() {
              --i || r.resolveWith(o, [o]);
            };
          for ('string' != typeof e && ((t = e), (e = C)), e = e || 'fx'; a--; )
            (n = ie._data(o[a], e + 'queueHooks')) &&
              n.empty &&
              (i++, n.empty.add(s));
          return s(), r.promise(t);
        }
      });
    var F,
      R,
      B = /[\t\r\n\f]/g,
      z = /\r/g,
      I = /^(?:input|select|textarea|button|object)$/i,
      W = /^(?:a|area)$/i,
      q = /^(?:checked|selected)$/i,
      $ = ie.support.getSetAttribute,
      U = ie.support.input;
    ie.fn.extend({
      attr: function(e, t) {
        return ie.access(this, ie.attr, e, t, 1 < arguments.length);
      },
      removeAttr: function(e) {
        return this.each(function() {
          ie.removeAttr(this, e);
        });
      },
      prop: function(e, t) {
        return ie.access(this, ie.prop, e, t, 1 < arguments.length);
      },
      removeProp: function(e) {
        return (
          (e = ie.propFix[e] || e),
          this.each(function() {
            try {
              (this[e] = C), delete this[e];
            } catch (e) {}
          })
        );
      },
      addClass: function(t) {
        var e,
          n,
          i,
          r,
          o,
          a = 0,
          s = this.length,
          l = 'string' == typeof t && t;
        if (ie.isFunction(t))
          return this.each(function(e) {
            ie(this).addClass(t.call(this, e, this.className));
          });
        if (l)
          for (e = (t || '').match(S) || []; a < s; a++)
            if (
              (i =
                1 === (n = this[a]).nodeType &&
                (n.className ? (' ' + n.className + ' ').replace(B, ' ') : ' '))
            ) {
              for (o = 0; (r = e[o++]); )
                i.indexOf(' ' + r + ' ') < 0 && (i += r + ' ');
              n.className = ie.trim(i);
            }
        return this;
      },
      removeClass: function(t) {
        var e,
          n,
          i,
          r,
          o,
          a = 0,
          s = this.length,
          l = 0 === arguments.length || ('string' == typeof t && t);
        if (ie.isFunction(t))
          return this.each(function(e) {
            ie(this).removeClass(t.call(this, e, this.className));
          });
        if (l)
          for (e = (t || '').match(S) || []; a < s; a++)
            if (
              (i =
                1 === (n = this[a]).nodeType &&
                (n.className ? (' ' + n.className + ' ').replace(B, ' ') : ''))
            ) {
              for (o = 0; (r = e[o++]); )
                for (; 0 <= i.indexOf(' ' + r + ' '); )
                  i = i.replace(' ' + r + ' ', ' ');
              n.className = t ? ie.trim(i) : '';
            }
        return this;
      },
      toggleClass: function(o, a) {
        var s = typeof o,
          l = 'boolean' == typeof a;
        return ie.isFunction(o)
          ? this.each(function(e) {
              ie(this).toggleClass(o.call(this, e, this.className, a), a);
            })
          : this.each(function() {
              if ('string' === s)
                for (
                  var e, t = 0, n = ie(this), i = a, r = o.match(S) || [];
                  (e = r[t++]);

                )
                  (i = l ? i : !n.hasClass(e)),
                    n[i ? 'addClass' : 'removeClass'](e);
              else
                (s !== v && 'boolean' !== s) ||
                  (this.className &&
                    ie._data(this, '__className__', this.className),
                  (this.className =
                    this.className || !1 === o
                      ? ''
                      : ie._data(this, '__className__') || ''));
            });
      },
      hasClass: function(e) {
        for (var t = ' ' + e + ' ', n = 0, i = this.length; n < i; n++)
          if (
            1 === this[n].nodeType &&
            0 <= (' ' + this[n].className + ' ').replace(B, ' ').indexOf(t)
          )
            return !0;
        return !1;
      },
      val: function(n) {
        var e,
          i,
          r,
          t = this[0];
        return arguments.length
          ? ((r = ie.isFunction(n)),
            this.each(function(e) {
              var t;
              1 === this.nodeType &&
                (null == (t = r ? n.call(this, e, ie(this).val()) : n)
                  ? (t = '')
                  : 'number' == typeof t
                  ? (t += '')
                  : ie.isArray(t) &&
                    (t = ie.map(t, function(e) {
                      return null == e ? '' : e + '';
                    })),
                ((i =
                  ie.valHooks[this.type] ||
                  ie.valHooks[this.nodeName.toLowerCase()]) &&
                  'set' in i &&
                  i.set(this, t, 'value') !== C) ||
                  (this.value = t));
            }))
          : t
          ? (i =
              ie.valHooks[t.type] || ie.valHooks[t.nodeName.toLowerCase()]) &&
            'get' in i &&
            (e = i.get(t, 'value')) !== C
            ? e
            : 'string' == typeof (e = t.value)
            ? e.replace(z, '')
            : null == e
            ? ''
            : e
          : void 0;
      }
    }),
      ie.extend({
        valHooks: {
          option: {
            get: function(e) {
              var t = ie.find.attr(e, 'value');
              return null != t ? t : e.text;
            }
          },
          select: {
            get: function(e) {
              for (
                var t,
                  n,
                  i = e.options,
                  r = e.selectedIndex,
                  o = 'select-one' === e.type || r < 0,
                  a = o ? null : [],
                  s = o ? r + 1 : i.length,
                  l = r < 0 ? s : o ? r : 0;
                l < s;
                l++
              )
                if (
                  ((n = i[l]).selected || l === r) &&
                  (ie.support.optDisabled
                    ? !n.disabled
                    : null === n.getAttribute('disabled')) &&
                  (!n.parentNode.disabled ||
                    !ie.nodeName(n.parentNode, 'optgroup'))
                ) {
                  if (((t = ie(n).val()), o)) return t;
                  a.push(t);
                }
              return a;
            },
            set: function(e, t) {
              for (
                var n, i, r = e.options, o = ie.makeArray(t), a = r.length;
                a--;

              )
                ((i = r[a]).selected = 0 <= ie.inArray(ie(i).val(), o)) &&
                  (n = !0);
              return n || (e.selectedIndex = -1), o;
            }
          }
        },
        attr: function(e, t, n) {
          var i,
            r,
            o = e.nodeType;
          if (e && 3 !== o && 8 !== o && 2 !== o)
            return typeof e.getAttribute === v
              ? ie.prop(e, t, n)
              : ((1 === o && ie.isXMLDoc(e)) ||
                  ((t = t.toLowerCase()),
                  (i =
                    ie.attrHooks[t] || (ie.expr.match.bool.test(t) ? R : F))),
                n === C
                  ? i && 'get' in i && null !== (r = i.get(e, t))
                    ? r
                    : null == (r = ie.find.attr(e, t))
                    ? C
                    : r
                  : null !== n
                  ? i && 'set' in i && (r = i.set(e, n, t)) !== C
                    ? r
                    : (e.setAttribute(t, n + ''), n)
                  : void ie.removeAttr(e, t));
        },
        removeAttr: function(e, t) {
          var n,
            i,
            r = 0,
            o = t && t.match(S);
          if (o && 1 === e.nodeType)
            for (; (n = o[r++]); )
              (i = ie.propFix[n] || n),
                ie.expr.match.bool.test(n)
                  ? (U && $) || !q.test(n)
                    ? (e[i] = !1)
                    : (e[ie.camelCase('default-' + n)] = e[i] = !1)
                  : ie.attr(e, n, ''),
                e.removeAttribute($ ? n : i);
        },
        attrHooks: {
          type: {
            set: function(e, t) {
              if (
                !ie.support.radioValue &&
                'radio' === t &&
                ie.nodeName(e, 'input')
              ) {
                var n = e.value;
                return e.setAttribute('type', t), n && (e.value = n), t;
              }
            }
          }
        },
        propFix: {
          for: 'htmlFor',
          class: 'className'
        },
        prop: function(e, t, n) {
          var i,
            r,
            o = e.nodeType;
          if (e && 3 !== o && 8 !== o && 2 !== o)
            return (
              (1 !== o || !ie.isXMLDoc(e)) &&
                ((t = ie.propFix[t] || t), (r = ie.propHooks[t])),
              n !== C
                ? r && 'set' in r && (i = r.set(e, n, t)) !== C
                  ? i
                  : (e[t] = n)
                : r && 'get' in r && null !== (i = r.get(e, t))
                ? i
                : e[t]
            );
        },
        propHooks: {
          tabIndex: {
            get: function(e) {
              var t = ie.find.attr(e, 'tabindex');
              return t
                ? parseInt(t, 10)
                : I.test(e.nodeName) || (W.test(e.nodeName) && e.href)
                ? 0
                : -1;
            }
          }
        }
      }),
      (R = {
        set: function(e, t, n) {
          return (
            !1 === t
              ? ie.removeAttr(e, n)
              : (U && $) || !q.test(n)
              ? e.setAttribute((!$ && ie.propFix[n]) || n, n)
              : (e[ie.camelCase('default-' + n)] = e[n] = !0),
            n
          );
        }
      }),
      ie.each(ie.expr.match.bool.source.match(/\w+/g), function(e, t) {
        var o = ie.expr.attrHandle[t] || ie.find.attr;
        ie.expr.attrHandle[t] =
          (U && $) || !q.test(t)
            ? function(e, t, n) {
                var i = ie.expr.attrHandle[t],
                  r = n
                    ? C
                    : (ie.expr.attrHandle[t] = C) != o(e, t, n)
                    ? t.toLowerCase()
                    : null;
                return (ie.expr.attrHandle[t] = i), r;
              }
            : function(e, t, n) {
                return n
                  ? C
                  : e[ie.camelCase('default-' + t)]
                  ? t.toLowerCase()
                  : null;
              };
      }),
      (U && $) ||
        (ie.attrHooks.value = {
          set: function(e, t, n) {
            if (!ie.nodeName(e, 'input')) return F && F.set(e, t, n);
            e.defaultValue = t;
          }
        }),
      $ ||
        ((F = {
          set: function(e, t, n) {
            var i = e.getAttributeNode(n);
            return (
              i || e.setAttributeNode((i = e.ownerDocument.createAttribute(n))),
              (i.value = t += ''),
              'value' === n || t === e.getAttribute(n) ? t : C
            );
          }
        }),
        (ie.expr.attrHandle.id = ie.expr.attrHandle.name = ie.expr.attrHandle.coords = function(
          e,
          t,
          n
        ) {
          var i;
          return n
            ? C
            : (i = e.getAttributeNode(t)) && '' !== i.value
            ? i.value
            : null;
        }),
        (ie.valHooks.button = {
          get: function(e, t) {
            var n = e.getAttributeNode(t);
            return n && n.specified ? n.value : C;
          },
          set: F.set
        }),
        (ie.attrHooks.contenteditable = {
          set: function(e, t, n) {
            F.set(e, '' !== t && t, n);
          }
        }),
        ie.each(['width', 'height'], function(e, n) {
          ie.attrHooks[n] = {
            set: function(e, t) {
              if ('' === t) return e.setAttribute(n, 'auto'), t;
            }
          };
        })),
      ie.support.hrefNormalized ||
        ie.each(['href', 'src'], function(e, t) {
          ie.propHooks[t] = {
            get: function(e) {
              return e.getAttribute(t, 4);
            }
          };
        }),
      ie.support.style ||
        (ie.attrHooks.style = {
          get: function(e) {
            return e.style.cssText || C;
          },
          set: function(e, t) {
            return (e.style.cssText = t + '');
          }
        }),
      ie.support.optSelected ||
        (ie.propHooks.selected = {
          get: function(e) {
            var t = e.parentNode;
            if (t) {
              t.selectedIndex;
              t.parentNode && t.parentNode.selectedIndex;
            }
            return null;
          }
        }),
      ie.each(
        [
          'tabIndex',
          'readOnly',
          'maxLength',
          'cellSpacing',
          'cellPadding',
          'rowSpan',
          'colSpan',
          'useMap',
          'frameBorder',
          'contentEditable'
        ],
        function() {
          ie.propFix[this.toLowerCase()] = this;
        }
      ),
      ie.support.enctype || (ie.propFix.enctype = 'encoding'),
      ie.each(['radio', 'checkbox'], function() {
        (ie.valHooks[this] = {
          set: function(e, t) {
            if (ie.isArray(t))
              return (e.checked = 0 <= ie.inArray(ie(e).val(), t));
          }
        }),
          ie.support.checkOn ||
            (ie.valHooks[this].get = function(e) {
              return null === e.getAttribute('value') ? 'on' : e.value;
            });
      });
    var V = /^(?:input|select|textarea)$/i,
      X = /^key/,
      J = /^(?:mouse|contextmenu)|click/,
      G = /^(?:focusinfocus|focusoutblur)$/,
      K = /^([^.]*)(?:\.(.+)|)$/;

    function returnTrue() {
      return !0;
    }

    function returnFalse() {
      return !1;
    }

    function safeActiveElement() {
      try {
        return g.activeElement;
      } catch (e) {}
    }
    (ie.event = {
      global: {},
      add: function(e, t, n, i, r) {
        var o,
          a,
          s,
          l,
          u,
          c,
          f,
          d,
          p,
          h,
          g,
          m = ie._data(e);
        if (m) {
          for (
            n.handler && ((n = (l = n).handler), (r = l.selector)),
              n.guid || (n.guid = ie.guid++),
              (a = m.events) || (a = m.events = {}),
              (c = m.handle) ||
                ((c = m.handle = function(e) {
                  return typeof ie === v || (e && ie.event.triggered === e.type)
                    ? C
                    : ie.event.dispatch.apply(c.elem, arguments);
                }).elem = e),
              s = (t = (t || '').match(S) || ['']).length;
            s--;

          )
            (p = g = (o = K.exec(t[s]) || [])[1]),
              (h = (o[2] || '').split('.').sort()),
              p &&
                ((u = ie.event.special[p] || {}),
                (p = (r ? u.delegateType : u.bindType) || p),
                (u = ie.event.special[p] || {}),
                (f = ie.extend(
                  {
                    type: p,
                    origType: g,
                    data: i,
                    handler: n,
                    guid: n.guid,
                    selector: r,
                    needsContext: r && ie.expr.match.needsContext.test(r),
                    namespace: h.join('.')
                  },
                  l
                )),
                (d = a[p]) ||
                  (((d = a[p] = []).delegateCount = 0),
                  (u.setup && !1 !== u.setup.call(e, i, h, c)) ||
                    (e.addEventListener
                      ? e.addEventListener(p, c, !1)
                      : e.attachEvent && e.attachEvent('on' + p, c))),
                u.add &&
                  (u.add.call(e, f),
                  f.handler.guid || (f.handler.guid = n.guid)),
                r ? d.splice(d.delegateCount++, 0, f) : d.push(f),
                (ie.event.global[p] = !0));
          e = null;
        }
      },
      remove: function(e, t, n, i, r) {
        var o,
          a,
          s,
          l,
          u,
          c,
          f,
          d,
          p,
          h,
          g,
          m = ie.hasData(e) && ie._data(e);
        if (m && (c = m.events)) {
          for (u = (t = (t || '').match(S) || ['']).length; u--; )
            if (
              ((p = g = (s = K.exec(t[u]) || [])[1]),
              (h = (s[2] || '').split('.').sort()),
              p)
            ) {
              for (
                f = ie.event.special[p] || {},
                  d = c[(p = (i ? f.delegateType : f.bindType) || p)] || [],
                  s =
                    s[2] &&
                    new RegExp('(^|\\.)' + h.join('\\.(?:.*\\.|)') + '(\\.|$)'),
                  l = o = d.length;
                o--;

              )
                (a = d[o]),
                  (!r && g !== a.origType) ||
                    (n && n.guid !== a.guid) ||
                    (s && !s.test(a.namespace)) ||
                    (i && i !== a.selector && ('**' !== i || !a.selector)) ||
                    (d.splice(o, 1),
                    a.selector && d.delegateCount--,
                    f.remove && f.remove.call(e, a));
              l &&
                !d.length &&
                ((f.teardown && !1 !== f.teardown.call(e, h, m.handle)) ||
                  ie.removeEvent(e, p, m.handle),
                delete c[p]);
            } else for (p in c) ie.event.remove(e, p + t[u], n, i, !0);
          ie.isEmptyObject(c) && (delete m.handle, ie._removeData(e, 'events'));
        }
      },
      trigger: function(e, t, n, i) {
        var r,
          o,
          a,
          s,
          l,
          u,
          c,
          f = [n || g],
          d = y.call(e, 'type') ? e.type : e,
          p = y.call(e, 'namespace') ? e.namespace.split('.') : [];
        if (
          ((a = u = n = n || g),
          3 !== n.nodeType &&
            8 !== n.nodeType &&
            !G.test(d + ie.event.triggered) &&
            (0 <= d.indexOf('.') &&
              ((d = (p = d.split('.')).shift()), p.sort()),
            (o = d.indexOf(':') < 0 && 'on' + d),
            ((e = e[ie.expando]
              ? e
              : new ie.Event(d, 'object' == typeof e && e)).isTrigger = i
              ? 2
              : 3),
            (e.namespace = p.join('.')),
            (e.namespace_re = e.namespace
              ? new RegExp('(^|\\.)' + p.join('\\.(?:.*\\.|)') + '(\\.|$)')
              : null),
            (e.result = C),
            e.target || (e.target = n),
            (t = null == t ? [e] : ie.makeArray(t, [e])),
            (l = ie.event.special[d] || {}),
            i || !l.trigger || !1 !== l.trigger.apply(n, t)))
        ) {
          if (!i && !l.noBubble && !ie.isWindow(n)) {
            for (
              s = l.delegateType || d, G.test(s + d) || (a = a.parentNode);
              a;
              a = a.parentNode
            )
              f.push(a), (u = a);
            u === (n.ownerDocument || g) &&
              f.push(u.defaultView || u.parentWindow || h);
          }
          for (c = 0; (a = f[c++]) && !e.isPropagationStopped(); )
            (e.type = 1 < c ? s : l.bindType || d),
              (r =
                (ie._data(a, 'events') || {})[e.type] &&
                ie._data(a, 'handle')) && r.apply(a, t),
              (r = o && a[o]) &&
                ie.acceptData(a) &&
                r.apply &&
                !1 === r.apply(a, t) &&
                e.preventDefault();
          if (
            ((e.type = d),
            !i &&
              !e.isDefaultPrevented() &&
              (!l._default || !1 === l._default.apply(f.pop(), t)) &&
              ie.acceptData(n) &&
              o &&
              n[d] &&
              !ie.isWindow(n))
          ) {
            (u = n[o]) && (n[o] = null), (ie.event.triggered = d);
            try {
              n[d]();
            } catch (e) {}
            (ie.event.triggered = C), u && (n[o] = u);
          }
          return e.result;
        }
      },
      dispatch: function(e) {
        e = ie.event.fix(e);
        var t,
          n,
          i,
          r,
          o,
          a,
          s = c.call(arguments),
          l = (ie._data(this, 'events') || {})[e.type] || [],
          u = ie.event.special[e.type] || {};
        if (
          (((s[0] = e).delegateTarget = this),
          !u.preDispatch || !1 !== u.preDispatch.call(this, e))
        ) {
          for (
            a = ie.event.handlers.call(this, e, l), t = 0;
            (r = a[t++]) && !e.isPropagationStopped();

          )
            for (
              e.currentTarget = r.elem, o = 0;
              (i = r.handlers[o++]) && !e.isImmediatePropagationStopped();

            )
              (e.namespace_re && !e.namespace_re.test(i.namespace)) ||
                ((e.handleObj = i),
                (e.data = i.data),
                (n = (
                  (ie.event.special[i.origType] || {}).handle || i.handler
                ).apply(r.elem, s)) !== C &&
                  !1 === (e.result = n) &&
                  (e.preventDefault(), e.stopPropagation()));
          return u.postDispatch && u.postDispatch.call(this, e), e.result;
        }
      },
      handlers: function(e, t) {
        var n,
          i,
          r,
          o,
          a = [],
          s = t.delegateCount,
          l = e.target;
        if (s && l.nodeType && (!e.button || 'click' !== e.type))
          for (; l != this; l = l.parentNode || this)
            if (1 === l.nodeType && (!0 !== l.disabled || 'click' !== e.type)) {
              for (r = [], o = 0; o < s; o++)
                r[(n = (i = t[o]).selector + ' ')] === C &&
                  (r[n] = i.needsContext
                    ? 0 <= ie(n, this).index(l)
                    : ie.find(n, this, null, [l]).length),
                  r[n] && r.push(i);
              r.length &&
                a.push({
                  elem: l,
                  handlers: r
                });
            }
        return (
          s < t.length &&
            a.push({
              elem: this,
              handlers: t.slice(s)
            }),
          a
        );
      },
      fix: function(e) {
        if (e[ie.expando]) return e;
        var t,
          n,
          i,
          r = e.type,
          o = e,
          a = this.fixHooks[r];
        for (
          a ||
            (this.fixHooks[r] = a = J.test(r)
              ? this.mouseHooks
              : X.test(r)
              ? this.keyHooks
              : {}),
            i = a.props ? this.props.concat(a.props) : this.props,
            e = new ie.Event(o),
            t = i.length;
          t--;

        )
          e[(n = i[t])] = o[n];
        return (
          e.target || (e.target = o.srcElement || g),
          3 === e.target.nodeType && (e.target = e.target.parentNode),
          (e.metaKey = !!e.metaKey),
          a.filter ? a.filter(e, o) : e
        );
      },
      props: 'altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which'.split(
        ' '
      ),
      fixHooks: {},
      keyHooks: {
        props: 'char charCode key keyCode'.split(' '),
        filter: function(e, t) {
          return (
            null == e.which &&
              (e.which = null != t.charCode ? t.charCode : t.keyCode),
            e
          );
        }
      },
      mouseHooks: {
        props: 'button buttons clientX clientY fromElement offsetX offsetY pageX pageY screenX screenY toElement'.split(
          ' '
        ),
        filter: function(e, t) {
          var n,
            i,
            r,
            o = t.button,
            a = t.fromElement;
          return (
            null == e.pageX &&
              null != t.clientX &&
              ((r = (i = e.target.ownerDocument || g).documentElement),
              (n = i.body),
              (e.pageX =
                t.clientX +
                ((r && r.scrollLeft) || (n && n.scrollLeft) || 0) -
                ((r && r.clientLeft) || (n && n.clientLeft) || 0)),
              (e.pageY =
                t.clientY +
                ((r && r.scrollTop) || (n && n.scrollTop) || 0) -
                ((r && r.clientTop) || (n && n.clientTop) || 0))),
            !e.relatedTarget &&
              a &&
              (e.relatedTarget = a === e.target ? t.toElement : a),
            e.which ||
              o === C ||
              (e.which = 1 & o ? 1 : 2 & o ? 3 : 4 & o ? 2 : 0),
            e
          );
        }
      },
      special: {
        load: {
          noBubble: !0
        },
        focus: {
          trigger: function() {
            if (this !== safeActiveElement() && this.focus)
              try {
                return this.focus(), !1;
              } catch (e) {}
          },
          delegateType: 'focusin'
        },
        blur: {
          trigger: function() {
            if (this === safeActiveElement() && this.blur)
              return this.blur(), !1;
          },
          delegateType: 'focusout'
        },
        click: {
          trigger: function() {
            if (
              ie.nodeName(this, 'input') &&
              'checkbox' === this.type &&
              this.click
            )
              return this.click(), !1;
          },
          _default: function(e) {
            return ie.nodeName(e.target, 'a');
          }
        },
        beforeunload: {
          postDispatch: function(e) {
            e.result !== C && (e.originalEvent.returnValue = e.result);
          }
        }
      },
      simulate: function(e, t, n, i) {
        var r = ie.extend(new ie.Event(), n, {
          type: e,
          isSimulated: !0,
          originalEvent: {}
        });
        i ? ie.event.trigger(r, null, t) : ie.event.dispatch.call(t, r),
          r.isDefaultPrevented() && n.preventDefault();
      }
    }),
      (ie.removeEvent = g.removeEventListener
        ? function(e, t, n) {
            e.removeEventListener && e.removeEventListener(t, n, !1);
          }
        : function(e, t, n) {
            var i = 'on' + t;
            e.detachEvent &&
              (typeof e[i] === v && (e[i] = null), e.detachEvent(i, n));
          }),
      (ie.Event = function(e, t) {
        if (!(this instanceof ie.Event)) return new ie.Event(e, t);
        e && e.type
          ? ((this.originalEvent = e),
            (this.type = e.type),
            (this.isDefaultPrevented =
              e.defaultPrevented ||
              !1 === e.returnValue ||
              (e.getPreventDefault && e.getPreventDefault())
                ? returnTrue
                : returnFalse))
          : (this.type = e),
          t && ie.extend(this, t),
          (this.timeStamp = (e && e.timeStamp) || ie.now()),
          (this[ie.expando] = !0);
      }),
      (ie.Event.prototype = {
        isDefaultPrevented: returnFalse,
        isPropagationStopped: returnFalse,
        isImmediatePropagationStopped: returnFalse,
        preventDefault: function() {
          var e = this.originalEvent;
          (this.isDefaultPrevented = returnTrue),
            e && (e.preventDefault ? e.preventDefault() : (e.returnValue = !1));
        },
        stopPropagation: function() {
          var e = this.originalEvent;
          (this.isPropagationStopped = returnTrue),
            e &&
              (e.stopPropagation && e.stopPropagation(), (e.cancelBubble = !0));
        },
        stopImmediatePropagation: function() {
          (this.isImmediatePropagationStopped = returnTrue),
            this.stopPropagation();
        }
      }),
      ie.each(
        {
          mouseenter: 'mouseover',
          mouseleave: 'mouseout'
        },
        function(e, r) {
          ie.event.special[e] = {
            delegateType: r,
            bindType: r,
            handle: function(e) {
              var t,
                n = e.relatedTarget,
                i = e.handleObj;
              return (
                (n && (n === this || ie.contains(this, n))) ||
                  ((e.type = i.origType),
                  (t = i.handler.apply(this, arguments)),
                  (e.type = r)),
                t
              );
            }
          };
        }
      ),
      ie.support.submitBubbles ||
        (ie.event.special.submit = {
          setup: function() {
            if (ie.nodeName(this, 'form')) return !1;
            ie.event.add(this, 'click._submit keypress._submit', function(e) {
              var t = e.target,
                n =
                  ie.nodeName(t, 'input') || ie.nodeName(t, 'button')
                    ? t.form
                    : C;
              n &&
                !ie._data(n, 'submitBubbles') &&
                (ie.event.add(n, 'submit._submit', function(e) {
                  e._submit_bubble = !0;
                }),
                ie._data(n, 'submitBubbles', !0));
            });
          },
          postDispatch: function(e) {
            e._submit_bubble &&
              (delete e._submit_bubble,
              this.parentNode &&
                !e.isTrigger &&
                ie.event.simulate('submit', this.parentNode, e, !0));
          },
          teardown: function() {
            if (ie.nodeName(this, 'form')) return !1;
            ie.event.remove(this, '._submit');
          }
        }),
      ie.support.changeBubbles ||
        (ie.event.special.change = {
          setup: function() {
            if (V.test(this.nodeName))
              return (
                ('checkbox' !== this.type && 'radio' !== this.type) ||
                  (ie.event.add(this, 'propertychange._change', function(e) {
                    'checked' === e.originalEvent.propertyName &&
                      (this._just_changed = !0);
                  }),
                  ie.event.add(this, 'click._change', function(e) {
                    this._just_changed &&
                      !e.isTrigger &&
                      (this._just_changed = !1),
                      ie.event.simulate('change', this, e, !0);
                  })),
                !1
              );
            ie.event.add(this, 'beforeactivate._change', function(e) {
              var t = e.target;
              V.test(t.nodeName) &&
                !ie._data(t, 'changeBubbles') &&
                (ie.event.add(t, 'change._change', function(e) {
                  !this.parentNode ||
                    e.isSimulated ||
                    e.isTrigger ||
                    ie.event.simulate('change', this.parentNode, e, !0);
                }),
                ie._data(t, 'changeBubbles', !0));
            });
          },
          handle: function(e) {
            var t = e.target;
            if (
              this !== t ||
              e.isSimulated ||
              e.isTrigger ||
              ('radio' !== t.type && 'checkbox' !== t.type)
            )
              return e.handleObj.handler.apply(this, arguments);
          },
          teardown: function() {
            return ie.event.remove(this, '._change'), !V.test(this.nodeName);
          }
        }),
      ie.support.focusinBubbles ||
        ie.each(
          {
            focus: 'focusin',
            blur: 'focusout'
          },
          function(e, t) {
            var n = 0,
              i = function(e) {
                ie.event.simulate(t, e.target, ie.event.fix(e), !0);
              };
            ie.event.special[t] = {
              setup: function() {
                0 == n++ && g.addEventListener(e, i, !0);
              },
              teardown: function() {
                0 == --n && g.removeEventListener(e, i, !0);
              }
            };
          }
        ),
      ie.fn.extend({
        on: function(e, t, n, i, r) {
          var o, a;
          if ('object' == typeof e) {
            for (o in ('string' != typeof t && ((n = n || t), (t = C)), e))
              this.on(o, t, n, e[o], r);
            return this;
          }
          if (
            (null == n && null == i
              ? ((i = t), (n = t = C))
              : null == i &&
                ('string' == typeof t
                  ? ((i = n), (n = C))
                  : ((i = n), (n = t), (t = C))),
            !1 === i)
          )
            i = returnFalse;
          else if (!i) return this;
          return (
            1 === r &&
              ((a = i),
              ((i = function(e) {
                return ie().off(e), a.apply(this, arguments);
              }).guid = a.guid || (a.guid = ie.guid++))),
            this.each(function() {
              ie.event.add(this, e, i, n, t);
            })
          );
        },
        one: function(e, t, n, i) {
          return this.on(e, t, n, i, 1);
        },
        off: function(e, t, n) {
          var i, r;
          if (e && e.preventDefault && e.handleObj)
            return (
              (i = e.handleObj),
              ie(e.delegateTarget).off(
                i.namespace ? i.origType + '.' + i.namespace : i.origType,
                i.selector,
                i.handler
              ),
              this
            );
          if ('object' != typeof e)
            return (
              (!1 !== t && 'function' != typeof t) || ((n = t), (t = C)),
              !1 === n && (n = returnFalse),
              this.each(function() {
                ie.event.remove(this, e, n, t);
              })
            );
          for (r in e) this.off(r, t, e[r]);
          return this;
        },
        trigger: function(e, t) {
          return this.each(function() {
            ie.event.trigger(e, t, this);
          });
        },
        triggerHandler: function(e, t) {
          var n = this[0];
          if (n) return ie.event.trigger(e, t, n, !0);
        }
      });
    var Y = /^.[^:#\[\.,]*$/,
      Z = /^(?:parents|prev(?:Until|All))/,
      Q = ie.expr.match.needsContext,
      ee = {
        children: !0,
        contents: !0,
        next: !0,
        prev: !0
      };

    function sibling(e, t) {
      for (; (e = e[t]) && 1 !== e.nodeType; );
      return e;
    }

    function winnow(e, n, i) {
      if (ie.isFunction(n))
        return ie.grep(e, function(e, t) {
          return !!n.call(e, t, e) !== i;
        });
      if (n.nodeType)
        return ie.grep(e, function(e) {
          return (e === n) !== i;
        });
      if ('string' == typeof n) {
        if (Y.test(n)) return ie.filter(n, e, i);
        n = ie.filter(n, e);
      }
      return ie.grep(e, function(e) {
        return 0 <= ie.inArray(e, n) !== i;
      });
    }

    function createSafeFragment(e) {
      var t = te.split('|'),
        n = e.createDocumentFragment();
      if (n.createElement) for (; t.length; ) n.createElement(t.pop());
      return n;
    }
    ie.fn.extend({
      find: function(e) {
        var t,
          n = [],
          i = this,
          r = i.length;
        if ('string' != typeof e)
          return this.pushStack(
            ie(e).filter(function() {
              for (t = 0; t < r; t++) if (ie.contains(i[t], this)) return !0;
            })
          );
        for (t = 0; t < r; t++) ie.find(e, i[t], n);
        return (
          ((n = this.pushStack(1 < r ? ie.unique(n) : n)).selector = this
            .selector
            ? this.selector + ' ' + e
            : e),
          n
        );
      },
      has: function(e) {
        var t,
          n = ie(e, this),
          i = n.length;
        return this.filter(function() {
          for (t = 0; t < i; t++) if (ie.contains(this, n[t])) return !0;
        });
      },
      not: function(e) {
        return this.pushStack(winnow(this, e || [], !0));
      },
      filter: function(e) {
        return this.pushStack(winnow(this, e || [], !1));
      },
      is: function(e) {
        return !!winnow(
          this,
          'string' == typeof e && Q.test(e) ? ie(e) : e || [],
          !1
        ).length;
      },
      closest: function(e, t) {
        for (
          var n,
            i = 0,
            r = this.length,
            o = [],
            a =
              Q.test(e) || 'string' != typeof e ? ie(e, t || this.context) : 0;
          i < r;
          i++
        )
          for (n = this[i]; n && n !== t; n = n.parentNode)
            if (
              n.nodeType < 11 &&
              (a
                ? -1 < a.index(n)
                : 1 === n.nodeType && ie.find.matchesSelector(n, e))
            ) {
              n = o.push(n);
              break;
            }
        return this.pushStack(1 < o.length ? ie.unique(o) : o);
      },
      index: function(e) {
        return e
          ? 'string' == typeof e
            ? ie.inArray(this[0], ie(e))
            : ie.inArray(e.jquery ? e[0] : e, this)
          : this[0] && this[0].parentNode
          ? this.first().prevAll().length
          : -1;
      },
      add: function(e, t) {
        var n =
            'string' == typeof e
              ? ie(e, t)
              : ie.makeArray(e && e.nodeType ? [e] : e),
          i = ie.merge(this.get(), n);
        return this.pushStack(ie.unique(i));
      },
      addBack: function(e) {
        return this.add(
          null == e ? this.prevObject : this.prevObject.filter(e)
        );
      }
    }),
      ie.each(
        {
          parent: function(e) {
            var t = e.parentNode;
            return t && 11 !== t.nodeType ? t : null;
          },
          parents: function(e) {
            return ie.dir(e, 'parentNode');
          },
          parentsUntil: function(e, t, n) {
            return ie.dir(e, 'parentNode', n);
          },
          next: function(e) {
            return sibling(e, 'nextSibling');
          },
          prev: function(e) {
            return sibling(e, 'previousSibling');
          },
          nextAll: function(e) {
            return ie.dir(e, 'nextSibling');
          },
          prevAll: function(e) {
            return ie.dir(e, 'previousSibling');
          },
          nextUntil: function(e, t, n) {
            return ie.dir(e, 'nextSibling', n);
          },
          prevUntil: function(e, t, n) {
            return ie.dir(e, 'previousSibling', n);
          },
          siblings: function(e) {
            return ie.sibling((e.parentNode || {}).firstChild, e);
          },
          children: function(e) {
            return ie.sibling(e.firstChild);
          },
          contents: function(e) {
            return ie.nodeName(e, 'iframe')
              ? e.contentDocument || e.contentWindow.document
              : ie.merge([], e.childNodes);
          }
        },
        function(i, r) {
          ie.fn[i] = function(e, t) {
            var n = ie.map(this, r, e);
            return (
              'Until' !== i.slice(-5) && (t = e),
              t && 'string' == typeof t && (n = ie.filter(t, n)),
              1 < this.length &&
                (ee[i] || (n = ie.unique(n)), Z.test(i) && (n = n.reverse())),
              this.pushStack(n)
            );
          };
        }
      ),
      ie.extend({
        filter: function(e, t, n) {
          var i = t[0];
          return (
            n && (e = ':not(' + e + ')'),
            1 === t.length && 1 === i.nodeType
              ? ie.find.matchesSelector(i, e)
                ? [i]
                : []
              : ie.find.matches(
                  e,
                  ie.grep(t, function(e) {
                    return 1 === e.nodeType;
                  })
                )
          );
        },
        dir: function(e, t, n) {
          for (
            var i = [], r = e[t];
            r &&
            9 !== r.nodeType &&
            (n === C || 1 !== r.nodeType || !ie(r).is(n));

          )
            1 === r.nodeType && i.push(r), (r = r[t]);
          return i;
        },
        sibling: function(e, t) {
          for (var n = []; e; e = e.nextSibling)
            1 === e.nodeType && e !== t && n.push(e);
          return n;
        }
      });
    var te =
        'abbr|article|aside|audio|bdi|canvas|data|datalist|details|figcaption|figure|footer|header|hgroup|mark|meter|nav|output|progress|section|summary|time|video',
      ne = / jQuery\d+="(?:null|\d+)"/g,
      re = new RegExp('<(?:' + te + ')[\\s/>]', 'i'),
      oe = /^\s+/,
      ae = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi,
      se = /<([\w:]+)/,
      le = /<tbody/i,
      ue = /<|&#?\w+;/,
      ce = /<(?:script|style|link)/i,
      fe = /^(?:checkbox|radio)$/i,
      de = /checked\s*(?:[^=]|=\s*.checked.)/i,
      pe = /^$|\/(?:java|ecma)script/i,
      he = /^true\/(.*)/,
      ge = /^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g,
      me = {
        option: [1, "<select multiple='multiple'>", '</select>'],
        legend: [1, '<fieldset>', '</fieldset>'],
        area: [1, '<map>', '</map>'],
        param: [1, '<object>', '</object>'],
        thead: [1, '<table>', '</table>'],
        tr: [2, '<table><tbody>', '</tbody></table>'],
        col: [2, '<table><tbody></tbody><colgroup>', '</colgroup></table>'],
        td: [3, '<table><tbody><tr>', '</tr></tbody></table>'],
        _default: ie.support.htmlSerialize
          ? [0, '', '']
          : [1, 'X<div>', '</div>']
      },
      ve = createSafeFragment(g).appendChild(g.createElement('div'));

    function manipulationTarget(e, t) {
      return ie.nodeName(e, 'table') &&
        ie.nodeName(1 === t.nodeType ? t : t.firstChild, 'tr')
        ? e.getElementsByTagName('tbody')[0] ||
            e.appendChild(e.ownerDocument.createElement('tbody'))
        : e;
    }

    function disableScript(e) {
      return (e.type = (null !== ie.find.attr(e, 'type')) + '/' + e.type), e;
    }

    function restoreScript(e) {
      var t = he.exec(e.type);
      return t ? (e.type = t[1]) : e.removeAttribute('type'), e;
    }

    function setGlobalEval(e, t) {
      for (var n, i = 0; null != (n = e[i]); i++)
        ie._data(n, 'globalEval', !t || ie._data(t[i], 'globalEval'));
    }

    function cloneCopyEvent(e, t) {
      if (1 === t.nodeType && ie.hasData(e)) {
        var n,
          i,
          r,
          o = ie._data(e),
          a = ie._data(t, o),
          s = o.events;
        if (s)
          for (n in (delete a.handle, (a.events = {}), s))
            for (i = 0, r = s[n].length; i < r; i++)
              ie.event.add(t, n, s[n][i]);
        a.data && (a.data = ie.extend({}, a.data));
      }
    }

    function fixCloneNodeIssues(e, t) {
      var n, i, r;
      if (1 === t.nodeType) {
        if (
          ((n = t.nodeName.toLowerCase()),
          !ie.support.noCloneEvent && t[ie.expando])
        ) {
          for (i in (r = ie._data(t)).events) ie.removeEvent(t, i, r.handle);
          t.removeAttribute(ie.expando);
        }
        'script' === n && t.text !== e.text
          ? ((disableScript(t).text = e.text), restoreScript(t))
          : 'object' === n
          ? (t.parentNode && (t.outerHTML = e.outerHTML),
            ie.support.html5Clone &&
              e.innerHTML &&
              !ie.trim(t.innerHTML) &&
              (t.innerHTML = e.innerHTML))
          : 'input' === n && fe.test(e.type)
          ? ((t.defaultChecked = t.checked = e.checked),
            t.value !== e.value && (t.value = e.value))
          : 'option' === n
          ? (t.defaultSelected = t.selected = e.defaultSelected)
          : ('input' !== n && 'textarea' !== n) ||
            (t.defaultValue = e.defaultValue);
      }
    }

    function getAll(e, t) {
      var n,
        i,
        r = 0,
        o =
          typeof e.getElementsByTagName !== v
            ? e.getElementsByTagName(t || '*')
            : typeof e.querySelectorAll !== v
            ? e.querySelectorAll(t || '*')
            : C;
      if (!o)
        for (o = [], n = e.childNodes || e; null != (i = n[r]); r++)
          !t || ie.nodeName(i, t) ? o.push(i) : ie.merge(o, getAll(i, t));
      return t === C || (t && ie.nodeName(e, t)) ? ie.merge([e], o) : o;
    }

    function fixDefaultChecked(e) {
      fe.test(e.type) && (e.defaultChecked = e.checked);
    }
    (me.optgroup = me.option),
      (me.tbody = me.tfoot = me.colgroup = me.caption = me.thead),
      (me.th = me.td),
      ie.fn.extend({
        text: function(e) {
          return ie.access(
            this,
            function(e) {
              return e === C
                ? ie.text(this)
                : this.empty().append(
                    ((this[0] && this[0].ownerDocument) || g).createTextNode(e)
                  );
            },
            null,
            e,
            arguments.length
          );
        },
        append: function() {
          return this.domManip(arguments, function(e) {
            (1 !== this.nodeType &&
              11 !== this.nodeType &&
              9 !== this.nodeType) ||
              manipulationTarget(this, e).appendChild(e);
          });
        },
        prepend: function() {
          return this.domManip(arguments, function(e) {
            if (
              1 === this.nodeType ||
              11 === this.nodeType ||
              9 === this.nodeType
            ) {
              var t = manipulationTarget(this, e);
              t.insertBefore(e, t.firstChild);
            }
          });
        },
        before: function() {
          return this.domManip(arguments, function(e) {
            this.parentNode && this.parentNode.insertBefore(e, this);
          });
        },
        after: function() {
          return this.domManip(arguments, function(e) {
            this.parentNode &&
              this.parentNode.insertBefore(e, this.nextSibling);
          });
        },
        remove: function(e, t) {
          for (
            var n, i = e ? ie.filter(e, this) : this, r = 0;
            null != (n = i[r]);
            r++
          )
            t || 1 !== n.nodeType || ie.cleanData(getAll(n)),
              n.parentNode &&
                (t &&
                  ie.contains(n.ownerDocument, n) &&
                  setGlobalEval(getAll(n, 'script')),
                n.parentNode.removeChild(n));
          return this;
        },
        empty: function() {
          for (var e, t = 0; null != (e = this[t]); t++) {
            for (
              1 === e.nodeType && ie.cleanData(getAll(e, !1));
              e.firstChild;

            )
              e.removeChild(e.firstChild);
            e.options && ie.nodeName(e, 'select') && (e.options.length = 0);
          }
          return this;
        },
        clone: function(e, t) {
          return (
            (e = null != e && e),
            (t = null == t ? e : t),
            this.map(function() {
              return ie.clone(this, e, t);
            })
          );
        },
        html: function(e) {
          return ie.access(
            this,
            function(e) {
              var t = this[0] || {},
                n = 0,
                i = this.length;
              if (e === C)
                return 1 === t.nodeType ? t.innerHTML.replace(ne, '') : C;
              if (
                'string' == typeof e &&
                !ce.test(e) &&
                (ie.support.htmlSerialize || !re.test(e)) &&
                (ie.support.leadingWhitespace || !oe.test(e)) &&
                !me[(se.exec(e) || ['', ''])[1].toLowerCase()]
              ) {
                e = e.replace(ae, '<$1></$2>');
                try {
                  for (; n < i; n++)
                    1 === (t = this[n] || {}).nodeType &&
                      (ie.cleanData(getAll(t, !1)), (t.innerHTML = e));
                  t = 0;
                } catch (e) {}
              }
              t && this.empty().append(e);
            },
            null,
            e,
            arguments.length
          );
        },
        replaceWith: function() {
          var i = ie.map(this, function(e) {
              return [e.nextSibling, e.parentNode];
            }),
            r = 0;
          return (
            this.domManip(
              arguments,
              function(e) {
                var t = i[r++],
                  n = i[r++];
                n &&
                  (t && t.parentNode !== n && (t = this.nextSibling),
                  ie(this).remove(),
                  n.insertBefore(e, t));
              },
              !0
            ),
            r ? this : this.remove()
          );
        },
        detach: function(e) {
          return this.remove(e, !0);
        },
        domManip: function(n, i, r) {
          n = m.apply([], n);
          var e,
            t,
            o,
            a,
            s,
            l,
            u = 0,
            c = this.length,
            f = this,
            d = c - 1,
            p = n[0],
            h = ie.isFunction(p);
          if (
            h ||
            (!(c <= 1 || 'string' != typeof p || ie.support.checkClone) &&
              de.test(p))
          )
            return this.each(function(e) {
              var t = f.eq(e);
              h && (n[0] = p.call(this, e, t.html())), t.domManip(n, i, r);
            });
          if (
            c &&
            ((e = (l = ie.buildFragment(
              n,
              this[0].ownerDocument,
              !1,
              !r && this
            )).firstChild),
            1 === l.childNodes.length && (l = e),
            e)
          ) {
            for (
              o = (a = ie.map(getAll(l, 'script'), disableScript)).length;
              u < c;
              u++
            )
              (t = l),
                u !== d &&
                  ((t = ie.clone(t, !0, !0)),
                  o && ie.merge(a, getAll(t, 'script'))),
                i.call(this[u], t, u);
            if (o)
              for (
                s = a[a.length - 1].ownerDocument,
                  ie.map(a, restoreScript),
                  u = 0;
                u < o;
                u++
              )
                (t = a[u]),
                  pe.test(t.type || '') &&
                    !ie._data(t, 'globalEval') &&
                    ie.contains(s, t) &&
                    (t.src
                      ? ie._evalUrl(t.src)
                      : ie.globalEval(
                          (
                            t.text ||
                            t.textContent ||
                            t.innerHTML ||
                            ''
                          ).replace(ge, '')
                        ));
            l = e = null;
          }
          return this;
        }
      }),
      ie.each(
        {
          appendTo: 'append',
          prependTo: 'prepend',
          insertBefore: 'before',
          insertAfter: 'after',
          replaceAll: 'replaceWith'
        },
        function(e, a) {
          ie.fn[e] = function(e) {
            for (var t, n = 0, i = [], r = ie(e), o = r.length - 1; n <= o; n++)
              (t = n === o ? this : this.clone(!0)),
                ie(r[n])[a](t),
                l.apply(i, t.get());
            return this.pushStack(i);
          };
        }
      ),
      ie.extend({
        clone: function(e, t, n) {
          var i,
            r,
            o,
            a,
            s,
            l = ie.contains(e.ownerDocument, e);
          if (
            (ie.support.html5Clone ||
            ie.isXMLDoc(e) ||
            !re.test('<' + e.nodeName + '>')
              ? (o = e.cloneNode(!0))
              : ((ve.innerHTML = e.outerHTML),
                ve.removeChild((o = ve.firstChild))),
            !(
              (ie.support.noCloneEvent && ie.support.noCloneChecked) ||
              (1 !== e.nodeType && 11 !== e.nodeType) ||
              ie.isXMLDoc(e)
            ))
          )
            for (i = getAll(o), s = getAll(e), a = 0; null != (r = s[a]); ++a)
              i[a] && fixCloneNodeIssues(r, i[a]);
          if (t)
            if (n)
              for (
                s = s || getAll(e), i = i || getAll(o), a = 0;
                null != (r = s[a]);
                a++
              )
                cloneCopyEvent(r, i[a]);
            else cloneCopyEvent(e, o);
          return (
            0 < (i = getAll(o, 'script')).length &&
              setGlobalEval(i, !l && getAll(e, 'script')),
            (i = s = r = null),
            o
          );
        },
        buildFragment: function(e, t, n, i) {
          for (
            var r,
              o,
              a,
              s,
              l,
              u,
              c,
              f = e.length,
              d = createSafeFragment(t),
              p = [],
              h = 0;
            h < f;
            h++
          )
            if ((o = e[h]) || 0 === o)
              if ('object' === ie.type(o)) ie.merge(p, o.nodeType ? [o] : o);
              else if (ue.test(o)) {
                for (
                  s = s || d.appendChild(t.createElement('div')),
                    l = (se.exec(o) || ['', ''])[1].toLowerCase(),
                    c = me[l] || me._default,
                    s.innerHTML = c[1] + o.replace(ae, '<$1></$2>') + c[2],
                    r = c[0];
                  r--;

                )
                  s = s.lastChild;
                if (
                  (!ie.support.leadingWhitespace &&
                    oe.test(o) &&
                    p.push(t.createTextNode(oe.exec(o)[0])),
                  !ie.support.tbody)
                )
                  for (
                    r =
                      (o =
                        'table' !== l || le.test(o)
                          ? '<table>' !== c[1] || le.test(o)
                            ? 0
                            : s
                          : s.firstChild) && o.childNodes.length;
                    r--;

                  )
                    ie.nodeName((u = o.childNodes[r]), 'tbody') &&
                      !u.childNodes.length &&
                      o.removeChild(u);
                for (
                  ie.merge(p, s.childNodes), s.textContent = '';
                  s.firstChild;

                )
                  s.removeChild(s.firstChild);
                s = d.lastChild;
              } else p.push(t.createTextNode(o));
          for (
            s && d.removeChild(s),
              ie.support.appendChecked ||
                ie.grep(getAll(p, 'input'), fixDefaultChecked),
              h = 0;
            (o = p[h++]);

          )
            if (
              (!i || -1 === ie.inArray(o, i)) &&
              ((a = ie.contains(o.ownerDocument, o)),
              (s = getAll(d.appendChild(o), 'script')),
              a && setGlobalEval(s),
              n)
            )
              for (r = 0; (o = s[r++]); ) pe.test(o.type || '') && n.push(o);
          return (s = null), d;
        },
        cleanData: function(e, t) {
          for (
            var n,
              i,
              r,
              o,
              a = 0,
              s = ie.expando,
              l = ie.cache,
              u = ie.support.deleteExpando,
              c = ie.event.special;
            null != (n = e[a]);
            a++
          )
            if ((t || ie.acceptData(n)) && (o = (r = n[s]) && l[r])) {
              if (o.events)
                for (i in o.events)
                  c[i] ? ie.event.remove(n, i) : ie.removeEvent(n, i, o.handle);
              l[r] &&
                (delete l[r],
                u
                  ? delete n[s]
                  : typeof n.removeAttribute !== v
                  ? n.removeAttribute(s)
                  : (n[s] = null),
                f.push(r));
            }
        },
        _evalUrl: function(e) {
          return ie.ajax({
            url: e,
            type: 'GET',
            dataType: 'script',
            async: !1,
            global: !1,
            throws: !0
          });
        }
      }),
      ie.fn.extend({
        wrapAll: function(t) {
          if (ie.isFunction(t))
            return this.each(function(e) {
              ie(this).wrapAll(t.call(this, e));
            });
          if (this[0]) {
            var e = ie(t, this[0].ownerDocument)
              .eq(0)
              .clone(!0);
            this[0].parentNode && e.insertBefore(this[0]),
              e
                .map(function() {
                  for (
                    var e = this;
                    e.firstChild && 1 === e.firstChild.nodeType;

                  )
                    e = e.firstChild;
                  return e;
                })
                .append(this);
          }
          return this;
        },
        wrapInner: function(n) {
          return ie.isFunction(n)
            ? this.each(function(e) {
                ie(this).wrapInner(n.call(this, e));
              })
            : this.each(function() {
                var e = ie(this),
                  t = e.contents();
                t.length ? t.wrapAll(n) : e.append(n);
              });
        },
        wrap: function(t) {
          var n = ie.isFunction(t);
          return this.each(function(e) {
            ie(this).wrapAll(n ? t.call(this, e) : t);
          });
        },
        unwrap: function() {
          return this.parent()
            .each(function() {
              ie.nodeName(this, 'body') ||
                ie(this).replaceWith(this.childNodes);
            })
            .end();
        }
      });
    var ye,
      be,
      xe,
      we = /alpha\([^)]*\)/i,
      Te = /opacity\s*=\s*([^)]*)/,
      Ce = /^(top|right|bottom|left)$/,
      Se = /^(none|table(?!-c[ea]).+)/,
      Ee = /^margin/,
      ke = new RegExp('^(' + b + ')(.*)$', 'i'),
      Ae = new RegExp('^(' + b + ')(?!px)[a-z%]+$', 'i'),
      Ne = new RegExp('^([+-])=(' + b + ')', 'i'),
      Le = {
        BODY: 'block'
      },
      Oe = {
        position: 'absolute',
        visibility: 'hidden',
        display: 'block'
      },
      De = {
        letterSpacing: 0,
        fontWeight: 400
      },
      Me = ['Top', 'Right', 'Bottom', 'Left'],
      Pe = ['Webkit', 'O', 'Moz', 'ms'];

    function vendorPropName(e, t) {
      if (t in e) return t;
      for (
        var n = t.charAt(0).toUpperCase() + t.slice(1), i = t, r = Pe.length;
        r--;

      )
        if ((t = Pe[r] + n) in e) return t;
      return i;
    }

    function isHidden(e, t) {
      return (
        (e = t || e),
        'none' === ie.css(e, 'display') || !ie.contains(e.ownerDocument, e)
      );
    }

    function showHide(e, t) {
      for (var n, i, r, o = [], a = 0, s = e.length; a < s; a++)
        (i = e[a]).style &&
          ((o[a] = ie._data(i, 'olddisplay')),
          (n = i.style.display),
          t
            ? (o[a] || 'none' !== n || (i.style.display = ''),
              '' === i.style.display &&
                isHidden(i) &&
                (o[a] = ie._data(
                  i,
                  'olddisplay',
                  css_defaultDisplay(i.nodeName)
                )))
            : o[a] ||
              ((r = isHidden(i)),
              ((n && 'none' !== n) || !r) &&
                ie._data(i, 'olddisplay', r ? n : ie.css(i, 'display'))));
      for (a = 0; a < s; a++)
        (i = e[a]).style &&
          ((t && 'none' !== i.style.display && '' !== i.style.display) ||
            (i.style.display = t ? o[a] || '' : 'none'));
      return e;
    }

    function setPositiveNumber(e, t, n) {
      var i = ke.exec(t);
      return i ? Math.max(0, i[1] - (n || 0)) + (i[2] || 'px') : t;
    }

    function augmentWidthOrHeight(e, t, n, i, r) {
      for (
        var o = n === (i ? 'border' : 'content') ? 4 : 'width' === t ? 1 : 0,
          a = 0;
        o < 4;
        o += 2
      )
        'margin' === n && (a += ie.css(e, n + Me[o], !0, r)),
          i
            ? ('content' === n && (a -= ie.css(e, 'padding' + Me[o], !0, r)),
              'margin' !== n &&
                (a -= ie.css(e, 'border' + Me[o] + 'Width', !0, r)))
            : ((a += ie.css(e, 'padding' + Me[o], !0, r)),
              'padding' !== n &&
                (a += ie.css(e, 'border' + Me[o] + 'Width', !0, r)));
      return a;
    }

    function getWidthOrHeight(e, t, n) {
      var i = !0,
        r = 'width' === t ? e.offsetWidth : e.offsetHeight,
        o = be(e),
        a =
          ie.support.boxSizing &&
          'border-box' === ie.css(e, 'boxSizing', !1, o);
      if (r <= 0 || null == r) {
        if (
          (((r = xe(e, t, o)) < 0 || null == r) && (r = e.style[t]), Ae.test(r))
        )
          return r;
        (i = a && (ie.support.boxSizingReliable || r === e.style[t])),
          (r = parseFloat(r) || 0);
      }
      return (
        r +
        augmentWidthOrHeight(e, t, n || (a ? 'border' : 'content'), i, o) +
        'px'
      );
    }

    function css_defaultDisplay(e) {
      var t = g,
        n = Le[e];
      return (
        n ||
          (('none' !== (n = actualDisplay(e, t)) && n) ||
            ((t = (
              (ye = (
                ye ||
                ie("<iframe frameborder='0' width='0' height='0'/>").css(
                  'cssText',
                  'display:block !important'
                )
              ).appendTo(t.documentElement))[0].contentWindow ||
              ye[0].contentDocument
            ).document).write('<!doctype html><html><body>'),
            t.close(),
            (n = actualDisplay(e, t)),
            ye.detach()),
          (Le[e] = n)),
        n
      );
    }

    function actualDisplay(e, t) {
      var n = ie(t.createElement(e)).appendTo(t.body),
        i = ie.css(n[0], 'display');
      return n.remove(), i;
    }
    ie.fn.extend({
      css: function(e, t) {
        return ie.access(
          this,
          function(e, t, n) {
            var i,
              r,
              o = {},
              a = 0;
            if (ie.isArray(t)) {
              for (r = be(e), i = t.length; a < i; a++)
                o[t[a]] = ie.css(e, t[a], !1, r);
              return o;
            }
            return n !== C ? ie.style(e, t, n) : ie.css(e, t);
          },
          e,
          t,
          1 < arguments.length
        );
      },
      show: function() {
        return showHide(this, !0);
      },
      hide: function() {
        return showHide(this);
      },
      toggle: function(e) {
        var t = 'boolean' == typeof e;
        return this.each(function() {
          (t ? e : isHidden(this)) ? ie(this).show() : ie(this).hide();
        });
      }
    }),
      ie.extend({
        cssHooks: {
          opacity: {
            get: function(e, t) {
              if (t) {
                var n = xe(e, 'opacity');
                return '' === n ? '1' : n;
              }
            }
          }
        },
        cssNumber: {
          columnCount: !0,
          fillOpacity: !0,
          fontWeight: !0,
          lineHeight: !0,
          opacity: !0,
          orphans: !0,
          widows: !0,
          zIndex: !0,
          zoom: !0
        },
        cssProps: {
          float: ie.support.cssFloat ? 'cssFloat' : 'styleFloat'
        },
        style: function(e, t, n, i) {
          if (e && 3 !== e.nodeType && 8 !== e.nodeType && e.style) {
            var r,
              o,
              a,
              s = ie.camelCase(t),
              l = e.style;
            if (
              ((t = ie.cssProps[s] || (ie.cssProps[s] = vendorPropName(l, s))),
              (a = ie.cssHooks[t] || ie.cssHooks[s]),
              n === C)
            )
              return a && 'get' in a && (r = a.get(e, !1, i)) !== C ? r : l[t];
            if (
              !('string' === (o = typeof n) &&
                (r = Ne.exec(n)) &&
                ((n = (r[1] + 1) * r[2] + parseFloat(ie.css(e, t))),
                (o = 'number')),
              null == n ||
                ('number' === o && isNaN(n)) ||
                ('number' !== o || ie.cssNumber[s] || (n += 'px'),
                ie.support.clearCloneStyle ||
                  '' !== n ||
                  0 !== t.indexOf('background') ||
                  (l[t] = 'inherit'),
                a && 'set' in a && (n = a.set(e, n, i)) === C))
            )
              try {
                l[t] = n;
              } catch (e) {}
          }
        },
        css: function(e, t, n, i) {
          var r,
            o,
            a,
            s = ie.camelCase(t);
          return (
            (t =
              ie.cssProps[s] || (ie.cssProps[s] = vendorPropName(e.style, s))),
            (a = ie.cssHooks[t] || ie.cssHooks[s]) &&
              'get' in a &&
              (o = a.get(e, !0, n)),
            o === C && (o = xe(e, t, i)),
            'normal' === o && t in De && (o = De[t]),
            '' === n || n
              ? ((r = parseFloat(o)), !0 === n || ie.isNumeric(r) ? r || 0 : o)
              : o
          );
        }
      }),
      h.getComputedStyle
        ? ((be = function(e) {
            return h.getComputedStyle(e, null);
          }),
          (xe = function(e, t, n) {
            var i,
              r,
              o,
              a = n || be(e),
              s = a ? a.getPropertyValue(t) || a[t] : C,
              l = e.style;
            return (
              a &&
                ('' !== s ||
                  ie.contains(e.ownerDocument, e) ||
                  (s = ie.style(e, t)),
                Ae.test(s) &&
                  Ee.test(t) &&
                  ((i = l.width),
                  (r = l.minWidth),
                  (o = l.maxWidth),
                  (l.minWidth = l.maxWidth = l.width = s),
                  (s = a.width),
                  (l.width = i),
                  (l.minWidth = r),
                  (l.maxWidth = o))),
              s
            );
          }))
        : g.documentElement.currentStyle &&
          ((be = function(e) {
            return e.currentStyle;
          }),
          (xe = function(e, t, n) {
            var i,
              r,
              o,
              a = n || be(e),
              s = a ? a[t] : C,
              l = e.style;
            return (
              null == s && l && l[t] && (s = l[t]),
              Ae.test(s) &&
                !Ce.test(t) &&
                ((i = l.left),
                (o = (r = e.runtimeStyle) && r.left) &&
                  (r.left = e.currentStyle.left),
                (l.left = 'fontSize' === t ? '1em' : s),
                (s = l.pixelLeft + 'px'),
                (l.left = i),
                o && (r.left = o)),
              '' === s ? 'auto' : s
            );
          })),
      ie.each(['height', 'width'], function(e, r) {
        ie.cssHooks[r] = {
          get: function(e, t, n) {
            if (t)
              return 0 === e.offsetWidth && Se.test(ie.css(e, 'display'))
                ? ie.swap(e, Oe, function() {
                    return getWidthOrHeight(e, r, n);
                  })
                : getWidthOrHeight(e, r, n);
          },
          set: function(e, t, n) {
            var i = n && be(e);
            return setPositiveNumber(
              0,
              t,
              n
                ? augmentWidthOrHeight(
                    e,
                    r,
                    n,
                    ie.support.boxSizing &&
                      'border-box' === ie.css(e, 'boxSizing', !1, i),
                    i
                  )
                : 0
            );
          }
        };
      }),
      ie.support.opacity ||
        (ie.cssHooks.opacity = {
          get: function(e, t) {
            return Te.test(
              (t && e.currentStyle ? e.currentStyle.filter : e.style.filter) ||
                ''
            )
              ? 0.01 * parseFloat(RegExp.$1) + ''
              : t
              ? '1'
              : '';
          },
          set: function(e, t) {
            var n = e.style,
              i = e.currentStyle,
              r = ie.isNumeric(t) ? 'alpha(opacity=' + 100 * t + ')' : '',
              o = (i && i.filter) || n.filter || '';
            (((n.zoom = 1) <= t || '' === t) &&
              '' === ie.trim(o.replace(we, '')) &&
              n.removeAttribute &&
              (n.removeAttribute('filter'), '' === t || (i && !i.filter))) ||
              (n.filter = we.test(o) ? o.replace(we, r) : o + ' ' + r);
          }
        }),
      ie(function() {
        ie.support.reliableMarginRight ||
          (ie.cssHooks.marginRight = {
            get: function(e, t) {
              if (t)
                return ie.swap(
                  e,
                  {
                    display: 'inline-block'
                  },
                  xe,
                  [e, 'marginRight']
                );
            }
          }),
          !ie.support.pixelPosition &&
            ie.fn.position &&
            ie.each(['top', 'left'], function(e, n) {
              ie.cssHooks[n] = {
                get: function(e, t) {
                  if (t)
                    return (
                      (t = xe(e, n)),
                      Ae.test(t) ? ie(e).position()[n] + 'px' : t
                    );
                }
              };
            });
      }),
      ie.expr &&
        ie.expr.filters &&
        ((ie.expr.filters.hidden = function(e) {
          return (
            (e.offsetWidth <= 0 && e.offsetHeight <= 0) ||
            (!ie.support.reliableHiddenOffsets &&
              'none' === ((e.style && e.style.display) || ie.css(e, 'display')))
          );
        }),
        (ie.expr.filters.visible = function(e) {
          return !ie.expr.filters.hidden(e);
        })),
      ie.each(
        {
          margin: '',
          padding: '',
          border: 'Width'
        },
        function(r, o) {
          (ie.cssHooks[r + o] = {
            expand: function(e) {
              for (
                var t = 0,
                  n = {},
                  i = 'string' == typeof e ? e.split(' ') : [e];
                t < 4;
                t++
              )
                n[r + Me[t] + o] = i[t] || i[t - 2] || i[0];
              return n;
            }
          }),
            Ee.test(r) || (ie.cssHooks[r + o].set = setPositiveNumber);
        }
      );
    var He = /%20/g,
      je = /\[\]$/,
      _e = /\r?\n/g,
      Fe = /^(?:submit|button|image|reset|file)$/i,
      Re = /^(?:input|select|textarea|keygen)/i;

    function buildParams(n, e, i, r) {
      var t;
      if (ie.isArray(e))
        ie.each(e, function(e, t) {
          i || je.test(n)
            ? r(n, t)
            : buildParams(
                n + '[' + ('object' == typeof t ? e : '') + ']',
                t,
                i,
                r
              );
        });
      else if (i || 'object' !== ie.type(e)) r(n, e);
      else for (t in e) buildParams(n + '[' + t + ']', e[t], i, r);
    }
    ie.fn.extend({
      serialize: function() {
        return ie.param(this.serializeArray());
      },
      serializeArray: function() {
        return this.map(function() {
          var e = ie.prop(this, 'elements');
          return e ? ie.makeArray(e) : this;
        })
          .filter(function() {
            var e = this.type;
            return (
              this.name &&
              !ie(this).is(':disabled') &&
              Re.test(this.nodeName) &&
              !Fe.test(e) &&
              (this.checked || !fe.test(e))
            );
          })
          .map(function(e, t) {
            var n = ie(this).val();
            return null == n
              ? null
              : ie.isArray(n)
              ? ie.map(n, function(e) {
                  return {
                    name: t.name,
                    value: e.replace(_e, '\r\n')
                  };
                })
              : {
                  name: t.name,
                  value: n.replace(_e, '\r\n')
                };
          })
          .get();
      }
    }),
      (ie.param = function(e, t) {
        var n,
          i = [],
          r = function(e, t) {
            (t = ie.isFunction(t) ? t() : null == t ? '' : t),
              (i[i.length] =
                encodeURIComponent(e) + '=' + encodeURIComponent(t));
          };
        if (
          (t === C && (t = ie.ajaxSettings && ie.ajaxSettings.traditional),
          ie.isArray(e) || (e.jquery && !ie.isPlainObject(e)))
        )
          ie.each(e, function() {
            r(this.name, this.value);
          });
        else for (n in e) buildParams(n, e[n], t, r);
        return i.join('&').replace(He, '+');
      }),
      ie.each(
        'blur focus focusin focusout load resize scroll unload click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup error contextmenu'.split(
          ' '
        ),
        function(e, n) {
          ie.fn[n] = function(e, t) {
            return 0 < arguments.length
              ? this.on(n, null, e, t)
              : this.trigger(n);
          };
        }
      ),
      ie.fn.extend({
        hover: function(e, t) {
          return this.mouseenter(e).mouseleave(t || e);
        },
        bind: function(e, t, n) {
          return this.on(e, null, t, n);
        },
        unbind: function(e, t) {
          return this.off(e, null, t);
        },
        delegate: function(e, t, n, i) {
          return this.on(t, e, n, i);
        },
        undelegate: function(e, t, n) {
          return 1 === arguments.length
            ? this.off(e, '**')
            : this.off(t, e || '**', n);
        }
      });
    var Be,
      ze,
      Ie = ie.now(),
      We = /\?/,
      qe = /#.*$/,
      $e = /([?&])_=[^&]*/,
      Ue = /^(.*?):[ \t]*([^\r\n]*)\r?$/gm,
      Ve = /^(?:GET|HEAD)$/,
      Xe = /^\/\//,
      Je = /^([\w.+-]+:)(?:\/\/([^\/?#:]*)(?::(\d+)|)|)/,
      Ge = ie.fn.load,
      Ke = {},
      Ye = {},
      Ze = '*/'.concat('*');
    try {
      ze = e.href;
    } catch (e) {
      ((ze = g.createElement('a')).href = ''), (ze = ze.href);
    }

    function addToPrefiltersOrTransports(o) {
      return function(e, t) {
        'string' != typeof e && ((t = e), (e = '*'));
        var n,
          i = 0,
          r = e.toLowerCase().match(S) || [];
        if (ie.isFunction(t))
          for (; (n = r[i++]); )
            '+' === n[0]
              ? ((n = n.slice(1) || '*'), (o[n] = o[n] || []).unshift(t))
              : (o[n] = o[n] || []).push(t);
      };
    }

    function inspectPrefiltersOrTransports(t, r, o, a) {
      var s = {},
        l = t === Ye;

      function inspect(e) {
        var i;
        return (
          (s[e] = !0),
          ie.each(t[e] || [], function(e, t) {
            var n = t(r, o, a);
            return 'string' != typeof n || l || s[n]
              ? l
                ? !(i = n)
                : void 0
              : (r.dataTypes.unshift(n), inspect(n), !1);
          }),
          i
        );
      }
      return inspect(r.dataTypes[0]) || (!s['*'] && inspect('*'));
    }

    function ajaxExtend(e, t) {
      var n,
        i,
        r = ie.ajaxSettings.flatOptions || {};
      for (i in t) t[i] !== C && ((r[i] ? e : n || (n = {}))[i] = t[i]);
      return n && ie.extend(!0, e, n), e;
    }
    (Be = Je.exec(ze.toLowerCase()) || []),
      (ie.fn.load = function(e, t, n) {
        if ('string' != typeof e && Ge) return Ge.apply(this, arguments);
        var i,
          r,
          o,
          a = this,
          s = e.indexOf(' ');
        return (
          0 <= s && ((i = e.slice(s, e.length)), (e = e.slice(0, s))),
          ie.isFunction(t)
            ? ((n = t), (t = C))
            : t && 'object' == typeof t && (o = 'POST'),
          0 < a.length &&
            ie
              .ajax({
                url: e,
                type: o,
                dataType: 'html',
                data: t
              })
              .done(function(e) {
                (r = arguments),
                  a.html(
                    i
                      ? ie('<div>')
                          .append(ie.parseHTML(e))
                          .find(i)
                      : e
                  );
              })
              .complete(
                n &&
                  function(e, t) {
                    a.each(n, r || [e.responseText, t, e]);
                  }
              ),
          this
        );
      }),
      ie.each(
        [
          'ajaxStart',
          'ajaxStop',
          'ajaxComplete',
          'ajaxError',
          'ajaxSuccess',
          'ajaxSend'
        ],
        function(e, t) {
          ie.fn[t] = function(e) {
            return this.on(t, e);
          };
        }
      ),
      ie.extend({
        active: 0,
        lastModified: {},
        etag: {},
        ajaxSettings: {
          url: ze,
          type: 'GET',
          isLocal: /^(?:about|app|app-storage|.+-extension|file|res|widget):$/.test(
            Be[1]
          ),
          global: !0,
          processData: !0,
          async: !0,
          contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
          accepts: {
            '*': Ze,
            text: 'text/plain',
            html: 'text/html',
            xml: 'application/xml, text/xml',
            json: 'application/json, text/javascript'
          },
          contents: {
            xml: /xml/,
            html: /html/,
            json: /json/
          },
          responseFields: {
            xml: 'responseXML',
            text: 'responseText',
            json: 'responseJSON'
          },
          converters: {
            '* text': String,
            'text html': !0,
            'text json': ie.parseJSON,
            'text xml': ie.parseXML
          },
          flatOptions: {
            url: !0,
            context: !0
          }
        },
        ajaxSetup: function(e, t) {
          return t
            ? ajaxExtend(ajaxExtend(e, ie.ajaxSettings), t)
            : ajaxExtend(ie.ajaxSettings, e);
        },
        ajaxPrefilter: addToPrefiltersOrTransports(Ke),
        ajaxTransport: addToPrefiltersOrTransports(Ye),
        ajax: function(e, t) {
          'object' == typeof e && ((t = e), (e = C)), (t = t || {});
          var n,
            i,
            c,
            f,
            d,
            p,
            h,
            r,
            g = ie.ajaxSetup({}, t),
            m = g.context || g,
            v = g.context && (m.nodeType || m.jquery) ? ie(m) : ie.event,
            y = ie.Deferred(),
            b = ie.Callbacks('once memory'),
            x = g.statusCode || {},
            o = {},
            a = {},
            w = 0,
            s = 'canceled',
            T = {
              readyState: 0,
              getResponseHeader: function(e) {
                var t;
                if (2 === w) {
                  if (!r)
                    for (r = {}; (t = Ue.exec(f)); )
                      r[t[1].toLowerCase()] = t[2];
                  t = r[e.toLowerCase()];
                }
                return null == t ? null : t;
              },
              getAllResponseHeaders: function() {
                return 2 === w ? f : null;
              },
              setRequestHeader: function(e, t) {
                var n = e.toLowerCase();
                return w || ((e = a[n] = a[n] || e), (o[e] = t)), this;
              },
              overrideMimeType: function(e) {
                return w || (g.mimeType = e), this;
              },
              statusCode: function(e) {
                var t;
                if (e)
                  if (w < 2) for (t in e) x[t] = [x[t], e[t]];
                  else T.always(e[T.status]);
                return this;
              },
              abort: function(e) {
                var t = e || s;
                return h && h.abort(t), done(0, t), this;
              }
            };
          if (
            ((y.promise(T).complete = b.add),
            (T.success = T.done),
            (T.error = T.fail),
            (g.url = ((e || g.url || ze) + '')
              .replace(qe, '')
              .replace(Xe, Be[1] + '//')),
            (g.type = t.method || t.type || g.method || g.type),
            (g.dataTypes = ie
              .trim(g.dataType || '*')
              .toLowerCase()
              .match(S) || ['']),
            null == g.crossDomain &&
              ((n = Je.exec(g.url.toLowerCase())),
              (g.crossDomain = !(
                !n ||
                (n[1] === Be[1] &&
                  n[2] === Be[2] &&
                  (n[3] || ('http:' === n[1] ? '80' : '443')) ===
                    (Be[3] || ('http:' === Be[1] ? '80' : '443')))
              ))),
            g.data &&
              g.processData &&
              'string' != typeof g.data &&
              (g.data = ie.param(g.data, g.traditional)),
            inspectPrefiltersOrTransports(Ke, g, t, T),
            2 === w)
          )
            return T;
          for (i in ((p = g.global) &&
            0 == ie.active++ &&
            ie.event.trigger('ajaxStart'),
          (g.type = g.type.toUpperCase()),
          (g.hasContent = !Ve.test(g.type)),
          (c = g.url),
          g.hasContent ||
            (g.data &&
              ((c = g.url += (We.test(c) ? '&' : '?') + g.data), delete g.data),
            !1 === g.cache &&
              (g.url = $e.test(c)
                ? c.replace($e, '$1_=' + Ie++)
                : c + (We.test(c) ? '&' : '?') + '_=' + Ie++)),
          g.ifModified &&
            (ie.lastModified[c] &&
              T.setRequestHeader('If-Modified-Since', ie.lastModified[c]),
            ie.etag[c] && T.setRequestHeader('If-None-Match', ie.etag[c])),
          ((g.data && g.hasContent && !1 !== g.contentType) || t.contentType) &&
            T.setRequestHeader('Content-Type', g.contentType),
          T.setRequestHeader(
            'Accept',
            g.dataTypes[0] && g.accepts[g.dataTypes[0]]
              ? g.accepts[g.dataTypes[0]] +
                  ('*' !== g.dataTypes[0] ? ', ' + Ze + '; q=0.01' : '')
              : g.accepts['*']
          ),
          g.headers))
            T.setRequestHeader(i, g.headers[i]);
          if (g.beforeSend && (!1 === g.beforeSend.call(m, T, g) || 2 === w))
            return T.abort();
          for (i in ((s = 'abort'),
          {
            success: 1,
            error: 1,
            complete: 1
          }))
            T[i](g[i]);
          if ((h = inspectPrefiltersOrTransports(Ye, g, t, T))) {
            (T.readyState = 1),
              p && v.trigger('ajaxSend', [T, g]),
              g.async &&
                0 < g.timeout &&
                (d = setTimeout(function() {
                  T.abort('timeout');
                }, g.timeout));
            try {
              (w = 1), h.send(o, done);
            } catch (e) {
              if (!(w < 2)) throw e;
              done(-1, e);
            }
          } else done(-1, 'No Transport');

          function done(e, t, n, i) {
            var r,
              o,
              a,
              s,
              l,
              u = t;
            2 !== w &&
              ((w = 2),
              d && clearTimeout(d),
              (h = C),
              (f = i || ''),
              (T.readyState = 0 < e ? 4 : 0),
              (r = (200 <= e && e < 300) || 304 === e),
              n &&
                (s = (function ajaxHandleResponses(e, t, n) {
                  var i,
                    r,
                    o,
                    a,
                    s = e.contents,
                    l = e.dataTypes;
                  for (; '*' === l[0]; )
                    l.shift(),
                      r === C &&
                        (r = e.mimeType || t.getResponseHeader('Content-Type'));
                  if (r)
                    for (a in s)
                      if (s[a] && s[a].test(r)) {
                        l.unshift(a);
                        break;
                      }
                  if (l[0] in n) o = l[0];
                  else {
                    for (a in n) {
                      if (!l[0] || e.converters[a + ' ' + l[0]]) {
                        o = a;
                        break;
                      }
                      i || (i = a);
                    }
                    o = o || i;
                  }
                  if (o) return o !== l[0] && l.unshift(o), n[o];
                })(g, T, n)),
              (s = (function ajaxConvert(e, t, n, i) {
                var r,
                  o,
                  a,
                  s,
                  l,
                  u = {},
                  c = e.dataTypes.slice();
                if (c[1])
                  for (a in e.converters) u[a.toLowerCase()] = e.converters[a];
                o = c.shift();
                for (; o; )
                  if (
                    (e.responseFields[o] && (n[e.responseFields[o]] = t),
                    !l &&
                      i &&
                      e.dataFilter &&
                      (t = e.dataFilter(t, e.dataType)),
                    (l = o),
                    (o = c.shift()))
                  )
                    if ('*' === o) o = l;
                    else if ('*' !== l && l !== o) {
                      if (!(a = u[l + ' ' + o] || u['* ' + o]))
                        for (r in u)
                          if (
                            (s = r.split(' '))[1] === o &&
                            (a = u[l + ' ' + s[0]] || u['* ' + s[0]])
                          ) {
                            !0 === a
                              ? (a = u[r])
                              : !0 !== u[r] && ((o = s[0]), c.unshift(s[1]));
                            break;
                          }
                      if (!0 !== a)
                        if (a && e.throws) t = a(t);
                        else
                          try {
                            t = a(t);
                          } catch (e) {
                            return {
                              state: 'parsererror',
                              error: a
                                ? e
                                : 'No conversion from ' + l + ' to ' + o
                            };
                          }
                    }
                return {
                  state: 'success',
                  data: t
                };
              })(g, s, T, r)),
              r
                ? (g.ifModified &&
                    ((l = T.getResponseHeader('Last-Modified')) &&
                      (ie.lastModified[c] = l),
                    (l = T.getResponseHeader('etag')) && (ie.etag[c] = l)),
                  204 === e || 'HEAD' === g.type
                    ? (u = 'nocontent')
                    : 304 === e
                    ? (u = 'notmodified')
                    : ((u = s.state), (o = s.data), (r = !(a = s.error))))
                : ((a = u), (!e && u) || ((u = 'error'), e < 0 && (e = 0))),
              (T.status = e),
              (T.statusText = (t || u) + ''),
              r ? y.resolveWith(m, [o, u, T]) : y.rejectWith(m, [T, u, a]),
              T.statusCode(x),
              (x = C),
              p &&
                v.trigger(r ? 'ajaxSuccess' : 'ajaxError', [T, g, r ? o : a]),
              b.fireWith(m, [T, u]),
              p &&
                (v.trigger('ajaxComplete', [T, g]),
                --ie.active || ie.event.trigger('ajaxStop')));
          }
          return T;
        },
        getJSON: function(e, t, n) {
          return ie.get(e, t, n, 'json');
        },
        getScript: function(e, t) {
          return ie.get(e, C, t, 'script');
        }
      }),
      ie.each(['get', 'post'], function(e, r) {
        ie[r] = function(e, t, n, i) {
          return (
            ie.isFunction(t) && ((i = i || n), (n = t), (t = C)),
            ie.ajax({
              url: e,
              type: r,
              dataType: i,
              data: t,
              success: n
            })
          );
        };
      }),
      ie.ajaxSetup({
        accepts: {
          script:
            'text/javascript, application/javascript, application/ecmascript, application/x-ecmascript'
        },
        contents: {
          script: /(?:java|ecma)script/
        },
        converters: {
          'text script': function(e) {
            return ie.globalEval(e), e;
          }
        }
      }),
      ie.ajaxPrefilter('script', function(e) {
        e.cache === C && (e.cache = !1),
          e.crossDomain && ((e.type = 'GET'), (e.global = !1));
      }),
      ie.ajaxTransport('script', function(t) {
        if (t.crossDomain) {
          var i,
            r = g.head || ie('head')[0] || g.documentElement;
          return {
            send: function(e, n) {
              ((i = g.createElement('script')).async = !0),
                t.scriptCharset && (i.charset = t.scriptCharset),
                (i.src = t.url),
                (i.onload = i.onreadystatechange = function(e, t) {
                  (t ||
                    !i.readyState ||
                    /loaded|complete/.test(i.readyState)) &&
                    ((i.onload = i.onreadystatechange = null),
                    i.parentNode && i.parentNode.removeChild(i),
                    (i = null),
                    t || n(200, 'success'));
                }),
                r.insertBefore(i, r.firstChild);
            },
            abort: function() {
              i && i.onload(C, !0);
            }
          };
        }
      });
    var Qe = [],
      et = /(=)\?(?=&|$)|\?\?/;
    ie.ajaxSetup({
      jsonp: 'callback',
      jsonpCallback: function() {
        var e = Qe.pop() || ie.expando + '_' + Ie++;
        return (this[e] = !0), e;
      }
    }),
      ie.ajaxPrefilter('json jsonp', function(e, t, n) {
        var i,
          r,
          o,
          a =
            !1 !== e.jsonp &&
            (et.test(e.url)
              ? 'url'
              : 'string' == typeof e.data &&
                !(e.contentType || '').indexOf(
                  'application/x-www-form-urlencoded'
                ) &&
                et.test(e.data) &&
                'data');
        if (a || 'jsonp' === e.dataTypes[0])
          return (
            (i = e.jsonpCallback = ie.isFunction(e.jsonpCallback)
              ? e.jsonpCallback()
              : e.jsonpCallback),
            a
              ? (e[a] = e[a].replace(et, '$1' + i))
              : !1 !== e.jsonp &&
                (e.url += (We.test(e.url) ? '&' : '?') + e.jsonp + '=' + i),
            (e.converters['script json'] = function() {
              return o || ie.error(i + ' was not called'), o[0];
            }),
            (e.dataTypes[0] = 'json'),
            (r = h[i]),
            (h[i] = function() {
              o = arguments;
            }),
            n.always(function() {
              (h[i] = r),
                e[i] && ((e.jsonpCallback = t.jsonpCallback), Qe.push(i)),
                o && ie.isFunction(r) && r(o[0]),
                (o = r = C);
            }),
            'script'
          );
      });
    var tt,
      nt,
      it = 0,
      rt =
        h.ActiveXObject &&
        function() {
          var e;
          for (e in tt) tt[e](C, !0);
        };

    function createStandardXHR() {
      try {
        return new h.XMLHttpRequest();
      } catch (e) {}
    }
    (ie.ajaxSettings.xhr = h.ActiveXObject
      ? function() {
          return (
            (!this.isLocal && createStandardXHR()) ||
            (function createActiveXHR() {
              try {
                return new h.ActiveXObject('Microsoft.XMLHTTP');
              } catch (e) {}
            })()
          );
        }
      : createStandardXHR),
      (nt = ie.ajaxSettings.xhr()),
      (ie.support.cors = !!nt && 'withCredentials' in nt),
      (nt = ie.support.ajax = !!nt) &&
        ie.ajaxTransport(function(u) {
          var c;
          if (!u.crossDomain || ie.support.cors)
            return {
              send: function(e, a) {
                var s,
                  t,
                  l = u.xhr();
                if (
                  (u.username
                    ? l.open(u.type, u.url, u.async, u.username, u.password)
                    : l.open(u.type, u.url, u.async),
                  u.xhrFields)
                )
                  for (t in u.xhrFields) l[t] = u.xhrFields[t];
                u.mimeType &&
                  l.overrideMimeType &&
                  l.overrideMimeType(u.mimeType),
                  u.crossDomain ||
                    e['X-Requested-With'] ||
                    (e['X-Requested-With'] = 'XMLHttpRequest');
                try {
                  for (t in e) l.setRequestHeader(t, e[t]);
                } catch (e) {}
                l.send((u.hasContent && u.data) || null),
                  (c = function(e, t) {
                    var n, i, r, o;
                    try {
                      if (c && (t || 4 === l.readyState))
                        if (
                          ((c = C),
                          s &&
                            ((l.onreadystatechange = ie.noop),
                            rt && delete tt[s]),
                          t)
                        )
                          4 !== l.readyState && l.abort();
                        else {
                          (o = {}),
                            (n = l.status),
                            (i = l.getAllResponseHeaders()),
                            'string' == typeof l.responseText &&
                              (o.text = l.responseText);
                          try {
                            r = l.statusText;
                          } catch (e) {
                            r = '';
                          }
                          n || !u.isLocal || u.crossDomain
                            ? 1223 === n && (n = 204)
                            : (n = o.text ? 200 : 404);
                        }
                    } catch (e) {
                      t || a(-1, e);
                    }
                    o && a(n, r, o, i);
                  }),
                  u.async
                    ? 4 === l.readyState
                      ? setTimeout(c)
                      : ((s = ++it),
                        rt &&
                          (tt || ((tt = {}), ie(h).unload(rt)), (tt[s] = c)),
                        (l.onreadystatechange = c))
                    : c();
              },
              abort: function() {
                c && c(C, !0);
              }
            };
        });
    var ot,
      at,
      st = /^(?:toggle|show|hide)$/,
      lt = new RegExp('^(?:([+-])=|)(' + b + ')([a-z%]*)$', 'i'),
      ut = /queueHooks$/,
      ct = [
        function defaultPrefilter(t, e, n) {
          var i,
            r,
            o,
            a,
            s,
            l,
            u = this,
            c = {},
            f = t.style,
            d = t.nodeType && isHidden(t),
            p = ie._data(t, 'fxshow');
          n.queue ||
            (null == (s = ie._queueHooks(t, 'fx')).unqueued &&
              ((s.unqueued = 0),
              (l = s.empty.fire),
              (s.empty.fire = function() {
                s.unqueued || l();
              })),
            s.unqueued++,
            u.always(function() {
              u.always(function() {
                s.unqueued--, ie.queue(t, 'fx').length || s.empty.fire();
              });
            }));
          1 === t.nodeType &&
            ('height' in e || 'width' in e) &&
            ((n.overflow = [f.overflow, f.overflowX, f.overflowY]),
            'inline' === ie.css(t, 'display') &&
              'none' === ie.css(t, 'float') &&
              (ie.support.inlineBlockNeedsLayout &&
              'inline' !== css_defaultDisplay(t.nodeName)
                ? (f.zoom = 1)
                : (f.display = 'inline-block')));
          n.overflow &&
            ((f.overflow = 'hidden'),
            ie.support.shrinkWrapBlocks ||
              u.always(function() {
                (f.overflow = n.overflow[0]),
                  (f.overflowX = n.overflow[1]),
                  (f.overflowY = n.overflow[2]);
              }));
          for (i in e)
            if (((r = e[i]), st.exec(r))) {
              if (
                (delete e[i],
                (o = o || 'toggle' === r),
                r === (d ? 'hide' : 'show'))
              )
                continue;
              c[i] = (p && p[i]) || ie.style(t, i);
            }
          if (!ie.isEmptyObject(c))
            for (i in (p
              ? 'hidden' in p && (d = p.hidden)
              : (p = ie._data(t, 'fxshow', {})),
            o && (p.hidden = !d),
            d
              ? ie(t).show()
              : u.done(function() {
                  ie(t).hide();
                }),
            u.done(function() {
              var e;
              for (e in (ie._removeData(t, 'fxshow'), c)) ie.style(t, e, c[e]);
            }),
            c))
              (a = createTween(d ? p[i] : 0, i, u)),
                i in p ||
                  ((p[i] = a.start),
                  d &&
                    ((a.end = a.start),
                    (a.start = 'width' === i || 'height' === i ? 1 : 0)));
        }
      ],
      ft = {
        '*': [
          function(e, t) {
            var n = this.createTween(e, t),
              i = n.cur(),
              r = lt.exec(t),
              o = (r && r[3]) || (ie.cssNumber[e] ? '' : 'px'),
              a =
                (ie.cssNumber[e] || ('px' !== o && +i)) &&
                lt.exec(ie.css(n.elem, e)),
              s = 1,
              l = 20;
            if (a && a[3] !== o)
              for (
                o = o || a[3], r = r || [], a = +i || 1;
                (a /= s = s || '.5'),
                  ie.style(n.elem, e, a + o),
                  s !== (s = n.cur() / i) && 1 !== s && --l;

              );
            return (
              r &&
                ((a = n.start = +a || +i || 0),
                (n.unit = o),
                (n.end = r[1] ? a + (r[1] + 1) * r[2] : +r[2])),
              n
            );
          }
        ]
      };

    function createFxNow() {
      return (
        setTimeout(function() {
          ot = C;
        }, 0),
        (ot = ie.now())
      );
    }

    function createTween(e, t, n) {
      for (
        var i, r = (ft[t] || []).concat(ft['*']), o = 0, a = r.length;
        o < a;
        o++
      )
        if ((i = r[o].call(n, t, e))) return i;
    }

    function Animation(o, e, t) {
      var n,
        a,
        i = 0,
        r = ct.length,
        s = ie.Deferred().always(function() {
          delete l.elem;
        }),
        l = function() {
          if (a) return !1;
          for (
            var e = ot || createFxNow(),
              t = Math.max(0, u.startTime + u.duration - e),
              n = 1 - (t / u.duration || 0),
              i = 0,
              r = u.tweens.length;
            i < r;
            i++
          )
            u.tweens[i].run(n);
          return (
            s.notifyWith(o, [u, n, t]),
            n < 1 && r ? t : (s.resolveWith(o, [u]), !1)
          );
        },
        u = s.promise({
          elem: o,
          props: ie.extend({}, e),
          opts: ie.extend(
            !0,
            {
              specialEasing: {}
            },
            t
          ),
          originalProperties: e,
          originalOptions: t,
          startTime: ot || createFxNow(),
          duration: t.duration,
          tweens: [],
          createTween: function(e, t) {
            var n = ie.Tween(
              o,
              u.opts,
              e,
              t,
              u.opts.specialEasing[e] || u.opts.easing
            );
            return u.tweens.push(n), n;
          },
          stop: function(e) {
            var t = 0,
              n = e ? u.tweens.length : 0;
            if (a) return this;
            for (a = !0; t < n; t++) u.tweens[t].run(1);
            return e ? s.resolveWith(o, [u, e]) : s.rejectWith(o, [u, e]), this;
          }
        }),
        c = u.props;
      for (
        !(function propFilter(e, t) {
          var n, i, r, o, a;
          for (n in e)
            if (
              ((i = ie.camelCase(n)),
              (r = t[i]),
              (o = e[n]),
              ie.isArray(o) && ((r = o[1]), (o = e[n] = o[0])),
              n !== i && ((e[i] = o), delete e[n]),
              (a = ie.cssHooks[i]) && ('expand' in a))
            )
              for (n in ((o = a.expand(o)), delete e[i], o))
                (n in e) || ((e[n] = o[n]), (t[n] = r));
            else t[i] = r;
        })(c, u.opts.specialEasing);
        i < r;
        i++
      )
        if ((n = ct[i].call(u, o, c, u.opts))) return n;
      return (
        ie.map(c, createTween, u),
        ie.isFunction(u.opts.start) && u.opts.start.call(o, u),
        ie.fx.timer(
          ie.extend(l, {
            elem: o,
            anim: u,
            queue: u.opts.queue
          })
        ),
        u
          .progress(u.opts.progress)
          .done(u.opts.done, u.opts.complete)
          .fail(u.opts.fail)
          .always(u.opts.always)
      );
    }

    function Tween(e, t, n, i, r) {
      return new Tween.prototype.init(e, t, n, i, r);
    }

    function genFx(e, t) {
      var n,
        i = {
          height: e
        },
        r = 0;
      for (t = t ? 1 : 0; r < 4; r += 2 - t)
        i['margin' + (n = Me[r])] = i['padding' + n] = e;
      return t && (i.opacity = i.width = e), i;
    }

    function getWindow(e) {
      return ie.isWindow(e)
        ? e
        : 9 === e.nodeType && (e.defaultView || e.parentWindow);
    }
    (ie.Animation = ie.extend(Animation, {
      tweener: function(e, t) {
        for (
          var n,
            i = 0,
            r = (e = ie.isFunction(e) ? ((t = e), ['*']) : e.split(' ')).length;
          i < r;
          i++
        )
          (n = e[i]), (ft[n] = ft[n] || []), ft[n].unshift(t);
      },
      prefilter: function(e, t) {
        t ? ct.unshift(e) : ct.push(e);
      }
    })),
      (((ie.Tween = Tween).prototype = {
        constructor: Tween,
        init: function(e, t, n, i, r, o) {
          (this.elem = e),
            (this.prop = n),
            (this.easing = r || 'swing'),
            (this.options = t),
            (this.start = this.now = this.cur()),
            (this.end = i),
            (this.unit = o || (ie.cssNumber[n] ? '' : 'px'));
        },
        cur: function() {
          var e = Tween.propHooks[this.prop];
          return e && e.get ? e.get(this) : Tween.propHooks._default.get(this);
        },
        run: function(e) {
          var t,
            n = Tween.propHooks[this.prop];
          return (
            this.options.duration
              ? (this.pos = t = ie.easing[this.easing](
                  e,
                  this.options.duration * e,
                  0,
                  1,
                  this.options.duration
                ))
              : (this.pos = t = e),
            (this.now = (this.end - this.start) * t + this.start),
            this.options.step &&
              this.options.step.call(this.elem, this.now, this),
            n && n.set ? n.set(this) : Tween.propHooks._default.set(this),
            this
          );
        }
      }).init.prototype = Tween.prototype),
      ((Tween.propHooks = {
        _default: {
          get: function(e) {
            var t;
            return null == e.elem[e.prop] ||
              (e.elem.style && null != e.elem.style[e.prop])
              ? (t = ie.css(e.elem, e.prop, '')) && 'auto' !== t
                ? t
                : 0
              : e.elem[e.prop];
          },
          set: function(e) {
            ie.fx.step[e.prop]
              ? ie.fx.step[e.prop](e)
              : e.elem.style &&
                (null != e.elem.style[ie.cssProps[e.prop]] ||
                  ie.cssHooks[e.prop])
              ? ie.style(e.elem, e.prop, e.now + e.unit)
              : (e.elem[e.prop] = e.now);
          }
        }
      }).scrollTop = Tween.propHooks.scrollLeft = {
        set: function(e) {
          e.elem.nodeType && e.elem.parentNode && (e.elem[e.prop] = e.now);
        }
      }),
      ie.each(['toggle', 'show', 'hide'], function(e, i) {
        var r = ie.fn[i];
        ie.fn[i] = function(e, t, n) {
          return null == e || 'boolean' == typeof e
            ? r.apply(this, arguments)
            : this.animate(genFx(i, !0), e, t, n);
        };
      }),
      ie.fn.extend({
        fadeTo: function(e, t, n, i) {
          return this.filter(isHidden)
            .css('opacity', 0)
            .show()
            .end()
            .animate(
              {
                opacity: t
              },
              e,
              n,
              i
            );
        },
        animate: function(t, e, n, i) {
          var r = ie.isEmptyObject(t),
            o = ie.speed(e, n, i),
            a = function() {
              var e = Animation(this, ie.extend({}, t), o);
              (r || ie._data(this, 'finish')) && e.stop(!0);
            };
          return (
            (a.finish = a),
            r || !1 === o.queue ? this.each(a) : this.queue(o.queue, a)
          );
        },
        stop: function(r, e, o) {
          var a = function(e) {
            var t = e.stop;
            delete e.stop, t(o);
          };
          return (
            'string' != typeof r && ((o = e), (e = r), (r = C)),
            e && !1 !== r && this.queue(r || 'fx', []),
            this.each(function() {
              var e = !0,
                t = null != r && r + 'queueHooks',
                n = ie.timers,
                i = ie._data(this);
              if (t) i[t] && i[t].stop && a(i[t]);
              else for (t in i) i[t] && i[t].stop && ut.test(t) && a(i[t]);
              for (t = n.length; t--; )
                n[t].elem !== this ||
                  (null != r && n[t].queue !== r) ||
                  (n[t].anim.stop(o), (e = !1), n.splice(t, 1));
              (!e && o) || ie.dequeue(this, r);
            })
          );
        },
        finish: function(a) {
          return (
            !1 !== a && (a = a || 'fx'),
            this.each(function() {
              var e,
                t = ie._data(this),
                n = t[a + 'queue'],
                i = t[a + 'queueHooks'],
                r = ie.timers,
                o = n ? n.length : 0;
              for (
                t.finish = !0,
                  ie.queue(this, a, []),
                  i && i.stop && i.stop.call(this, !0),
                  e = r.length;
                e--;

              )
                r[e].elem === this &&
                  r[e].queue === a &&
                  (r[e].anim.stop(!0), r.splice(e, 1));
              for (e = 0; e < o; e++)
                n[e] && n[e].finish && n[e].finish.call(this);
              delete t.finish;
            })
          );
        }
      }),
      ie.each(
        {
          slideDown: genFx('show'),
          slideUp: genFx('hide'),
          slideToggle: genFx('toggle'),
          fadeIn: {
            opacity: 'show'
          },
          fadeOut: {
            opacity: 'hide'
          },
          fadeToggle: {
            opacity: 'toggle'
          }
        },
        function(e, i) {
          ie.fn[e] = function(e, t, n) {
            return this.animate(i, e, t, n);
          };
        }
      ),
      (ie.speed = function(e, t, n) {
        var i =
          e && 'object' == typeof e
            ? ie.extend({}, e)
            : {
                complete: n || (!n && t) || (ie.isFunction(e) && e),
                duration: e,
                easing: (n && t) || (t && !ie.isFunction(t) && t)
              };
        return (
          (i.duration = ie.fx.off
            ? 0
            : 'number' == typeof i.duration
            ? i.duration
            : i.duration in ie.fx.speeds
            ? ie.fx.speeds[i.duration]
            : ie.fx.speeds._default),
          (null != i.queue && !0 !== i.queue) || (i.queue = 'fx'),
          (i.old = i.complete),
          (i.complete = function() {
            ie.isFunction(i.old) && i.old.call(this),
              i.queue && ie.dequeue(this, i.queue);
          }),
          i
        );
      }),
      (ie.easing = {
        linear: function(e) {
          return e;
        },
        swing: function(e) {
          return 0.5 - Math.cos(e * Math.PI) / 2;
        }
      }),
      (ie.timers = []),
      (ie.fx = Tween.prototype.init),
      (ie.fx.tick = function() {
        var e,
          t = ie.timers,
          n = 0;
        for (ot = ie.now(); n < t.length; n++)
          (e = t[n])() || t[n] !== e || t.splice(n--, 1);
        t.length || ie.fx.stop(), (ot = C);
      }),
      (ie.fx.timer = function(e) {
        e() && ie.timers.push(e) && ie.fx.start();
      }),
      (ie.fx.interval = 13),
      (ie.fx.start = function() {
        at || (at = setInterval(ie.fx.tick, ie.fx.interval));
      }),
      (ie.fx.stop = function() {
        clearInterval(at), (at = null);
      }),
      (ie.fx.speeds = {
        slow: 600,
        fast: 200,
        _default: 400
      }),
      (ie.fx.step = {}),
      ie.expr &&
        ie.expr.filters &&
        (ie.expr.filters.animated = function(t) {
          return ie.grep(ie.timers, function(e) {
            return t === e.elem;
          }).length;
        }),
      (ie.fn.offset = function(t) {
        if (arguments.length)
          return t === C
            ? this
            : this.each(function(e) {
                ie.offset.setOffset(this, t, e);
              });
        var e,
          n,
          i = {
            top: 0,
            left: 0
          },
          r = this[0],
          o = r && r.ownerDocument;
        return o
          ? ((e = o.documentElement),
            ie.contains(e, r)
              ? (typeof r.getBoundingClientRect !== v &&
                  (i = r.getBoundingClientRect()),
                (n = getWindow(o)),
                {
                  top:
                    i.top + (n.pageYOffset || e.scrollTop) - (e.clientTop || 0),
                  left:
                    i.left +
                    (n.pageXOffset || e.scrollLeft) -
                    (e.clientLeft || 0)
                })
              : i)
          : void 0;
      }),
      (ie.offset = {
        setOffset: function(e, t, n) {
          var i = ie.css(e, 'position');
          'static' === i && (e.style.position = 'relative');
          var r,
            o,
            a = ie(e),
            s = a.offset(),
            l = ie.css(e, 'top'),
            u = ie.css(e, 'left'),
            c = {},
            f = {};
          (o =
            ('absolute' === i || 'fixed' === i) &&
            -1 < ie.inArray('auto', [l, u])
              ? ((r = (f = a.position()).top), f.left)
              : ((r = parseFloat(l) || 0), parseFloat(u) || 0)),
            ie.isFunction(t) && (t = t.call(e, n, s)),
            null != t.top && (c.top = t.top - s.top + r),
            null != t.left && (c.left = t.left - s.left + o),
            'using' in t ? t.using.call(e, c) : a.css(c);
        }
      }),
      ie.fn.extend({
        position: function() {
          if (this[0]) {
            var e,
              t,
              n = {
                top: 0,
                left: 0
              },
              i = this[0];
            return (
              'fixed' === ie.css(i, 'position')
                ? (t = i.getBoundingClientRect())
                : ((e = this.offsetParent()),
                  (t = this.offset()),
                  ie.nodeName(e[0], 'html') || (n = e.offset()),
                  (n.top += ie.css(e[0], 'borderTopWidth', !0)),
                  (n.left += ie.css(e[0], 'borderLeftWidth', !0))),
              {
                top: t.top - n.top - ie.css(i, 'marginTop', !0),
                left: t.left - n.left - ie.css(i, 'marginLeft', !0)
              }
            );
          }
        },
        offsetParent: function() {
          return this.map(function() {
            for (
              var e = this.offsetParent || t;
              e &&
              !ie.nodeName(e, 'html') &&
              'static' === ie.css(e, 'position');

            )
              e = e.offsetParent;
            return e || t;
          });
        }
      }),
      ie.each(
        {
          scrollLeft: 'pageXOffset',
          scrollTop: 'pageYOffset'
        },
        function(t, r) {
          var o = /Y/.test(r);
          ie.fn[t] = function(e) {
            return ie.access(
              this,
              function(e, t, n) {
                var i = getWindow(e);
                if (n === C)
                  return i
                    ? r in i
                      ? i[r]
                      : i.document.documentElement[t]
                    : e[t];
                i
                  ? i.scrollTo(
                      o ? ie(i).scrollLeft() : n,
                      o ? n : ie(i).scrollTop()
                    )
                  : (e[t] = n);
              },
              t,
              e,
              arguments.length,
              null
            );
          };
        }
      ),
      ie.each(
        {
          Height: 'height',
          Width: 'width'
        },
        function(o, a) {
          ie.each(
            {
              padding: 'inner' + o,
              content: a,
              '': 'outer' + o
            },
            function(i, e) {
              ie.fn[e] = function(e, t) {
                var n = arguments.length && (i || 'boolean' != typeof e),
                  r = i || (!0 === e || !0 === t ? 'margin' : 'border');
                return ie.access(
                  this,
                  function(e, t, n) {
                    var i;
                    return ie.isWindow(e)
                      ? e.document.documentElement['client' + o]
                      : 9 === e.nodeType
                      ? ((i = e.documentElement),
                        Math.max(
                          e.body['scroll' + o],
                          i['scroll' + o],
                          e.body['offset' + o],
                          i['offset' + o],
                          i['client' + o]
                        ))
                      : n === C
                      ? ie.css(e, t, r)
                      : ie.style(e, t, n, r);
                  },
                  a,
                  n ? e : C,
                  n,
                  null
                );
              };
            }
          );
        }
      ),
      (ie.fn.size = function() {
        return this.length;
      }),
      (ie.fn.andSelf = ie.fn.addBack),
      'object' == typeof module && module && 'object' == typeof module.exports
        ? (module.exports = ie)
        : ((h.jQuery = h.$ = ie),
          'function' == typeof define &&
            define.hasOwnProperty('amd') &&
            define('jquery', [], function() {
              return ie;
            }));
  })(window),
  (function() {
    var i = function(e) {
      this.w = e || [];
    };
    (i.prototype.set = function(e) {
      this.w[e] = !0;
    }),
      (i.prototype.encode = function() {
        for (var e = [], t = 0; t < this.w.length; t++)
          this.w[t] && (e[Math.floor(t / 6)] ^= 1 << t % 6);
        for (t = 0; t < e.length; t++)
          e[
            t
          ] = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'.charAt(
            e[t] || 0
          );
        return e.join('') + '~';
      });
    var r = new i();

    function J(e) {
      r.set(e);
    }
    var o = function(e, t) {
        var n = new i(s(e));
        n.set(t), e.set(et, n.w);
      },
      a = function(e) {
        (e = s(e)), (e = new i(e));
        for (var t = r.w.slice(), n = 0; n < e.w.length; n++)
          t[n] = t[n] || e.w[n];
        return new i(t).encode();
      },
      s = function(e) {
        return (e = e.get(et)), u(e) || (e = []), e;
      },
      l = function(e) {
        return 'function' == typeof e;
      },
      u = function(e) {
        return '[object Array]' == Object.prototype.toString.call(Object(e));
      },
      n = function(e) {
        return null != e && -1 < (e.constructor + '').indexOf('String');
      },
      f = function(e, t) {
        return 0 == e.indexOf(t);
      },
      p = function(e) {
        return e ? e.replace(/^[\s\xa0]+|[\s\xa0]+$/g, '') : '';
      },
      h = function(e) {
        var t = A.createElement('img');
        return (t.width = 1), (t.height = 1), (t.src = e), t;
      },
      g = function() {},
      m = function(e) {
        return encodeURIComponent instanceof Function
          ? encodeURIComponent(e)
          : (J(28), e);
      },
      v = function(e, t, n, i) {
        try {
          e.addEventListener
            ? e.addEventListener(t, n, !!i)
            : e.attachEvent && e.attachEvent('on' + t, n);
        } catch (e) {
          J(27);
        }
      },
      y = /^[\w\-:/.?=&%!]+$/,
      x = function(e, t, n) {
        e &&
          (n
            ? ((n = ''),
              t && y.test(t) && (n = ' id="' + t + '"'),
              y.test(e) &&
                A.write('<script' + n + ' src="' + e + '"></script>'))
            : (((n = A.createElement('script')).type = 'text/javascript'),
              (n.async = !0),
              (n.src = e),
              t && (n.id = t),
              (e = A.getElementsByTagName('script')[0]).parentNode.insertBefore(
                n,
                e
              )));
      },
      w = function() {
        return 'https:' == A.location.protocol;
      },
      T = function(e, t) {
        var n = e.match(
          '(?:&|#|\\?)' +
            m(t).replace(/([.*+?^=!:${}()|\[\]\/\\])/g, '\\$1') +
            '=([^&#]*)'
        );
        return n && 2 == n.length ? n[1] : '';
      },
      C = function() {
        var e = '' + A.location.hostname;
        return 0 == e.indexOf('www.') ? e.substring(4) : e;
      },
      S = function(e, t) {
        if (1 == t.length && null != t[0] && 'object' == typeof t[0])
          return t[0];
        for (
          var n = {}, i = Math.min(e.length + 1, t.length), r = 0;
          r < i;
          r++
        ) {
          if ('object' == typeof t[r]) {
            for (var o in t[r]) t[r].hasOwnProperty(o) && (n[o] = t[r][o]);
            break;
          }
          r < e.length && (n[e[r]] = t[r]);
        }
        return n;
      },
      E = function() {
        (this.keys = []), (this.values = {}), (this.m = {});
      };
    (E.prototype.set = function(e, t, n) {
      this.keys.push(e), n ? (this.m[':' + e] = t) : (this.values[':' + e] = t);
    }),
      (E.prototype.get = function(e) {
        return this.m.hasOwnProperty(':' + e)
          ? this.m[':' + e]
          : this.values[':' + e];
      }),
      (E.prototype.map = function(e) {
        for (var t = 0; t < this.keys.length; t++) {
          var n = this.keys[t],
            i = this.get(n);
          i && e(n, i);
        }
      });
    var k = window,
      A = document,
      N = window,
      L = function(e) {
        var t = N._gaUserPrefs;
        if ((t && t.ioo && t.ioo()) || (e && !0 === N['ga-disable-' + e]))
          return !0;
        try {
          var n = N.external;
          if (n && n._gaUserPrefs && 'oo' == n._gaUserPrefs) return !0;
        } catch (e) {}
        return !1;
      },
      O = function(e) {
        var t = [],
          n = A.cookie.split(';');
        e = new RegExp('^\\s*' + e + '=\\s*(.*?)\\s*$');
        for (var i = 0; i < n.length; i++) {
          var r = n[i].match(e);
          r && t.push(r[1]);
        }
        return t;
      },
      D = function(e, t, n, i, r, o) {
        if (
          !(r =
            !L(r) && !(H.test(A.location.hostname) || ('/' == n && P.test(i))))
        )
          return !1;
        if (
          (t && 1200 < t.length && ((t = t.substring(0, 1200)), J(24)),
          (n = e + '=' + t + '; path=' + n + '; '),
          o &&
            (n +=
              'expires=' +
              new Date(new Date().getTime() + o).toGMTString() +
              '; '),
          i && 'none' != i && (n += 'domain=' + i + ';'),
          (i = A.cookie),
          (A.cookie = n),
          !(i = i != A.cookie))
        )
          e: {
            for (e = O(e), i = 0; i < e.length; i++)
              if (t == e[i]) {
                i = !0;
                break e;
              }
            i = !1;
          }
        return i;
      },
      M = function(e) {
        return m(e)
          .replace(/\(/g, '%28')
          .replace(/\)/g, '%29');
      },
      P = /^(www\.)?google(\.com?)?(\.[a-z]{2})?$/,
      H = /(^|\.)doubleclick\.net$/i,
      j = function() {
        return (oe || w() ? 'https:' : 'http:') + '//www.google-analytics.com';
      },
      _ = function(e) {
        (this.name = 'len'), (this.message = e + '-8192');
      },
      F = function(e, t, n) {
        if (((n = n || g), t.length <= 2036)) R(e, t, n);
        else {
          if (!(t.length <= 8192)) throw (I('len', t.length), new _(t.length));
          z(e, t, n) || B(e, t, n) || R(e, t, n);
        }
      },
      R = function(e, t, n) {
        var i = h(e + '?' + t);
        i.onload = i.onerror = function() {
          (i.onload = null), (i.onerror = null), n();
        };
      },
      B = function(e, t, n) {
        var i = k.XMLHttpRequest;
        if (!i) return !1;
        var r = new i();
        return (
          'withCredentials' in r &&
          (r.open('POST', e, !0),
          (r.withCredentials = !0),
          r.setRequestHeader('Content-Type', 'text/plain'),
          (r.onreadystatechange = function() {
            4 == r.readyState && (n(), (r = null));
          }),
          r.send(t),
          !0)
        );
      },
      z = function(e, t, n) {
        return (
          !!k.navigator.sendBeacon &&
          (!!k.navigator.sendBeacon(e, t) && (n(), !0))
        );
      },
      I = function(e, t, n) {
        1 <= 100 * Math.random() ||
          L('?') ||
          ((e = ['t=error', '_e=' + e, '_v=j47', 'sr=1']),
          t && e.push('_f=' + t),
          n && e.push('_m=' + m(n.substring(0, 100))),
          e.push('aip=1'),
          e.push('z=' + $()),
          R(j() + '/collect', e.join('&'), g));
      },
      W = function(e) {
        var t = (k.gaData = k.gaData || {});
        return (t[e] = t[e] || {});
      },
      q = function() {
        this.M = [];
      };

    function Ja(e) {
      if (100 != e.get(Ot) && La(Y(e, vt)) % 1e4 >= 100 * Z(e, Ot))
        throw 'abort';
    }

    function Ma(e) {
      if (L(Y(e, xt))) throw 'abort';
    }

    function Oa() {
      var e = A.location.protocol;
      if ('http:' != e && 'https:' != e) throw 'abort';
    }

    function Pa(i) {
      try {
        k.navigator.sendBeacon
          ? J(42)
          : k.XMLHttpRequest &&
            'withCredentials' in new k.XMLHttpRequest() &&
            J(40);
      } catch (e) {}
      i.set(Qe, a(i), !0), i.set(he, Z(i, he) + 1);
      var r = [];
      G.map(function(e, t) {
        if (t.F) {
          var n = i.get(e);
          null != n &&
            n != t.defaultValue &&
            ('boolean' == typeof n && (n *= 1), r.push(t.F + '=' + m('' + n)));
        }
      }),
        r.push('z=' + U()),
        i.set(fe, r.join('&'), !0);
    }

    function Sa(e) {
      var t = Y(e, Pt) || j() + '/collect',
        n = Y(e, pe);
      if ((!n && e.get(de) && (n = 'beacon'), n)) {
        var i = Y(e, fe),
          r = (r = e.get(ce)) || g;
        'image' == n
          ? R(t, i, r)
          : ('xhr' == n && B(t, i, r)) ||
            ('beacon' == n && z(t, i, r)) ||
            F(t, i, r);
      } else F(t, Y(e, fe), e.get(ce));
      (t = e.get(xt)),
        (n = (t = W(t)).hitcount),
        (t.hitcount = n ? n + 1 : 1),
        (t = e.get(xt)),
        delete W(t).pending_experiments,
        e.set(ce, g, !0);
    }

    function Hc(e) {
      var t;
      (k.gaData = k.gaData || {}).expId &&
        e.set($e, (k.gaData = k.gaData || {}).expId),
        (k.gaData = k.gaData || {}).expVar &&
          e.set(Ue, (k.gaData = k.gaData || {}).expVar);
      var n = e.get(xt);
      if ((n = W(n).pending_experiments)) {
        var i = [];
        for (t in n)
          n.hasOwnProperty(t) &&
            n[t] &&
            i.push(encodeURIComponent(t) + '.' + encodeURIComponent(n[t]));
        t = i.join('!');
      } else t = void 0;
      t && e.set(Ve, t, !0);
    }

    function cd() {
      if (k.navigator && 'preview' == k.navigator.loadPurpose) throw 'abort';
    }

    function yd(e) {
      var t = k.gaDevIds;
      u(t) && 0 != t.length && e.set('&did', t.join(','), !0);
    }

    function vb(e) {
      if (!e.get(xt)) throw 'abort';
    }
    (q.prototype.add = function(e) {
      this.M.push(e);
    }),
      (q.prototype.D = function(e) {
        try {
          for (var t = 0; t < this.M.length; t++) {
            var n = e.get(this.M[t]);
            n && l(n) && n.call(k, e);
          }
        } catch (e) {}
        (t = e.get(ce)) != g && l(t) && (e.set(ce, g, !0), setTimeout(t, 10));
      });
    var $ = function() {
        return Math.round(2147483647 * Math.random());
      },
      U = function() {
        try {
          var e = new Uint32Array(1);
          return k.crypto.getRandomValues(e), 2147483647 & e[0];
        } catch (e) {
          return $();
        }
      };

    function Ta(e) {
      var t = Z(e, Ke);
      if ((500 <= t && J(15), 'transaction' != (n = Y(e, ue)) && 'item' != n)) {
        var n = Z(e, Ze),
          i = new Date().getTime(),
          r = Z(e, Ye);
        if (
          (0 == r && e.set(Ye, i),
          0 < (r = Math.round((2 * (i - r)) / 1e3)) &&
            ((n = Math.min(n + r, 20)), e.set(Ye, i)),
          n <= 0)
        )
          throw 'abort';
        e.set(Ze, --n);
      }
      e.set(Ke, ++t);
    }
    var V = function() {
        this.data = new E();
      },
      G = new E(),
      K = [];
    V.prototype.get = function(e) {
      var t = te(e),
        n = this.data.get(e);
      return (
        t &&
          null == n &&
          (n = l(t.defaultValue) ? t.defaultValue() : t.defaultValue),
        t && t.Z ? t.Z(this, e, n) : n
      );
    };
    var Y = function(e, t) {
        var n = e.get(t);
        return null == n ? '' : '' + n;
      },
      Z = function(e, t) {
        var n = e.get(t);
        return null == n || '' === n ? 0 : 1 * n;
      };
    V.prototype.set = function(e, t, n) {
      if (e)
        if ('object' == typeof e)
          for (var i in e) e.hasOwnProperty(i) && Q(this, i, e[i], n);
        else Q(this, e, t, n);
    };
    var Q = function(e, t, n, i) {
        if (null != n)
          switch (t) {
            case xt:
              hn.test(n);
          }
        var r = te(t);
        r && r.o ? r.o(e, t, n, i) : e.data.set(t, n, i);
      },
      ee = function(e, t, n, i, r) {
        (this.name = e),
          (this.F = t),
          (this.Z = i),
          (this.o = r),
          (this.defaultValue = n);
      },
      te = function(e) {
        var t = G.get(e);
        if (!t)
          for (var n = 0; n < K.length; n++) {
            var i = K[n],
              r = i[0].exec(e);
            if (r) {
              (t = i[1](r)), G.set(t.name, t);
              break;
            }
          }
        return t;
      },
      ne = function(e, t, n, i, r) {
        return (e = new ee(e, t, n, i, r)), G.set(e.name, e), e.name;
      },
      e = function(e, t) {
        K.push([new RegExp('^' + e + '$'), t]);
      },
      t = function(e, t, n) {
        return ne(e, t, n, void 0, ie);
      },
      ie = function() {},
      re =
        (n(window.GoogleAnalyticsObject) && p(window.GoogleAnalyticsObject)) ||
        'ga',
      oe = !1,
      ae = t('apiVersion', 'v'),
      se = t('clientVersion', '_v');
    ne('anonymizeIp', 'aip');
    var le = ne('adSenseId', 'a'),
      ue = ne('hitType', 't'),
      ce = ne('hitCallback'),
      fe = ne('hitPayload');
    ne('nonInteraction', 'ni'),
      ne('currencyCode', 'cu'),
      ne('dataSource', 'ds');
    var de = ne('useBeacon', void 0, !1),
      pe = ne('transport');
    ne('sessionControl', 'sc', ''),
      ne('sessionGroup', 'sg'),
      ne('queueTime', 'qt');
    var he = ne('_s', '_s');
    ne('screenName', 'cd');
    var ge = ne('location', 'dl', ''),
      me = ne('referrer', 'dr'),
      ve = ne('page', 'dp', '');
    ne('hostname', 'dh');
    var ye = ne('language', 'ul'),
      be = ne('encoding', 'de');
    ne('title', 'dt', function() {
      return A.title || void 0;
    }),
      e('contentGroup([0-9]+)', function(e) {
        return new ee(e[0], 'cg' + e[1]);
      });
    var xe = ne('screenColors', 'sd'),
      we = ne('screenResolution', 'sr'),
      Te = ne('viewportSize', 'vp'),
      Ce = ne('javaEnabled', 'je'),
      Se = ne('flashVersion', 'fl');
    ne('campaignId', 'ci'),
      ne('campaignName', 'cn'),
      ne('campaignSource', 'cs'),
      ne('campaignMedium', 'cm'),
      ne('campaignKeyword', 'ck'),
      ne('campaignContent', 'cc');
    var Ee = ne('eventCategory', 'ec'),
      ke = ne('eventAction', 'ea'),
      Ae = ne('eventLabel', 'el'),
      Ne = ne('eventValue', 'ev'),
      Le = ne('socialNetwork', 'sn'),
      Oe = ne('socialAction', 'sa'),
      De = ne('socialTarget', 'st'),
      Me = ne('l1', 'plt'),
      Pe = ne('l2', 'pdt'),
      He = ne('l3', 'dns'),
      je = ne('l4', 'rrt'),
      _e = ne('l5', 'srt'),
      Fe = ne('l6', 'tcp'),
      Re = ne('l7', 'dit'),
      Be = ne('l8', 'clt'),
      ze = ne('timingCategory', 'utc'),
      Ie = ne('timingVar', 'utv'),
      We = ne('timingLabel', 'utl'),
      qe = ne('timingValue', 'utt');
    ne('appName', 'an'),
      ne('appVersion', 'av', ''),
      ne('appId', 'aid', ''),
      ne('appInstallerId', 'aiid', ''),
      ne('exDescription', 'exd'),
      ne('exFatal', 'exf');
    var $e = ne('expId', 'xid'),
      Ue = ne('expVar', 'xvar'),
      Ve = ne('exp', 'exp'),
      Xe = ne('_utma', '_utma'),
      Je = ne('_utmz', '_utmz'),
      Ge = ne('_utmht', '_utmht'),
      Ke = ne('_hc', void 0, 0),
      Ye = ne('_ti', void 0, 0),
      Ze = ne('_to', void 0, 20);
    e('dimension([0-9]+)', function(e) {
      return new ee(e[0], 'cd' + e[1]);
    }),
      e('metric([0-9]+)', function(e) {
        return new ee(e[0], 'cm' + e[1]);
      }),
      ne(
        'linkerParam',
        void 0,
        void 0,
        function Bc(e) {
          var t = Ic((e = e.get(vt)), 0);
          return '_ga=1.' + m(t + '.' + e);
        },
        ie
      );
    var Qe = ne('usage', '_u'),
      et = ne('_um');
    ne(
      'forceSSL',
      void 0,
      void 0,
      function() {
        return oe;
      },
      function(e, t, n) {
        J(34), (oe = !!n);
      }
    );
    var tt = ne('_j1', 'jid');
    e('\\&(.*)', function(e) {
      var n,
        i,
        t = new ee(e[0], e[1]),
        r =
          ((n = e[0].substring(1)),
          G.map(function(e, t) {
            t.F == n && (i = t);
          }),
          i && i.name);
      return (
        r &&
          ((t.Z = function(e) {
            return e.get(r);
          }),
          (t.o = function(e, t, n, i) {
            e.set(r, n, i);
          }),
          (t.F = void 0)),
        t
      );
    });
    var nt = t('_oot'),
      it = ne('previewTask'),
      rt = ne('checkProtocolTask'),
      ot = ne('validationTask'),
      at = ne('checkStorageTask'),
      st = ne('historyImportTask'),
      lt = ne('samplerTask'),
      ut = ne('_rlt'),
      ct = ne('buildHitTask'),
      ft = ne('sendHitTask'),
      dt = ne('ceTask'),
      pt = ne('devIdTask'),
      ht = ne('timingTask'),
      gt = ne('displayFeaturesTask'),
      mt = t('name'),
      vt = t('clientId', 'cid'),
      yt = t('clientIdTime'),
      bt = ne('userId', 'uid'),
      xt = t('trackingId', 'tid'),
      wt = t('cookieName', void 0, '_ga'),
      Tt = t('cookieDomain'),
      Ct = t('cookiePath', void 0, '/'),
      St = t('cookieExpires', void 0, 63072e3),
      Et = t('legacyCookieDomain'),
      kt = t('legacyHistoryImport', void 0, !0),
      At = t('storage', void 0, 'cookie'),
      Nt = t('allowLinker', void 0, !1),
      Lt = t('allowAnchor', void 0, !0),
      Ot = t('sampleRate', 'sf', 100),
      Dt = t('siteSpeedSampleRate', void 0, 1),
      Mt = t('alwaysSendReferrer', void 0, !1),
      Pt = ne('transportUrl'),
      Ht = ne('_r', '_r');

    function X(t, e, n, i) {
      e[t] = function() {
        try {
          return i && J(i), n.apply(this, arguments);
        } catch (e) {
          throw (I('exc', t, e && e.name), e);
        }
      };
    }
    var jt = function(e) {
        (this.V = e),
          (this.fa = void 0),
          (this.$ = !1),
          (this.oa = void 0),
          (this.ea = 1);
      },
      _t = function(e, t) {
        var n;
        if (e.fa && e.$) return 0;
        if (((e.$ = !0), t)) {
          if (e.oa && Z(t, e.oa)) return Z(t, e.oa);
          if (0 == t.get(Dt)) return 0;
        }
        return 0 == e.V
          ? 0
          : (void 0 === n && (n = U()),
            0 == n % e.V ? (Math.floor(n / e.V) % e.ea) + 1 : 0);
      };
    var Ft = function(e) {
        var t = {};
        if (Rt(t) || Bt(t)) {
          var n = t[Me];
          null == n ||
            1 / 0 == n ||
            isNaN(n) ||
            (0 < n
              ? (zt(t, He),
                zt(t, Fe),
                zt(t, _e),
                zt(t, Pe),
                zt(t, je),
                zt(t, Re),
                zt(t, Be),
                e(t))
              : v(
                  k,
                  'load',
                  function() {
                    Ft(e);
                  },
                  !1
                ));
        }
      },
      Rt = function(e) {
        var t;
        if (!(t = (t = k.performance || k.webkitPerformance) && t.timing))
          return !1;
        var n = t.navigationStart;
        return (
          0 != n &&
          ((e[Me] = t.loadEventStart - n),
          (e[He] = t.domainLookupEnd - t.domainLookupStart),
          (e[Fe] = t.connectEnd - t.connectStart),
          (e[_e] = t.responseStart - t.requestStart),
          (e[Pe] = t.responseEnd - t.responseStart),
          (e[je] = t.fetchStart - n),
          (e[Re] = t.domInteractive - n),
          (e[Be] = t.domContentLoadedEventStart - n),
          !0)
        );
      },
      Bt = function(e) {
        if (k.top != k) return !1;
        var t = k.external,
          n = t && t.onloadT;
        return (
          t && !t.isValidLoadTime && (n = void 0),
          2147483648 < n && (n = void 0),
          0 < n && t.setPageReadyTime(),
          null != n && ((e[Me] = n), !0)
        );
      },
      zt = function(e, t) {
        var n = e[t];
        (isNaN(n) || 1 / 0 == n || n < 0) && (e[t] = void 0);
      },
      It = function(r) {
        return function(e) {
          if ('pageview' == e.get(ue) && !r.I) {
            r.I = !0;
            var t =
              ((n = e),
              (i = Math.min(Z(n, Dt), 100)),
              !(La(Y(n, vt)) % 100 >= i));
            (e = 0 < T(e.get(ge), 'gclid').length),
              (t || e) &&
                Ft(function(e) {
                  r.send(t ? 'timing' : 'adtiming', e);
                });
          }
          var n, i;
        };
      },
      Wt = !1,
      qt = function(e) {
        if ('cookie' == Y(e, At)) {
          var t = Y(e, wt),
            n = Vt(e),
            i = Gt(Y(e, Ct)),
            r = Jt(Y(e, Tt)),
            o = 1e3 * Z(e, St),
            a = Y(e, xt);
          if ('auto' != r) D(t, n, i, r, a, o) && (Wt = !0);
          else {
            var s;
            if (
              (J(32),
              (n = []),
              4 != (r = C().split('.')).length ||
                ((s = r[r.length - 1]), parseInt(s, 10) != s))
            ) {
              for (s = r.length - 2; 0 <= s; s--) n.push(r.slice(s).join('.'));
              n.push('none'), (s = n);
            } else s = ['none'];
            for (var l = 0; l < s.length; l++)
              if (
                ((r = s[l]),
                e.data.set(Tt, r),
                (n = Vt(e)),
                D(t, n, i, r, a, o))
              )
                return void (Wt = !0);
            e.data.set(Tt, 'auto');
          }
        }
      },
      $t = function(e) {
        if ('cookie' == Y(e, At) && !Wt && (qt(e), !Wt)) throw 'abort';
      },
      Ut = function(e) {
        if (e.get(kt)) {
          var t = Y(e, Tt),
            n = Y(e, Et) || C(),
            i = Xc('__utma', n, t);
          i &&
            (J(19),
            e.set(Ge, new Date().getTime(), !0),
            e.set(Xe, i.R),
            (t = Xc('__utmz', n, t)) && i.hash == t.hash && e.set(Je, t.R));
        }
      },
      Vt = function(e) {
        var t = M(Y(e, vt)),
          n = Jt(Y(e, Tt)).split('.').length;
        return (
          1 < (e = Kt(Y(e, Ct))) && (n += '-' + e), ['GA1', n, t].join('.')
        );
      },
      Xt = function(e, t, n) {
        for (var i, r = [], o = [], a = 0; a < e.length; a++) {
          var s = e[a];
          s.H[n] == t
            ? r.push(s)
            : null == i || s.H[n] < i
            ? ((o = [s]), (i = s.H[n]))
            : s.H[n] == i && o.push(s);
        }
        return 0 < r.length ? r : o;
      },
      Jt = function(e) {
        return 0 == e.indexOf('.') ? e.substr(1) : e;
      },
      Gt = function(e) {
        return e
          ? (1 < e.length &&
              e.lastIndexOf('/') == e.length - 1 &&
              (e = e.substr(0, e.length - 1)),
            0 != e.indexOf('/') && (e = '/' + e),
            e)
          : '/';
      },
      Kt = function(e) {
        return '/' == (e = Gt(e)) ? 1 : e.split('/').length;
      };

    function Xc(e, t, n) {
      'none' == t && (t = '');
      var i = [],
        r = O(e);
      e = '__utma' == e ? 6 : 2;
      for (var o = 0; o < r.length; o++) {
        var a = ('' + r[o]).split('.');
        a.length >= e &&
          i.push({
            hash: a[0],
            R: r[o],
            O: a
          });
      }
      if (0 != i.length)
        return 1 == i.length
          ? i[0]
          : Zc(t, i) || Zc(n, i) || Zc(null, i) || i[0];
    }

    function Zc(e, t) {
      var n, i;
      null == e
        ? (n = i = 1)
        : ((n = La(e)), (i = La(f(e, '.') ? e.substring(1) : '.' + e)));
      for (var r = 0; r < t.length; r++)
        if (t[r].hash == n || t[r].hash == i) return t[r];
    }
    var Yt = new RegExp(/^https?:\/\/([^\/:]+)/),
      Zt = /(.*)([?&#])(?:_ga=[^&#]*)(?:&?)(.*)/;

    function Ic(e, t) {
      for (
        var n = new Date(),
          i = (r = k.navigator).plugins || [],
          r =
            ((n = [
              e,
              r.userAgent,
              n.getTimezoneOffset(),
              n.getYear(),
              n.getDate(),
              n.getHours(),
              n.getMinutes() + t
            ]),
            0);
        r < i.length;
        ++r
      )
        n.push(i[r].description);
      return La(n.join('.'));
    }
    var Qt = function(e) {
      J(48), (this.target = e), (this.T = !1);
    };
    Qt.prototype.ca = function(e, t) {
      if (e.tagName) {
        if ('a' == e.tagName.toLowerCase())
          return void (e.href && (e.href = en(this, e.href, t)));
        if ('form' == e.tagName.toLowerCase()) return tn(this, e);
      }
      if ('string' == typeof e) return en(this, e, t);
    };
    var en = function(e, t, n) {
        (r = Zt.exec(t)) &&
          3 <= r.length &&
          (t = r[1] + (r[3] ? r[2] + r[3] : '')),
          (e = e.target.get('linkerParam'));
        var i = t.indexOf('?'),
          r = t.indexOf('#');
        return (
          n
            ? (t += (-1 == r ? '#' : '&') + e)
            : ((n = -1 == i ? '?' : '&'),
              (t =
                -1 == r
                  ? t + (n + e)
                  : t.substring(0, r) + n + e + t.substring(r))),
          t.replace(/&+_ga=/, '&_ga=')
        );
      },
      tn = function(e, t) {
        if (t && t.action) {
          var n = e.target.get('linkerParam').split('=')[1];
          if ('get' == t.method.toLowerCase()) {
            for (var i = t.childNodes || [], r = 0; r < i.length; r++)
              if ('_ga' == i[r].name) return void i[r].setAttribute('value', n);
            (i = A.createElement('input')).setAttribute('type', 'hidden'),
              i.setAttribute('name', '_ga'),
              i.setAttribute('value', n),
              t.appendChild(i);
          } else
            'post' == t.method.toLowerCase() && (t.action = en(e, t.action));
        }
      };

    function sd(e, t) {
      if (t == A.location.hostname) return !1;
      for (var n = 0; n < e.length; n++)
        if (e[n] instanceof RegExp) {
          if (e[n].test(t)) return !0;
        } else if (0 <= t.indexOf(e[n])) return !0;
      return !1;
    }
    Qt.prototype.S = function(i, r, e) {
      function d(e) {
        try {
          var t;
          e = e || k.event;
          e: {
            var n = e.target || e.srcElement;
            for (e = 100; n && 0 < e; ) {
              if (n.href && n.nodeName.match(/^a(?:rea)?$/i)) {
                t = n;
                break e;
              }
              (n = n.parentNode), e--;
            }
            t = {};
          }
          ('http:' == t.protocol || 'https:' == t.protocol) &&
            sd(i, t.hostname || '') &&
            t.href &&
            (t.href = en(o, t.href, r));
        } catch (e) {
          J(26);
        }
      }
      var o = this;
      this.T || ((this.T = !0), v(A, 'mousedown', d, !1), v(A, 'keyup', d, !1)),
        e &&
          v(A, 'submit', function(e) {
            if ((e = (e = e || k.event).target || e.srcElement) && e.action) {
              var t = e.action.match(Yt);
              t && sd(i, t[1]) && tn(o, e);
            }
          });
    };
    var nn,
      rn = /^(GTM|OPT)-[A-Z0-9]+$/,
      on = /;_gaexp=[^;]*/g,
      an = /;((__utma=)|([^;=]+=GAX?\d+\.))[^;]*/g,
      sn = function(e, t, n) {
        (this.U = tt),
          (this.aa = t),
          (t = n) ||
            (t =
              (t = Y(e, mt)) && 't0' != t
                ? fn.test(t)
                  ? '_gat_' + M(Y(e, xt))
                  : '_gat_' + M(t)
                : '_gat'),
          (this.Y = t),
          _t(new jt(100), e) && (J(30), (this.pa = !0));
      },
      ln = function(e, t) {
        t.get(e.U) ||
          ('1' == O(e.Y)[0] ? t.set(e.U, '', !0) : t.set(e.U, '' + $(), !0));
      },
      un = function(e, t) {
        if (t.get(e.U)) {
          var n = 6e5;
          e.pa && (n /= 10), D(e.Y, '1', t.get(Ct), t.get(Tt), t.get(xt), n);
        }
      },
      cn = function(e, t) {
        if (t.get(e.U)) {
          var n = new E(),
            i = function(e) {
              te(e).F && n.set(te(e).F, t.get(e));
            };
          i(ae), i(se), i(xt), i(vt), i(bt), i(e.U), n.set(te(Qe).F, a(t));
          var r = e.aa;
          n.map(function(e, t) {
            (r += m(e) + '='), (r += m('' + t) + '&');
          }),
            (r += 'z=' + $()),
            h(r),
            t.set(e.U, '', !0);
        }
      },
      fn = /^gtm\d+$/,
      dn = function(e, t) {
        var n,
          i = e.b;
        i.get('dcLoaded') ||
          (o(i, 29),
          (t = t || {})[wt] && (n = M(t[wt])),
          (function(n, e) {
            var i = e.get(ct);
            e.set(ct, function(e) {
              ln(n, e);
              var t = i(e);
              return un(n, e), t;
            });
            var r = e.get(ft);
            e.set(ft, function(e) {
              var t = r(e);
              return cn(n, e), t;
            });
          })(
            (n = new sn(
              i,
              'https://stats.g.doubleclick.net/r/collect?t=dc&aip=1&_r=3&',
              n
            )),
            i
          ),
          i.set('dcLoaded', !0));
      },
      pn = function(e) {
        if (!e.get('dcLoaded') && 'cookie' == e.get(At)) {
          o(e, 51);
          var t = new sn(e);
          ln(t, e),
            un(t, e),
            e.get(t.U) && (e.set(Ht, 1, !0), e.set(Pt, j() + '/r/collect', !0));
        }
      },
      hn = /^(UA|YT|MO|GP)-(\d+)-(\d+)$/,
      gn = function(e) {
        function b(e, t) {
          n.b.data.set(e, t);
        }

        function c(e, t) {
          b(e, t), n.filters.add(e);
        }
        var t,
          n = this;
        (this.b = new V()),
          (this.filters = new q()),
          b(mt, e[mt]),
          b(xt, p(e[xt])),
          b(wt, e[wt]),
          b(Tt, e[Tt] || C()),
          b(Ct, e[Ct]),
          b(St, e[St]),
          b(Et, e[Et]),
          b(kt, e[kt]),
          b(Nt, e[Nt]),
          b(Lt, e[Lt]),
          b(Ot, e[Ot]),
          b(Dt, e[Dt]),
          b(Mt, e[Mt]),
          b(At, e[At]),
          b(bt, e[bt]),
          b(yt, e[yt]),
          b(ae, 1),
          b(se, 'j47'),
          c(nt, Ma),
          c(it, cd),
          c(rt, Oa),
          c(ot, vb),
          c(at, $t),
          c(st, Ut),
          c(lt, Ja),
          c(ut, Ta),
          c(dt, Hc),
          c(pt, yd),
          c(gt, pn),
          c(ct, Pa),
          c(ft, Sa),
          c(ht, It(this)),
          mn(this.b, e[vt]),
          vn(this.b),
          this.b.set(
            le,
            ((t = k.gaGlobal = k.gaGlobal || {}).hid = t.hid || $())
          ),
          (function(e, t, n) {
            if (!nn) {
              var i;
              i = A.location.hash;
              var r = k.name,
                o = /^#?gaso=([^&]*)/;
              (r =
                (i = (i = (i && i.match(o)) || (r && r.match(o)))
                  ? i[1]
                  : O('GASO')[0] || '') &&
                i.match(/^(?:!([-0-9a-z.]{1,40})!)?([-.\w]{10,1200})$/i)) &&
                (D('GASO', '' + i, n, t, e, 0),
                window._udo || (window._udo = t),
                window._utcp || (window._utcp = n),
                (e = r[1]),
                x(
                  'https://www.google.com/analytics/web/inpage/pub/inpage.js?' +
                    (e ? 'prefix=' + e + '&' : '') +
                    $(),
                  '_gasojs'
                )),
                (nn = !0);
            }
          })(this.b.get(xt), this.b.get(Tt), this.b.get(Ct));
      },
      mn = function(e, t) {
        if ('cookie' == Y(e, At)) {
          var n;
          Wt = !1;
          e: {
            var i = O(Y(e, wt));
            if (i && !(i.length < 1)) {
              n = [];
              for (var r = 0; r < i.length; r++) {
                var o,
                  a = (o = i[r].split('.')).shift();
                (o =
                  ('GA1' == a || '1' == a) && 1 < o.length
                    ? (1 == (a = o.shift().split('-')).length && (a[1] = '1'),
                      (a[0] *= 1),
                      (a[1] *= 1),
                      {
                        H: a,
                        s: o.join('.')
                      })
                    : void 0) && n.push(o);
              }
              if (1 == n.length) {
                J(13), (n = n[0].s);
                break e;
              }
              if (0 != n.length) {
                if (
                  (J(14),
                  (i = Jt(Y(e, Tt)).split('.').length),
                  1 == (n = Xt(n, i, 0)).length)
                ) {
                  n = n[0].s;
                  break e;
                }
                (i = Kt(Y(e, Ct))), (n = (n = Xt(n, i, 1))[0] && n[0].s);
                break e;
              }
              J(12);
            }
            n = void 0;
          }
          n ||
            ((n = Y(e, Tt)),
            (n =
              null != (n = Xc('__utma', (i = Y(e, Et) || C()), n))
                ? (J(10), n.O[1] + '.' + n.O[2])
                : void 0)),
            n && (e.data.set(vt, n), (Wt = !0));
        }
        if (
          ((n = e.get(Lt)),
          (r = T(A.location[n ? 'href' : 'search'], '_ga')) &&
            (e.get(Nt)
              ? -1 == (n = r.indexOf('.'))
                ? J(22)
                : ((i = r.substring(n + 1)),
                  '1' != r.substring(0, n)
                    ? J(22)
                    : -1 == (n = i.indexOf('.'))
                    ? J(22)
                    : (r = i.substring(0, n)) !=
                        Ic((n = i.substring(n + 1)), 0) &&
                      r != Ic(n, -1) &&
                      r != Ic(n, -2)
                    ? J(23)
                    : (J(11), e.data.set(vt, n)))
              : J(21)),
          t && (J(9), e.data.set(vt, m(t))),
          !e.get(vt))
        )
          if (
            (n =
              (n = k.gaGlobal && k.gaGlobal.vid) &&
              -1 != n.search(/^(?:utma\.)?\d+\.\d+$/)
                ? n
                : void 0)
          )
            J(17), e.data.set(vt, n);
          else {
            for (
              J(8),
                i = (n =
                  k.navigator.userAgent +
                  (A.cookie ? A.cookie : '') +
                  (A.referrer ? A.referrer : '')).length,
                r = k.history.length;
              0 < r;

            )
              n += r-- ^ i++;
            e.data.set(
              vt,
              [
                $() ^ (2147483647 & La(n)),
                Math.round(new Date().getTime() / 1e3)
              ].join('.')
            );
          }
        qt(e);
      },
      vn = function(e) {
        var t = k.navigator,
          n = k.screen,
          i = A.location;
        if (
          (e.set(
            me,
            (function(e) {
              var t = A.referrer;
              if (/^https?:\/\//i.test(t)) {
                if (e) return t;
                e = '//' + A.location.hostname;
                var n = t.indexOf(e);
                if (
                  !(
                    (5 != n && 6 != n) ||
                    ('/' != (e = t.charAt(n + e.length)) &&
                      '?' != e &&
                      '' != e &&
                      ':' != e)
                  )
                )
                  return;
                return t;
              }
            })(e.get(Mt))
          ),
          i)
        ) {
          var r = i.pathname || '';
          '/' != r.charAt(0) && (J(31), (r = '/' + r)),
            e.set(ge, i.protocol + '//' + i.hostname + r + i.search);
        }
        n && e.set(we, n.width + 'x' + n.height),
          n && e.set(xe, n.colorDepth + '-bit');
        n = A.documentElement;
        var o = (r = A.body) && r.clientWidth && r.clientHeight,
          a = [];
        if (
          (n &&
          n.clientWidth &&
          n.clientHeight &&
          ('CSS1Compat' === A.compatMode || !o)
            ? (a = [n.clientWidth, n.clientHeight])
            : o && (a = [r.clientWidth, r.clientHeight]),
          (n = a[0] <= 0 || a[1] <= 0 ? '' : a.join('x')),
          e.set(Te, n),
          e.set(
            Se,
            (function fc() {
              var e, t, n;
              if ((n = (n = k.navigator) ? n.plugins : null) && n.length)
                for (var i = 0; i < n.length && !t; i++) {
                  var r = n[i];
                  -1 < r.name.indexOf('Shockwave Flash') && (t = r.description);
                }
              if (!t)
                try {
                  t = (e = new ActiveXObject(
                    'ShockwaveFlash.ShockwaveFlash.7'
                  )).GetVariable('$version');
                } catch (e) {}
              if (!t)
                try {
                  (e = new ActiveXObject('ShockwaveFlash.ShockwaveFlash.6')),
                    (t = 'WIN 6,0,21,0'),
                    (e.AllowScriptAccess = 'always'),
                    (t = e.GetVariable('$version'));
                } catch (e) {}
              if (!t)
                try {
                  t = (e = new ActiveXObject(
                    'ShockwaveFlash.ShockwaveFlash'
                  )).GetVariable('$version');
                } catch (e) {}
              return (
                t &&
                  (e = t.match(/[\d]+/g)) &&
                  3 <= e.length &&
                  (t = e[0] + '.' + e[1] + ' r' + e[2]),
                t || void 0
              );
            })()
          ),
          e.set(be, A.characterSet || A.charset),
          e.set(
            Ce,
            (t && 'function' == typeof t.javaEnabled && t.javaEnabled()) || !1
          ),
          e.set(
            ye,
            ((t && (t.language || t.browserLanguage)) || '').toLowerCase()
          ),
          i && e.get(Lt) && (t = A.location.hash))
        ) {
          for (t = t.split(/[?&#]+/), i = [], n = 0; n < t.length; ++n)
            (f(t[n], 'utm_id') ||
              f(t[n], 'utm_campaign') ||
              f(t[n], 'utm_source') ||
              f(t[n], 'utm_medium') ||
              f(t[n], 'utm_term') ||
              f(t[n], 'utm_content') ||
              f(t[n], 'gclid') ||
              f(t[n], 'dclid') ||
              f(t[n], 'gclsrc')) &&
              i.push(t[n]);
          0 < i.length && ((t = '#' + i.join('&')), e.set(ge, e.get(ge) + t));
        }
      };
    (gn.prototype.get = function(e) {
      return this.b.get(e);
    }),
      (gn.prototype.set = function(e, t) {
        this.b.set(e, t);
      });
    var yn = {
      pageview: [ve],
      event: [Ee, ke, Ae, Ne],
      social: [Le, Oe, De],
      timing: [ze, Ie, qe, We]
    };
    (gn.prototype.send = function(e) {
      var t, n;
      arguments.length < 1 ||
        ((n =
          'string' == typeof e
            ? ((t = e), [].slice.call(arguments, 1))
            : ((t = e && e[ue]), arguments)),
        t &&
          (((n = S(yn[t] || [], n))[ue] = t),
          this.b.set(n, void 0, !0),
          this.filters.D(this.b),
          (this.b.data.m = {})));
    }),
      (gn.prototype.ma = function(e, t) {
        var n = this;
        An(e, n, t) ||
          (Ln(e, function() {
            An(e, n, t);
          }),
          Nn(String(n.get(mt)), e, void 0, t, !0));
      });
    var bn,
      xn,
      wn,
      Tn,
      Cn = function(e) {
        return 'prerender' != A.visibilityState && (e(), !0);
      },
      Sn = function(n) {
        if (!Cn(n)) {
          J(16);
          var i = !1,
            r = function() {
              if (!i && Cn(n)) {
                i = !0;
                var e = r,
                  t = A;
                t.removeEventListener
                  ? t.removeEventListener('visibilitychange', e, !1)
                  : t.detachEvent && t.detachEvent('onvisibilitychange', e);
              }
            };
          v(A, 'visibilitychange', r);
        }
      },
      En = /^(?:(\w+)\.)?(?:(\w+):)?(\w+)$/,
      kn = function(e) {
        if (l(e[0])) this.u = e[0];
        else {
          var t = En.exec(e[0]);
          if (
            (null != t &&
              4 == t.length &&
              ((this.c = t[1] || 't0'),
              (this.K = t[2] || ''),
              (this.C = t[3]),
              (this.a = [].slice.call(e, 1)),
              this.K ||
                ((this.A = 'create' == this.C),
                (this.i = 'require' == this.C),
                (this.g = 'provide' == this.C),
                (this.ba = 'remove' == this.C)),
              this.i &&
                (3 <= this.a.length
                  ? ((this.X = this.a[1]), (this.W = this.a[2]))
                  : this.a[1] &&
                    (n(this.a[1])
                      ? (this.X = this.a[1])
                      : (this.W = this.a[1])))),
            (t = e[1]),
            (e = e[2]),
            !this.C)
          )
            throw 'abort';
          if (this.i && (!n(t) || '' == t)) throw 'abort';
          if (this.g && (!n(t) || '' == t || !l(e))) throw 'abort';
          if (ud(this.c) || ud(this.K)) throw 'abort';
          if (this.g && 't0' != this.c) throw 'abort';
        }
      };

    function ud(e) {
      return 0 <= e.indexOf('.') || 0 <= e.indexOf(':');
    }
    (bn = new E()),
      (wn = new E()),
      (Tn = new E()),
      (xn = {
        ec: 45,
        ecommerce: 46,
        linkid: 47
      });
    var An = function(e, t, n) {
        t == Hn || t.get(mt);
        var i = bn.get(e);
        return (
          !!l(i) &&
          ((t.plugins_ = t.plugins_ || new E()),
          t.plugins_.get(e) || t.plugins_.set(e, new i(t, n || {})),
          !0)
        );
      },
      Nn = function(e, t, n, i, r) {
        if (!l(bn.get(t)) && !wn.get(t)) {
          if ((xn.hasOwnProperty(t) && J(xn[t]), rn.test(t))) {
            if ((J(52), !(e = Hn.j(e)))) return !0;
            (i = {
              id: t,
              B: (n = i || {}).dataLayer || 'dataLayer',
              ia: !!e.get('anonymizeIp'),
              na: r,
              G: !1
            }),
              e.get('&gtm') == t && (i.G = !0);
            var o = String(e.get('name'));
            't0' != o && (i.target = o),
              L(String(e.get('trackingId'))) ||
                ((i.ja = String(e.get(vt))),
                (i.ka = Number(e.get(yt))),
                (e = n.palindrome ? an : on),
                (e = (e = A.cookie.replace(/^|(; +)/g, ';').match(e))
                  ? e
                      .sort()
                      .join('')
                      .substring(1)
                  : void 0),
                (i.la = e)),
              (e = i.B),
              (n = new Date().getTime()),
              (k[e] = k[e] || []),
              (n = {
                'gtm.start': n
              }),
              r || (n.event = 'gtm.js'),
              k[e].push(n),
              (n = (function(e) {
                function b(e, t) {
                  t && (n += '&' + e + '=' + m(t));
                }
                var n = 'https://www.google-analytics.com/gtm/js?id=' + m(e.id);
                return (
                  'dataLayer' != e.B && b('l', e.B),
                  b('t', e.target),
                  b('cid', e.ja),
                  b('cidt', e.ka),
                  b('gac', e.la),
                  b('aip', e.ia),
                  e.na && b('m', 'sync'),
                  b('cycle', e.G),
                  n
                );
              })(i));
          }
          !n && xn.hasOwnProperty(t) ? (J(39), (n = t + '.js')) : J(43),
            n &&
              ((n && 0 <= n.indexOf('/')) ||
                (n =
                  (oe || w() ? 'https:' : 'http:') +
                  '//www.google-analytics.com/plugins/ua/' +
                  n),
              (e = (i = Mn(n)).protocol),
              (n = A.location.protocol),
              ('https:' == e || e == n || ('http:' == e && 'http:' == n)) &&
                Dn(i) &&
                (x(i.url, void 0, r), wn.set(t, !0)));
        }
      },
      Ln = function(e, t) {
        var n = Tn.get(e) || [];
        n.push(t), Tn.set(e, n);
      },
      On = function(e, t) {
        bn.set(e, t);
        for (var n = Tn.get(e) || [], i = 0; i < n.length; i++) n[i]();
        Tn.set(e, []);
      },
      Dn = function(e) {
        var t = Mn(A.location.href);
        return (
          !!f(e.url, 'https://www.google-analytics.com/gtm/js?id=') ||
          (!(
            e.query ||
            0 <= e.url.indexOf('?') ||
            0 <= e.path.indexOf('://')
          ) &&
            ((e.host == t.host && e.port == t.port) ||
              ((t = 'http:' == e.protocol ? 80 : 443),
              !(
                'www.google-analytics.com' != e.host ||
                (e.port || t) != t ||
                !f(e.path, '/plugins/')
              ))))
        );
      },
      Mn = function(e) {
        function b(e) {
          var t = (e.hostname || '').split(':')[0].toLowerCase(),
            n = (e.protocol || '').toLowerCase();
          n = 1 * e.port || ('http:' == n ? 80 : 'https:' == n ? 443 : '');
          return (
            (e = e.pathname || ''), f(e, '/') || (e = '/' + e), [t, '' + n, e]
          );
        }
        var t = A.createElement('a');
        t.href = A.location.href;
        var n = (t.protocol || '').toLowerCase(),
          i = b(t),
          r = t.search || '',
          o = n + '//' + i[0] + (i[1] ? ':' + i[1] : '');
        return (
          f(e, '//')
            ? (e = n + e)
            : f(e, '/')
            ? (e = o + e)
            : !e || f(e, '?')
            ? (e = o + i[2] + (e || r))
            : e.split('/')[0].indexOf(':') < 0 &&
              (e = o + i[2].substring(0, i[2].lastIndexOf('/')) + '/' + e),
          (t.href = e),
          (n = b(t)),
          {
            protocol: (t.protocol || '').toLowerCase(),
            host: n[0],
            port: n[1],
            path: n[2],
            query: t.search || '',
            url: e || ''
          }
        );
      },
      Pn = {
        ga: function() {
          Pn.f = [];
        }
      };
    Pn.ga(),
      (Pn.D = function(e) {
        var t = Pn.J.apply(Pn, arguments);
        t = Pn.f.concat(t);
        for (
          Pn.f = [];
          0 < t.length && !Pn.v(t[0]) && (t.shift(), !(0 < Pn.f.length));

        );
        Pn.f = Pn.f.concat(t);
      }),
      (Pn.J = function(e) {
        for (var t = [], n = 0; n < arguments.length; n++)
          try {
            var i = new kn(arguments[n]);
            i.g
              ? On(i.a[0], i.a[1])
              : (i.i && (i.ha = Nn(i.c, i.a[0], i.X, i.W)), t.push(i));
          } catch (e) {}
        return t;
      }),
      (Pn.v = function(e) {
        try {
          if (e.u) e.u.call(k, Hn.j('t0'));
          else {
            var t = e.c == re ? Hn : Hn.j(e.c);
            if (e.A) 't0' != e.c || Hn.create.apply(Hn, e.a);
            else if (e.ba) Hn.remove(e.c);
            else if (t)
              if (e.i) {
                if (
                  (e.ha && (e.ha = Nn(e.c, e.a[0], e.X, e.W)),
                  !An(e.a[0], t, e.W))
                )
                  return !0;
              } else if (e.K) {
                var n = e.C,
                  i = e.a,
                  r = t.plugins_.get(e.K);
                r[n].apply(r, i);
              } else t[e.C].apply(t, e.a);
          }
        } catch (e) {}
      });
    var Hn = function(e) {
      J(1), Pn.D.apply(Pn, [arguments]);
    };
    (Hn.h = {}), (Hn.P = []), (Hn.L = 0), (Hn.answer = 42);
    var jn = [xt, Tt, mt];
    (Hn.create = function(e) {
      var t = S(jn, [].slice.call(arguments));
      t[mt] || (t[mt] = 't0');
      var n = '' + t[mt];
      return Hn.h[n]
        ? Hn.h[n]
        : ((t = new gn(t)), (Hn.h[n] = t), Hn.P.push(t), t);
    }),
      (Hn.remove = function(e) {
        for (var t = 0; t < Hn.P.length; t++)
          if (Hn.P[t].get(mt) == e) {
            Hn.P.splice(t, 1), (Hn.h[e] = null);
            break;
          }
      }),
      (Hn.j = function(e) {
        return Hn.h[e];
      }),
      (Hn.getAll = function() {
        return Hn.P.slice(0);
      }),
      (Hn.N = function() {
        'ga' != re && J(49);
        var e = k[re];
        if (!e || 42 != e.answer) {
          if (
            ((Hn.L = e && e.l),
            (Hn.loaded = !0),
            X('create', (t = k[re] = Hn), t.create),
            X('remove', t, t.remove),
            X('getByName', t, t.j, 5),
            X('getAll', t, t.getAll, 6),
            X('get', (t = gn.prototype), t.get, 7),
            X('set', t, t.set, 4),
            X('send', t, t.send),
            X('requireSync', t, t.ma),
            X('get', (t = V.prototype), t.get),
            X('set', t, t.set),
            !w() && !oe)
          ) {
            e: {
              for (
                var t = A.getElementsByTagName('script'), n = 0;
                n < t.length && n < 100;
                n++
              ) {
                var i = t[n].src;
                if (
                  i &&
                  0 == i.indexOf('https://www.google-analytics.com/analytics')
                ) {
                  J(33), (t = !0);
                  break e;
                }
              }
              t = !1;
            }
            t && (oe = !0);
          }
          w() || oe || !_t(new jt(1e4)) || (J(36), (oe = !0)),
            (t = ((k.gaplugins = k.gaplugins || {}).Linker = Qt).prototype),
            On('linker', Qt),
            X('decorate', t, t.ca, 20),
            X('autoLink', t, t.S, 25),
            On('displayfeatures', dn),
            On('adfeatures', dn),
            (e = e && e.q),
            u(e) ? Pn.D.apply(Hn, e) : J(50);
        }
      }),
      (Hn.da = function() {
        for (var e = Hn.getAll(), t = 0; t < e.length; t++) e[t].get(mt);
      });
    var _n = Hn.N,
      Fn = k[re];

    function La(e) {
      var t,
        n,
        i = 1;
      if (e)
        for (i = 0, n = e.length - 1; 0 <= n; n--)
          i =
            0 !=
            (t =
              266338304 &
              (i = ((i << 6) & 268435455) + (t = e.charCodeAt(n)) + (t << 14)))
              ? i ^ (t >> 21)
              : i;
      return i;
    }
    Fn && Fn.r ? _n() : Sn(_n),
      Sn(function() {
        Pn.D(['provide', 'render', g]);
      });
  })(window);
var tns = (function() {
  var e = window,
    Gt =
      e.requestAnimationFrame ||
      e.webkitRequestAnimationFrame ||
      e.mozRequestAnimationFrame ||
      e.msRequestAnimationFrame ||
      function(e) {
        return setTimeout(e, 16);
      },
    t = window,
    Kt =
      t.cancelAnimationFrame ||
      t.mozCancelAnimationFrame ||
      function(e) {
        clearTimeout(e);
      };

  function extend() {
    for (
      var e, t, n, i = arguments[0] || {}, r = 1, o = arguments.length;
      r < o;
      r++
    )
      if (null !== (e = arguments[r]))
        for (t in e) i !== (n = e[t]) && void 0 !== n && (i[t] = n);
    return i;
  }

  function checkStorageValue(e) {
    return 0 <= ['true', 'false'].indexOf(e) ? JSON.parse(e) : e;
  }

  function setLocalStorage(e, t, n, i) {
    if (i)
      try {
        e.setItem(t, n);
      } catch (e) {}
    return n;
  }

  function getBody() {
    var e = document,
      t = e.body;
    return t || ((t = e.createElement('body')).fake = !0), t;
  }
  var n = document.documentElement;

  function setFakeBody(e) {
    var t = '';
    return (
      e.fake &&
        ((t = n.style.overflow),
        (e.style.background = ''),
        (e.style.overflow = n.style.overflow = 'hidden'),
        n.appendChild(e)),
      t
    );
  }

  function resetFakeBody(e, t) {
    e.fake && (e.remove(), (n.style.overflow = t), n.offsetHeight);
  }

  function addCSSRule(e, t, n, i) {
    'insertRule' in e ? e.insertRule(t + '{' + n + '}', i) : e.addRule(t, n, i);
  }

  function getCssRulesLength(e) {
    return ('insertRule' in e ? e.cssRules : e.rules).length;
  }

  function forEach(e, t, n) {
    for (var i = 0, r = e.length; i < r; i++) t.call(n, e[i], i);
  }
  var i = 'classList' in document.createElement('_'),
    Yt = i
      ? function(e, t) {
          return e.classList.contains(t);
        }
      : function(e, t) {
          return 0 <= e.className.indexOf(t);
        },
    Zt = i
      ? function(e, t) {
          Yt(e, t) || e.classList.add(t);
        }
      : function(e, t) {
          Yt(e, t) || (e.className += ' ' + t);
        },
    Qt = i
      ? function(e, t) {
          Yt(e, t) && e.classList.remove(t);
        }
      : function(e, t) {
          Yt(e, t) && (e.className = e.className.replace(t, ''));
        };

  function hasAttr(e, t) {
    return e.hasAttribute(t);
  }

  function getAttr(e, t) {
    return e.getAttribute(t);
  }

  function isNodeList(e) {
    return void 0 !== e.item;
  }

  function setAttrs(e, t) {
    if (
      ((e = isNodeList(e) || e instanceof Array ? e : [e]),
      '[object Object]' === Object.prototype.toString.call(t))
    )
      for (var n = e.length; n--; ) for (var i in t) e[n].setAttribute(i, t[i]);
  }

  function removeAttrs(e, t) {
    e = isNodeList(e) || e instanceof Array ? e : [e];
    for (var n = (t = t instanceof Array ? t : [t]).length, i = e.length; i--; )
      for (var r = n; r--; ) e[i].removeAttribute(t[r]);
  }

  function arrayFromNodeList(e) {
    for (var t = [], n = 0, i = e.length; n < i; n++) t.push(e[n]);
    return t;
  }

  function hideElement(e, t) {
    'none' !== e.style.display && (e.style.display = 'none');
  }

  function showElement(e, t) {
    'none' === e.style.display && (e.style.display = '');
  }

  function isVisible(e) {
    return 'none' !== window.getComputedStyle(e).display;
  }

  function whichProperty(t) {
    if ('string' == typeof t) {
      var n = [t],
        i = t.charAt(0).toUpperCase() + t.substr(1);
      ['Webkit', 'Moz', 'ms', 'O'].forEach(function(e) {
        ('ms' === e && 'transform' !== t) || n.push(e + i);
      }),
        (t = n);
    }
    for (
      var e = document.createElement('fakeelement'), r = (t.length, 0);
      r < t.length;
      r++
    ) {
      var o = t[r];
      if (void 0 !== e.style[o]) return o;
    }
    return !1;
  }

  function getEndProperty(e, t) {
    var n = !1;
    return (
      /^Webkit/.test(e)
        ? (n = 'webkit' + t + 'End')
        : /^O/.test(e)
        ? (n = 'o' + t + 'End')
        : e && (n = t.toLowerCase() + 'end'),
      n
    );
  }
  var r = !1;
  try {
    var o = Object.defineProperty({}, 'passive', {
      get: function() {
        r = !0;
      }
    });
    window.addEventListener('test', null, o);
  } catch (e) {}
  var a = !!r && {
    passive: !0
  };

  function addEvents(e, t, n) {
    for (var i in t) {
      var r = 0 <= ['touchstart', 'touchmove'].indexOf(i) && !n && a;
      e.addEventListener(i, t[i], r);
    }
  }

  function removeEvents(e, t) {
    for (var n in t) {
      var i = 0 <= ['touchstart', 'touchmove'].indexOf(n) && a;
      e.removeEventListener(n, t[n], i);
    }
  }

  function Events() {
    return {
      topics: {},
      on: function(e, t) {
        (this.topics[e] = this.topics[e] || []), this.topics[e].push(t);
      },
      off: function(e, t) {
        if (this.topics[e])
          for (var n = 0; n < this.topics[e].length; n++)
            if (this.topics[e][n] === t) {
              this.topics[e].splice(n, 1);
              break;
            }
      },
      emit: function(t, n) {
        (n.type = t),
          this.topics[t] &&
            this.topics[t].forEach(function(e) {
              e(n, t);
            });
      }
    };
  }
  Object.keys ||
    (Object.keys = function(e) {
      var t = [];
      for (var n in e) Object.prototype.hasOwnProperty.call(e, n) && t.push(n);
      return t;
    }),
    'remove' in Element.prototype ||
      (Element.prototype.remove = function() {
        this.parentNode && this.parentNode.removeChild(this);
      });
  var en = function(L) {
    L = extend(
      {
        container: '.slider',
        mode: 'carousel',
        axis: 'horizontal',
        items: 1,
        gutter: 0,
        edgePadding: 0,
        fixedWidth: !1,
        autoWidth: !1,
        viewportMax: !1,
        slideBy: 1,
        center: !1,
        controls: !0,
        controlsPosition: 'top',
        controlsText: ['prev', 'next'],
        controlsContainer: !1,
        prevButton: !1,
        nextButton: !1,
        nav: !0,
        navPosition: 'top',
        navContainer: !1,
        navAsThumbnails: !1,
        arrowKeys: !1,
        speed: 300,
        autoplay: !1,
        autoplayPosition: 'top',
        autoplayTimeout: 5e3,
        autoplayDirection: 'forward',
        autoplayText: ['start', 'stop'],
        autoplayHoverPause: !1,
        autoplayButton: !1,
        autoplayButtonOutput: !0,
        autoplayResetOnVisibility: !0,
        animateIn: 'tns-fadeIn',
        animateOut: 'tns-fadeOut',
        animateNormal: 'tns-normal',
        animateDelay: !1,
        loop: !0,
        rewind: !1,
        autoHeight: !1,
        responsive: !1,
        lazyload: !1,
        lazyloadSelector: '.tns-lazy-img',
        touch: !0,
        mouseDrag: !1,
        swipeAngle: 15,
        nested: !1,
        preventActionWhenRunning: !1,
        preventScrollOnTouch: !1,
        freezable: !0,
        onInit: !1,
        useLocalStorage: !0,
        textDirection: 'ltr'
      },
      L || {}
    );
    var O = document,
      m = window,
      r = {
        ENTER: 13,
        SPACE: 32,
        LEFT: 37,
        RIGHT: 39
      },
      t = {},
      n = L.useLocalStorage;
    if (n) {
      var e = navigator.userAgent,
        i = new Date();
      try {
        (t = m.localStorage)
          ? (t.setItem(i, i), (n = t.getItem(i) == i), t.removeItem(i))
          : (n = !1),
          n || (t = {});
      } catch (e) {
        n = !1;
      }
      n &&
        (t.tnsApp &&
          t.tnsApp !== e &&
          [
            'tC',
            'tPL',
            'tMQ',
            'tTf',
            't3D',
            'tTDu',
            'tTDe',
            'tADu',
            'tADe',
            'tTE',
            'tAE'
          ].forEach(function(e) {
            t.removeItem(e);
          }),
        (localStorage.tnsApp = e));
    }
    var v = t.tC
        ? checkStorageValue(t.tC)
        : setLocalStorage(
            t,
            'tC',
            (function calc() {
              var e = document,
                t = getBody(),
                n = setFakeBody(t),
                i = e.createElement('div'),
                r = !1;
              t.appendChild(i);
              try {
                for (
                  var o,
                    a = '(10px * 10)',
                    s = ['calc' + a, '-moz-calc' + a, '-webkit-calc' + a],
                    l = 0;
                  l < 3;
                  l++
                )
                  if (
                    ((o = s[l]), (i.style.width = o), 100 === i.offsetWidth)
                  ) {
                    r = o.replace(a, '');
                    break;
                  }
              } catch (e) {}
              return t.fake ? resetFakeBody(t, n) : i.remove(), r;
            })(),
            n
          ),
      y = t.tPL
        ? checkStorageValue(t.tPL)
        : setLocalStorage(
            t,
            'tPL',
            (function percentageLayout() {
              var e,
                t = document,
                n = getBody(),
                i = setFakeBody(n),
                r = t.createElement('div'),
                o = t.createElement('div'),
                a = '';
              (r.className = 'tns-t-subp2'), (o.className = 'tns-t-ct');
              for (var s = 0; s < 70; s++) a += '<div></div>';
              return (
                (o.innerHTML = a),
                r.appendChild(o),
                n.appendChild(r),
                (e =
                  Math.abs(
                    r.getBoundingClientRect().left -
                      o.children[67].getBoundingClientRect().left
                  ) < 2),
                n.fake ? resetFakeBody(n, i) : r.remove(),
                e
              );
            })(),
            n
          ),
      D = t.tMQ ? checkStorageValue(t.tMQ) : setLocalStorage(t, 'tMQ', !0, n),
      o = t.tTf
        ? checkStorageValue(t.tTf)
        : setLocalStorage(t, 'tTf', whichProperty('transform'), n),
      a = t.t3D
        ? checkStorageValue(t.t3D)
        : setLocalStorage(
            t,
            't3D',
            (function has3DTransforms(e) {
              if (!e) return !1;
              if (!window.getComputedStyle) return !1;
              var t,
                n = document,
                i = getBody(),
                r = setFakeBody(i),
                o = n.createElement('p'),
                a =
                  9 < e.length ? '-' + e.slice(0, -9).toLowerCase() + '-' : '';
              return (
                (a += 'transform'),
                i.insertBefore(o, null),
                (o.style[e] = 'translate3d(1px,1px,1px)'),
                (t = window.getComputedStyle(o).getPropertyValue(a)),
                i.fake ? resetFakeBody(i, r) : o.remove(),
                void 0 !== t && 0 < t.length && 'none' !== t
              );
            })(o),
            n
          ),
      b = t.tTDu
        ? checkStorageValue(t.tTDu)
        : setLocalStorage(t, 'tTDu', whichProperty('transitionDuration'), n),
      s = t.tTDe
        ? checkStorageValue(t.tTDe)
        : setLocalStorage(t, 'tTDe', whichProperty('transitionDelay'), n),
      x = t.tADu
        ? checkStorageValue(t.tADu)
        : setLocalStorage(t, 'tADu', whichProperty('animationDuration'), n),
      l = t.tADe
        ? checkStorageValue(t.tADe)
        : setLocalStorage(t, 'tADe', whichProperty('animationDelay'), n),
      u = t.tTE
        ? checkStorageValue(t.tTE)
        : setLocalStorage(t, 'tTE', getEndProperty(b, 'Transition'), n),
      c = t.tAE
        ? checkStorageValue(t.tAE)
        : setLocalStorage(t, 'tAE', getEndProperty(x, 'Animation'), n),
      f = m.console && 'function' == typeof m.console.warn,
      d = [
        'container',
        'controlsContainer',
        'prevButton',
        'nextButton',
        'navContainer',
        'autoplayButton'
      ],
      p = {};
    if (
      (d.forEach(function(e) {
        if ('string' == typeof L[e]) {
          var t = L[e],
            n = O.querySelector(t);
          if (((p[e] = t), !n || !n.nodeName))
            return void (f && console.warn("Can't find", L[e]));
          L[e] = n;
        }
      }),
      !(L.container.children.length < 1))
    ) {
      var M = L.responsive,
        P = L.nested,
        H = 'carousel' === L.mode;
      if (M) {
        0 in M && ((L = extend(L, M[0])), delete M[0]);
        var h = {};
        for (var g in M) {
          var w = M[g];
          (w =
            'number' == typeof w
              ? {
                  items: w
                }
              : w),
            (h[g] = w);
        }
        (M = h), (h = null);
      }
      if (
        (H ||
          (function updateOptions(e) {
            for (var t in e)
              H ||
                ('slideBy' === t && (e[t] = 'page'),
                'edgePadding' === t && (e[t] = !1),
                'autoHeight' === t && (e[t] = !1)),
                'responsive' === t && updateOptions(e[t]);
          })(L),
        !H)
      ) {
        (L.axis = 'horizontal'), (L.slideBy = 'page'), (L.edgePadding = !1);
        var j = L.animateIn,
          _ = L.animateOut,
          T = L.animateDelay,
          F = L.animateNormal;
      }
      var C,
        R,
        B = 'horizontal' === L.axis,
        S = O.createElement('div'),
        z = O.createElement('div'),
        I = L.container,
        E = I.parentNode,
        k = I.outerHTML,
        W = I.children,
        q = W.length,
        $ = getWindowWidth(),
        U = !1;
      M && setBreakpointZone(), H && (I.className += ' tns-vpfix');
      var A,
        N,
        V,
        X = L.autoWidth,
        J = getOption('fixedWidth'),
        G = getOption('edgePadding'),
        K = getOption('gutter'),
        Y = getViewportWidth(),
        Z = getOption('center'),
        Q = X ? 1 : Math.floor(getOption('items')),
        ee = getOption('slideBy'),
        te = L.viewportMax || L.fixedWidthViewportWidth,
        ne = getOption('arrowKeys'),
        ie = getOption('speed'),
        re = L.rewind,
        oe = !re && L.loop,
        ae = getOption('autoHeight'),
        se = getOption('controls'),
        le = getOption('controlsText'),
        ue = getOption('textDirection'),
        ce = getOption('nav'),
        fe = getOption('touch'),
        de = getOption('mouseDrag'),
        pe = getOption('autoplay'),
        he = getOption('autoplayTimeout'),
        ge = getOption('autoplayText'),
        me = getOption('autoplayHoverPause'),
        ve = getOption('autoplayResetOnVisibility'),
        ye = (function createStyleSheet(e) {
          var t = document.createElement('style');
          return (
            e && t.setAttribute('media', e),
            document.querySelector('head').appendChild(t),
            t.sheet ? t.sheet : t.styleSheet
          );
        })(),
        be = L.lazyload,
        xe = (L.lazyloadSelector, []),
        we = oe
          ? (function getCloneCountForLoop() {
              var e = (function getItemsMax() {
                  {
                    if (X || (J && !te)) return q - 1;
                    var e = J ? 'fixedWidth' : 'items',
                      t = [];
                    if (((J || L[e] < q) && t.push(L[e]), M))
                      for (var n in M) {
                        var i = M[n][e];
                        i && (J || i < q) && t.push(i);
                      }
                    return (
                      t.length || t.push(0),
                      Math.ceil(
                        J
                          ? te / Math.min.apply(null, t)
                          : Math.max.apply(null, t)
                      )
                    );
                  }
                })(),
                t = H ? Math.ceil((5 * e - q) / 2) : 4 * e - q;
              return (t = Math.max(e, t)), hasOption('edgePadding') ? t + 1 : t;
            })()
          : 0,
        Te = H ? q + 2 * we : q + we,
        Ce = !((!J && !X) || oe),
        Se = J ? getRightBoundary() : null,
        Ee = !H || !oe,
        ke = B ? 'left' : 'top',
        Ae = '',
        Ne = '',
        Le = J
          ? function() {
              return Z && !oe ? q - 1 : Math.ceil(-Se / (J + K));
            }
          : X
          ? function() {
              for (var e = Te; e--; ) if (A[e] > -Se) return e;
            }
          : function() {
              return Z && H && !oe
                ? q - 1
                : oe || H
                ? Math.max(0, Te - Math.ceil(Q))
                : Te - 1;
            },
        Oe = getStartIndex(getOption('startIndex')),
        De = Oe,
        Me = (getCurrentSlide(), 0),
        Pe = X ? null : Le(),
        He = L.preventActionWhenRunning,
        je = L.swipeAngle,
        _e = !je || '?',
        Fe = !1,
        Re = L.onInit,
        Be = new Events(),
        ze = ' tns-slider tns-' + L.mode,
        Ie =
          I.id ||
          (function getSlideId() {
            var e = window.tnsId;
            return (window.tnsId = e ? e + 1 : 1), 'tns' + window.tnsId;
          })(),
        We = getOption('disable'),
        qe = !1,
        $e = L.freezable,
        Ue = !(!$e || X) && getFreeze(),
        Ve = !1,
        Xe = {
          touchstart: onControlsClick,
          click: onControlsClick,
          keydown: function onControlsKeydown(e) {
            e = getEvent(e);
            var t = [r.LEFT, r.RIGHT].indexOf(e.keyCode);
            if (Fe && He) return;
            0 <= t &&
              (0 === t
                ? gt.disabled || onControlsClick(e, -1)
                : mt.disabled || onControlsClick(e, 1));
          }
        },
        Je = {
          touchstart: onNavClick,
          click: onNavClick,
          keydown: function onNavKeydown(e) {
            e = getEvent(e);
            var t = O.activeElement;
            if (!hasAttr(t, 'data-nav')) return;
            var n = [r.LEFT, r.RIGHT, r.ENTER, r.SPACE].indexOf(e.keyCode),
              i = Number(getAttr(t, 'data-nav'));
            0 <= n &&
              (0 === n
                ? 0 < i && setFocus(bt[i - 1])
                : 1 === n
                ? i < Tt - 1 && setFocus(bt[i + 1])
                : goTo((St = i), e));
          }
        },
        Ge = {
          mouseover: function mouseoverPause() {
            Dt && (stopAutoplayTimer(), (Mt = !0));
          },
          mouseout: function mouseoutRestart() {
            Mt && (setAutoplayTimer(), (Mt = !1));
          }
        },
        Ke = {
          visibilitychange: function onVisibilityChange() {
            O.hidden
              ? Dt && (stopAutoplayTimer(), (Ht = !0))
              : Ht && (setAutoplayTimer(), (Ht = !1));
          }
        },
        Ye = {
          keydown: function onDocumentKeydown(e) {
            e = getEvent(e);
            var t = [r.LEFT, r.RIGHT].indexOf(e.keyCode);
            0 <= t && onControlsClick(e, 0 === t ? -1 : 1);
          }
        },
        Ze = {
          touchstart: onPanStart,
          touchmove: onPanMove,
          touchend: onPanEnd,
          touchcancel: onPanEnd
        },
        Qe = {
          mousedown: onPanStart,
          mousemove: onPanMove,
          mouseup: onPanEnd,
          mouseleave: onPanEnd
        },
        et = null,
        tt = hasOption('controls'),
        nt = hasOption('nav'),
        it = !!X || L.navAsThumbnails,
        rt = hasOption('autoplay'),
        ot = hasOption('touch'),
        at = hasOption('mouseDrag'),
        st = 'tns-slide-active',
        lt = 'tns-complete',
        ut = {
          load: function onImgLoaded(e) {
            imgLoaded(getTarget(e));
          },
          error: function onImgFailed(e) {
            !(function imgFailed(e) {
              Zt(e, 'failed'), imgCompleted(e);
            })(getTarget(e));
          }
        },
        ct = 'force' === L.preventScrollOnTouch;
      if (tt)
        var ft,
          dt,
          pt = L.controlsContainer,
          ht = L.controlsContainer ? L.controlsContainer.outerHTML : '',
          gt = L.prevButton,
          mt = L.nextButton,
          vt = L.prevButton ? L.prevButton.outerHTML : '',
          yt = L.nextButton ? L.nextButton.outerHTML : '';
      if (nt)
        var bt,
          xt = L.navContainer,
          wt = L.navContainer ? L.navContainer.outerHTML : '',
          Tt = X ? q : getPages(),
          Ct = 0,
          St = -1,
          Et = getCurrentNavIndex(),
          kt = Et,
          At = 'tns-nav-active',
          Nt = 'Carousel Page ',
          Lt = ' (Current Slide)';
      if (rt)
        var Ot,
          Dt,
          Mt,
          Pt,
          Ht,
          jt = 'forward' === L.autoplayDirection ? 1 : -1,
          _t = L.autoplayButton,
          Ft = L.autoplayButton ? L.autoplayButton.outerHTML : '',
          Rt = ["<span class='tns-visually-hidden'>", ' animation</span>'];
      if (ot || at)
        var Bt,
          zt,
          It = {},
          Wt = {},
          qt = !1,
          $t = B
            ? function(e, t) {
                return e.x - t.x;
              }
            : function(e, t) {
                return e.y - t.y;
              };
      X || resetVariblesWhenDisable(We || Ue),
        o &&
          ((ke = o),
          (Ae = 'translate'),
          (Ne = a
            ? ((Ae += B ? '3d(' : '3d(0px, '), B ? ', 0px, 0px)' : ', 0px)')
            : ((Ae += B ? 'X(' : 'Y('), ')'))),
        H && (I.className = I.className.replace('tns-vpfix', '')),
        (function initStructure() {
          hasOption('gutter');
          (S.className = 'tns-outer'),
            (z.className = 'tns-inner'),
            (S.id = Ie + '-ow'),
            (z.id = Ie + '-iw'),
            '' === I.id && (I.id = Ie);
          (ze += y || X ? ' tns-subpixel' : ' tns-no-subpixel'),
            (ze += v ? ' tns-calc' : ' tns-no-calc'),
            X && (ze += ' tns-autowidth');
          (ze += ' tns-' + L.axis),
            (I.className += ze),
            H
              ? (((C = O.createElement('div')).id = Ie + '-mw'),
                (C.className = 'tns-ovh'),
                S.appendChild(C),
                C.appendChild(z))
              : S.appendChild(z);
          if (ae) {
            var e = C || z;
            e.className += ' tns-ah';
          }
          if (
            (E.insertBefore(S, I),
            z.appendChild(I),
            forEach(W, function(e, t) {
              Zt(e, 'tns-item'),
                e.id || (e.id = Ie + '-item' + t),
                !H && F && Zt(e, F),
                setAttrs(e, {
                  'aria-hidden': 'true',
                  tabindex: '-1'
                });
            }),
            we)
          ) {
            for (
              var t = O.createDocumentFragment(),
                n = O.createDocumentFragment(),
                i = we;
              i--;

            ) {
              var r = i % q,
                o = W[r].cloneNode(!0);
              if ((removeAttrs(o, 'id'), n.insertBefore(o, n.firstChild), H)) {
                var a = W[q - 1 - r].cloneNode(!0);
                removeAttrs(a, 'id'), t.appendChild(a);
              }
            }
            I.insertBefore(t, I.firstChild), I.appendChild(n), (W = I.children);
          }
        })(),
        (function initSheet() {
          if (!H)
            for (var e = Oe, t = Oe + Math.min(q, Q); e < t; e++) {
              var n = W[e];
              (n.style.left = (100 * (e - Oe)) / Q + '%'), Zt(n, j), Qt(n, F);
            }
          B &&
            (y || X
              ? (addCSSRule(
                  ye,
                  '#' + Ie + ' > .tns-item',
                  'font-size:' + m.getComputedStyle(W[0]).fontSize + ';',
                  getCssRulesLength(ye)
                ),
                addCSSRule(ye, '#' + Ie, 'font-size:0;', getCssRulesLength(ye)))
              : H &&
                forEach(W, function(e, t) {
                  e.style.marginLeft = (function getSlideMarginLeft(e) {
                    return v
                      ? v + '(' + 100 * e + '% / ' + Te + ')'
                      : (100 * e) / Te + '%';
                  })(t);
                }));
          if (D) {
            if (b) {
              var i =
                C && L.autoHeight ? getTransitionDurationStyle(L.speed) : '';
              addCSSRule(ye, '#' + Ie + '-mw', i, getCssRulesLength(ye));
            }
            (i = getInnerWrapperStyles(
              L.edgePadding,
              L.gutter,
              L.fixedWidth,
              L.speed,
              L.autoHeight
            )),
              addCSSRule(ye, '#' + Ie + '-iw', i, getCssRulesLength(ye)),
              H &&
                ((i =
                  B && !X
                    ? 'width:' +
                      getContainerWidth(L.fixedWidth, L.gutter, L.items) +
                      ';'
                    : ''),
                b && (i += getTransitionDurationStyle(ie)),
                addCSSRule(ye, '#' + Ie, i, getCssRulesLength(ye))),
              (i =
                B && !X
                  ? getSlideWidthStyle(L.fixedWidth, L.gutter, L.items)
                  : ''),
              L.gutter && (i += getSlideGutterStyle(L.gutter)),
              H ||
                (b && (i += getTransitionDurationStyle(ie)),
                x && (i += getAnimationDurationStyle(ie))),
              i &&
                addCSSRule(
                  ye,
                  '#' + Ie + ' > .tns-item',
                  i,
                  getCssRulesLength(ye)
                );
          } else {
            update_carousel_transition_duration(),
              (z.style.cssText = getInnerWrapperStyles(G, K, J, ae)),
              H && B && !X && (I.style.width = getContainerWidth(J, K, Q));
            var i = B && !X ? getSlideWidthStyle(J, K, Q) : '';
            K && (i += getSlideGutterStyle(K)),
              i &&
                addCSSRule(
                  ye,
                  '#' + Ie + ' > .tns-item',
                  i,
                  getCssRulesLength(ye)
                );
          }
          if (M && D)
            for (var r in M) {
              r = parseInt(r);
              var o = M[r],
                i = '',
                a = '',
                s = '',
                l = '',
                u = '',
                c = X ? null : getOption('items', r),
                f = getOption('fixedWidth', r),
                d = getOption('speed', r),
                p = getOption('edgePadding', r),
                h = getOption('autoHeight', r),
                g = getOption('gutter', r);
              b &&
                C &&
                getOption('autoHeight', r) &&
                'speed' in o &&
                (a = '#' + Ie + '-mw{' + getTransitionDurationStyle(d) + '}'),
                ('edgePadding' in o || 'gutter' in o) &&
                  (s =
                    '#' +
                    Ie +
                    '-iw{' +
                    getInnerWrapperStyles(p, g, f, d, h) +
                    '}'),
                H &&
                  B &&
                  !X &&
                  ('fixedWidth' in o || 'items' in o || (J && 'gutter' in o)) &&
                  (l = 'width:' + getContainerWidth(f, g, c) + ';'),
                b && 'speed' in o && (l += getTransitionDurationStyle(d)),
                l && (l = '#' + Ie + '{' + l + '}'),
                ('fixedWidth' in o ||
                  (J && 'gutter' in o) ||
                  (!H && 'items' in o)) &&
                  (u += getSlideWidthStyle(f, g, c)),
                'gutter' in o && (u += getSlideGutterStyle(g)),
                !H &&
                  'speed' in o &&
                  (b && (u += getTransitionDurationStyle(d)),
                  x && (u += getAnimationDurationStyle(d))),
                u && (u = '#' + Ie + ' > .tns-item{' + u + '}'),
                (i = a + s + l + u) &&
                  ye.insertRule(
                    '@media (min-width: ' + r / 16 + 'em) {' + i + '}',
                    ye.cssRules.length
                  );
            }
        })(),
        initSliderTransform();
      var Ut = oe
          ? H
            ? function() {
                var e = Me,
                  t = Pe;
                (e += ee),
                  (t -= ee),
                  G ? ((e += 1), (t -= 1)) : J && (Y + K) % (J + K) && (t -= 1),
                  we && (t < Oe ? (Oe -= q) : Oe < e && (Oe += q));
              }
            : function() {
                if (Pe < Oe) for (; Me + q <= Oe; ) Oe -= q;
                else if (Oe < Me) for (; Oe <= Pe - q; ) Oe += q;
              }
          : function() {
              Oe = Math.max(Me, Math.min(Pe, Oe));
            },
        Vt = H
          ? function() {
              resetDuration(I, ''),
                b || !ie
                  ? (doContainerTransform(),
                    ie && isVisible(I)
                      ? (clearTimeout(et),
                        (et = setTimeout(onTransitionEnd, ie + 100)))
                      : onTransitionEnd())
                  : (function jsTransform(e, t, n, i, r, o, a) {
                      var s = Math.min(o, 10),
                        l = 0 <= r.indexOf('%') ? '%' : 'px',
                        u =
                          ((r = r.replace(l, '')),
                          Number(
                            e.style[t]
                              .replace(n, '')
                              .replace(i, '')
                              .replace(l, '')
                          )),
                        c = ((r - u) / o) * s;
                      setTimeout(function moveElement() {
                        (o -= s),
                          (u += c),
                          (e.style[t] = n + u + l + i),
                          0 < o ? setTimeout(moveElement, s) : a();
                      }, s);
                    })(
                      I,
                      ke,
                      Ae,
                      Ne,
                      getContainerTransformValue(),
                      ie,
                      onTransitionEnd
                    ),
                B || updateContentWrapperHeight();
            }
          : function() {
              xe = [];
              var e = {};
              (e[u] = e[c] = onTransitionEnd),
                removeEvents(W[De], e),
                addEvents(W[Oe], e),
                animateSlide(De, j, _, !0),
                animateSlide(Oe, F, j),
                (u && c && ie && isVisible(I)) || onTransitionEnd();
            },
        Xt = 'rtl' === ue ? -100 / Te : -100,
        Jt = 'rtl' === ue ? 100 : 100 / Te;
      return {
        version: '2.9.1',
        getInfo: info,
        events: Be,
        goTo: goTo,
        play: function play() {
          pe && !Dt && (startAutoplay(), (Pt = !1));
        },
        pause: function pause() {
          Dt && (stopAutoplay(), (Pt = !0));
        },
        isOn: U,
        updateSliderHeight: updateInnerWrapperHeight,
        refresh: initSliderTransform,
        destroy: function destroy() {
          if (
            ((ye.disabled = !0),
            ye.ownerNode && ye.ownerNode.remove(),
            removeEvents(m, {
              resize: onResize
            }),
            ne && removeEvents(O, Ye),
            pt && removeEvents(pt, Xe),
            xt && removeEvents(xt, Je),
            removeEvents(I, Ge),
            removeEvents(I, Ke),
            _t &&
              removeEvents(_t, {
                click: toggleAutoplay
              }),
            pe && clearInterval(Ot),
            H && u)
          ) {
            var e = {};
            (e[u] = onTransitionEnd), removeEvents(I, e);
          }
          fe && removeEvents(I, Ze), de && removeEvents(I, Qe);
          var o = [k, ht, vt, yt, wt, Ft];
          for (var t in (d.forEach(function(e, t) {
            var n = 'container' === e ? S : L[e];
            if ('object' == typeof n) {
              var i = !!n.previousElementSibling && n.previousElementSibling,
                r = n.parentNode;
              (n.outerHTML = o[t]),
                (L[e] = i ? i.nextElementSibling : r.firstElementChild);
            }
          }),
          (d = j = _ = T = F = B = S = z = I = E = k = W = q = R = $ = X = J = G = K = Y = Q = ee = te = ne = ie = re = oe = ae = ye = be = A = xe = we = Te = Ce = Se = Ee = ke = Ae = Ne = Le = Oe = De = Me = Pe = je = _e = Fe = Re = Be = ze = Ie = We = qe = $e = Ue = Ve = Xe = Je = Ge = Ke = Ye = Ze = Qe = tt = nt = it = rt = ot = at = st = lt = ut = N = se = le = pt = ht = gt = mt = ft = dt = ce = xt = wt = bt = Tt = Ct = St = Et = kt = At = Nt = Lt = pe = he = jt = ge = me = _t = Ft = ve = Rt = Ot = Dt = Mt = Pt = Ht = It = Wt = Bt = qt = zt = $t = fe = de = null),
          this))
            'rebuild' !== t && (this[t] = null);
          U = !1;
        },
        rebuild: function() {
          return en(extend(L, p));
        }
      };
    }

    function resetVariblesWhenDisable(e) {
      e && (se = ce = fe = de = ne = pe = me = ve = !1);
    }

    function getCurrentSlide() {
      for (var e = H ? Oe - we : Oe; e < 0; ) e += q;
      return (e % q) + 1;
    }

    function getStartIndex(e) {
      return (
        (e = e ? Math.max(0, Math.min(oe ? q - 1 : q - Q, e)) : 0),
        H ? e + we : e
      );
    }

    function getAbsIndex(e) {
      for (null == e && (e = Oe), H && (e -= we); e < 0; ) e += q;
      return Math.floor(e % q);
    }

    function getCurrentNavIndex() {
      var e,
        t = getAbsIndex();
      return (
        (e = it
          ? t
          : J || X
          ? Math.ceil(((t + 1) * Tt) / q - 1)
          : Math.floor(t / Q)),
        !oe && H && Oe === Pe && (e = Tt - 1),
        e
      );
    }

    function getWindowWidth() {
      return (
        m.innerWidth || O.documentElement.clientWidth || O.body.clientWidth
      );
    }

    function getInsertPosition(e) {
      return 'top' === e ? 'afterbegin' : 'beforeend';
    }

    function getViewportWidth() {
      var e = G ? 2 * G - K : 0;
      return (
        (function getClientWidth(e) {
          var t,
            n,
            i = O.createElement('div');
          return (
            e.appendChild(i),
            (n = (t = i.getBoundingClientRect()).right - t.left),
            i.remove(),
            n || getClientWidth(e.parentNode)
          );
        })(E) - e
      );
    }

    function hasOption(e) {
      if (L[e]) return !0;
      if (M) for (var t in M) if (M[t][e]) return !0;
      return !1;
    }

    function getOption(e, t) {
      if ((null == t && (t = $), 'items' === e && J))
        return Math.floor((Y + K) / (J + K)) || 1;
      var n = L[e];
      if (M) for (var i in M) t >= parseInt(i) && e in M[i] && (n = M[i][e]);
      return (
        'slideBy' === e && 'page' === n && (n = getOption('items')),
        H || ('slideBy' !== e && 'items' !== e) || (n = Math.floor(n)),
        n
      );
    }

    function getInnerWrapperStyles(e, t, n, i, r) {
      var o = '';
      if (void 0 !== e) {
        var a = e;
        t && (a -= t),
          (o = B
            ? 'margin: 0 ' + a + 'px 0 ' + e + 'px;'
            : 'margin: ' + e + 'px 0 ' + a + 'px 0;');
      } else if (t && !n) {
        var s = '-' + t + 'px';
        o = 'margin: 0 ' + (B ? s + ' 0 0' : '0 ' + s + ' 0') + ';';
      }
      return !H && r && b && i && (o += getTransitionDurationStyle(i)), o;
    }

    function getContainerWidth(e, t, n) {
      return e
        ? (e + t) * Te + 'px'
        : v
        ? v + '(' + 100 * Te + '% / ' + n + ')'
        : (100 * Te) / n + '%';
    }

    function getSlideWidthStyle(e, t, n) {
      var i;
      if (e) i = e + t + 'px';
      else {
        H || (n = Math.floor(n));
        var r = H ? Te : n;
        i = v ? v + '(100% / ' + r + ')' : 100 / r + '%';
      }
      return (i = 'width:' + i), 'inner' !== P ? i + ';' : i + ' !important;';
    }

    function getSlideGutterStyle(e) {
      var t = '';
      !1 !== e &&
        (t =
          (B ? 'padding-' : 'margin-') +
          (B ? 'right' : 'bottom') +
          ': ' +
          e +
          'px;');
      return t;
    }

    function getCSSPrefix(e, t) {
      var n = e.substring(0, e.length - t).toLowerCase();
      return n && (n = '-' + n + '-'), n;
    }

    function getTransitionDurationStyle(e) {
      return getCSSPrefix(b, 18) + 'transition-duration:' + e / 1e3 + 's;';
    }

    function getAnimationDurationStyle(e) {
      return getCSSPrefix(x, 17) + 'animation-duration:' + e / 1e3 + 's;';
    }

    function initSliderTransform() {
      if (hasOption('autoHeight') || X || !B) {
        var e = I.querySelectorAll('img');
        forEach(e, function(e) {
          var t = e.src;
          t && t.indexOf('data:image') < 0
            ? (addEvents(e, ut), (e.src = ''), (e.src = t), Zt(e, 'loading'))
            : be || imgLoaded(e);
        }),
          Gt(function() {
            imgsLoadedCheck(arrayFromNodeList(e), function() {
              N = !0;
            });
          }),
          !X && B && (e = getImageArray(Oe, Math.min(Oe + Q - 1, Te - 1))),
          be
            ? initSliderTransformStyleCheck()
            : Gt(function() {
                imgsLoadedCheck(
                  arrayFromNodeList(e),
                  initSliderTransformStyleCheck
                );
              });
      } else H && doContainerTransformSilent(), initTools(), initEvents();
    }

    function initSliderTransformStyleCheck() {
      if (X) {
        var e = oe ? Oe : q - 1;
        !(function stylesApplicationCheck() {
          W[e - 1].getBoundingClientRect().right.toFixed(2) ===
          W[e].getBoundingClientRect().left.toFixed(2)
            ? initSliderTransformCore()
            : setTimeout(function() {
                stylesApplicationCheck();
              }, 16);
        })();
      } else initSliderTransformCore();
    }

    function initSliderTransformCore() {
      (B && !X) ||
        (setSlidePositions(),
        X
          ? ((Se = getRightBoundary()),
            $e && (Ue = getFreeze()),
            (Pe = Le()),
            resetVariblesWhenDisable(We || Ue))
          : updateContentWrapperHeight()),
        H && doContainerTransformSilent(),
        initTools(),
        initEvents();
    }

    function initTools() {
      if (
        (updateSlideStatus(),
        S.insertAdjacentHTML(
          'afterbegin',
          '<div class="tns-liveregion tns-visually-hidden" aria-live="polite" aria-atomic="true">slide <span class="current">' +
            getLiveRegionStr() +
            '</span>  of ' +
            q +
            '</div>'
        ),
        (V = S.querySelector('.tns-liveregion .current')),
        rt)
      ) {
        var e = pe ? 'stop' : 'start';
        _t
          ? setAttrs(_t, {
              'data-action': e
            })
          : L.autoplayButtonOutput &&
            (S.insertAdjacentHTML(
              getInsertPosition(L.autoplayPosition),
              '<button data-action="' +
                e +
                '">' +
                Rt[0] +
                e +
                Rt[1] +
                ge[0] +
                '</button>'
            ),
            (_t = S.querySelector('[data-action]'))),
          _t &&
            addEvents(_t, {
              click: toggleAutoplay
            }),
          pe &&
            (startAutoplay(), me && addEvents(I, Ge), ve && addEvents(I, Ke));
      }
      if (nt) {
        if (xt)
          setAttrs(xt, {
            'aria-label': 'Carousel Pagination'
          }),
            forEach((bt = xt.children), function(e, t) {
              setAttrs(e, {
                'data-nav': t,
                tabindex: '-1',
                'aria-label': Nt + (t + 1),
                'aria-controls': Ie
              });
            });
        else {
          for (
            var t = '', n = it ? '' : 'style="display:none"', i = 0;
            i < q;
            i++
          )
            t +=
              '<button data-nav="' +
              i +
              '" tabindex="-1" aria-controls="' +
              Ie +
              '" ' +
              n +
              ' aria-label="' +
              Nt +
              (i + 1) +
              '"></button>';
          (t =
            '<div class="tns-nav" aria-label="Carousel Pagination">' +
            t +
            '</div>'),
            S.insertAdjacentHTML(getInsertPosition(L.navPosition), t),
            (xt = S.querySelector('.tns-nav')),
            (bt = xt.children);
        }
        if ((updateNavVisibility(), b)) {
          var r = b.substring(0, b.length - 18).toLowerCase(),
            o = 'transition: all ' + ie / 1e3 + 's';
          r && (o = '-' + r + '-' + o),
            addCSSRule(
              ye,
              '[aria-controls^=' + Ie + '-item]',
              o,
              getCssRulesLength(ye)
            );
        }
        setAttrs(bt[Et], {
          'aria-label': Nt + (Et + 1) + Lt
        }),
          removeAttrs(bt[Et], 'tabindex'),
          Zt(bt[Et], At),
          addEvents(xt, Je);
      }
      tt &&
        (pt ||
          (gt && mt) ||
          (S.insertAdjacentHTML(
            getInsertPosition(L.controlsPosition),
            '<div class="tns-controls" aria-label="Carousel Navigation" tabindex="0"><button data-controls="prev" tabindex="-1" aria-controls="' +
              Ie +
              '">' +
              le[0] +
              '</button><button data-controls="next" tabindex="-1" aria-controls="' +
              Ie +
              '">' +
              le[1] +
              '</button></div>'
          ),
          (pt = S.querySelector('.tns-controls'))),
        (gt && mt) || ((gt = pt.children[0]), (mt = pt.children[1])),
        L.controlsContainer &&
          setAttrs(pt, {
            'aria-label': 'Carousel Navigation',
            tabindex: '0'
          }),
        (L.controlsContainer || (L.prevButton && L.nextButton)) &&
          setAttrs([gt, mt], {
            'aria-controls': Ie,
            tabindex: '-1'
          }),
        (L.controlsContainer || (L.prevButton && L.nextButton)) &&
          (setAttrs(gt, {
            'data-controls': 'prev'
          }),
          setAttrs(mt, {
            'data-controls': 'next'
          })),
        (ft = isButton(gt)),
        (dt = isButton(mt)),
        updateControlsStatus(),
        pt ? addEvents(pt, Xe) : (addEvents(gt, Xe), addEvents(mt, Xe))),
        disableUI();
    }

    function initEvents() {
      if (H && u) {
        var e = {};
        (e[u] = onTransitionEnd), addEvents(I, e);
      }
      fe && addEvents(I, Ze, L.preventScrollOnTouch),
        de && addEvents(I, Qe),
        ne && addEvents(O, Ye),
        'inner' === P
          ? Be.on('outerResized', function() {
              resizeTasks(), Be.emit('innerLoaded', info());
            })
          : (M || J || X || ae || !B) &&
            addEvents(m, {
              resize: onResize
            }),
        ae &&
          ('outer' === P
            ? Be.on('innerLoaded', doAutoHeight)
            : We || doAutoHeight()),
        doLazyLoad(),
        We ? disableSlider() : Ue && freezeSlider(),
        Be.on('indexChanged', additionalUpdates),
        'inner' === P && Be.emit('innerLoaded', info()),
        'function' == typeof Re && Re(info()),
        (U = !0);
    }

    function onResize(e) {
      Gt(function() {
        resizeTasks(getEvent(e));
      });
    }

    function resizeTasks(e) {
      if (U) {
        'outer' === P && Be.emit('outerResized', info(e)),
          ($ = getWindowWidth());
        var t,
          n = R,
          i = !1;
        M &&
          (setBreakpointZone(),
          (t = n !== R) && Be.emit('newBreakpointStart', info(e)));
        var r,
          o,
          a = Q,
          s = We,
          l = Ue,
          u = ne,
          c = se,
          f = ce,
          d = fe,
          p = de,
          h = pe,
          g = me,
          m = ve,
          v = Oe;
        if (t) {
          var y = J,
            b = ae,
            x = le,
            w = Z,
            T = ge;
          if (!D)
            var C = K,
              S = G;
        }
        if (
          ((ne = getOption('arrowKeys')),
          (se = getOption('controls')),
          (ce = getOption('nav')),
          (fe = getOption('touch')),
          (Z = getOption('center')),
          (de = getOption('mouseDrag')),
          (pe = getOption('autoplay')),
          (me = getOption('autoplayHoverPause')),
          (ve = getOption('autoplayResetOnVisibility')),
          t &&
            ((We = getOption('disable')),
            (J = getOption('fixedWidth')),
            (ie = getOption('speed')),
            (ae = getOption('autoHeight')),
            (le = getOption('controlsText')),
            (ge = getOption('autoplayText')),
            (he = getOption('autoplayTimeout')),
            D || ((G = getOption('edgePadding')), (K = getOption('gutter')))),
          resetVariblesWhenDisable(We),
          (Y = getViewportWidth()),
          (B && !X) ||
            We ||
            (setSlidePositions(),
            B || (updateContentWrapperHeight(), (i = !0))),
          (J || X) && ((Se = getRightBoundary()), (Pe = Le())),
          (t || J) &&
            ((Q = getOption('items')),
            (ee = getOption('slideBy')),
            (o = Q !== a) && (J || X || (Pe = Le()), Ut())),
          t &&
            We !== s &&
            (We
              ? disableSlider()
              : (function enableSlider() {
                  if (!qe) return;
                  if (
                    ((ye.disabled = !1),
                    (I.className += ze),
                    doContainerTransformSilent(),
                    oe)
                  )
                    for (var e = we; e--; )
                      H && showElement(W[e]), showElement(W[Te - e - 1]);
                  if (!H)
                    for (var t = Oe, n = Oe + q; t < n; t++) {
                      var i = W[t],
                        r = t < Oe + Q ? j : F;
                      (i.style.left = (100 * (t - Oe)) / Q + '%'), Zt(i, r);
                    }
                  enableUI(), (qe = !1);
                })()),
          $e &&
            (t || J || X) &&
            (Ue = getFreeze()) !== l &&
            (Ue
              ? (doContainerTransform(
                  getContainerTransformValue(getStartIndex(0))
                ),
                freezeSlider())
              : (!(function unfreezeSlider() {
                  if (!Ve) return;
                  G && D && (z.style.margin = '');
                  if (we)
                    for (var e = 'tns-transparent', t = we; t--; )
                      H && Qt(W[t], e), Qt(W[Te - t - 1], e);
                  enableUI(), (Ve = !1);
                })(),
                (i = !0))),
          resetVariblesWhenDisable(We || Ue),
          pe || (me = ve = !1),
          ne !== u && (ne ? addEvents(O, Ye) : removeEvents(O, Ye)),
          se !== c &&
            (se
              ? pt
                ? showElement(pt)
                : (gt && showElement(gt), mt && showElement(mt))
              : pt
              ? hideElement(pt)
              : (gt && hideElement(gt), mt && hideElement(mt))),
          ce !== f && (ce ? showElement(xt) : hideElement(xt)),
          fe !== d &&
            (fe
              ? addEvents(I, Ze, L.preventScrollOnTouch)
              : removeEvents(I, Ze)),
          de !== p && (de ? addEvents(I, Qe) : removeEvents(I, Qe)),
          pe !== h &&
            (pe
              ? (_t && showElement(_t), Dt || Pt || startAutoplay())
              : (_t && hideElement(_t), Dt && stopAutoplay())),
          me !== g && (me ? addEvents(I, Ge) : removeEvents(I, Ge)),
          ve !== m && (ve ? addEvents(O, Ke) : removeEvents(O, Ke)),
          t)
        ) {
          if (
            ((J === y && Z === w) || (i = !0),
            ae !== b && (ae || (z.style.height = '')),
            se && le !== x && ((gt.innerHTML = le[0]), (mt.innerHTML = le[1])),
            _t && ge !== T)
          ) {
            var E = pe ? 1 : 0,
              k = _t.innerHTML,
              A = k.length - T[E].length;
            k.substring(A) === T[E] &&
              (_t.innerHTML = k.substring(0, A) + ge[E]);
          }
        } else Z && (J || X) && (i = !0);
        if (
          ((o || (J && !X)) && ((Tt = getPages()), updateNavVisibility()),
          (r = Oe !== v)
            ? (Be.emit('indexChanged', info()), (i = !0))
            : o
            ? r || additionalUpdates()
            : (J || X) &&
              (doLazyLoad(), updateSlideStatus(), updateLiveRegion()),
          (!o && H) ||
            (function updateGallerySlidePositions() {
              for (var e = Oe + Math.min(q, Q), t = Te; t--; ) {
                var n = W[t];
                Oe <= t && t < e
                  ? (Zt(n, 'tns-moving'),
                    (n.style.left = (100 * (t - Oe)) / Q + '%'),
                    Zt(n, j),
                    Qt(n, F))
                  : n.style.left && ((n.style.left = ''), Zt(n, F), Qt(n, j)),
                  Qt(n, _);
              }
              setTimeout(function() {
                forEach(W, function(e) {
                  Qt(e, 'tns-moving');
                });
              }, 300);
            })(),
          !We && !Ue)
        ) {
          if (
            t &&
            !D &&
            ((ae === autoheightTem && ie === speedTem) ||
              update_carousel_transition_duration(),
            (G === S && K === C) ||
              (z.style.cssText = getInnerWrapperStyles(G, K, J, ie, ae)),
            B)
          ) {
            H && (I.style.width = getContainerWidth(J, K, Q));
            var N = getSlideWidthStyle(J, K, Q) + getSlideGutterStyle(K);
            !(function removeCSSRule(e, t) {
              'deleteRule' in e ? e.deleteRule(t) : e.removeRule(t);
            })(ye, getCssRulesLength(ye) - 1),
              addCSSRule(
                ye,
                '#' + Ie + ' > .tns-item',
                N,
                getCssRulesLength(ye)
              );
          }
          ae && doAutoHeight(), i && (doContainerTransformSilent(), (De = Oe));
        }
        t && Be.emit('newBreakpointEnd', info(e));
      }
    }

    function getFreeze() {
      if (!J && !X) return q <= (Z ? Q - (Q - 1) / 2 : Q);
      var e = J ? (J + K) * q : A[q],
        t = G ? Y + 2 * G : Y + K;
      return (
        Z && (t -= J ? (Y - J) / 2 : (Y - (A[Oe + 1] - A[Oe] - K)) / 2), e <= t
      );
    }

    function setBreakpointZone() {
      for (var e in ((R = 0), M)) (e = parseInt(e)) <= $ && (R = e);
    }

    function disableUI() {
      !pe && _t && hideElement(_t),
        !ce && xt && hideElement(xt),
        se ||
          (pt
            ? hideElement(pt)
            : (gt && hideElement(gt), mt && hideElement(mt)));
    }

    function enableUI() {
      pe && _t && showElement(_t),
        ce && xt && showElement(xt),
        se &&
          (pt
            ? showElement(pt)
            : (gt && showElement(gt), mt && showElement(mt)));
    }

    function freezeSlider() {
      if (!Ve) {
        if ((G && (z.style.margin = '0px'), we))
          for (var e = 'tns-transparent', t = we; t--; )
            H && Zt(W[t], e), Zt(W[Te - t - 1], e);
        disableUI(), (Ve = !0);
      }
    }

    function disableSlider() {
      if (!qe) {
        if (
          ((ye.disabled = !0),
          (I.className = I.className.replace(ze.substring(1), '')),
          removeAttrs(I, ['style']),
          oe)
        )
          for (var e = we; e--; )
            H && hideElement(W[e]), hideElement(W[Te - e - 1]);
        if (((B && H) || removeAttrs(z, ['style']), !H))
          for (var t = Oe, n = Oe + q; t < n; t++) {
            var i = W[t];
            removeAttrs(i, ['style']), Qt(i, j), Qt(i, F);
          }
        disableUI(), (qe = !0);
      }
    }

    function updateLiveRegion() {
      var e = getLiveRegionStr();
      V.innerHTML !== e && (V.innerHTML = e);
    }

    function getLiveRegionStr() {
      var e = getVisibleSlideRange(),
        t = e[0] + 1,
        n = e[1] + 1;
      return t === n ? t + '' : t + ' to ' + n;
    }

    function getVisibleSlideRange(e) {
      null == e && (e = getContainerTransformValue());
      var n,
        i,
        r,
        o = Oe;
      if (
        (Z || G
          ? (X || J) && ((i = -(parseFloat(e) + G)), (r = i + Y + 2 * G))
          : X && ((i = A[Oe]), (r = i + Y)),
        X)
      )
        A.forEach(function(e, t) {
          t < Te &&
            ((Z || G) && e <= i + 0.5 && (o = t), 0.5 <= r - e && (n = t));
        });
      else {
        if (J) {
          var t = J + K;
          n =
            Z || G
              ? ((o = Math.floor(i / t)), Math.ceil(r / t - 1))
              : o + Math.ceil(Y / t) - 1;
        } else if (Z || G) {
          var a = Q - 1;
          if (((n = Z ? ((o -= a / 2), Oe + a / 2) : Oe + a), G)) {
            var s = (G * Q) / Y;
            (o -= s), (n += s);
          }
          (o = Math.floor(o)), (n = Math.ceil(n));
        } else n = o + Q - 1;
        (o = Math.max(o, 0)), (n = Math.min(n, Te - 1));
      }
      return [o, n];
    }

    function doLazyLoad() {
      be &&
        !We &&
        getImageArray.apply(null, getVisibleSlideRange()).forEach(function(e) {
          if (!Yt(e, lt)) {
            var t = {};
            (t[u] = function(e) {
              e.stopPropagation();
            }),
              addEvents(e, t),
              addEvents(e, ut),
              (e.src = getAttr(e, 'data-src'));
            var n = getAttr(e, 'data-srcset');
            n && (e.srcset = n), Zt(e, 'loading');
          }
        });
    }

    function imgLoaded(e) {
      Zt(e, 'loaded'), imgCompleted(e);
    }

    function imgCompleted(e) {
      Zt(e, 'tns-complete'), Qt(e, 'loading'), removeEvents(e, ut);
    }

    function getImageArray(e, t) {
      for (var n = []; e <= t; )
        forEach(W[e].querySelectorAll('img'), function(e) {
          n.push(e);
        }),
          e++;
      return n;
    }

    function doAutoHeight() {
      var e = getImageArray.apply(null, getVisibleSlideRange());
      Gt(function() {
        imgsLoadedCheck(e, updateInnerWrapperHeight);
      });
    }

    function imgsLoadedCheck(n, e) {
      return N
        ? e()
        : (n.forEach(function(e, t) {
            Yt(e, lt) && n.splice(t, 1);
          }),
          n.length
            ? void Gt(function() {
                imgsLoadedCheck(n, e);
              })
            : e());
    }

    function additionalUpdates() {
      doLazyLoad(),
        updateSlideStatus(),
        updateLiveRegion(),
        updateControlsStatus(),
        (function updateNavStatus() {
          if (
            ce &&
            ((Et = 0 <= St ? St : getCurrentNavIndex()), (St = -1), Et !== kt)
          ) {
            var e = bt[kt],
              t = bt[Et];
            setAttrs(e, {
              tabindex: '-1',
              'aria-label': Nt + (kt + 1)
            }),
              Qt(e, At),
              setAttrs(t, {
                'aria-label': Nt + (Et + 1) + Lt
              }),
              removeAttrs(t, 'tabindex'),
              Zt(t, At),
              (kt = Et);
          }
        })();
    }

    function update_carousel_transition_duration() {
      H && ae && (C.style[b] = ie / 1e3 + 's');
    }

    function getMaxSlideHeight(e, t) {
      for (var n = [], i = e, r = Math.min(e + t, Te); i < r; i++)
        n.push(W[i].offsetHeight);
      return Math.max.apply(null, n);
    }

    function updateInnerWrapperHeight() {
      var e = ae ? getMaxSlideHeight(Oe, Q) : getMaxSlideHeight(we, q),
        t = C || z;
      t.style.height !== e && (t.style.height = e + 'px');
    }

    function setSlidePositions() {
      A = [0];
      var n = B ? 'left' : 'top',
        i = B ? 'right' : 'bottom',
        r = W[0].getBoundingClientRect()[n];
      forEach(W, function(e, t) {
        t && A.push(e.getBoundingClientRect()[n] - r),
          t === Te - 1 && A.push(e.getBoundingClientRect()[i] - r);
      });
    }

    function updateSlideStatus() {
      var e = getVisibleSlideRange(),
        n = e[0],
        i = e[1];
      forEach(W, function(e, t) {
        n <= t && t <= i
          ? hasAttr(e, 'aria-hidden') &&
            (removeAttrs(e, ['aria-hidden', 'tabindex']), Zt(e, st))
          : hasAttr(e, 'aria-hidden') ||
            (setAttrs(e, {
              'aria-hidden': 'true',
              tabindex: '-1'
            }),
            Qt(e, st));
      });
    }

    function getLowerCaseNodeName(e) {
      return e.nodeName.toLowerCase();
    }

    function isButton(e) {
      return 'button' === getLowerCaseNodeName(e);
    }

    function isAriaDisabled(e) {
      return 'true' === e.getAttribute('aria-disabled');
    }

    function disEnableElement(e, t, n) {
      e ? (t.disabled = n) : t.setAttribute('aria-disabled', n.toString());
    }

    function updateControlsStatus() {
      if (se && !re && !oe) {
        var e = ft ? gt.disabled : isAriaDisabled(gt),
          t = dt ? mt.disabled : isAriaDisabled(mt),
          n = Oe <= Me,
          i = !re && Pe <= Oe;
        n && !e && disEnableElement(ft, gt, !0),
          !n && e && disEnableElement(ft, gt, !1),
          i && !t && disEnableElement(dt, mt, !0),
          !i && t && disEnableElement(dt, mt, !1);
      }
    }

    function resetDuration(e, t) {
      b && (e.style[b] = t);
    }

    function getCenterGap(e) {
      return (
        null == e && (e = Oe),
        X
          ? (Y - (G ? K : 0) - (A[e + 1] - A[e] - K)) / 2
          : J
          ? (Y - J) / 2
          : (Q - 1) / 2
      );
    }

    function getRightBoundary() {
      var e =
        Y +
        (G ? K : 0) -
        (function getSliderWidth() {
          return J ? (J + K) * Te : A[Te];
        })();
      return (
        Z &&
          !oe &&
          (e = J
            ? -(J + K) * (Te - 1) - getCenterGap()
            : getCenterGap(Te - 1) - A[Te - 1]),
        0 < e && (e = 0),
        e
      );
    }

    function getContainerTransformValue(e) {
      var t;
      if ((null == e && (e = Oe), B && !X))
        if (J) (t = -(J + K) * e), Z && (t += getCenterGap());
        else {
          var n = o ? Te : Q;
          Z && (e -= getCenterGap()), (t = (100 * -e) / n);
        }
      else (t = -A[e]), Z && X && (t += getCenterGap());
      return Ce && (t = Math.max(t, Se)), (t += !B || X || J ? 'px' : '%');
    }

    function doContainerTransformSilent(e) {
      resetDuration(I, '0s'), doContainerTransform(e);
    }

    function doContainerTransform(e) {
      null == e && (e = getContainerTransformValue()),
        'rtl' === ue && '-' === e.charAt(0) && (e = e.substr(1)),
        (I.style[ke] = Ae + e + Ne);
    }

    function animateSlide(e, t, n, i) {
      var r = e + Q;
      oe || (r = Math.min(r, Te));
      for (var o = e; o < r; o++) {
        var a = W[o];
        i || (a.style.left = (100 * (o - Oe)) / Q + '%'),
          T && s && (a.style[s] = a.style[l] = (T * (o - e)) / 1e3 + 's'),
          Qt(a, t),
          Zt(a, n),
          i && xe.push(a);
      }
    }

    function render(e, t) {
      Ee && Ut(),
        (Oe !== De || t) &&
          (Be.emit('indexChanged', info()),
          Be.emit('transitionStart', info()),
          ae && doAutoHeight(),
          Dt &&
            e &&
            0 <= ['click', 'keydown'].indexOf(e.type) &&
            stopAutoplay(),
          (Fe = !0),
          Vt());
    }

    function strTrans(e) {
      return e.toLowerCase().replace(/-/g, '');
    }

    function onTransitionEnd(e) {
      if ((clearTimeout(et), (et = null), H || Fe)) {
        if ((Be.emit('transitionEnd', info(e)), !H && 0 < xe.length))
          for (var t = 0; t < xe.length; t++) {
            var n = xe[t];
            (n.style.left = ''),
              l && s && ((n.style[l] = ''), (n.style[s] = '')),
              Qt(n, _),
              Zt(n, F);
          }
        if (
          !e ||
          (!H && e.target.parentNode === I) ||
          (e.target === I && strTrans(e.propertyName) === strTrans(ke))
        ) {
          if (!Ee) {
            var i = Oe;
            Ut(),
              Oe !== i &&
                (Be.emit('indexChanged', info()), doContainerTransformSilent());
          }
          'inner' === P && Be.emit('innerLoaded', info()), (De = Oe);
        }
        Fe = !1;
      }
    }

    function goTo(e, t) {
      if (!Ue)
        if ('prev' === e) onControlsClick(t, -1);
        else if ('next' === e) onControlsClick(t, 1);
        else {
          if (Fe) {
            if (He) return;
            onTransitionEnd();
          }
          var n = getAbsIndex(),
            i = 0;
          if (
            ('first' === e
              ? (i = -n)
              : 'last' === e
              ? (i = H ? q - Q - n : q - 1 - n)
              : ('number' != typeof e && (e = parseInt(e)),
                isNaN(e) ||
                  (t || (e = Math.max(0, Math.min(q - 1, e))), (i = e - n))),
            !H && i && Math.abs(i) < Q)
          ) {
            var r = 0 < i ? 1 : -1;
            i += Me <= Oe + i - q ? q * r : 2 * q * r * -1;
          }
          (Oe += i),
            H && oe && (Oe < Me && (Oe += q), Pe < Oe && (Oe -= q)),
            getAbsIndex(Oe) !== getAbsIndex(De) && render(t);
        }
    }

    function onControlsClick(e, t) {
      if (Fe) {
        if (He) return;
        onTransitionEnd();
      }
      var n;
      if (!t) {
        for (
          var i = getTarget((e = getEvent(e)));
          i !== pt && [gt, mt].indexOf(i) < 0;

        )
          i = i.parentNode;
        var r = [gt, mt].indexOf(i);
        0 <= r && ((n = !0), (t = 0 === r ? -1 : 1));
      }
      if (re) {
        if (Oe === Me && -1 === t) return void goTo('last', e);
        if (Oe === Pe && 1 === t) return void goTo('first', e);
      }
      t &&
        ((Oe += ee * t),
        X && (Oe = Math.floor(Oe)),
        render(n || (e && 'keydown' === e.type) ? e : null));
    }

    function onNavClick(e) {
      if (Fe) {
        if (He) return;
        onTransitionEnd();
      }
      for (
        var t = getTarget((e = getEvent(e)));
        t !== xt && !hasAttr(t, 'data-nav');

      )
        t = t.parentNode;
      if (hasAttr(t, 'data-nav')) {
        var n = (St = Number(getAttr(t, 'data-nav'))),
          i = J || X ? (n * q) / Tt : n * Q;
        goTo(it ? n : Math.min(Math.ceil(i), q - 1), e),
          Et === n && (Dt && stopAutoplay(), (St = -1));
      }
    }

    function setAutoplayTimer() {
      (Ot = setInterval(function() {
        onControlsClick(null, jt);
      }, he)),
        (Dt = !0);
    }

    function stopAutoplayTimer() {
      clearInterval(Ot), (Dt = !1);
    }

    function updateAutoplayButton(e, t) {
      setAttrs(_t, {
        'data-action': e
      }),
        (_t.innerHTML = Rt[0] + e + Rt[1] + t);
    }

    function startAutoplay() {
      setAutoplayTimer(), _t && updateAutoplayButton('stop', ge[1]);
    }

    function stopAutoplay() {
      stopAutoplayTimer(), _t && updateAutoplayButton('start', ge[0]);
    }

    function toggleAutoplay() {
      Pt = Dt ? (stopAutoplay(), !0) : (startAutoplay(), !1);
    }

    function setFocus(e) {
      e.focus();
    }

    function getEvent(e) {
      return isTouchEvent((e = e || m.event)) ? e.changedTouches[0] : e;
    }

    function getTarget(e) {
      return e.target || m.event.srcElement;
    }

    function isTouchEvent(e) {
      return 0 <= e.type.indexOf('touch');
    }

    function preventDefaultBehavior(e) {
      e.preventDefault ? e.preventDefault() : (e.returnValue = !1);
    }

    function getMoveDirectionExpected() {
      return (
        (function getTouchDirection(e, t) {
          var n = !1,
            i = Math.abs(90 - Math.abs(e));
          return (
            90 - t <= i ? (n = 'horizontal') : i <= t && (n = 'vertical'), n
          );
        })(
          (function toDegree(e, t) {
            return Math.atan2(e, t) * (180 / Math.PI);
          })(Wt.y - It.y, Wt.x - It.x),
          je
        ) === L.axis
      );
    }

    function onPanStart(e) {
      if (Fe) {
        if (He) return;
        onTransitionEnd();
      }
      pe && Dt && stopAutoplayTimer(), (qt = !0), zt && (Kt(zt), (zt = null));
      var t = getEvent(e);
      Be.emit(isTouchEvent(e) ? 'touchStart' : 'dragStart', info(e)),
        !isTouchEvent(e) &&
          0 <= ['img', 'a'].indexOf(getLowerCaseNodeName(getTarget(e))) &&
          preventDefaultBehavior(e),
        (Wt.x = It.x = t.clientX),
        (Wt.y = It.y = t.clientY),
        H &&
          ((Bt = parseFloat(I.style[ke].replace(Ae, ''))),
          resetDuration(I, '0s'));
    }

    function onPanMove(e) {
      if (qt) {
        var t = getEvent(e);
        (Wt.x = t.clientX),
          (Wt.y = t.clientY),
          H
            ? zt ||
              (zt = Gt(function() {
                !(function panUpdate(e) {
                  if (!_e) return void (qt = !1);
                  Kt(zt);
                  qt &&
                    (zt = Gt(function() {
                      panUpdate(e);
                    }));
                  '?' === _e && (_e = getMoveDirectionExpected());
                  if (_e) {
                    !ct && isTouchEvent(e) && (ct = !0);
                    try {
                      e.type &&
                        Be.emit(
                          isTouchEvent(e) ? 'touchMove' : 'dragMove',
                          info(e)
                        );
                    } catch (e) {}
                    var t = !1,
                      n = Bt,
                      i = $t(Wt, It);
                    if (!B || J || X) (n += i), (n += 'px');
                    else {
                      var r = o
                        ? (i * Q * 100) / ((Y + K) * Te)
                        : (100 * i) / (Y + K);
                      (n = Math.max(Xt, Math.min(n + r, Jt))),
                        (t = n === Xt || n === Jt),
                        (n += '%');
                    }
                    (I.style[ke] = Ae + n + Ne), t && onPanEnd(e);
                  }
                })(e);
              }))
            : ('?' === _e && (_e = getMoveDirectionExpected()),
              _e && (ct = !0)),
          ct && e.preventDefault();
      }
    }

    function onPanEnd(i) {
      if (qt) {
        zt && (Kt(zt), (zt = null)), H && resetDuration(I, ''), (qt = !1);
        var e = getEvent(i);
        (Wt.x = e.clientX), (Wt.y = e.clientY);
        var r = $t(Wt, It);
        if (Math.abs(r)) {
          if (!isTouchEvent(i)) {
            var t = getTarget(i);
            addEvents(t, {
              click: function preventClick(e) {
                preventDefaultBehavior(e),
                  removeEvents(t, {
                    click: preventClick
                  });
              }
            });
          }
          H
            ? (zt = Gt(function() {
                if (B && !X) {
                  var e = (-r * Q) / (Y + K);
                  (e = 0 < r ? Math.floor(e) : Math.ceil(e)),
                    10 <= Math.abs(r) && ('rtl' === ue ? (Oe -= e) : (Oe += e));
                } else {
                  var t = -(Bt + r);
                  if (t <= 0) Oe = Me;
                  else if (t >= A[Te - 1]) Oe = Pe;
                  else
                    for (var n = 0; n < Te && t >= A[n]; )
                      t > A[(Oe = n)] && r < 0 && (Oe += 1), n++;
                }
                render(i, r),
                  Be.emit(isTouchEvent(i) ? 'touchEnd' : 'dragEnd', info(i));
              }))
            : _e && onControlsClick(i, 0 < r ? -1 : 1);
        }
      }
      'auto' === L.preventScrollOnTouch && (ct = !1),
        je && (_e = '?'),
        pe && !Dt && setAutoplayTimer();
    }

    function updateContentWrapperHeight() {
      (C || z).style.height = A[Oe + Q] - A[Oe] + 'px';
    }

    function getPages() {
      var e = J ? ((J + K) * q) / Y : q / Q;
      return Math.min(Math.ceil(e), q);
    }

    function updateNavVisibility() {
      if (ce && !it && Tt !== Ct) {
        var e = Ct,
          t = Tt,
          n = showElement;
        for (Tt < Ct && ((e = Tt), (t = Ct), (n = hideElement)); e < t; )
          n(bt[e]), e++;
        Ct = Tt;
      }
    }

    function info(e) {
      return {
        container: I,
        slideItems: W,
        navContainer: xt,
        navItems: bt,
        controlsContainer: pt,
        hasControls: tt,
        prevButton: gt,
        nextButton: mt,
        items: Q,
        slideBy: ee,
        cloneCount: we,
        slideCount: q,
        slideCountNew: Te,
        index: Oe,
        indexCached: De,
        displayIndex: getCurrentSlide(),
        navCurrentIndex: Et,
        navCurrentIndexCached: kt,
        pages: Tt,
        pagesCached: Ct,
        sheet: ye,
        isOn: U,
        event: e || {}
      };
    }
    f && console.warn('No slides found in', L.container);
  };
  return en;
})();
window.matchMedia ||
  (window.matchMedia = (function() {
    'use strict';
    var t = window.styleMedia || window.media;
    if (!t) {
      var n,
        i = document.createElement('style'),
        e = document.getElementsByTagName('script')[0];
      (i.type = 'text/css'),
        (i.id = 'matchmediajs-test'),
        e.parentNode.insertBefore(i, e),
        (n =
          ('getComputedStyle' in window && window.getComputedStyle(i, null)) ||
          i.currentStyle),
        (t = {
          matchMedium: function(e) {
            var t = '@media ' + e + '{ #matchmediajs-test { width: 1px; } }';
            return (
              i.styleSheet ? (i.styleSheet.cssText = t) : (i.textContent = t),
              '1px' === n.width
            );
          }
        });
    }
    return function(e) {
      return {
        matches: t.matchMedium(e || 'all'),
        media: e || 'all'
      };
    };
  })()),
  (function($) {
    var escapeable = /["\\\x00-\x1f\x7f-\x9f]/g,
      meta = {
        '\b': '\\b',
        '\t': '\\t',
        '\n': '\\n',
        '\f': '\\f',
        '\r': '\\r',
        '"': '\\"',
        '\\': '\\\\'
      };
    ($.toJSON =
      'object' == typeof JSON && JSON.stringify
        ? JSON.stringify
        : function(e) {
            if (null === e) return 'null';
            var t = typeof e;
            if ('undefined' !== t) {
              if ('number' === t || 'boolean' === t) return '' + e;
              if ('string' === t) return $.quoteString(e);
              if ('object' === t) {
                if ('function' == typeof e.toJSON) return $.toJSON(e.toJSON());
                if (e.constructor === Date) {
                  var n = e.getUTCMonth() + 1,
                    i = e.getUTCDate(),
                    r = e.getUTCFullYear(),
                    o = e.getUTCHours(),
                    a = e.getUTCMinutes(),
                    s = e.getUTCSeconds(),
                    l = e.getUTCMilliseconds();
                  return (
                    n < 10 && (n = '0' + n),
                    i < 10 && (i = '0' + i),
                    o < 10 && (o = '0' + o),
                    a < 10 && (a = '0' + a),
                    s < 10 && (s = '0' + s),
                    l < 100 && (l = '0' + l),
                    l < 10 && (l = '0' + l),
                    '"' +
                      r +
                      '-' +
                      n +
                      '-' +
                      i +
                      'T' +
                      o +
                      ':' +
                      a +
                      ':' +
                      s +
                      '.' +
                      l +
                      'Z"'
                  );
                }
                if (e.constructor === Array) {
                  for (var u = [], c = 0; c < e.length; c++)
                    u.push($.toJSON(e[c]) || 'null');
                  return '[' + u.join(',') + ']';
                }
                var f,
                  d,
                  p = [];
                for (var h in e) {
                  if ('number' === (t = typeof h)) f = '"' + h + '"';
                  else {
                    if ('string' !== t) continue;
                    f = $.quoteString(h);
                  }
                  'function' !== (t = typeof e[h]) &&
                    'undefined' !== t &&
                    ((d = $.toJSON(e[h])), p.push(f + ':' + d));
                }
                return '{' + p.join(',') + '}';
              }
            }
          }),
      ($.evalJSON =
        'object' == typeof JSON && JSON.parse
          ? JSON.parse
          : function(src) {
              return eval('(' + src + ')');
            }),
      ($.secureEvalJSON =
        'object' == typeof JSON && JSON.parse
          ? JSON.parse
          : function(src) {
              var filtered = src
                .replace(/\\["\\\/bfnrtu]/g, '@')
                .replace(
                  /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,
                  ']'
                )
                .replace(/(?:^|:|,)(?:\s*\[)+/g, '');
              if (/^[\],:{}\s]*$/.test(filtered)) return eval('(' + src + ')');
              throw new SyntaxError('Error parsing JSON, source is not valid.');
            }),
      ($.quoteString = function(e) {
        return e.match(escapeable)
          ? '"' +
              e.replace(escapeable, function(e) {
                var t = meta[e];
                return 'string' == typeof t
                  ? t
                  : ((t = e.charCodeAt()),
                    '\\u00' +
                      Math.floor(t / 16).toString(16) +
                      (t % 16).toString(16));
              }) +
              '"'
          : '"' + e + '"';
      });
  })(jQuery),
  (function() {
    var a = window.PhoneGap || window.Cordova || window.cordova;

    function GAPlugin() {}
    (GAPlugin.prototype.trackEvent = function(e, t, n, i, r, o) {
      return a.exec(e, t, 'GAPlugin', 'trackEvent', [n, i, r, o]);
    }),
      (GAPlugin.prototype.trackPage = function(e, t, n) {
        return a.exec(e, t, 'GAPlugin', 'trackPage', [n]);
      }),
      window.plugins || (window.plugins = {}),
      window.plugins.gaPlugin || (window.plugins.gaPlugin = new GAPlugin());
  })(),
  (function() {
    var r = window.PhoneGap || window.Cordova || window.cordova;

    function Utilities() {}
    (Utilities.prototype.getFreeDiskSpace = function getFreeDiskSpace(e, t) {
      console.log('Utilities.getFreeDiskSpace'),
        'function' == typeof e
          ? 'function' == typeof t
            ? r.exec(e, t, 'Utilities', 'getFreeDiskSpace', [])
            : console.log('Expected fail callback to be a function')
          : console.log('Expected success callback to be a function');
    }),
      (Utilities.prototype.getAppVersion = function getAppVersion(e, t) {
        console.log('Utilities.getAppVersion'),
          'function' == typeof e
            ? 'function' == typeof t
              ? r.exec(e, t, 'Utilities', 'getAppVersion', [])
              : console.log('Expected fail callback to be a function')
            : console.log('Expected success callback to be a function');
      }),
      (Utilities.prototype.getPNToken = function getPNToken(e, t) {
        console.log('Utilities.getPNToken'),
          'function' == typeof e
            ? 'function' == typeof t
              ? e()
              : console.log('Expected fail callback to be a function')
            : console.log('Expected success callback to be a function');
      }),
      (Utilities.prototype.getDeepLink = function getDeepLink(e, t) {
        console.log('Utilities.getDeepLink'),
          'function' == typeof e
            ? 'function' == typeof t
              ? r.exec(e, t, 'Utilities', 'getDeepLink', [])
              : console.log('Expected fail callback to be a function')
            : console.log('Expected success callback to be a function');
      }),
      (Utilities.prototype.registerNimble = function registerNimble(
        e,
        t,
        n,
        i
      ) {
        console.log('Utilities.registerNimble'),
          'function' == typeof n
            ? 'function' == typeof i
              ? r.exec(n, i, 'Utilities', 'registerNimble', [e, t])
              : console.log('Expected fail callback to be a function')
            : console.log('Expected success callback to be a function');
      }),
      (Utilities.prototype.setupMTX = function setupMTX(e, t) {
        console.log('Utilities.setupMTX'),
          'function' == typeof e
            ? 'function' == typeof t
              ? r.exec(e, t, 'Utilities', 'setupMTX', [])
              : console.log('Expected fail callback to be a function')
            : console.log('Expected success callback to be a function');
      }),
      (Utilities.prototype.startMTXPurchase = function startMTXPurchase(
        e,
        t,
        n
      ) {
        console.log('Utilities.startMTXPurchase'),
          'function' == typeof t
            ? 'function' == typeof n
              ? r.exec(t, n, 'Utilities', 'startMTXPurchase', [e])
              : console.log('Expected fail callback to be a function')
            : console.log('Expected success callback to be a function');
      }),
      (Utilities.prototype.showStoreAppPage = function showStoreAppPage(
        e,
        t,
        n
      ) {
        console.log('Utilities.showStoreAppPage'),
          'function' == typeof e
            ? 'function' == typeof t
              ? r.exec(e, t, 'Utilities', 'showStoreAppPage', [
                  getStoreId(),
                  n ? 'true' : 'false'
                ])
              : console.log('Expected fail callback to be a function')
            : console.log('Expected success callback to be a function');
      }),
      (Utilities.prototype.showStatusBar = function showStatusBar(e, t) {
        console.log('Utilities.showStatusBar'),
          'function' == typeof e
            ? 'function' == typeof t
              ? e()
              : console.log('Expected fail callback to be a function')
            : console.log('Expected success callback to be a function');
      }),
      (Utilities.prototype.setStatusBarStyle = function setStatusBarStyle(
        e,
        t,
        n
      ) {
        console.log('Utilities.setStatusBarStyle'),
          'function' == typeof e
            ? 'function' == typeof t
              ? e()
              : console.log('Expected fail callback to be a function')
            : console.log('Expected success callback to be a function');
      }),
      window.plugins || (window.plugins = {}),
      (window.plugins.utilities = new Utilities());
  })(),
  (function() {
    var r = window.PhoneGap || window.Cordova || window.cordova;

    function PluginResourceCache() {}
    (PluginResourceCache.prototype.isResourceAvailable = function(n, e, t, i) {
      this.getCachedResource(
        function(e, t) {
          n('' !== t);
        },
        e,
        t,
        i
      );
    }),
      (PluginResourceCache.prototype.getCachedResource = function(e, t, n, i) {
        'function' == typeof e &&
          'function' == typeof t &&
          r.exec(e, t, 'PluginResourceCache', 'getCachedResource', [
            {
              resourcePath: n,
              baseUrl: i
            }
          ]);
      }),
      (PluginResourceCache.prototype.cacheResource = function(e, t, n, i) {
        'function' == typeof e &&
          'function' == typeof t &&
          r.exec(e, t, 'PluginResourceCache', 'cacheResource', [
            {
              resourcePath: n,
              baseUrl: i
            }
          ]);
      }),
      (PluginResourceCache.prototype.clearCache = function(e, t) {
        'function' == typeof e &&
          'function' == typeof t &&
          r.exec(e, t, 'PluginResourceCache', 'clearCache', []);
      });
    window.plugins || (window.plugins = {}),
      (window.plugins.resCache = new PluginResourceCache()),
      (PluginResourceCache.UNKNOWN_ERROR = 0);
  })();
