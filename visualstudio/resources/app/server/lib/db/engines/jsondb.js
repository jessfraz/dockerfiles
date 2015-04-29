/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
'use strict';
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", 'fs', './inmemory'], function (require, exports, fs, inmemoryDb) {
    var JSONEngine = (function (_super) {
        __extends(JSONEngine, _super);
        function JSONEngine(path, data) {
            _super.call(this);
            this.path = path;
            if (data) {
                this.database = data;
            }
        }
        JSONEngine.prototype.toString = function () {
            return 'JSON Database Engine [\'' + this.path + '\']';
        };
        JSONEngine.prototype.create = function (type, key1, key2, data, callback) {
            return _super.prototype.create.call(this, type, key1, key2, data, this.save.bind(this, callback));
        };
        JSONEngine.prototype.update = function (type, key1, key2, data, callback) {
            return _super.prototype.update.call(this, type, key1, key2, data, this.save.bind(this, callback));
        };
        JSONEngine.prototype.del = function (type, key1, key2, callback) {
            return _super.prototype.del.call(this, type, key1, key2, this.save.bind(this, callback));
        };
        JSONEngine.prototype.save = function (callback, err) {
            if (err) {
                return callback(err, null);
            }
            var result = Array.prototype.slice.call(arguments, 1);
            fs.writeFile(this.path, JSON.stringify(this.database), null, function (err) {
                if (err) {
                    return callback(err, null);
                }
                return callback.apply(null, result);
            });
        };
        return JSONEngine;
    })(inmemoryDb.InMemoryEngine);
    exports.JSONEngine = JSONEngine;
    function open(path, callback) {
        fs.readFile(path, function (err, data) {
            if (err) {
                return callback(null, new JSONEngine(path));
            }
            else {
                try {
                    callback(null, new JSONEngine(path, JSON.parse(data.toString())));
                }
                catch (e) {
                    callback(new Error('Unable to parse "' + path + '" as Engine.'));
                }
            }
        });
    }
    exports.open = open;
    function openSync(path) {
        if (!fs.existsSync(path)) {
            return new JSONEngine(path);
        }
        var data = fs.readFileSync(path);
        try {
            return new JSONEngine(path, JSON.parse(data.toString()));
        }
        catch (e) {
            throw new Error('Unable to parse "' + path + '" as Engine.');
        }
    }
    exports.openSync = openSync;
});
