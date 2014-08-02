/*
 * cookie-manager.js
 * Last Change: 2014 Aug 02.
 *
 * LICENSE
 *  New BSD License: http://opensource.org/licenses/bsd-license.php
 *
 *  Copyright (c) 2008-2009, janus_wel<janus.wel.3@gmailcom>
 *  All rights reserved.
 *
 *  Redistribution and use in source and binary forms, with or
 *  without modification, are permitted provided that the following
 *  conditions are met:
 *
 *      * Redistributions of source code must retain the above
 *        copyright notice, this list of conditions and the
 *        following disclaimer.
 *      * Redistributions in binary form must reproduce the above
 *        copyright notice, this list of conditions and the following
 *        disclaimer in the documentation and/or other materials
 *        provided with the distribution.
 *      * Neither the name of the <ORGANIZATION> nor the names of its
 *        contributors may be used to endorse or promote products
 *        derived from this software without specific prior written
 *        permission.
 *
 *  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND
 *  CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES,
 *  INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 *  MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 *  DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS
 *  BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 *  EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
 *  TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 *  DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
 *  ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 *  OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY
 *  OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 *  POSSIBILITY OF SUCH DAMAGE.
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

