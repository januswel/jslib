/*
 * cookie-manager.js
 *
 * LICENSE
 *  licensed under the MIT License
 *  http://opensource.org/about
 *
 *  Copyright (c) 2008-2009, janus_wel<janus.wel.3@gmailcom>
 *  All rights reserved.
 * */

/*
 * example
var cm = new CookieManager();
cm.readCookie('http://www.nicovideo.jp/');
var flag = cm.getCookie('desopen');
cm.setCookie({
    key:        'desopen',
    value:      !flag,
    domain:     '.nicovideo.jp',
    expires:    60 * 60 * 24 * 365 * 1000,
});
 * */

// cookie manager
function CookieManager() {
    this.initialize.apply(this, arguments);
}
CookieManager.prototype = {
    initialize: function (uri) {
        const Cc = Components.classes;
        const Ci = Components.interfaces;

        const MOZILLA = '@mozilla.org/';
        const IO_SERVICE = MOZILLA + 'network/io-service;1';
        const COOKIE_SERVICE = MOZILLA + 'cookieService;1';

        this.ioService = Cc[IO_SERVICE].getService(Ci.nsIIOService);
        this.cookieService = Cc[COOKIE_SERVICE].getService(Ci.nsICookieService);
        if (!this.ioService || !this.cookieService) {
            throw new Error('error on CookieManager initialize.');
        }

        this.readCookie(uri);
    },

    readCookie: function (uri) {
        if (uri) {
            this.uri = uri;
            this.uriObject = this.ioService.newURI(uri, null, null);
            this.cookie = this._deserializeCookie(this._getCookieString());
        }
    },

    _getCookieString: function () {
        return this.uriObject
            ? this.cookieService.getCookieString(this.uriObject, null)
            : null;
    },

    _setCookieString: function (cookieString) {
        if (this.uriObject && cookieString) {
            this.cookieService.setCookieString(this.uriObject, null, cookieString, null);
        }
    },

    _deserializeCookie: function (cookieString) {
        var cookies = cookieString.split('; ');
        var cookie = {};
        var key, val;
        for (var i=0, max=cookies.length ; i<max ; ++i) {
            [key, val] = cookies[i].split('=');
            cookie[key] = val;
        }
        return cookie;
    },

    getCookie: function (key) {
        return this.cookie[key] ? this.cookie[key] : null;
    },

    setCookie: function (obj) {
        this.cookie[obj.key] = obj.value;
        var string = [
            obj.key + '=' + obj.value,
            'domain=' + obj.domain,
            'expires=' + new Date(new Date().getTime() + obj.expires),
        ].join(';');
        this._setCookieString(string);
    },
};

