var objStore = {
  vars: {
    uselocalstorage: true
  },
  store: null,
  setlocalstorageitem: function (key, value) {
    objStore.store.setItem(key, value);
  },
  getlocalstorageitem: function (key) {
    return objStore.store.getItem(key);
  },
  removelocalstorageitem: function (key) {
    objStore.store.removeItem(key);
  },
  init: function () {
    var self = this;

    // Try to initiate a localStorage object, and fall back to MemoryStorageShim if needed
    try {
      var x = 't_' + Date.now();
      localStorage.setItem(x, x);
      var y = localStorage.getItem(x);
      localStorage.removeItem(x);
      if (x !== y) { throw new Error(); }
      objStore.store = window.localStorage; // Yippee, all is fine!
    } catch (e) {
      console.log('Could not initiate memory storage, fall back to memory storage shim') // fall back to shim
      self.vars.uselocalstorage = false;
      objStore.store = new MemoryStorage();
    }




    //set a guid to use for statistics if it does not exist
    if (self.getlocalstorageitem('statguid') == null) {
      self.setlocalstorageitem('statguid', 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      }))
    }
  }
}

/*! [memorystorage 0.10.0](http://download.github.io/memorystorage) Copyright 2015 by [Stijn de Witt](http://StijnDeWitt.com). Some rights reserved. License: [CC-BY-4.0](https://creativecommons.org/licenses/by/4.0/) */
!function (u, m, d) { "function" == typeof define && define.amd ? define("memorystorage", [], function () { return d() }) : "object" == typeof exports ? module.exports = d() : u[m] = d() }(this, "MemoryStorage", function () { "use strict"; function MemoryStorage(e) { function f() { var b = Object.keys(g).filter(function (b) { return !(b in a) }); return b.concat(Object.keys(h)) } e = e || "global"; var g = c[e]; if (g) return g; if (!(this instanceof MemoryStorage)) return new MemoryStorage(e); g = c[e] = this; var h = {}; return Object.defineProperty(g, b, { enumerable: !1, configurable: !0, get: function () { return h } }), Object.defineProperty(g, "id", { enumerable: !0, configurable: !0, get: function () { return e } }), Object.defineProperty(g, "length", { enumerable: !0, configurable: !0, get: function () { return f().length } }), g.getItem = function (c) { return c in a ? this[b][c] : this[c] }, g.setItem = function (c, e) { c in a ? this[b][c] = e : this[c] = e }, g.removeItem = function (c) { c in a ? delete this[b][c] : delete this[c] }, g.key = function (a) { var b = f(); return a >= 0 && a < b.length ? b[a] : null }, g.clear = function () { for (var c, e = (Object.keys(this).filter(function (b) { return !(b in a) })), f = 0; c = e[f]; f++) c in a || delete this[c]; e = Object.keys(this[b]); for (var c, f = 0; c = e[f]; f++) delete this[b][c] }, "undefined" == typeof Proxy ? g : new Proxy(g, { ownKeys: function () { return f() } }) } var a = { clear: 1, getItem: 1, id: 1, key: 1, length: 1, removeItem: 1, setItem: 1 }, b = "__memorystorage_cloaked_items__", c = {}; return MemoryStorage });
