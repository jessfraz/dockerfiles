/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
'use strict';
define(["require", "exports", '../../../lib/utils', '../db'], function (require, exports, utils, db) {
    function computeKey(key1, key2) {
        return (key1 || '') + '/' + (key2 || '');
    }
    var InMemoryEngine = (function () {
        function InMemoryEngine() {
            this._database = {};
        }
        Object.defineProperty(InMemoryEngine.prototype, "database", {
            get: function () {
                return this._database;
            },
            set: function (database) {
                this._database = database;
            },
            enumerable: true,
            configurable: true
        });
        InMemoryEngine.prototype.toString = function () {
            return 'In Memory Database Engine';
        };
        InMemoryEngine.prototype.create = function (type, key1, key2, data, callback) {
            var key = computeKey(key1, key2);
            var collection = this._database[type] = this._database[type] || {};
            if (collection[key]) {
                return callback(new db.DBError('Key already exists', db.ERROR_ALREADY_EXISTS), null);
            }
            var model = {};
            utils.mixin(model, data);
            collection[key] = model;
            return callback(null, data);
        };
        InMemoryEngine.prototype.query = function (type, parameters, callback) {
            var singleResult = parameters.key1 !== undefined && parameters.key2 !== undefined;
            var collection = this._database[type];
            if (!collection) {
                return callback(null, singleResult ? null : []);
            }
            if (singleResult) {
                var key = computeKey(parameters.key1, parameters.key2);
                return callback(null, collection[key] || null);
            }
            else {
                var parameterKeys = Object.keys(parameters);
                var results = Object.keys(collection).filter(function (key) {
                    var model = collection[key];
                    return parameterKeys.every(function (parameterKey) {
                        var value = parameters[parameterKey];
                        if (parameterKey === 'key1') {
                            return (new RegExp('^' + value)).test(key);
                        }
                        else if (parameterKey === 'key2') {
                            return (new RegExp(value + '$')).test(key);
                        }
                        return model[parameterKey] === value;
                    });
                }).map(function (key) {
                    return collection[key];
                });
                return callback(null, results);
            }
        };
        InMemoryEngine.prototype.update = function (type, key1, key2, data, callback) {
            var key = computeKey(key1, key2);
            var collection = this._database[type] = this._database[type] || {};
            var model = collection[key];
            if (!model) {
                return callback(new db.DBError('Model does not exist', db.ERROR_DOES_NOT_EXIST), null);
            }
            utils.mixin(model, data);
            return callback(null, data);
        };
        InMemoryEngine.prototype.del = function (type, key1, key2, callback) {
            var key = computeKey(key1, key2);
            var collection = this._database[type] = this._database[type] || {};
            if (!collection[key]) {
                return callback(new db.DBError('Model does not exist', db.ERROR_DOES_NOT_EXIST), null);
            }
            delete collection[key];
            if (Object.keys(collection).length === 0) {
                delete this._database[type];
            }
            return callback(null, null);
        };
        return InMemoryEngine;
    })();
    exports.InMemoryEngine = InMemoryEngine;
    function open(callback) {
        callback(null, new InMemoryEngine());
    }
    exports.open = open;
    function openSync() {
        return new InMemoryEngine();
    }
    exports.openSync = openSync;
});
