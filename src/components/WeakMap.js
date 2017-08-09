var b = Object.defineProperty,
    y = Date.now() % 1e9;
w = function() {
    this.name = "__st" + (1e9 * Math.random() >>> 0) + (y++ + "__")
}, w.prototype = {
    set: function(t, e) {
        var r = t[this.name];
        return r && r[0] === t ? r[1] = e : b(t, this.name, {
            value: [t, e],
            writable: !0
        }), this
    },
    get: function(t) {
        var e;
        return (e = t[this.name]) && e[0] === t ? e[1] : void 0
    },
    "delete": function(t) {
        var e = t[this.name];
        if (!e) return !1;
        var r = e[0] === t;
        return e[0] = e[1] = void 0, r
    },
    has: function(t) {
        var e = t[this.name];
        return e ? e[0] === t : !1
    }
}

module.exports=w;