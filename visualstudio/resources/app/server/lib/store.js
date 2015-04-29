/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
'use strict';
define(["require", "exports", './pfs', './system'], function (require, exports, pfs, winjs) {
    var InMemoryStore = (function () {
        function InMemoryStore() {
            this.store = {};
        }
        InMemoryStore.prototype.getValue = function (key) {
            return winjs.TPromise.as(this.store[key] || null);
        };
        InMemoryStore.prototype.setValue = function (key, value) {
            this.store[key] = value;
            return winjs.Promise.as(null);
        };
        InMemoryStore.prototype.deleteValue = function (key) {
            delete this.store[key];
            return winjs.Promise.as(null);
        };
        return InMemoryStore;
    })();
    exports.InMemoryStore = InMemoryStore;
    var FileStore = (function () {
        function FileStore(storePath) {
            this.storePath = storePath;
        }
        FileStore.prototype.getValue = function (key) {
            return this.load().then(function (data) {
                if (!data.hasOwnProperty(key)) {
                    return null;
                }
                try {
                    return JSON.parse(data[key]);
                }
                catch (e) {
                    return null;
                }
            });
        };
        FileStore.prototype.setValue = function (key, value) {
            var _this = this;
            return this.load().then(function (data) {
                data[key] = JSON.stringify(value);
                return _this.save(data);
            });
        };
        FileStore.prototype.deleteValue = function (key) {
            var _this = this;
            return this.load().then(function (data) {
                delete data[key];
                return _this.save(data);
            });
        };
        FileStore.prototype.load = function () {
            return pfs.readFile(this.storePath).then(function (raw) {
                try {
                    return JSON.parse(raw);
                }
                catch (e) {
                    return {};
                }
            }, function () {
                return {};
            });
        };
        FileStore.prototype.save = function (data) {
            return pfs.writeFile(this.storePath, JSON.stringify(data));
        };
        return FileStore;
    })();
    exports.FileStore = FileStore;
});
