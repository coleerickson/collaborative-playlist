"SpotifyRemote" in window || (window.SpotifyRemote = {});
SpotifyRemote.Type = {
    DesktopClient: "desktop-client",
    WebPlayer: "webplayer"
};
SpotifyRemote.Error = {
    TRACK_UNAVAILABLE: "4303",
    USER_NOT_LOGGED_IN: "4110",
    message: {
        4001: "Unknown method",
        4002: "Error parsing request",
        4003: "Unknown service",
        4004: "Service not responding",
        4102: "Invalid OAuthToken",
        4103: "Expired OAuth token",
        4104: "OAuth token not verified",
        4105: "Token verification denied, too many requests",
        4106: "Token verification timeout",
        4107: "Invalid Csrf token",
        4108: "OAuth token is invalid for current user",
        4109: "Invalid Csrf path",
        4110: "No user logged in",
        4111: "Invalid scope",
        4112: "Csrf challenge failed",
        4201: "Upgrade to premium",
        4202: "Upgrade to premium or wait",
        4203: "Billing failed",
        4204: "Technical error",
        4205: "Commercial is playing",
        4301: "Content is unavailable but can be purchased",
        4302: "Premium only content",
        4303: "Content unavailable",
        "default": "Unexpected error. Please try again later."
    }
};
SpotifyRemote.createCookie = function(c, d, a) {
    var b;
    if (a) {
        b = new Date;
        b.setTime(b.getTime() + a * 864E5);
        a = "; expires=" + b.toGMTString()
    } else a = "";
    document.cookie = c + "=" + d + a + "; path=/"
};
SpotifyRemote.EventTarget = function() {
    this.events = {
        playmodechanged: "PLAY_MODE_CHANGED",
        playpositionchanged: "PLAY_POSITION_CHANGED",
        volumechanged: "VOLUME_CHANGED",
        onclientopening: "ON_CLIENT_OPENING",
        onclientconnected: "ON_CLIENT_CONNECTED",
        onclientconnectionfailed: "ON_CLIENT_CONNECTION_FAILED",
        onclienterror: "ON_CLIENT_ERROR",
        onclientdisconnect: "ON_CLIENT_DISCONNECT"
    }
};
SpotifyRemote.EventTarget.prototype.applyEventCallbacks = function(c) {
    var d = this,
        a;
    for (a in this.events)
        if (this.events.hasOwnProperty(a)) {
            var b = this.getCallbackName(a),
                e = "add" + b,
                i = "remove" + b.replace(/^on/i, "");
            (function(a) {
                typeof c[e] === "undefined" && (c[e] = function(b) {
                    d.subscribe(d.events[a], b)
                });
                typeof c[i] === "undefined" && (c[i] = function(b) {
                    d.unsubscribe(d.events[a], b)
                })
            })(a)
        }
    return c
};
SpotifyRemote.EventTarget.prototype.getCallbackName = function(c) {
    var d = null;
    if (typeof this.events[c] !== "undefined") {
        c = this.events[c];
        c = c.toLowerCase();
        c = c.split("_");
        for (d = 0; d < c.length; d++) c[d] = c[d].charAt(0).toUpperCase() + c[d].slice(1);
        d = c.join("") + "Listener"
    }
    return d
};
SpotifyRemote.EventTarget.prototype.subscribe = function(c, d) {
    void 0 === this.events[c] && (this.events[c] = []);
    this.events[c].push(d)
};
SpotifyRemote.EventTarget.prototype.unsubscribe = function(c, d) {
    for (var a = this.events[c], b = a.length - 1; b >= 0; --b)
        if (a[b] === d) {
            a.splice(b, 1);
            return true
        }
    return false
};
SpotifyRemote.EventTarget.prototype.dispatch = function(c, d, a) {
    if (this.events[c])
        for (var a = a || this, d = d instanceof Array ? d : [d], b, e = 0, i = this.events[c].length; e < i; e++) {
            b = this.events[c][e];
            b.apply(a, d)
        }
};
SpotifyRemote.settings = {
    extend: function(c, d) {
        var a, b;
        for (a in d) {
            b = d[a];
            d.hasOwnProperty(a) && typeof b != "undefined" && (c[a] = b)
        }
        return c
    }
};
SpotifyRemote.isDev = function() {
    return false
};
SpotifyRemote._isDev = null;
"SpotifyRemote" in window || (window.SpotifyRemote = {});
"web" in SpotifyRemote || (SpotifyRemote.web = {});
SpotifyRemote.web.config = {
    clientUrl: "https://play.spotify.com"
};
SpotifyRemote.web.getTrackUri = function(c) {
    var d;
    if (/spotify:track:[a-z0-9]+/ig.test(c)) return c;
    if ((d = /^spotify:trackset:(\w+:)?([a-z0-9]+(,[a-z0-9]+)*)(#\d)?$/ig.exec(c)) !== null) {
        c = d[2].split(",");
        d = d[4] !== null ? parseInt(d[4].substr(1)) : 0;
        d = d < c.length ? c[d] : c[0];
        return "spotify:track:" + d
    }
    return c
};
SpotifyRemote.web.remoteMessages = function() {
    return {
        messages: {
            STATUS_TO_REMOTE: "SPB_in",
            STATUS_FROM_REMOTE: "SPB_out",
            CONNECTED: "SPB_connected",
            CONNECT_REQUEST_FROM_REMOTE: "SPB_connect"
        },
        init: function() {
            return SpotifyRemote.web.localStorageMessages()
        }
    }
}();
SpotifyRemote.addEvent = function(c, d) {
    window.addEventListener ? window.addEventListener(c, d, false) : window.attachEvent && window.attachEvent("on" + c, d)
};
SpotifyRemote.web.localStorageMessages = function() {
    function c(e) {
        var c = e.key;
        if (a[c] && document.location.href !== e.url)
            for (var e = d(e.newValue), h = 0, f = a[c].length; h < f; h++) {
                b = a[c][h];
                b.fn.apply(b.context || this, [e].concat(b.args))
            }
    }

    function d(a, b) {
        var e = "";
        try {
            var d = JSON.parse(a),
                e = b ? JSON.stringify(d.data) : d.data
        } catch (c) {}
        return e
    }
    var a = {},
        b, e = function() {
            var a = false;
            if (window.localStorage && typeof window.localStorage.setItem === "function") try {
                var b = "check-storage-" + Date.now();
                localStorage.setItem(b, Date.now());
                localStorage.removeItem(b);
                a = true
            } catch (e) {}
            return a
        }();
    e && SpotifyRemote.addEvent("storage", c);
    return {
        send: function(a, b) {
            var d = false,
                b = b || {};
            b.referrerUrl = location.href;
            b.reason = "remote";
            if (e) try {
                var c = {
                    timestamp: Date.now(),
                    data: b
                };
                localStorage.setItem(a, JSON.stringify(c));
                d = true
            } catch (j) {}
            return d
        },
        listen: function(b, d, c, f) {
            if (e) {
                void 0 === a[b] && (a[b] = []);
                a[b].push({
                    fn: d,
                    args: c,
                    context: f
                })
            }
        },
        detach: function(b, d) {
            if (e && typeof a[b] !== "undefined" && a[b].length > 0)
                for (var c = 0, f = a[b].length, j = null; c < f; c++) {
                    j =
                        a[b][c];
                    if (j.fn == d) {
                        a[b].splice(c, 1);
                        f = f - 1;
                        c = c - 1
                    }
                }
        },
        read: function(a, b) {
            var c = null;
            if (e) {
                c = localStorage.getItem(a);
                c = d(c, b)
            }
            return c
        }
    }
};
"SpotifyRemote" in window || (window.SpotifyRemote = {});
SpotifyRemote.init = function(c, d, a, b) {
    var e, i;

    function g() {
        if (e !== null && e.isClientRunning()) {
            f = e;
            SpotifyRemote.desktop.utils.disable()
        } else if (i !== null && i.isClientRunning()) {
            f = i;
            f !== null && f.getIdentifier() === SpotifyRemote.Type.WebPlayer && f.disable()
        }
    }

    function h() {
        _clientOpenCheckRunning = false;
        typeof s === "function" && s(f)
    }
    var f = null;
    e = i = null;
    var j = d ? d : null,
        k = SpotifyRemote.settings.extend({
            allowPopUp: true,
            shouldUseWebPlayer: false
        }, b || {}),
        l = false,
        n = new SpotifyRemote.EventTarget,
        s = a;
    (function() {
        setTimeout(function() {
                if (f ===
                    null) {
                    SpotifyRemote.isDev() && console.log("client remote loaded");
                    i = SpotifyRemote.desktop.remote(n, {
                        oauthToken: c,
                        fbAuthToken: j,
                        allowPopup: k.allowPopUp
                    }, {
                        port: void 0,
                        subdomain: void 0
                    });
                    i.addOnWebHelperReadyListener(g);
                    f = i;
                    if (!l) {
                        l = true;
                        h()
                    }
                }
                window.setTimeout(function() {
                    if (k.shouldUseWebPlayer && (f === null || !f.isClientRunning())) {
                        SpotifyRemote.isDev() && console.log("webplayer remote loaded");
                        f = e = SpotifyRemote.web.remote(n, {
                            oauthToken: c,
                            fbAuthToken: j,
                            allowPopup: k.allowPopUp
                        });
                        if (!l) {
                            l = true;
                            h()
                        }
                    }
                }, 400)
            },
            0)
    })();
    d = {
        events: n.events,
        playPauseTrack: function(a, b, e) {
            f.playPauseTrack(a, b, e)
        },
        getCurrentTrack: function() {
            return f.getCurrentTrack()
        },
        getCurrentURI: function() {
            return f.getCurrentURI()
        },
        updateClientRunning: function(a) {
            return f.updateClientRunning(a)
        },
        isClientRunning: function() {
            if (f === null) {
                this.updateActiveClient();
                return false
            }
            return f.isClientRunning()
        },
        playPauseCurrent: function() {
            return f.playPauseCurrent()
        },
        addToQueue: function() {
            return f.addToQueue()
        },
        pause: function() {
            return f.pause()
        },
        pauseSong: function() {
            return this.pause()
        },
        isTrackPlaying: function() {
            return f.isTrackPlaying()
        },
        openSpotifyURI: function(a, b) {
            f.openSpotifyURI(a, b)
        },
        playSpotifyURI: function(a) {
            f.playSpotifyURI(a)
        },
        setVolume: function(a) {
            f.setVolume(a)
        },
        setPlayPosition: function(a) {
            f.setPlayPosition(a)
        },
        setReferrer: function(a) {
            f.setReferrer(a)
        },
        getIdentifier: function() {
            var a = "";
            f !== null && (a = f.getIdentifier());
            return a
        },
        isLoggedIn: function() {
            var a = false;
            f !== null && (a = f.isLoggedIn());
            return a
        },
        isAutoplay: function() {
            return f.isAutoplay()
        },
        attach: function(a) {
            for (var b in a) a.hasOwnProperty(b) &&
                n.subscribe(b, a[b])
        },
        addOnClientConnectedListener: function(a) {
            var b = this;
            n.subscribe(this.events.onclientconnected, function() {
                b.updateActiveClient();
                typeof a === "function" && a()
            })
        },
        updateActiveClient: g
    };
    return d = n.applyEventCallbacks(d)
};
"SpotifyRemote" in window || (window.SpotifyRemote = {});
SpotifyRemote.desktop = {};
SpotifyRemote.desktop.config = {
    startingPort: "https:" === window.location.protocol ? 4370 : 4379,
    endingPort: "https:" === window.location.protocol ? 4380 : 4389,
    subdomain: ""
};
SpotifyRemote.desktop.utils = {
    _enabled: !0,
    disable: function() {
        this._enabled = false
    },
    resetSubdomain: function() {
        SpotifyRemote.desktop.config.subdomain = ""
    },
    randomString: function() {
        for (var c = "", d = 0; d < 10; ++d) c = c + String.fromCharCode(Math.floor(Math.random() * 26) + 97);
        return c
    },
    baseUrl: function() {
        var c = SpotifyRemote.desktop.config.subdomain || SpotifyRemote.desktop.utils.randomString();
        SpotifyRemote.desktop.config.subdomain = c;
        return "//" + c + ".spotilocal.com"
    },
    ajax: function(c, d, a) {
        var b, a = c.url + "&ref=" + encodeURIComponent(a ||
            document.referrer);
        if ("undefined" !== typeof window.XDomainRequest) {
            b = new XDomainRequest;
            c.abortTimer = setTimeout(function() {}, d + 1E3);
            b.onload = function() {
                if (typeof JSON !== "undefined") {
                    clearTimeout(c.abortTimer);
                    var a = b.responseText,
                        a = JSON.parse(a);
                    c.success(a);
                    c.complete && c.complete(b.responseText)
                }
            };
            b.onerror = function() {
                clearTimeout(c.abortTimer);
                c.error && c.error(b.responseText);
                c.complete && c.complete(b.responseText)
            };
            b.ontimeout = function() {
                clearTimeout(c.abortTimer);
                c.error && c.error({
                    type: "timeout"
                });
                c.complete && c.complete(b.responseText)
            };
            b.timeout = d ? d : 5E3;
            b.open("get", a)
        } else {
            b = function() {
                try {
                    return new(this.XMLHttpRequest || ActiveXObject)("MSXML2.XMLHTTP.3.0")
                } catch (a) {
                    return null
                }
            }();
            b.onload = function() {
                var a = b.responseText,
                    a = JSON.parse(a);
                c.success(a);
                typeof c.complete === "function" && c.complete(b.responseText)
            };
            b.onerror = function() {
                if (c.error) {
                    c.error(b.responseText);
                    typeof c.complete === "function" && c.complete(b.responseText)
                }
            };
            b.open("get", a + "&cors=")
        }
        b.send()
    },
    isPortAvailable: function(c,
        d, a, b) {
        if (!this._enabled) return true;
        var e = SpotifyRemote.desktop.utils.baseUrl() + ":" + c + "/service/version.json?service=remote",
            i = SpotifyRemote.desktop.config.subdomain;
        SpotifyRemote.desktop.utils.ajax({
            url: e,
            success: function(b) {
                a && a(b, c, i)
            },
            error: function(e) {
                c < d ? SpotifyRemote.desktop.utils.isPortAvailable(++c, d, a, b) : b && b(e)
            }
        }, 5E3)
    }
};
SpotifyRemote.desktop.base = function() {
    var c = SpotifyRemote.desktop.config,
        d = c.startingPort,
        a = c.endingPort;
    return {
        isDesktopClientRunning: function(b, e) {
            SpotifyRemote.desktop.utils.isPortAvailable(d, a, function(a, e, c) {
                b && b(e, c)
            }, function() {
                e && e()
            })
        }
    }
};
SpotifyRemote.desktop.remote = function(c, d, a) {
    function b(a, b) {
        if (u.allowPopup) {
            b || (b = 5E3);
            E = window.open("http://" + location.host + "/openspotify/?spuri=" + a + "&closedelay=" + b, "sp", "status=0,toolbar=0,location=0,menubar=0,directories=0,resizable=0,scrollbars=0,height=80,width=250,left=" + (screen.width - 250) / 2 + ",top=" + (screen.height - 80) / 2)
        }
    }

    function e(a, b) {
        SpotifyRemote.desktop.utils.isPortAvailable(SpotifyRemote.desktop.config.startingPort, SpotifyRemote.desktop.config.endingPort, function(b, e) {
            SpotifyRemote.isDev() &&
                console.log("result", b);
            t = e;
            x = true;
            if (E) {
                E.close();
                E = null
            }
            A = b.running === false;
            F = false;
            b.running !== false && a && a();
            typeof J == "function" && J()
        }, function(a) {
            SpotifyRemote.isDev() && console.log("error", a);
            b && b()
        })
    }

    function i() {
        q && w({
            url: h("remote/login.json", {
                csrf: v,
                oauth: q
            }),
            success: function(a) {
                a.error && a.error.type == "4102" && (q = "")
            }
        })
    }

    function g(a) {
        var b = 60;
        a && (b = 1);
        K = B = true;
        w({
            url: h("remote/status.json", {
                csrf: v,
                oauth: u.oauthToken,
                returnon: "login,logout,play,pause,error,ap",
                returnafter: b
            }),
            complete: function() {
                K =
                    false
            },
            success: function(a) {
                if (a.error) {
                    SpotifyRemote.isDev() && console.log("connect success but error", a.error.type);
                    if (a.running === false) {
                        SpotifyRemote.isDev() && console.log("client not running but webhelper in place");
                        A = true;
                        B = false
                    } else if (a.error.type == "4110") {
                        y = false;
                        setTimeout(function() {
                            g(true)
                        }, 1E3);
                        i()
                    } else a.error.type == "4107" ? f(g) : a.error.type == "4303" ? g(false) : C({
                        track: r,
                        playing: false
                    })
                } else {
                    SpotifyRemote.isDev() && console.log("connect success");
                    y = F = true;
                    q = null;
                    C(a);
                    g(false);
                    p !== "" && setTimeout(n,
                        2E3)
                }
            },
            error: function(a) {
                SpotifyRemote.isDev() && console.log("connect error", arguments);
                x = y = B = false;
                setTimeout(function() {
                    m.dispatch(m.events.onclientdisconnect, a)
                }, 300)
            }
        }, b * 1E3 + 5E3)
    }

    function h(a, b) {
        var e = N() + ":" + t + "/" + a,
            c = [],
            d = b || {},
            f;
        for (f in d) c.push(encodeURIComponent(f) + "=" + encodeURIComponent(d[f]));
        return e + "?" + c.join("&")
    }

    function f(a) {
        w({
            url: h("simplecsrf/token.json"),
            success: function(b) {
                SpotifyRemote.isDev() && console.log("csrf successful");
                v = b.token;
                m.dispatch(m.events.onclientconnected, {
                    running: !A
                });
                a && a(true)
            },
            error: function() {
                SpotifyRemote.isDev() && console.log("csrf failure")
            }
        })
    }

    function j() {
        G || k(0, F ? O : P)
    }

    function k(a, b) {
        if (a >= b) {
            G = false;
            m.dispatch(m.events.onclientconnectionfailed, {})
        } else {
            G = true;
            e(function() {
                G = false;
                f(g)
            }, function() {
                var e = Math.min((a + 1) * 1E3, Q);
                setTimeout(function() {
                    k(a + 1, b)
                }, e)
            })
        }
    }

    function l(a) {
        var b = a.error.type;
        if (!a.error.message) a.error.message = b && typeof SpotifyRemote.Error.message[b] !== "undefined" ? SpotifyRemote.Error.message[b] : SpotifyRemote.Error.message["default"];
        return a
    }

    function n() {
        p !== "" && w({
            url: h("remote/play.json", {
                csrf: v,
                oauth: u.oauthToken,
                uri: p,
                context: D
            }),
            success: function(a) {
                SpotifyRemote.isDev() && console.log("play success");
                if (a.error) {
                    a.error.uri = p;
                    l(a);
                    m.dispatch(m.events.onclienterror, a.error)
                } else C(a);
                p = ""
            },
            error: function() {}
        })
    }

    function s() {
        p !== "" && w({
            url: h("remote/queue.json", {
                csrf: v,
                oauth: u.oauthToken,
                uri: p,
                context: D
            }),
            success: function(a) {
                SpotifyRemote.isDev() && console.log("successfully added to queue");
                if (a.error) {
                    a.error.uri = p;
                    l(a);
                    m.dispatch(m.events.onclienterror,
                        a.error)
                } else C(a);
                p = ""
            },
            error: function() {}
        })
    }

    function z(a) {
        a = a || H;
        p = "";
        w({
            url: h("remote/pause.json", {
                pause: a,
                csrf: v,
                oauth: u.oauthToken
            }),
            success: function(a) {
                C(a)
            }
        })
    }

    function I() {
        w({
            url: h("remote/open.json"),
            success: function(a) {
                if (a.running) {
                    A = false;
                    o()
                }
            }
        }, 15E3)
    }

    function o() {
        F = false;
        if (x)
            if (A) {
                SpotifyRemote.isDev() && console.log("webhelper running");
                I()
            } else if (B) {
            SpotifyRemote.isDev() && console.log("just play it");
            if (!y && !K) {
                SpotifyRemote.isDev() && console.log("focus client");
                b("spotify:", 500)
            } else if (r &&
                r.track_resource.uri == p) {
                SpotifyRemote.isDev() && console.log("playpause");
                z()
            } else {
                SpotifyRemote.isDev() && console.log("play");
                n()
            }
        } else {
            SpotifyRemote.isDev() && console.log("longpoll running");
            g(true)
        } else {
            SpotifyRemote.isDev() && console.log("client not running");
            x || m.dispatch(m.events.onclientopening, {});
            j()
        }
    }

    function L(a) {
        a = parseFloat(a);
        SpotifyRemote.isDev() && console.log("Warning: volume control not yet implemented for desktop client remote.");
        w({
            url: h("remote/volume.json", {
                volume: a,
                csrf: v,
                oauth: u.oauthToken
            }),
            success: function(a) {
                SpotifyRemote.isDev() && console.log("called setVolume", a)
            }
        })
    }

    function M(a) {
        var a = function(a) {
                var b = Math.floor(a / 60),
                    a = (a % 60).toFixed(3);
                return b + ":" + a
            }(a),
            b = r ? r.track_resource.uri : null;
        b && a && w({
            url: h("remote/play.json", {
                csrf: v,
                oauth: u.oauthToken,
                uri: b + "#" + a,
                context: D
            }),
            success: function(a) {
                SpotifyRemote.isDev() && console.log("called setPlayPosition", a)
            }
        })
    }
    var a = a || {},
        u = d || {},
        d = SpotifyRemote.desktop.utils,
        v = "",
        q = u.fbAuthToken || null,
        t = a.port || SpotifyRemote.desktop.config.startingPort;
    a.subdomain || d.randomString();
    var p = "",
        D = "",
        y = false,
        B = false,
        K = false,
        x = a.port && a.subdomain,
        H = false,
        r = null,
        F = true,
        G = false,
        O = 2,
        P = 90,
        Q = 5E3,
        E, A = false,
        w = d.ajax,
        N = d.baseUrl,
        J = null,
        m = c || new SpotifyRemote.EventTarget,
        C = function() {
            function a() {
                b = null;
                if (!e || !e.track && r) e = {
                    track: r,
                    playing: false
                };
                if (!(e.track && typeof e.track.track_resource === "undefined")) {
                    e.track && e.track.track_resource.uri === (r ? r.track_resource.uri : null) && m.dispatch(m.events.playpositionchanged, {
                        value: e.playing_position
                    });
                    if (e.track) {
                        H = e.playing;
                        m.dispatch(m.events.playmodechanged, {
                            track: e.track,
                            status: H,
                            playing_position: e.playing_position
                        });
                        r = e.track
                    }
                }
            }
            var b, e;
            return function(c) {
                e = c;
                b && clearTimeout(b);
                b = setTimeout(a, 100)
            }
        }();
    x ? f(g) : j();
    return {
        getIdentifier: function() {
            return SpotifyRemote.Type.DesktopClient
        },
        addListener: function(a, b) {
            m.subscribe(a, b)
        },
        removeListener: function(a, b) {
            m.unsubscribe(a, b)
        },
        playPauseTrack: function(a, b, e) {
            p = "spotify:" + b + ":" + a;
            D = e;
            !y && B ? setTimeout(o, 1E3) : o()
        },
        playPauseCurrent: function() {
            z()
        },
        addToQueue: function(a) {
            p =
                a;
            s()
        },
        pause: function() {
            z(true)
        },
        getCurrentTrack: function() {
            return r
        },
        getCurrentURI: function() {
            return r ? r.track_resource.uri : null
        },
        updateClientRunning: function() {},
        isClientRunning: function() {
            return x
        },
        isLoggedIn: function() {
            return y
        },
        isTrackPlaying: function() {
            return H
        },
        openSpotifyURI: function(a, e) {
            b(a, e);
            j()
        },
        playSpotifyURI: function(a) {
            D = p = a;
            o()
        },
        setVolume: function(a) {
            L(a)
        },
        setPlayPosition: function(a) {
            M(a)
        },
        setReferrer: function() {},
        isAutoplay: function() {
            return false
        },
        addOnWebHelperReadyListener: function(a) {
            typeof a ==
                "function" && (J = a)
        }
    }
};
"SpotifyRemote" in window || (window.SpotifyRemote = {});
"web" in SpotifyRemote || (SpotifyRemote.web = {});
SpotifyRemote.web.remote = function(c) {
    function d() {
        k && (j ? f && f.track_resource.uri == g ? a(!l) : a(true) : s || (s = setInterval(b, I)))
    }

    function a(a) {
        a = {
            track: g,
            context: h,
            play: a,
            time: Date.now()
        };
        SpotifyRemote.isDev() && console.log("[SPB play-pause]", a);
        q.send(t.STATUS_FROM_REMOTE, a)
    }

    function b() {
        SpotifyRemote.isDev() && console.log("[SPB try to connect...]");
        if (j) SpotifyRemote.isDev() && console.log("[SPB already connected...]");
        else {
            q.send(t.CONNECT_REQUEST_FROM_REMOTE);
            n++;
            if (n > z) {
                clearInterval(s);
                s = null;
                n = 0
            }
        }
    }

    function e(a) {
        if (typeof a.error !==
            "undefined") {
            a = {
                type: v[a.error],
                message: a.message,
                uri: typeof a.uri !== "undefined" ? a.uri : ""
            };
            o.dispatch(o.events.onclienterror, a);
            SpotifyRemote.isDev() && console.log("[SPB client error]", a)
        } else {
            o.dispatch(L, a);
            p({
                track: {
                    track_resource: {
                        uri: a.track
                    },
                    artist_resource: {
                        uri: a.track
                    },
                    album_resource: {
                        uri: a.track
                    }
                },
                playing_position: (a.playing_position || 0) / 1E3,
                playing: a.playing,
                time: a.time
            });
            SpotifyRemote.isDev() && console.log("[SPB status message]", a)
        }
    }

    function i(a) {
        var b;
        if (a === true) {
            b = M;
            j = k = true;
            o.dispatch(o.events.onclientconnected);
            clearInterval(s);
            s = null;
            n = 0
        } else {
            b = u;
            j = k = false;
            o.dispatch(o.events.onclientdisconnected);
            p(null)
        }
        o.dispatch(b, a);
        SpotifyRemote.isDev() && console.log("[SPB " + b + "]", a)
    }
    var g = "",
        h = "",
        f = null,
        j = false,
        k = false,
        l = false,
        n = 0,
        s, z = 30,
        I = 2E3,
        o = c || new SpotifyRemote.EventTarget,
        L = "STATUS_MESSAGE",
        M = "CLIENT_CONNECTED",
        u = "CLIENT_DISCONNECTED",
        v = {
            unplayable: "4303"
        },
        q = SpotifyRemote.web.remoteMessages.init(),
        t = SpotifyRemote.web.remoteMessages.messages,
        p = function() {
            function a() {
                SpotifyRemote.isDev() && console.log("dispatch playmodechanged",
                    e);
                b = null;
                if (!e || !e.track && f) e = {
                    track: f,
                    playing: false
                };
                if (e.track) {
                    l = e.playing;
                    o.dispatch(o.events.playmodechanged, {
                        track: e.track,
                        status: l,
                        playing_position: e.playing_position,
                        time: e.time
                    });
                    f = e.track
                }
            }
            var b, e;
            return function(c) {
                e = c;
                b && clearTimeout(b);
                b = setTimeout(a, 50)
            }
        }();
    setTimeout(function() {
        if (!j) {
            setTimeout(b, 500);
            setTimeout(function() {}, 1E3)
        }
        q.listen(t.STATUS_TO_REMOTE, e);
        q.listen(t.CONNECTED, i)
    }, 500);
    return {
        disable: function() {
            q.detach(t.STATUS_TO_REMOTE, e);
            q.detach(t.CONNECTED, i)
        },
        getIdentifier: function() {
            return SpotifyRemote.Type.WebPlayer
        },
        addListener: function(a, b) {
            o.subscribe(a, b)
        },
        removeListener: function(a, b) {
            o.unsubscribe(a, b)
        },
        playPauseTrack: function(a, b, e) {
            g = "spotify:" + b + ":" + a;
            h = e;
            d()
        },
        playPauseCurrent: function() {
            a(!l)
        },
        addToQueue: function() {},
        pause: function() {
            a(false)
        },
        getCurrentTrack: function() {
            return f
        },
        getCurrentURI: function() {
            return f !== null ? f.track_resource.uri : null
        },
        updateClientRunning: function(a, b) {
            k = a;
            typeof b !== "undefined" && (l = b)
        },
        isClientRunning: function() {
            return k
        },
        isLoggedIn: function() {
            return true
        },
        isTrackPlaying: function() {
            return l
        },
        openSpotifyURI: function() {},
        playSpotifyURI: function(a) {
            g = SpotifyRemote.web.getTrackUri(a);
            h = a.indexOf("#") > -1 ? a.replace("#", ":#:") : a;
            d()
        },
        setVolume: function(a) {
            a = {
                volume: a
            };
            SpotifyRemote.isDev() && console.log("[SPB volume]", a);
            q.send(t.STATUS_FROM_REMOTE, a)
        },
        setPlayPosition: function(a) {
            a = {
                position: a
            };
            SpotifyRemote.isDev() && console.log("[SPB play-position]", a);
            q.send(t.STATUS_FROM_REMOTE, a)
        },
        setReferrer: function() {},
        isAutoplay: function() {
            return h.indexOf("spotify:trackset:") < 0
        }
    }
};
var Spotify = function(c) {
    c.Config = {
        _configuration: {
            debug: !1,
            tracking: !0,
            server: "//embed.spotify.com/",
            "open-url": "https://open.spotify.com/",
            "mediabar-url": "https://embed.spotify.com/mediabar/",
            "link-url": "https://play.spotify.com/",
            "play-now-url": "https://embed.spotify.com/registration/play-now.php",
            "logging-prefix": "[SPB]",
            "entity-renderer-url": "//embed.spotify.com/mediabar/entity/",
            "download-url": "https://www.spotify.com/download/",
            "fb-app-id": "174829003346",
            "trackset-max-length": 70,
            "registration-module-browser-versions": {
                firefox: 14,
                chrome: 21,
                safari: 5,
                explorer: 8
            },
            "link-enabled": !0,
            "link-browser-versions": {
                chrome: 21,
                firefox: 14,
                safari: 5,
                explorer: 9
            },
            "embedded-player-versions": {
                chrome: 21,
                firefox: 14,
                safari: 5,
                explorer: 9
            },
            "mediabar-browser-versions": {
                chrome: 21,
                firefox: 14,
                safari: 5,
                explorer: [9, 10]
            },
            "mediabar-platforms": ["Windows", "Mac", "Linux", "Unknown"],
            "play-now-markets": [],
            "download-links": {
                windows: {
                    "default": "https://d1clcicqv97n4s.cloudfront.net/SpotifySetup.exe"
                },
                mac: {
                    "default": "https://d1clcicqv97n4s.cloudfront.net/Spotify.dmg",
                    app: "https://d1clcicqv97n4s.cloudfront.net/SpotifyInstaller.zip"
                }
            },
            "spotify-target-origin": "https://embed.spotify.com",
            "allowed-origins": [
                ["*.spotify.com", "https"],
                ["*.yahoo.com", "http|https"], "https://d1tgm0mcw6tx0m.cloudfront.net", "https://d34f388hvlfgq4.cloudfront.net", "https://d20nan3osubr3.cloudfront.net", ["*.last.fm", "http|https"],
                ["*.lastfm.de", "http|https"],
                ["*.lastfm.fr", "http|https"],
                ["*.lastfm.se", "http|https"],
                ["*.lastfm.pt", "http|https"],
                ["*.lastfm.pl", "http|https"],
                ["*.lastfm.it", "http|https"],
                ["*.lastfm.com.br", "http|https"],
                ["*.lastfm.tr", "http|https"],
                ["*.lastfm.jp", "http|https"],
                ["*.lastfm.es", "http|https"],
                ["*.lastfm.ru", "http|https"],
                ["*.lastfm.ch", "http|https"],
                ["*.lastfm.at", "http|https"],
                ["*.lastfm.com.tr", "http|https"],
                ["*.lastfm.biz", "http|https"],
                ["*.coachella.com", "http|https"],
                ["*.sandpit.us", "http|https"],
                ["*.echonest.com", "http|https"],
                ["*.musixmatch.com", "http|https"],
                ["*.undrtone.com", "http|https"],
                ["*.genius.com", "http|https"],
                ["*.genius-staging.com", "http|https"],
                ["*.g.dev",
                    "http|https"
                ]
            ],
            "ab-testing": {
                "play-now-performance": {
                    A: {
                        range: [0, 24],
                        description: "No prefetch, no autoplay"
                    },
                    B: {
                        range: [25, 49],
                        description: "Only prefetch"
                    },
                    C: {
                        range: [50, 74],
                        description: "Only autoplay"
                    },
                    D: {
                        range: [75, 100],
                        description: "Prefetch and autoplay"
                    }
                },
                "animated-play-count": {
                    "no-animated": {
                        range: [0, 0],
                        description: "No animation updating playcount"
                    },
                    animated: {
                        range: [0, 100],
                        description: "Animated playcount update"
                    }
                }
            }
        },
        set: function(c, a) {
            this._configuration[c] = a
        },
        get: function(c) {
            var a = null;
            "undefined" !==
            typeof this._configuration[c] && this._configuration.hasOwnProperty(c) && (a = this._configuration[c]);
            return a
        },
        override: function(c) {
            for (var a in c) c.hasOwnProperty(a) && "undefined" !== typeof this._configuration[a] && (this._configuration[a] = c[a])
        }
    };
    return c
}(Spotify || {});
Spotify = function(c) {
    c.Logger = {
        log: function(d, a, b) {
            Spotify.Config.get("debug") && this.isConsoleAvailable() && ("undefined" === typeof b && (b = !1), d = Spotify.Config.get("logging-prefix") + d, c.BrowserDetect.init(), "chrome" == c.BrowserDetect.browser.toLowerCase() && b && (b = Error().stack.split("\n")[2], d += "\n" + b, "undefined" !== typeof a && (d += "\n")), "undefined" !== typeof a ? console.log(d, a) : console.log(d))
        },
        isConsoleAvailable: function() {
            return window.console ? !0 : !1
        }
    };
    return c
}(Spotify || {});
Spotify = function(c) {
    var d = {
        "default": {
            source: "embed.spotify.com",
            campaign: "spb",
            medium: "spb"
        },
        "music.yahoo.com": {
            source: "music.yahoo.com",
            campaign: "yahoo",
            medium: "bd_partner"
        },
        "last.fm": {
            source: "last.fm",
            campaign: "lastfm",
            medium: "bd_partner"
        },
        "coachella.com": {
            source: "coachella.com",
            campaign: "coachella",
            medium: "bd_partner"
        }
    };
    c.Webplayer = {
        getValidUrl: function(a) {
            "spotify:" === a && (a = "");
            if ("" !== a)
                if (a = a.split(":"), "trackset" === a[1]) var b = "" !== a[2] ? a[2] : "default",
                    e = a[3].replace("#", "/%23/"),
                    a = a[1] + "/" +
                    encodeURIComponent(b) + "/" + e;
                else a = a.splice(1).join("/");
            return Spotify.Config.get("link-url") + a
        },
        open: function(a, b) {
            "undefined" === typeof a && (a = {});
            var e = {
                    uri: a.uri || "",
                    token: a.token || null,
                    checkIsLinkSpotified: a.checkIsLinkSpotified || !1,
                    fbBridge: a.fbBridge || null,
                    source: a.source || "spb",
                    newuser: a.newuser || null,
                    defaultTrack: a.defaultTrack || null
                },
                c = this.getValidUrl(e.uri),
                c = this.addParameters(c, e);
            Spotify.isLinkSpotified() || !e.checkIsLinkSpotified ? (e = window.open(c), Spotify.WebplayerInspect.inspectWindowStatus(e)) :
                $.ajax({
                    async: !1,
                    url: "./xhr/auth-link.php",
                    data: {
                        token: Spotify.Util.getChallengeToken()
                    },
                    success: function(a) {
                        "true" === a.status && (a = window.open(c), Spotify.WebplayerInspect.inspectWindowStatus(a), b && b())
                    },
                    type: "POST"
                })
        },
        addParameters: function(a, b) {
            if (b.uri && b.defaultTrack) {
                var e = "play=true";
                b.defaultTrack !== b.uri && -1 < b.defaultTrack.indexOf("spotify:track:") && (e = "play=" + b.defaultTrack.split(":")[2]);
                a = Spotify.Url.addParameters(a, e)
            }
            null !== b.token && (a = Spotify.Url.addParameters(a, "oauth_token=" + b.token));
            1 == b.newuser && (a = Spotify.Url.addParameters(a, "sp-new-user=1"));
            null !== b.fbBridge && b.fbBridge.getStatus() === Spotify.FbStatus.CONNECTED && (a = Spotify.Url.addParameters(a, "flow=spb"));
            e = this.getUtmTags(b.source);
            "undefined" !== typeof window.frameReferrer && "" !== window.frameReferrer && (e.source = window.frameReferrer);
            return a = Spotify.Url.addParameters(a, "utm_source=" + encodeURIComponent(e.source) + "&utm_medium=" + encodeURIComponent(e.medium) + "&utm_campaign=" + encodeURIComponent(e.campaign))
        },
        getUtmTags: function(a) {
            var b =
                d["default"];
            "undefined" !== typeof d[a] && (b = d[a]);
            return b
        },
        isCompatible: function(a) {
            var b = !0;
            "undefined" !== typeof a && (b = this.isUriCompatible(a));
            return Spotify.Util.isBrowserCompatible("link-browser-versions", !0) && this.isEnabled() && Spotify.Util.isLocalStorageSupported() && b
        },
        isEnabled: function() {
            return Spotify.Config.get("link-enabled")
        },
        isUriCompatible: function(a) {
            return 0 > a.indexOf("spotify:artist:")
        },
        getUrl: function(a) {
            var b = "",
                e = Spotify.Config.get("link-url");
            "/" !== e[e.length - 1] && (e += "/");
            b = e;
            "undefined" !== typeof a && ("undefined" !== typeof a.entityInformation && (b = e + a.entityInformation.type + "/" + a.entityInformation.id), "undefined" !== typeof a.tracking && (b = Spotify.Url.addParameters(b, "utm_source=" + encodeURIComponent(a.tracking.source) + "&utm_medium=" + encodeURIComponent(a.tracking.medium) + "&utm_campaign=" + encodeURIComponent(a.tracking.campaign))));
            return b
        }
    };
    return c
}(Spotify || {});
Spotify = function(c) {
    c.Cookie = {
        get: function(c) {
            for (var a = document.cookie.split(";"), b = "", e = "", i = "", g = 0; g < a.length; g++)
                if (b = a[g].split("="), e = b[0].replace(/^\s+|\s+$/g, ""), e == c) return 1 < b.length && (i = unescape(b[1].replace(/^\s+|\s+$/g, ""))), i;
            return null
        },
        set: function(c, a, b, e, i, g) {
            var h = new Date;
            h.setTime(h.getTime());
            b && (b *= 864E5);
            h = new Date(h.getTime() + b);
            document.cookie = c + "=" + escape(a) + (b ? ";expires=" + h.toGMTString() : "") + (e ? ";path=" + e : "") + (i ? ";domain=" + i : "") + (g ? ";secure" : "")
        },
        unset: function(c) {
            var a =
                new Date;
            a.setFullYear(a.getFullYear() - 1);
            document.cookie = c + "=null; expires=" + a
        },
        isCookieEnabled: function() {
            var c = navigator.cookieEnabled;
            "undefined" === typeof navigator.cookieEnabled && !c && (document.cookie = "testcookie", c = -1 != document.cookie.indexOf("testcookie"));
            return c
        }
    };
    return c
}(Spotify || {});
Spotify = function(c) {
    c.BrowserDetect = {
        initialized: !1,
        init: function() {
            this.initialized || (this.browser = this._searchString(this.dataBrowser) || "Unknown", this.version = this._searchVersion(navigator.userAgent) || this._searchVersion(navigator.appVersion) || "an unknown version", this.OS = this._searchString(this.dataOS) || "Unknown", this.initialized = !0)
        },
        _searchString: function(c) {
            for (var a = 0; a < c.length; a++) {
                var b = c[a].string,
                    e = c[a].prop,
                    i = c[a].subString;
                this.versionSearch = c[a].versionSearch || c[a].identity;
                if (b) {
                    if ("string" ===
                        typeof i && -1 != b.indexOf(i) || "object" === typeof i && -1 != b.search(i)) return c[a].identity
                } else if (e) return c[a].identity
            }
        },
        _searchVersion: function(c) {
            var a = this.versionSearch,
                b = -1;
            "string" === typeof a ? b = c.indexOf(a) + a.length + 1 : "object" === typeof a && (b = (b = c.match(a)) ? c.search(a) + b[0].length : -1);
            if (-1 !== b) return parseFloat(c.substring(b))
        },
        dataBrowser: [{
            string: navigator.userAgent,
            subString: "Chrome",
            identity: "Chrome"
        }, {
            string: navigator.userAgent,
            subString: "OmniWeb",
            versionSearch: "OmniWeb/",
            identity: "OmniWeb"
        }, {
            string: navigator.vendor,
            subString: "Apple",
            identity: "Safari",
            versionSearch: "Version"
        }, {
            prop: window.opera,
            identity: "Opera",
            versionSearch: "Version"
        }, {
            string: navigator.vendor,
            subString: "iCab",
            identity: "iCab"
        }, {
            string: navigator.vendor,
            subString: "KDE",
            identity: "Konqueror"
        }, {
            string: navigator.userAgent,
            subString: "Firefox",
            identity: "Firefox"
        }, {
            string: navigator.vendor,
            subString: "Camino",
            identity: "Camino"
        }, {
            string: navigator.userAgent,
            subString: "Netscape",
            identity: "Netscape"
        }, {
            string: navigator.userAgent,
            subString: /MSIE|Trident/i,
            identity: "Explorer",
            versionSearch: /MSIE|rv:/i
        }, {
            string: navigator.userAgent,
            subString: "Gecko",
            identity: "Mozilla",
            versionSearch: "rv"
        }, {
            string: navigator.userAgent,
            subString: "Mozilla",
            identity: "Netscape",
            versionSearch: "Mozilla"
        }],
        dataOS: [{
            string: navigator.platform,
            subString: "Win",
            identity: "Windows"
        }, {
            string: navigator.platform,
            subString: "Mac",
            identity: "Mac"
        }, {
            string: navigator.userAgent,
            subString: "Android",
            identity: "Android"
        }, {
            string: navigator.userAgent,
            subString: /iPhone|iPad|iPod/i,
            identity: "iOS"
        }, {
            string: navigator.platform,
            subString: "Linux",
            identity: "Linux"
        }],
        getUserAgent: function() {
            return window.navigator.userAgent
        }
    };
    return c
}(Spotify || {});
Spotify = function(c) {
    var d = null;
    c.Util = {
        _isYUILoaded: function() {
            return !!("undefined" !== typeof YAHOO && YAHOO.util)
        },
        _isJQueryLoaded: function() {
            return "undefined" !== typeof jQuery
        },
        _legacyByClassName: function(a, b) {
            var c = [];
            if ("undefined" === typeof b.getElementsByTagName) return c;
            for (var d = b.getElementsByTagName("*"), g = 0; g < d.length; g++)
                if (d[g].getAttribute("class"))
                    for (var h = d[g].getAttribute("class").split(" "), f = 0; f < h.length; f++) h[f].toLowerCase() == a.toLowerCase() && c.push(d[g]);
                else if (d[g].className) {
                h =
                    d[g].className.split(" ");
                for (f = 0; f < h.length; f++) h[f].toLowerCase() == a.toLowerCase() && c.push(d[g])
            }
            return c
        },
        byClassName: function(a, b) {
            "undefined" === typeof b && (b = document);
            var c = [];
            try {
                c = b.querySelectorAll ? b.querySelectorAll("." + a) : this._isYUILoaded() ? YAHOO.util.Dom.getElementsByClassName(a, void 0, b) : this._legacyByClassName(a, b)
            } catch (d) {
                c = this._legacyByClassName(a, b)
            }
            return c
        },
        randomId: function() {
            return "spotify-" + Math.floor(1E5 * Math.random())
        },
        position: function(a) {
            var b = {
                x: 0,
                y: 0
            };
            this._isYUILoaded() ?
                (b = YAHOO.util.Dom.getXY(a), b = {
                    x: b[0],
                    y: b[1]
                }) : a.getBoundingClientRect && (a = a.getBoundingClientRect(), b = {
                    x: parseInt(a.left, 10),
                    y: parseInt(a.top, 10)
                });
            return b
        },
        setPosition: function(a, b) {
            this._isYUILoaded() ? YAHOO.util.Dom.setXY(a, [b.x, b.y]) : (a.style.left = b.x + "px", a.style.top = b.y + "px")
        },
        size: function(a) {
            var b = null;
            return b = this._isYUILoaded() ? [parseInt(YAHOO.util.Dom.getStyle(a, "width"), 10), parseInt(YAHOO.util.Dom.getStyle(a, "height"), 10)] : this._isJQueryLoaded() ? [parseInt(jQuery(a).width(), 10), parseInt(jQuery(a).height(),
                10)] : [a.offsetWidth, a.offsetHeight]
        },
        domReady: function(a) {
            if (this._isYUILoaded() && "function" === typeof a) Y.on("domready", function() {
                a()
            })
        },
        isBrowserCompatible: function(a, b) {
            var c = !1;
            "undefined" === typeof b && (b = !1);
            Spotify.BrowserDetect.initialized || Spotify.BrowserDetect.init();
            var d = Spotify.BrowserDetect.browser.toLowerCase(),
                g = Spotify.BrowserDetect.version,
                h = Spotify.Config.get(a);
            h && "undefined" !== typeof h[d] && (c = "object" === typeof h[d] ? -1 < h[d].indexOf(g) : g >= h[d]);
            b || (c = c && "" !== Spotify.Download.getInstallerLink());
            return c
        },
        isPlatformCompatible: function(a) {
            var b = !1;
            Spotify.BrowserDetect.initialized || Spotify.BrowserDetect.init();
            (a = Spotify.Config.get(a)) && -1 < a.indexOf(Spotify.BrowserDetect.OS) && (b = !0);
            return b
        },
        isPostMessageCompatible: function() {
            return window.postMessage ? !0 : !1
        },
        attachEvent: function(a, b, c) {
            "undefined" === typeof c && (c = window);
            c.addEventListener ? c.addEventListener(a, b, !1) : c.attachEvent && c.attachEvent("on" + a, b)
        },
        removeEvent: function(a, b, c) {
            "undefined" === typeof c && (c = window);
            c.removeEventListener &&
                c.removeEventListener(a, b)
        },
        getWindowSize: function() {
            var a = [0, 0];
            return a = window.innerWidth ? [window.innerWidth, window.innerHeight] : [Math.max(document.documentElement.clientWidth, document.body.clientWidth), Math.max(document.documentElement.clientHeight, document.body.clientHeight)]
        },
        removeNode: function(a) {
            a.parentNode.removeChild(a)
        },
        isAttributeSupported: function(a, b) {
            return "undefined" !== typeof document.createElement(a)[b]
        },
        openWindow: function(a, b, c, d) {
            b = b.replace("-", "");
            (a = window.open(a, b, "height=" +
                d + ",width=" + c + ",resizable=yes,scrollbars=no,status=no,toolbar=no,menubar=no")) && a.focus();
            return a
        },
        ajax: function(a, b, c, d, g, h) {
            var f = !1;
            "undefined" !== typeof h && (f = "explorer" === Spotify.BrowserDetect.browser.toLowerCase() && 9 === Spotify.BrowserDetect.version);
            if (this._isJQueryLoaded() && !f) g = {
                url: a,
                data: b,
                success: c,
                error: c,
                type: "undefined" === typeof g ? "GET" : "POST"
            }, "undefined" !== typeof d && (g.timeout = d), $.ajax(g);
            else if (f) {
                var j = new XDomainRequest,
                    g = [],
                    d = function() {
                        try {
                            "undefined" !== typeof c && c(JSON.parse(j.responseText))
                        } finally {
                            j =
                                null
                        }
                    };
                j.onload = d;
                j.onerror = d;
                if (b instanceof Object)
                    for (var k in b) b.hasOwnProperty(k) && g.push(encodeURIComponent(k) + "=" + encodeURIComponent(b[k]));
                j.open("GET", a + "?" + g.join("&"), !0);
                j.send(null)
            }
        },
        eventTarget: function(a) {
            return a.target ? a.target : a.srcElement
        },
        onUnload: function(a) {
            window.onbeforeunload = function() {
                if ("function" === typeof a) return a()
            }
        },
        computeExtraOffset: function() {
            var a = 0,
                b = 0,
                c = b = a = 0,
                d = 0;
            if (window.innerWidth && window.outerHeight) a = window.innerWidth, b = window.innerHeight, c = window.outerWidth,
                d = window.outerHeight;
            else if (document.documentElement.clientWidth) try {
                var g = document.documentElement.clientWidth,
                    h = document.documentElement.clientHeight;
                window.resizeTo(g, h);
                var c = g - document.documentElement.clientWidth,
                    d = h - document.documentElement.clientHeight,
                    f = g + c,
                    j = h + d;
                window.resizeTo(f, j);
                if (g != document.documentElement.clientWidth || h != document.documentElement.clientHeight) c = f - document.documentElement.clientWidth, d = j - document.documentElement.clientHeight
            } catch (k) {}
            a = Math.abs(a - c);
            b = Math.abs(b -
                d);
            return [a, b]
        },
        resizeWindow: function(a) {
            if (!window.innerHeight) {
                try {
                    window.resizeTo(a[0] + 20, a[1] + 100)
                } catch (b) {}
                return !0
            }
            a = a.slice(0);
            "undefined" === typeof a[0] ? a = [0, 0] : "undefined" === typeof a[1] && (a[1] = 0);
            var c = this.computeExtraOffset(a);
            a[0] += c[0];
            a[1] += c[1];
            c = a[0];
            a = a[1];
            try {
                window.resizeTo(c, a)
            } catch (d) {}
        },
        setLocationWithIframe: function(a) {
            "chrome" === Spotify.BrowserDetect.browser.toLowerCase() && /spotify:/.test(a) ? top.location.assign(a) : (a = Spotify.View.render("iframe", {
                    src: a,
                    style: "display:none"
                }),
                document.getElementsByTagName("body")[0].appendChild(a))
        },
        stopPropagation: function(a) {
            a.stopPropagation ? a.stopPropagation() : "undefined" !== typeof a.cancelBubble && (a.cancelBubble = !0)
        },
        isIE8: function() {
            return "explorer" === Spotify.BrowserDetect.browser.toLowerCase() && 8 === Spotify.BrowserDetect.version
        },
        isMobile: function() {
            Spotify.BrowserDetect.init();
            return -1 !== ["iOS", "Android"].indexOf(Spotify.BrowserDetect.OS)
        },
        iframeReady: function(a, b) {
            a.attachEvent ? a.attachEvent("onload", b) : a.onload = b
        },
        readableTime: function(a) {
            var b =
                a / 1E3 / 60,
                a = Math.floor(b),
                b = Math.round(60 * (b - a));
            60 == b && (a++, b = 0);
            return 10 > b ? a + ":0" + b : a + ":" + b
        },
        pageTitle: function() {
            var a = "",
                b = document.getElementsByTagName("title");
            0 < b.length && (a = b[0].innerHTML);
            return a
        },
        addClass: function(a, b) {
            -1 === a.className.indexOf(b) && (a.className += " " + b)
        },
        removeClass: function(a, b) {
            a.className = a.className.replace(" " + b, "")
        },
        isLocalStorageSupported: function() {
            if (null === d) {
                var a = new Date,
                    b, c;
                try {
                    (b = window.localStorage).setItem(a, a), c = b.getItem(a) == a, b.removeItem(a), d = !(!c || !b)
                } catch (i) {
                    d = !1
                }
            }
            return d
        },
        parseJSON: function(a) {
            var b = null;
            try {
                b = JSON.parse(a)
            } catch (c) {}
            return b
        },
        getChallengeToken: function() {
            return "undefined" !== typeof Spotify.challengeToken ? Spotify.challengeToken : ""
        },
        setInterval: function(a, b) {
            var c = new Date,
                d = 0;
            return setInterval(function() {
                var g = (new Date).getTime() - c.getTime() + d,
                    h = parseInt(g / b) * b;
                d = g % b;
                a(h);
                c = new Date
            }, b)
        },
        formatNumber: function(a) {
            return ("" + a).replace(/(\d)(?=(\d{3})+$)/g, "$1,")
        },
        toHtml: function(a) {
            return ("" + a).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g,
                "&gt;").replace(/"/g, "&quot;")
        },
        objectCreate: function(a) {
            function b() {}
            if (1 != arguments.length) throw Error("Object.create implementation only accepts one parameter.");
            if (Object.create) return Object.create(a);
            b.prototype = a;
            return new b
        }
    };
    return c
}(Spotify || {});
Spotify = function(c) {
    c.isSpotified = function() {
        return "1" == Spotify.Cookie.get("spotified")
    };
    c.isLinkSpotified = function() {
        return Spotify.Config.get("link-enabled") && (null !== Spotify.Cookie.get("link_spb") || null !== Spotify.Cookie.get("from_wp"))
    };
    c.setSpotified = function(c) {
        Spotify.Cookie.set("spotified", c ? "1" : "0", 365)
    };
    return c
}(Spotify || {});
Spotify = function(c) {
    c.RemoteControlBridge = function() {
        this.changePlayModeForTrack = function(c) {
            Spotify.Logger.log("changePlayModeForTrack", c);
            this.publisher.send(Spotify.Message.PLAYER_STATUS, {
                data: c
            }, window.parent)
        };
        this.onClientConnected = function() {
            Spotify.Logger.log("onClientConnected");
            this.publisher.send(Spotify.Message.CLIENT_CONNECTED, {}, window.parent)
        };
        this.onClientConnectionFailed = function() {
            Spotify.Logger.log("onClientConnectionFailed");
            this.publisher.send(Spotify.Message.CLIENT_CONNECTION_FAILED, {}, window.parent)
        };
        this.onClientDisconnected = function() {
            Spotify.Logger.log("onClientDisconnected");
            this.publisher.send(Spotify.Message.CLIENT_DISCONNECTED, {}, window.parent)
        };
        this.onClientError = function(c) {
            Spotify.Logger.log("onClientError", c);
            this.publisher.send(Spotify.Message.CLIENT_ERROR, {
                data: c
            }, window.parent)
        };
        this.init = function(c) {
            Spotify.Config.set("logging-prefix", "[Remote Control Bridge] ");
            Spotify.Logger.log("initializing...");
            var a = this;
            this.publisher = Spotify.Publisher.getInstance({
                targetOrigin: "*"
            });
            var b = SpotifyRemote.init(c, void 0, function() {
                b.setReferrer(document.referrer);
                b.addOnClientErrorListener(function(b) {
                    a.onClientError(b)
                });
                b.addOnClientConnectedListener(function(b) {
                    a.onClientConnected(b)
                });
                b.addOnClientConnectionFailedListener(function(b) {
                    a.onClientConnectionFailed(b)
                });
                b.addOnClientDisconnectListener(function(b) {
                    a.onClientDisconnected(b)
                });
                b.addPlayModeChangedListener(function(b) {
                    a.changePlayModeForTrack(b)
                })
            }, {
                shouldUseWebPlayer: !Spotify.isSpotified() && Spotify.Webplayer.isCompatible()
            });
            Spotify.Subscriber.subscribe({
                onPlaySpotifyUri: function(a) {
                    b.playSpotifyURI(a.uri)
                },
                onPlayPauseCurrent: function() {
                    b.playPauseCurrent()
                },
                onPlayPauseTrack: function(a) {
                    b.playPauseTrack(a.id, a.type, a.context)
                },
                onPause: function() {
                    b.pause()
                }
            })
        }
    };
    return c
}(Spotify || {});
Spotify = function(c) {
    c.Message = {
        PLAYER_STATUS: "player-status",
        CONTROL_POPUP: "control-popup",
        CLIENT_CONNECTED: "client-connected",
        CLIENT_CONNECTION_FAILED: "client-connection-failed",
        CLIENT_DISCONNECTED: "client-disconnected",
        CLIENT_ERROR: "client-error",
        MINI_BUTTON_PLAY_PAUSE: "mini-button-play-pause",
        MINI_BUTTON_REPORT: "mini-button-report",
        MINI_BUTTON_VIEW_MORE: "mini-button-view-more",
        MEDIABAR_PLAY_PAUSE: "mediabar-play-pause",
        MEDIABAR_SHOW: "mediabar-show",
        ENTITIES_LIST: "entities-list",
        ENTITIES_RESET: "entities-reset",
        REGISTRATION_MODULE: "registration-module",
        TOGGLE_MENU: "toggle-menu",
        TOGGLE_PLAY_PAUSE: "toggle-play-pause",
        FEATURED_ENTITIES: "featured-entities",
        CHECK_CLIENT: "check-client",
        WEBPLAYER_CLOSED: "webplayer-closed",
        PLAY_PAUSE_CURRENT: "play-pause-current",
        RESUME: "resume",
        PAUSE: "pause",
        STOP: "stop",
        PLAY_SPOTIFY_URI: "play-spotify-uri",
        PLAY_PAUSE_TRACK: "play-pause-track",
        CUSTOM_MESSAGE: "custom-message",
        CHANGE_VOLUME: "change-volume",
        CHANGE_POSITION: "change-position",
        CONNECT: "connect",
        READY: "ready",
        SERVICE_CALL: "service-call",
        SERVICE_REPLY: "service-reply",
        PLAYER_POSITION: "player-position",
        TRY_TO_CONNECT: "try-to-connect",
        AUTH_FAILED: "auth-failed",
        QUEUE_SKIP_NEXT: "queue-skip-next",
        QUEUE_SKIP_PREVIOUS: "queue-skip-previous",
        TOKEN_LOST: "token-lost",
        LOGIN: "login",
        LOGIN_BY_FACEBOOK_TOKEN: "login-by-facebook-token",
        SHUFFLE: "shuffle",
        REPEAT: "repeat",
        INTERFACE_AUTH: "interface-auth",
        INTERFACE_DEF: "interface-def"
    };
    var d = function(a) {
        "undefined" === typeof a && (a = {});
        var b = a.target || window.parent,
            d = a.targetOrigin || "*",
            i = function(a, b, c) {
                a ===
                    window && (c = Spotify.Publisher.getTargetOrigin());
                a.postMessage(JSON.stringify(b), c)
            };
        this.attachSendToChildren = function(a) {
            var b = this,
                d = function(c) {
                    c.propagate && b.send(c.key, c, a.contentWindow)
                },
                e;
            for (e in c.Message)
                if (c.Message.hasOwnProperty(e)) {
                    var i = this.getCallbackName(c.Message[e]);
                    a[i] = d
                }
        };
        this.send = function(a, c, f, j, k) {
            if (Spotify.Util.isPostMessageCompatible())
                if ("undefined" === typeof c && (c = {}), "undefined" === typeof k && (k = !0), "undefined" === typeof c.unique && (c.unique = Spotify.Util.randomId()), "undefined" ===
                    typeof c.propagate && (c.propagate = k), "undefined" === typeof f && (f = b), a = {
                        key: a,
                        data: c
                    }, j)
                    for (j = 0; j < f.length; j++) i(f[j], a, d);
                else i(f, a, d)
        };
        this.getCallbackName = function(a) {
            for (var b = "", a = a.split("-"), b = a.length, c = 0; c < b; c++) a[c] = a[c].charAt(0).toUpperCase() + a[c].slice(1);
            b = a.join("");
            return "on" + b
        };
        this.getKeyByCallbackName = function(a) {
            var b = "";
            0 === a.indexOf("on") && (a = a.substring(2));
            b = a.replace(/[A-Z]/g, function(a) {
                return "-" + a.toLowerCase()
            });
            0 === b.indexOf("-") && (b = b.substring(1));
            return b
        }
    };
    c.Publisher = {
        instance: null,
        getInstance: function(a) {
            this.instance || (this.instance = new d(a));
            return this.instance
        },
        getTargetOrigin: function() {
            var a = "";
            return a = "undefined" === typeof window.location.origin ? window.location.protocol + "//" + window.location.hostname + (window.location.port ? ":" + window.location.port : "") : window.location.origin
        }
    };
    return c
}(Spotify || {});
Spotify = function(c) {
    var d = function() {
        var a = [],
            b = function(a, b) {
                var c = !1;
                "undefined" === typeof b && (b = Spotify.Config.get("allowed-origins"));
                if (-1 !== b.indexOf(a)) c = !0;
                else
                    for (var d = b.length, f = 0; f < d; f++) {
                        var j = b[f];
                        if ("[object Array]" === Object.prototype.toString.call(j)) {
                            var k = j[0],
                                j = j[1];
                            if (2 < k.length && (k = k.substring(2), k = k.replace(/\./g, "\\."), RegExp("^(" + j + ")(://)(([a-zA-Z0-9-])+[.]{1})*(" + k + ")$").test(a))) {
                                c = !0;
                                break
                            }
                        }
                    }
                return c
            };
        this.subscribe = function(b) {
            return a.push(b)
        };
        this.unsubscribe = function(b) {
            a[b] =
                null
        };
        this.validOrigin = function(a, c) {
            return b(a, c)
        };
        Spotify.Util.attachEvent("message", function(d) {
            if (b(d.origin))
                for (var i = 0; i < a.length; i++) {
                    var g = a[i];
                    if (null !== g) {
                        var h = d;
                        if ("function" === typeof g.onMessage) g.onMessage(h);
                        else {
                            var f = null;
                            try {
                                f = JSON.parse(h.data)
                            } catch (j) {}
                            if (f && f.key) {
                                var k = c.Message,
                                    l = void 0;
                                for (l in k)
                                    if (k.hasOwnProperty(l) && k[l] === f.key) {
                                        var n = Spotify.Publisher.getInstance().getCallbackName(k[l]);
                                        "function" === typeof g[n] && (f.data.key = f.key, g[n](f.data, h))
                                    }
                            }
                        }
                    }
                } else Spotify.Logger.log("Ignored postmessage from disallowed origin. " +
                    d.origin)
        }, window)
    };
    c.Subscriber = {
        instance: null,
        getInstance: function() {
            this.instance || (this.instance = new d);
            return this.instance
        },
        subscribe: function(a) {
            this.getInstance().subscribe(a)
        },
        unsubscribe: function(a) {
            this.getInstance().unsubscribe(a)
        }
    };
    return c
}(Spotify || {});
