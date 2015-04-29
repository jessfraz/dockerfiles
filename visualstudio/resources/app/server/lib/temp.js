/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
/// <reference path='../declare/node.d.ts' />
'use strict';
define(["require", "exports", 'fs', 'path', './utils'], function (require, exports, fs, _path, utils) {
    function getOSTempPath(callback) {
        var path;
        var paths = /^win/i.test(process.platform) ? [process.env.TMP, process.env.TEMP] : ['/tmp', '/var/tmp', '/private/tmp', '/private/var/tmp'];
        function tryPaths() {
            if (!paths.length) {
                return callback(new Error('Temp dir not found'));
            }
            path = paths.shift();
            fs.stat(path, function (err, stat) {
                if (err || !stat.isDirectory()) {
                    tryPaths();
                }
                else {
                    return callback(null, path);
                }
            });
        }
        tryPaths();
    }
    exports.getOSTempPath = getOSTempPath;
    function getOSTempPathSync() {
        var path;
        var paths = /^win/i.test(process.platform) ? [process.env.TMP, process.env.TEMP] : ['/tmp', '/var/tmp', '/private/tmp', '/private/var/tmp'];
        for (var i = 0; i < paths.length; i++) {
            path = paths[i];
            try {
                if (fs.statSync(path).isDirectory()) {
                    return path;
                }
            }
            catch (e) {
            }
        }
        throw new Error('Temp dir not found');
    }
    exports.getOSTempPathSync = getOSTempPathSync;
    var createTemp = function (options, callback, retry) {
        if (!options) {
            options = {};
        }
        var suffix = options.suffix || '';
        var prefix = options.prefix || '';
        function onDirectory(err, parentDirectory) {
            if (err) {
                return callback(err);
            }
            var retries = 0;
            function create(lastError) {
                if (retries++ > 25) {
                    return callback(lastError || new Error('Too many attempts to create temporary file'));
                }
                var path = _path.join(parentDirectory, (prefix || '') + utils.randomString() + (suffix || ''));
                retry(path, create);
            }
            create(null);
        }
        if (options.parentDirectory) {
            onDirectory(null, options.parentDirectory);
        }
        else {
            getOSTempPath(onDirectory);
        }
    };
    var createTempSync = function (options, retrySync) {
        if (!options) {
            options = {};
        }
        var suffix = options.suffix || '';
        var prefix = options.prefix || '';
        var parentDirectory = options.parentDirectory || getOSTempPathSync();
        for (var i = 0; i < 25; ++i) {
            var path = _path.join(parentDirectory, (prefix || '') + utils.randomString() + (suffix || ''));
            try {
                return retrySync(path);
            }
            catch (e) {
            }
        }
        throw new Error('Too many attempts to create temporary file');
    };
    function createTempFile(options, callback) {
        createTemp(options, callback, function (path, create) {
            fs.open(path, 'w', null, function (err, fd) {
                if (err) {
                    return create(err);
                }
                fs.close(fd, function (err) {
                    if (err) {
                        return create(err);
                    }
                    return callback(null, path);
                });
            });
        });
    }
    exports.createTempFile = createTempFile;
    function createTempFileSync(options) {
        if (options === void 0) { options = {}; }
        return createTempSync(options, function (path) {
            var fd = fs.openSync(path, 'w');
            fs.closeSync(fd);
            return path;
        });
    }
    exports.createTempFileSync = createTempFileSync;
    function createTempDirectory(options, callback) {
        createTemp(options, callback, function (path, retry) {
            fs.mkdir(path, 509, function (err) {
                if (err) {
                    return retry();
                }
                else {
                    return callback(null, path);
                }
            });
        });
    }
    exports.createTempDirectory = createTempDirectory;
    function createTempDirectorySync(options) {
        if (options === void 0) { options = {}; }
        return createTempSync(options, function (path) {
            fs.mkdirSync(path, 509); // 509 = 0775
            return path;
        });
    }
    exports.createTempDirectorySync = createTempDirectorySync;
});
