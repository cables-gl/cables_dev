module.exports = (function (t)
{
    let e = {}; function n(r) { if (e[r]) return e[r].exports; let o = e[r] = { "i": r, "l": !1, "exports": {} }; return t[r].call(o.exports, o, o.exports, n), o.l = !0, o.exports; }

    return n.m = t, n.c = e, n.d = function (t, e, r) { n.o(t, e) || Object.defineProperty(t, e, { "enumerable": !0, "get": r }); }, n.r = function (t) { typeof Symbol != "undefined" && Symbol.toStringTag && Object.defineProperty(t, Symbol.toStringTag, { "value": "Module" }), Object.defineProperty(t, "__esModule", { "value": !0 }); }, n.t = function (t, e) { if (1 & e && (t = n(t)), 8 & e) return t; if (4 & e && typeof t == "object" && t && t.__esModule) return t; let r = Object.create(null); if (n.r(r), Object.defineProperty(r, "default", { "enumerable": !0, "value": t }), 2 & e && typeof t != "string") for (let o in t)n.d(r, o, function (e) { return t[e]; }.bind(null, o)); return r; }, n.n = function (t) { let e = t && t.__esModule ? function () { return t.default; } : function () { return t; }; return n.d(e, "a", e), e; }, n.o = function (t, e) { return Object.prototype.hasOwnProperty.call(t, e); }, n.p = "", n(n.s = 3);
}([function (t, e, n)
{
    (function (e, n)
    {
        let r; r = function ()
        {
            function t(t) { return typeof t == "function"; }

            let r = Array.isArray ? Array.isArray : function (t) { return Object.prototype.toString.call(t) === "[object Array]"; }, o = 0, i = void 0, s = void 0, u = function (t, e) { p[o] = t, p[o + 1] = e, (o += 2) === 2 && (s ? s(v) : w()); }, a = typeof window != "undefined" ? window : void 0, c = a || {}, h = c.MutationObserver || c.WebKitMutationObserver, f = typeof self == "undefined" && void 0 !== e && {}.toString.call(e) === "[object process]", l = typeof Uint8ClampedArray != "undefined" && typeof importScripts != "undefined" && typeof MessageChannel != "undefined"; function d() { let t = setTimeout; return function () { return t(v, 1); }; }

            var p = new Array(1e3); function v() { for (let t = 0; t < o; t += 2) { (0, p[t])(p[t + 1]), p[t] = void 0, p[t + 1] = void 0; }o = 0; }

            var _, y, m, g, w = void 0; function b(t, e)
            {
                let n = this, r = new this.constructor(M); void 0 === r[k] && N(r); let o = n._state; if (o) { let i = arguments[o - 1]; u(function () { return H(o, r, i, n._result); }); }
                else W(n, r, t, e); return r;
            }

            function T(t) { if (t && typeof t == "object" && t.constructor === this) return t; let e = new this(M); return P(e, t), e; }

            f ? w = function () { return e.nextTick(v); } : h ? (y = 0, m = new h(v), g = document.createTextNode(""), m.observe(g, { "characterData": !0 }), w = function () { g.data = y = ++y % 2; }) : l ? ((_ = new MessageChannel()).port1.onmessage = v, w = function () { return _.port2.postMessage(0); }) : w = void 0 === a ? (function ()
            {
                try { let t = Function("return this")().require("vertx"); return void 0 !== (i = t.runOnLoop || t.runOnContext) ? function () { i(v); } : d(); }
                catch (t) { return d(); }
            }()) : d(); var k = Math.random().toString(36).substring(2); function M() {}

            let j = void 0, O = 1, A = 2, S = { "error": null }; function x(t)
            {
                try { return t.then; }
                catch (t) { return S.error = t, S; }
            }

            function E(e, n, r)
            {
                n.constructor === e.constructor && r === b && n.constructor.resolve === T ? (function (t, e) { e._state === O ? C(t, e._result) : e._state === A ? L(t, e._result) : W(e, void 0, function (e) { return P(t, e); }, function (e) { return L(t, e); }); }(e, n)) : r === S ? (L(e, S.error), S.error = null) : void 0 === r ? C(e, n) : t(r) ? (function (t, e, n)
                {
                    u(function (t)
                    {
                        let r = !1, o = (function (t, e, n, r)
                        {
                            try { t.call(e, n, r); }
                            catch (t) { return t; }
                        }(n, e, function (n) { r || (r = !0, e !== n ? P(t, n) : C(t, n)); }, function (e) { r || (r = !0, L(t, e)); }, t._label)); !r && o && (r = !0, L(t, o));
                    }, t);
                }(e, n, r)) : C(e, n);
            }

            function P(t, e) { let n, r; t === e ? L(t, new TypeError("You cannot resolve a promise with itself")) : (r = typeof (n = e), n === null || r !== "object" && r !== "function" ? C(t, e) : E(t, e, x(e))); }

            function I(t) { t._onerror && t._onerror(t._result), q(t); }

            function C(t, e) { t._state === j && (t._result = e, t._state = O, t._subscribers.length !== 0 && u(q, t)); }

            function L(t, e) { t._state === j && (t._state = A, t._result = e, u(I, t)); }

            function W(t, e, n, r) { let o = t._subscribers, i = o.length; t._onerror = null, o[i] = e, o[i + O] = n, o[i + A] = r, i === 0 && t._state && u(q, t); }

            function q(t) { let e = t._subscribers, n = t._state; if (e.length !== 0) { for (let r = void 0, o = void 0, i = t._result, s = 0; s < e.length; s += 3)r = e[s], o = e[s + n], r ? H(n, r, o, i) : o(i); t._subscribers.length = 0; } }

            function H(e, n, r, o)
            {
                let i = t(r), s = void 0, u = void 0, a = void 0, c = void 0; if (i)
                {
                    if ((s = (function (t, e)
                    {
                        try { return t(e); }
                        catch (t) { return S.error = t, S; }
                    }(r, o))) === S ? (c = !0, u = s.error, s.error = null) : a = !0, n === s) return void L(n, new TypeError("A promises callback cannot return that same promise."));
                }
                else s = o, a = !0; n._state !== j || (i && a ? P(n, s) : c ? L(n, u) : e === O ? C(n, s) : e === A && L(n, s));
            }

            let F = 0; function N(t) { t[k] = F++, t._state = void 0, t._result = void 0, t._subscribers = []; }

            var J = (function ()
                {
                    function t(t, e) { this._instanceConstructor = t, this.promise = new t(M), this.promise[k] || N(this.promise), r(e) ? (this.length = e.length, this._remaining = e.length, this._result = new Array(this.length), this.length === 0 ? C(this.promise, this._result) : (this.length = this.length || 0, this._enumerate(e), this._remaining === 0 && C(this.promise, this._result))) : L(this.promise, new Error("Array Methods must be provided an Array")); }

                    return t.prototype._enumerate = function (t) { for (let e = 0; this._state === j && e < t.length; e++) this._eachEntry(t[e], e); }, t.prototype._eachEntry = function (t, e)
                    {
                        let n = this._instanceConstructor, r = n.resolve; if (r === T)
                        {
                            let o = x(t); if (o === b && t._state !== j) this._settledAt(t._state, e, t._result); else if (typeof o != "function") this._remaining--, this._result[e] = t; else if (n === Q) { let i = new n(M); E(i, t, o), this._willSettleAt(i, e); }
                            else this._willSettleAt(new n(function (e) { return e(t); }), e);
                        }
                        else this._willSettleAt(r(t), e);
                    }, t.prototype._settledAt = function (t, e, n) { let r = this.promise; r._state === j && (this._remaining--, t === A ? L(r, n) : this._result[e] = n), this._remaining === 0 && C(r, this._result); }, t.prototype._willSettleAt = function (t, e) { let n = this; W(t, void 0, function (t) { return n._settledAt(O, e, t); }, function (t) { return n._settledAt(A, e, t); }); }, t;
                }()), Q = (function ()
                {
                    function t(e)
                    {
                        this[k] = F++, this._result = this._state = void 0, this._subscribers = [], M !== e && (typeof e != "function" && (function () { throw new TypeError("You must pass a resolver function as the first argument to the promise constructor"); }()), this instanceof t ? (function (t, e)
                        {
                            try { e(function (e) { P(t, e); }, function (e) { L(t, e); }); }
                            catch (e) { L(t, e); }
                        }(this, e)) : (function () { throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function."); }()));
                    }

                    return t.prototype.catch = function (t) { return this.then(null, t); }, t.prototype.finally = function (t) { let e = this.constructor; return this.then(function (n) { return e.resolve(t()).then(function () { return n; }); }, function (n) { return e.resolve(t()).then(function () { throw n; }); }); }, t;
                }()); return Q.prototype.then = b, Q.all = function (t) { return new J(this, t).promise; }, Q.race = function (t) { let e = this; return r(t) ? new e(function (n, r) { for (let o = t.length, i = 0; i < o; i++)e.resolve(t[i]).then(n, r); }) : new e(function (t, e) { return e(new TypeError("You must pass an array to race.")); }); }, Q.resolve = T, Q.reject = function (t) { let e = new this(M); return L(e, t), e; }, Q._setScheduler = function (t) { s = t; }, Q._setAsap = function (t) { u = t; }, Q._asap = u, Q.polyfill = function ()
            {
                let t = void 0; if (void 0 !== n)t = n; else if (typeof self != "undefined")t = self; else try { t = Function("return this")(); }
                catch (t) { throw new Error("polyfill failed because global object is unavailable in this environment"); } let e = t.Promise; if (e)
                {
                    let r = null; try { r = Object.prototype.toString.call(e.resolve()); }
                    catch (t) {} if (r === "[object Promise]" && !e.cast) return;
                }t.Promise = Q;
            }, Q.Promise = Q, Q;
        }, t.exports = r();
    }).call(this, n(1), n(2));
}, function (t, e)
{
    let n, r, o = t.exports = {}; function i() { throw new Error("setTimeout has not been defined"); }

    function s() { throw new Error("clearTimeout has not been defined"); }

    function u(t)
    {
        if (n === setTimeout) return setTimeout(t, 0); if ((n === i || !n) && setTimeout) return n = setTimeout, setTimeout(t, 0); try { return n(t, 0); }
        catch (e)
        {
            try { return n.call(null, t, 0); }
            catch (e) { return n.call(this, t, 0); }
        }
    }

    !(function ()
    {
        try { n = typeof setTimeout == "function" ? setTimeout : i; }
        catch (t) { n = i; } try { r = typeof clearTimeout == "function" ? clearTimeout : s; }
        catch (t) { r = s; }
    }()); let a, c = [], h = !1, f = -1; function l() { h && a && (h = !1, a.length ? c = a.concat(c) : f = -1, c.length && d()); }

    function d()
    {
        if (!h)
        {
            let t = u(l); h = !0; for (let e = c.length; e;) { for (a = c, c = []; ++f < e;)a && a[f].run(); f = -1, e = c.length; }a = null, h = !1, (function (t)
            {
                if (r === clearTimeout) return clearTimeout(t); if ((r === s || !r) && clearTimeout) return r = clearTimeout, clearTimeout(t); try { r(t); }
                catch (e)
                {
                    try { return r.call(null, t); }
                    catch (e) { return r.call(this, t); }
                }
            }(t));
        }
    }

    function p(t, e) { this.fun = t, this.array = e; }

    function v() {}

    o.nextTick = function (t) { let e = new Array(arguments.length - 1); if (arguments.length > 1) for (let n = 1; n < arguments.length; n++)e[n - 1] = arguments[n]; c.push(new p(t, e)), c.length !== 1 || h || u(d); }, p.prototype.run = function () { this.fun.apply(null, this.array); }, o.title = "browser", o.browser = !0, o.env = {}, o.argv = [], o.version = "", o.versions = {}, o.on = v, o.addListener = v, o.once = v, o.off = v, o.removeListener = v, o.removeAllListeners = v, o.emit = v, o.prependListener = v, o.prependOnceListener = v, o.listeners = function (t) { return []; }, o.binding = function (t) { throw new Error("process.binding is not supported"); }, o.cwd = function () { return "/"; }, o.chdir = function (t) { throw new Error("process.chdir is not supported"); }, o.umask = function () { return 0; };
}, function (t, e)
{
    let n; n = (function () { return this; }()); try { n = n || new Function("return this")(); }
    catch (t) { typeof window == "object" && (n = window); }t.exports = n;
}, function (t, e, n)
{
    n.r(e); let r, o = n(0), i = function (t, e, n) { return delete t.__resolve__, delete t.__reject__, e(n), t; }, s = function () { let t, e, n = new o.Promise(function (n, r) { t = n, e = r; }); return n.__resolve__ = function (e) { return i(n, t, e); }, n.__reject__ = function (t) { return i(n, e, t); }, n; }, u = "application/x-talkerjs-v1+json", a = (r = function (t, e) { return (r = Object.setPrototypeOf || { "__proto__": [] } instanceof Array && function (t, e) { t.__proto__ = e; } || function (t, e) { for (let n in e)e.hasOwnProperty(n) && (t[n] = e[n]); })(t, e); }, function (t, e)
        {
            function n() { this.constructor = t; }

            r(t, e), t.prototype = e === null ? Object.create(e) : (n.prototype = e.prototype, new n());
        }), c = (function () { return function (t, e, n, r) { void 0 === r && (r = null), this.talker = t, this.namespace = e, this.data = n, this.responseToId = r, this.type = u; }; }()), h = (function (t)
        {
            function e(e, n, r, o) { void 0 === o && (o = null); let i = t.call(this, e, n, r, o) || this; return i.talker = e, i.namespace = n, i.data = r, i.responseToId = o, i.id = i.talker.nextId(), i; }

            return a(e, t), e.prototype.toJSON = function () { let t = this; return { "id": t.id, "responseToId": t.responseToId || void 0, "namespace": t.namespace, "data": t.data, "type": t.type }; }, e;
        }(c)), f = (function (t)
        {
            function e(e, n, r, o) { void 0 === n && (n = ""), void 0 === r && (r = {}), void 0 === o && (o = 0); let i = t.call(this, e, n, r) || this; return i.talker = e, i.namespace = n, i.data = r, i.id = o, i; }

            return a(e, t), e.prototype.respond = function (t) { return this.talker.send(this.namespace, t, this.id); }, e;
        }(c)); n.d(e, "IncomingMessage", function () { return f; }), n.d(e, "OutgoingMessage", function () { return h; }); let l = (function ()
    {
        function t(t, e, n) { void 0 === n && (n = window); let r = this; return this.remoteWindow = t, this.remoteOrigin = e, this.localWindow = n, this.timeout = 3e3, this.latestId = 0, this.queue = [], this.sent = {}, this.handshaken = !1, this.handshake = s(), this.localWindow.addEventListener("message", function (t) { return r.receiveMessage(t); }, !1), this.sendHandshake(), this; }

        return t.prototype.send = function (t, e, n) { void 0 === n && (n = null); let r = new h(this, t, e, n), o = s(); return this.sent[r.id] = o, this.queue.push(r), this.flushQueue(), setTimeout(function () { return o.__reject__ && o.__reject__(new Error("Talker.js message timed out waiting for a response.")); }, this.timeout), o; }, t.prototype.nextId = function () { return this.latestId += 1; }, t.prototype.receiveMessage = function (t)
        {
            let e; try { e = JSON.parse(t.data); }
            catch (t) { e = { "namespace": "", "data": {}, "id": this.nextId(), "type": u }; } if (this.isSafeMessage(t.source, t.origin, e.type)) return e.handshake || e.handshakeConfirmation ? this.handleHandshake(e) : this.handleMessage(e);
        }, t.prototype.isSafeMessage = function (t, e, n) { let r = t === this.remoteWindow, o = this.remoteOrigin === "*" || e === this.remoteOrigin; return r && o && n === u; }, t.prototype.handleHandshake = function (t) { t.handshake && this.sendHandshake(this.handshaken), this.handshaken || (this.handshaken = !0, this.handshake.__resolve__ && this.handshake.__resolve__(this.handshaken), this.flushQueue()); }, t.prototype.handleMessage = function (t) { let e = new f(this, t.namespace, t.data, t.id), n = t.responseToId; return n ? this.respondToMessage(n, e) : this.broadcastMessage(e); }, t.prototype.respondToMessage = function (t, e) { let n = this.sent[t]; n && n.__resolve__ && (n.__resolve__(e), delete this.sent[t]); }, t.prototype.broadcastMessage = function (t) { this.onMessage && this.onMessage.call(this, t); }, t.prototype.sendHandshake = function (t) { let e; return void 0 === t && (t = !1), this.postMessage(((e = { "type": u })[t ? "handshakeConfirmation" : "handshake"] = !0, e)); }, t.prototype.postMessage = function (t)
        {
            let e = JSON.stringify(t); if (this.remoteWindow && this.remoteOrigin) try { this.remoteWindow.postMessage(e, this.remoteOrigin); }
            catch (t) {}
        }, t.prototype.flushQueue = function () { if (this.handshaken) for (;this.queue.length > 0;) { let t = this.queue.shift(); t && this.postMessage(t); } }, t;
    }()); e.default = l;
}]));
// # sourceMappingURL=talker.min.js.map
