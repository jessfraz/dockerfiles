/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
'use strict';
define(["require", "exports"], function (require, exports) {
    /**
     * Warning: not designed for frequent PUTs.
     * GETs and DELETEs are very performant though.
     */
    var Cache = (function () {
        function Cache() {
            this.cache = Object.create(null);
            this.volatileCache = Object.create(null);
        }
        Cache.prototype.put = function (key, value, timeout) {
            if (timeout === void 0) { timeout = null; }
            this.cleanup();
            this.remove(key);
            if (timeout === null) {
                this.cache[key] = value;
                return;
            }
            this.volatileCache[key] = {
                element: value,
                expiration: new Date(+new Date + timeout)
            };
        };
        Cache.prototype.get = function (key) {
            var result = this.cache[key];
            if (result) {
                return result;
            }
            var item = this.volatileCache[key];
            if (!item) {
                return null;
            }
            if (item.expiration <= new Date) {
                delete this.volatileCache[key];
                return null;
            }
            return item.element;
        };
        Cache.prototype.remove = function (key) {
            delete this.cache[key];
            delete this.volatileCache[key];
        };
        Cache.prototype.cleanup = function () {
            var _this = this;
            var date = new Date();
            Object.keys(this.volatileCache).forEach(function (key) {
                var item = _this.volatileCache[key];
                if (item.expiration <= date) {
                    delete _this.volatileCache[key];
                }
            });
        };
        return Cache;
    })();
    exports.Cache = Cache;
});
