/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
/// <reference path='../declare/node.d.ts' />
'use strict';
define(["require", "exports", 'fs', 'path', 'child_process', './utils', './temp', './flow', './zip/zip'], function (require, exports, fs, _path, child_process, utils, temp, flow, zip) {
    var sequence = flow.sequence;
    /**
     * Compresses the folder that is identified by the absolutePath and returns the zip file name from the directory where
     * the zip was created. If targetPath is not provided, will create the zip in the temp directory.
     */
    function compressFolder(absoluteFolderPath, options, callback) {
        // On Mac we can not use Edge
        if (!utils.isWindows()) {
            return posixCompress(absoluteFolderPath, {
                tempRoot: options.tmpPath
            }, callback);
        }
        function doZipFile(targetFile) {
            zip.createFromDirectory(absoluteFolderPath, targetFile, options.wwwRoot || _path.join(__dirname, '..'), function (error) {
                if (error) {
                    callback(error, null);
                }
                else {
                    callback(null, targetFile);
                }
            });
        }
        // If no tmp path provided but a target path, directly zip into target
        if (!options.tmpPath && options.targetPath) {
            return doZipFile(options.targetPath);
        }
        // Otherwise zip to a temp path
        flow.sequence(function onError(error) {
            callback(error, null);
        }, function createTempFile() {
            var tempFileOptions = {
                suffix: '.zip',
                parentDirectory: options.tmpPath
            };
            temp.createTempFile(tempFileOptions, this);
        }, function deleteTempFile(targetFile) {
            var _this = this;
            fs.unlink(targetFile, function (error) {
                if (error) {
                    return callback(error, null);
                }
                else {
                    _this(null, targetFile);
                }
            });
        }, function zipFile(targetFile) {
            return doZipFile(targetFile);
        });
    }
    exports.compressFolder = compressFolder;
    function posixCompress(absolutePath, options, callback) {
        if (!options) {
            options = {};
        }
        var fns = [
            function onError(error) {
                callback(error, null);
            }
        ];
        if (options.target) {
            fns.push(function () {
                this(null, options.target);
            });
        }
        else {
            fns.push(function createTempFile() {
                var tempFileOptions = {
                    suffix: '.zip',
                    parentDirectory: options.tempRoot
                };
                temp.createTempFile(tempFileOptions, this);
            }, function deleteTempFile(targetFile) {
                var _this = this;
                fs.unlink(targetFile, function (error) {
                    if (error) {
                        return callback(error, null);
                    }
                    else {
                        _this(null, targetFile);
                    }
                });
            });
        }
        fns.push(function zipFile(targetFile) {
            var zip = '/usr/bin/zip';
            var zipArgs = ['-r', targetFile, '.'];
            var process = child_process.spawn(zip, zipArgs, { cwd: absolutePath });
            var handled = false;
            process.stdout.on('data', function (data) {
                // child_process.spawn() blocks from terminating unless attaching data listener on process.stdout
            });
            process.stderr.on('data', function (data) {
                if (!handled) {
                    handled = true;
                    callback(new Error(data), null);
                }
            });
            process.on('error', function (error) {
                if (!handled) {
                    handled = true;
                    callback(error, null);
                }
            });
            process.on('exit', function () {
                if (!handled) {
                    handled = true;
                    callback(null, targetFile);
                }
            });
        });
        sequence.apply(null, fns);
    }
    function uncompress(absoluteArchivePath, absoluteFolderPath, options, callback) {
        // On Mac we can not use Edge
        if (!utils.isWindows()) {
            return posixUncompress(absoluteArchivePath, {
                cwd: absoluteFolderPath
            }, callback);
        }
        flow.sequence(function onError(error) {
            callback(error, null);
        }, function unzipFile(targetFile) {
            zip.extractToDirectory(absoluteFolderPath, absoluteArchivePath, options.wwwRoot, function (error) {
                if (error) {
                    callback(error, null);
                }
                else {
                    callback(null, true);
                }
            });
        });
    }
    exports.uncompress = uncompress;
    function posixUncompress(zipPath, options, callback) {
        if (!options) {
            options = {};
        }
        var zip = '/usr/bin/unzip';
        var zipArgs = [zipPath];
        var pid = child_process.spawn(zip, zipArgs, { cwd: options.cwd || process.cwd() });
        var handled = false;
        pid.stdout.on('data', function (data) {
            // child_process.spawn() blocks from terminating unless attaching data listener on process.stdout
        });
        pid.stderr.on('data', function (data) {
            if (!handled) {
                handled = true;
                callback(new Error(data), null);
            }
        });
        process.on('error', function (error) {
            if (!handled) {
                handled = true;
                callback(error, null);
            }
        });
        pid.on('exit', function () {
            if (!handled) {
                handled = true;
                callback(null, true);
            }
        });
    }
});
