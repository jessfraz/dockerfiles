/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
/// <reference path="../declare/node.d.ts" />
'use strict';
define(["require", "exports", './system', './promises', './extfs', 'fs'], function (require, exports, winjs, promises, extfs, fs) {
    function readdir(path) {
        return promises.as(function (clb) { return fs.readdir(path, clb); });
    }
    exports.readdir = readdir;
    function exists(path) {
        return new winjs.Promise(function (c, e, p) {
            fs.exists(path, function (value) { return c(value); });
        });
    }
    exports.exists = exists;
    function chmod(path, mode) {
        return promises.as(function (clb) { return fs.chmod(path, mode, clb); });
    }
    exports.chmod = chmod;
    function mkdirp(path, mode) {
        return promises.as(function (clb) { return extfs.mkdirp(path, mode, clb); });
    }
    exports.mkdirp = mkdirp;
    function realpath(path) {
        return promises.as(function (clb) { return fs.realpath(path, null, clb); });
    }
    exports.realpath = realpath;
    function stat(path) {
        return promises.as(function (clb) { return fs.stat(path, clb); });
    }
    exports.stat = stat;
    function mstat(paths) {
        return doStatMultiple(paths.slice(0));
    }
    exports.mstat = mstat;
    function doStatMultiple(paths) {
        var path = paths.shift();
        return stat(path).then(function (value) {
            return {
                path: path,
                stats: value
            };
        }, function (err) {
            if (paths.length === 0) {
                return err;
            }
            return mstat(paths);
        });
    }
    function readFile(path) {
        return promises.as(function (clb) { return fs.readFile(path, clb); });
    }
    exports.readFile = readFile;
    function writeFile(path, data, encoding) {
        if (encoding === void 0) { encoding = 'utf8'; }
        return promises.as(function (clb) { return fs.writeFile(path, data, encoding, clb); });
    }
    exports.writeFile = writeFile;
});
