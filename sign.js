function sign(t, e) {
    function y(t, e, n) {
        return t(n = {
            path: e,
            exports: {},
            require: function (t, e) {
                return function () {
                    throw new Error("Dynamic requires are not currently supported by @rollup/plugin-commonjs")
                }(null == e && n.path)
            }
        }, n.exports), n.exports
    }
    var b = y((function (t, e) {
        var n;
        t.exports = (n = n || function (t, e) {
            var n = Object.create || function () {
                    function t() {}
                    return function (e) {
                        var n;
                        return t.prototype = e, n = new t, t.prototype = null, n
                    }
                }(),
                r = {},
                i = r.lib = {},
                o = i.Base = {
                    extend: function (t) {
                        var e = n(this);
                        return t && e.mixIn(t), e.hasOwnProperty("init") && this.init !== e.init || (e.init = function () {
                            e.$super.init.apply(this, arguments)
                        }), e.init.prototype = e, e.$super = this, e
                    },
                    create: function () {
                        var t = this.extend();
                        return t.init.apply(t, arguments), t
                    },
                    init: function () {},
                    mixIn: function (t) {
                        for (var e in t) t.hasOwnProperty(e) && (this[e] = t[e]);
                        t.hasOwnProperty("toString") && (this.toString = t.toString)
                    },
                    clone: function () {
                        return this.init.prototype.extend(this)
                    }
                },
                a = i.WordArray = o.extend({
                    init: function (t, e) {
                        t = this.words = t || [], this.sigBytes = null != e ? e : 4 * t.length
                    },
                    toString: function (t) {
                        return (t || c).stringify(this)
                    },
                    concat: function (t) {
                        var e = this.words,
                            n = t.words,
                            r = this.sigBytes,
                            i = t.sigBytes;
                        if (this.clamp(), r % 4)
                            for (var o = 0; o < i; o++) {
                                var a = n[o >>> 2] >>> 24 - o % 4 * 8 & 255;
                                e[r + o >>> 2] |= a << 24 - (r + o) % 4 * 8
                            } else
                                for (o = 0; o < i; o += 4) e[r + o >>> 2] = n[o >>> 2];
                        return this.sigBytes += i, this
                    },
                    clamp: function () {
                        var e = this.words,
                            n = this.sigBytes;
                        e[n >>> 2] &= 4294967295 << 32 - n % 4 * 8, e.length = t.ceil(n / 4)
                    },
                    clone: function () {
                        var t = o.clone.call(this);
                        return t.words = this.words.slice(0), t
                    },
                    random: function (e) {
                        for (var n, r = [], i = function (e) {
                                e = e;
                                var n = 987654321,
                                    r = 4294967295;
                                return function () {
                                    var i = ((n = 36969 * (65535 & n) + (n >> 16) & r) << 16) + (e = 18e3 * (65535 & e) + (e >> 16) & r) & r;
                                    return i /= 4294967296, (i += .5) * (t.random() > .5 ? 1 : -1)
                                }
                            }, o = 0; o < e; o += 4) {
                            var s = i(4294967296 * (n || t.random()));
                            n = 987654071 * s(), r.push(4294967296 * s() | 0)
                        }
                        return new a.init(r, e)
                    }
                }),
                s = r.enc = {},
                c = s.Hex = {
                    stringify: function (t) {
                        for (var e = t.words, n = t.sigBytes, r = [], i = 0; i < n; i++) {
                            var o = e[i >>> 2] >>> 24 - i % 4 * 8 & 255;
                            r.push((o >>> 4).toString(16)), r.push((15 & o).toString(16))
                        }
                        return r.join("")
                    },
                    parse: function (t) {
                        for (var e = t.length, n = [], r = 0; r < e; r += 2) n[r >>> 3] |= parseInt(t.substr(r, 2), 16) << 24 - r % 8 * 4;
                        return new a.init(n, e / 2)
                    }
                },
                u = s.Latin1 = {
                    stringify: function (t) {
                        for (var e = t.words, n = t.sigBytes, r = [], i = 0; i < n; i++) {
                            var o = e[i >>> 2] >>> 24 - i % 4 * 8 & 255;
                            r.push(String.fromCharCode(o))
                        }
                        return r.join("")
                    },
                    parse: function (t) {
                        for (var e = t.length, n = [], r = 0; r < e; r++) n[r >>> 2] |= (255 & t.charCodeAt(r)) << 24 - r % 4 * 8;
                        return new a.init(n, e)
                    }
                },
                l = s.Utf8 = {
                    stringify: function (t) {
                        try {
                            return decodeURIComponent(escape(u.stringify(t)))
                        } catch (t) {
                            throw new Error("Malformed UTF-8 data")
                        }
                    },
                    parse: function (t) {
                        return u.parse(unescape(encodeURIComponent(t)))
                    }
                },
                f = i.BufferedBlockAlgorithm = o.extend({
                    reset: function () {
                        this._data = new a.init, this._nDataBytes = 0
                    },
                    _append: function (t) {
                        "string" == typeof t && (t = l.parse(t)), this._data.concat(t), this._nDataBytes += t.sigBytes
                    },
                    _process: function (e) {
                        var n = this._data,
                            r = n.words,
                            i = n.sigBytes,
                            o = this.blockSize,
                            s = i / (4 * o),
                            c = (s = e ? t.ceil(s) : t.max((0 | s) - this._minBufferSize, 0)) * o,
                            u = t.min(4 * c, i);
                        if (c) {
                            for (var l = 0; l < c; l += o) this._doProcessBlock(r, l);
                            var f = r.splice(0, c);
                            n.sigBytes -= u
                        }
                        return new a.init(f, u)
                    },
                    clone: function () {
                        var t = o.clone.call(this);
                        return t._data = this._data.clone(), t
                    },
                    _minBufferSize: 0
                }),
                d = (i.Hasher = f.extend({
                    cfg: o.extend(),
                    init: function (t) {
                        this.cfg = this.cfg.extend(t), this.reset()
                    },
                    reset: function () {
                        f.reset.call(this), this._doReset()
                    },
                    update: function (t) {
                        return this._append(t), this._process(), this
                    },
                    finalize: function (t) {
                        return t && this._append(t), this._doFinalize()
                    },
                    blockSize: 16,
                    _createHelper: function (t) {
                        return function (e, n) {
                            return new t.init(n).finalize(e)
                        }
                    },
                    _createHmacHelper: function (t) {
                        return function (e, n) {
                            return new d.HMAC.init(t, n).finalize(e)
                        }
                    }
                }), r.algo = {});
            return r
        }(Math), n)
    })),
    _ = (y((function (t, e) {
        var n;
        t.exports = (n = b, function (t) {
            var e = n,
                r = e.lib,
                i = r.WordArray,
                o = r.Hasher,
                a = e.algo,
                s = [];
            ! function () {
                for (var e = 0; e < 64; e++) s[e] = 4294967296 * t.abs(t.sin(e + 1)) | 0
            }();
            var c = a.MD5 = o.extend({
                _doReset: function () {
                    this._hash = new i.init([1732584193, 4023233417, 2562383102, 271733878])
                },
                _doProcessBlock: function (t, e) {
                    for (var n = 0; n < 16; n++) {
                        var r = e + n,
                            i = t[r];
                        t[r] = 16711935 & (i << 8 | i >>> 24) | 4278255360 & (i << 24 | i >>> 8)
                    }
                    var o = this._hash.words,
                        a = t[e + 0],
                        c = t[e + 1],
                        h = t[e + 2],
                        p = t[e + 3],
                        v = t[e + 4],
                        g = t[e + 5],
                        m = t[e + 6],
                        y = t[e + 7],
                        b = t[e + 8],
                        _ = t[e + 9],
                        w = t[e + 10],
                        k = t[e + 11],
                        S = t[e + 12],
                        x = t[e + 13],
                        T = t[e + 14],
                        C = t[e + 15],
                        O = o[0],
                        E = o[1],
                        A = o[2],
                        I = o[3];
                    O = u(O, E, A, I, a, 7, s[0]), I = u(I, O, E, A, c, 12, s[1]), A = u(A, I, O, E, h, 17, s[2]), E = u(E, A, I, O, p, 22, s[3]), O = u(O, E, A, I, v, 7, s[4]), I = u(I, O, E, A, g, 12, s[5]), A = u(A, I, O, E, m, 17, s[6]), E = u(E, A, I, O, y, 22, s[7]), O = u(O, E, A, I, b, 7, s[8]), I = u(I, O, E, A, _, 12, s[9]), A = u(A, I, O, E, w, 17, s[10]), E = u(E, A, I, O, k, 22, s[11]), O = u(O, E, A, I, S, 7, s[12]), I = u(I, O, E, A, x, 12, s[13]), A = u(A, I, O, E, T, 17, s[14]), O = l(O, E = u(E, A, I, O, C, 22, s[15]), A, I, c, 5, s[16]), I = l(I, O, E, A, m, 9, s[17]), A = l(A, I, O, E, k, 14, s[18]), E = l(E, A, I, O, a, 20, s[19]), O = l(O, E, A, I, g, 5, s[20]), I = l(I, O, E, A, w, 9, s[21]), A = l(A, I, O, E, C, 14, s[22]), E = l(E, A, I, O, v, 20, s[23]), O = l(O, E, A, I, _, 5, s[24]), I = l(I, O, E, A, T, 9, s[25]), A = l(A, I, O, E, p, 14, s[26]), E = l(E, A, I, O, b, 20, s[27]), O = l(O, E, A, I, x, 5, s[28]), I = l(I, O, E, A, h, 9, s[29]), A = l(A, I, O, E, y, 14, s[30]), O = f(O, E = l(E, A, I, O, S, 20, s[31]), A, I, g, 4, s[32]), I = f(I, O, E, A, b, 11, s[33]), A = f(A, I, O, E, k, 16, s[34]), E = f(E, A, I, O, T, 23, s[35]), O = f(O, E, A, I, c, 4, s[36]), I = f(I, O, E, A, v, 11, s[37]), A = f(A, I, O, E, y, 16, s[38]), E = f(E, A, I, O, w, 23, s[39]), O = f(O, E, A, I, x, 4, s[40]), I = f(I, O, E, A, a, 11, s[41]), A = f(A, I, O, E, p, 16, s[42]), E = f(E, A, I, O, m, 23, s[43]), O = f(O, E, A, I, _, 4, s[44]), I = f(I, O, E, A, S, 11, s[45]), A = f(A, I, O, E, C, 16, s[46]), O = d(O, E = f(E, A, I, O, h, 23, s[47]), A, I, a, 6, s[48]), I = d(I, O, E, A, y, 10, s[49]), A = d(A, I, O, E, T, 15, s[50]), E = d(E, A, I, O, g, 21, s[51]), O = d(O, E, A, I, S, 6, s[52]), I = d(I, O, E, A, p, 10, s[53]), A = d(A, I, O, E, w, 15, s[54]), E = d(E, A, I, O, c, 21, s[55]), O = d(O, E, A, I, b, 6, s[56]), I = d(I, O, E, A, C, 10, s[57]), A = d(A, I, O, E, m, 15, s[58]), E = d(E, A, I, O, x, 21, s[59]), O = d(O, E, A, I, v, 6, s[60]), I = d(I, O, E, A, k, 10, s[61]), A = d(A, I, O, E, h, 15, s[62]), E = d(E, A, I, O, _, 21, s[63]), o[0] = o[0] + O | 0, o[1] = o[1] + E | 0, o[2] = o[2] + A | 0, o[3] = o[3] + I | 0
                },
                _doFinalize: function () {
                    var e = this._data,
                        n = e.words,
                        r = 8 * this._nDataBytes,
                        i = 8 * e.sigBytes;
                    n[i >>> 5] |= 128 << 24 - i % 32;
                    var o = t.floor(r / 4294967296),
                        a = r;
                    n[15 + (i + 64 >>> 9 << 4)] = 16711935 & (o << 8 | o >>> 24) | 4278255360 & (o << 24 | o >>> 8), n[14 + (i + 64 >>> 9 << 4)] = 16711935 & (a << 8 | a >>> 24) | 4278255360 & (a << 24 | a >>> 8), e.sigBytes = 4 * (n.length + 1), this._process();
                    for (var s = this._hash, c = s.words, u = 0; u < 4; u++) {
                        var l = c[u];
                        c[u] = 16711935 & (l << 8 | l >>> 24) | 4278255360 & (l << 24 | l >>> 8)
                    }
                    return s
                },
                clone: function () {
                    var t = o.clone.call(this);
                    return t._hash = this._hash.clone(), t
                }
            });

            function u(t, e, n, r, i, o, a) {
                var s = t + (e & n | ~e & r) + i + a;
                return (s << o | s >>> 32 - o) + e
            }

            function l(t, e, n, r, i, o, a) {
                var s = t + (e & r | n & ~r) + i + a;
                return (s << o | s >>> 32 - o) + e
            }

            function f(t, e, n, r, i, o, a) {
                var s = t + (e ^ n ^ r) + i + a;
                return (s << o | s >>> 32 - o) + e
            }

            function d(t, e, n, r, i, o, a) {
                var s = t + (n ^ (e | ~r)) + i + a;
                return (s << o | s >>> 32 - o) + e
            }
            e.MD5 = o._createHelper(c), e.HmacMD5 = o._createHmacHelper(c)
        }(Math), n.MD5)
    })), y((function (t, e) {
        var n, r, i;
        t.exports = (r = (n = b).lib.Base, i = n.enc.Utf8, void(n.algo.HMAC = r.extend({
            init: function (t, e) {
                t = this._hasher = new t.init, "string" == typeof e && (e = i.parse(e));
                var n = t.blockSize,
                    r = 4 * n;
                e.sigBytes > r && (e = t.finalize(e)), e.clamp();
                for (var o = this._oKey = e.clone(), a = this._iKey = e.clone(), s = o.words, c = a.words, u = 0; u < n; u++) s[u] ^= 1549556828, c[u] ^= 909522486;
                o.sigBytes = a.sigBytes = r, this.reset()
            },
            reset: function () {
                var t = this._hasher;
                t.reset(), t.update(this._iKey)
            },
            update: function (t) {
                return this._hasher.update(t), this
            },
            finalize: function (t) {
                var e = this._hasher,
                    n = e.finalize(t);
                return e.reset(), e.finalize(this._oKey.clone().concat(n))
            }
        })))
    })), y((function (t, e) {
        t.exports = b.HmacMD5
    })));


    var n = "";
    return Object.keys(t).sort().forEach((function (e) {
        t[e] && (n = n + "&" + e + "=" + t[e])
    })), n = n.slice(1), _(n, e).toString()
}
module.exports=sign