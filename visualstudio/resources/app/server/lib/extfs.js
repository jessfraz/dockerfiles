/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
/// <reference path='../declare/node.d.ts' />
/// <reference path='../declare/glob.d.ts' />
/// <reference path='../declare/minimatch.d.ts' />
'use strict';
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", 'fs', 'path', 'assert', 'crypto', 'minimatch', './utils', './extpath', './temp', './types', './flow', './events', './strings', './system', './promises'], function (require, exports, fs, _path, assert, crypto, minimatch, utils, extpath, temp, types, flow, events, strings, winjs, promises) {
    var loop = flow.loop;
    var sequence = flow.sequence;
    var PATH_DIVIDER = utils.isWindows() ? '\\' : '/';
    function isDirectorySync(path) {
        try {
            return fs.statSync(path).isDirectory();
        }
        catch (error) {
            return false;
        }
    }
    exports.isDirectorySync = isDirectorySync;
    function isDirectory(path, callback) {
        fs.stat(path, function (error, stat) {
            if (error) {
                return callback(error);
            }
            callback(null, stat.isDirectory());
        });
    }
    exports.isDirectory = isDirectory;
    function copyDirRecursivelySync(source, target) {
        //Assert source and target directories
        assert.ok(isDirectorySync(source), 'Source must be a directory');
        assert.ok(isDirectorySync(target), 'Target must be a directory');
        //Loop Files in Dir
        var files = fs.readdirSync(source);
        for (var i = 0, length = files.length; i < length; i++) {
            var fileStat = fs.statSync(source + PATH_DIVIDER + files[i]);
            //Directory: Create and Copy contents recursivley
            if (fileStat.isDirectory()) {
                fs.mkdirSync(target + PATH_DIVIDER + files[i], fileStat.mode & 511); // 511 = 0777
                copyDirRecursivelySync(source + PATH_DIVIDER + files[i], target + PATH_DIVIDER + files[i]);
            }
            else {
                var sourceFile = source + PATH_DIVIDER + files[i];
                var sourceStat = fs.statSync(sourceFile);
                var targetFile = target + PATH_DIVIDER + files[i];
                var fileContent = fs.readFileSync(sourceFile);
                fs.writeFileSync(targetFile, fileContent);
                fs.chmodSync(targetFile, sourceStat.mode | 128);
            }
        }
    }
    exports.copyDirRecursivelySync = copyDirRecursivelySync;
    function mkdirpSync(path, mode) {
        if (fs.existsSync(path)) {
            if (!isDirectorySync(path)) {
                throw new Error('"' + path + '" is not a directory.');
            }
            return path;
        }
        mkdirpSync(_path.dirname(path), mode);
        fs.mkdirSync(path, mode);
        return path;
    }
    exports.mkdirpSync = mkdirpSync;
    function mkdirp(path, mode, callback) {
        fs.exists(path, function (exists) {
            if (exists) {
                return isDirectory(path, function (err, itIs) {
                    if (err) {
                        return callback(err);
                    }
                    if (!itIs) {
                        return callback(new Error('"' + path + '" is not a directory.'));
                    }
                    callback(null);
                });
            }
            mkdirp(_path.dirname(path), mode, function (err) {
                if (err) {
                    callback(err);
                    return;
                }
                if (mode) {
                    fs.mkdir(path, mode, callback);
                }
                else {
                    fs.mkdir(path, null, callback);
                }
            });
        });
    }
    exports.mkdirp = mkdirp;
    /**
     * Replacement for util.pump which is deprecated.
     */
    function pipeFs(source, target, callback) {
        var callbackHandled = false;
        var readStream = fs.createReadStream(source);
        var writeStream = fs.createWriteStream(target);
        var onError = function (error) {
            if (!callbackHandled) {
                callbackHandled = true;
                callback(error);
            }
        };
        readStream.on('error', onError);
        writeStream.on('error', onError);
        readStream.on('end', function () {
            writeStream.end(function () {
                if (!callbackHandled) {
                    callbackHandled = true;
                    callback(null);
                }
            });
        });
        // In node 0.8 there is no easy way to find out when the pipe operation has finished. As such, we use the end property = false
        // so that we are in charge of calling end() on the write stream and we will be notified when the write stream is really done.
        // We can do this because file streams have an end() method that allows to pass in a callback.
        // In node 0.10 there is an event 'finish' emitted from the write stream that can be used. See
        // https://groups.google.com/forum/?fromgroups=#!topic/nodejs/YWQ1sRoXOdI
        readStream.pipe(writeStream, { end: false });
    }
    exports.pipeFs = pipeFs;
    function copy(source, target, callback) {
        fs.stat(source, function (error, stat) {
            if (error) {
                return callback(error);
            }
            if (!stat.isDirectory()) {
                return pipeFs(source, target, callback);
            }
            mkdirp(target, stat.mode & 511, function (err) {
                fs.readdir(source, function (err, files) {
                    loop(files, function (file, clb) {
                        copy(_path.join(source, file), _path.join(target, file), clb);
                    }, callback);
                });
            });
        });
    }
    exports.copy = copy;
    // Deletes the given path by first moving it out of the workspace. This has two benefits. For one, the operation can return fast because
    // after the rename, the contents are out of the workspace although not yet deleted. The greater benefit however is that this operation
    // will fail in case any file is used by another process. fs.unlink() in node will not bail if a file unlinked is used by another process.
    // However, the consequences are bad as outlined in all the related bugs from https://github.com/joyent/node/issues/7164
    function del(path, tmpFolder, callback) {
        fs.exists(path, function (exists) {
            if (!exists) {
                return callback(null);
            }
            fs.stat(path, function (err, stat) {
                if (err || !stat) {
                    return callback(err);
                }
                // Special windows workaround: A file or folder that ends with a "." cannot be moved to another place
                // because it is not a valid file name. In this case, we really have to do the deletion without prior move.
                if (path[path.length - 1] === '.' || strings.endsWith(path, './') || strings.endsWith(path, '.\\')) {
                    return rmRecursive(path, callback);
                }
                var pathInTemp = _path.join(tmpFolder, utils.generateUuid());
                fs.rename(path, pathInTemp, function (error) {
                    if (error) {
                        // Special case: If tmpFolder and path are on different drives, fallback to classic rm without rename()
                        if (error.code === 'EXDEV') {
                            return rmRecursive(path, callback);
                        }
                        return callback(error);
                    }
                    // Return early since the move succeeded
                    callback(null);
                    // do the heavy deletion outside the callers callback
                    rmRecursive(pathInTemp, function (error) {
                        if (error) {
                            console.error(error);
                        }
                    });
                });
            });
        });
    }
    exports.del = del;
    function rmRecursive(path, callback) {
        fs.exists(path, function (exists) {
            if (!exists) {
                callback(null);
            }
            else {
                fs.stat(path, function (err, stat) {
                    if (err || !stat) {
                        callback(err);
                    }
                    else if (!stat.isDirectory()) {
                        var mode = stat.mode;
                        if (!(mode & 128)) {
                            fs.chmod(path, mode | 128, function (err) {
                                if (err) {
                                    callback(err);
                                }
                                else {
                                    fs.unlink(path, callback);
                                }
                            });
                        }
                        else {
                            fs.unlink(path, callback);
                        }
                    }
                    else {
                        fs.readdir(path, function (err, children) {
                            if (err || !children) {
                                callback(err);
                            }
                            else if (children.length === 0) {
                                fs.rmdir(path, callback);
                            }
                            else {
                                var firstError = null;
                                var childrenLeft = children.length;
                                children.forEach(function (child) {
                                    rmRecursive(path + PATH_DIVIDER + child, function (err) {
                                        childrenLeft--;
                                        if (err) {
                                            firstError = firstError || err;
                                        }
                                        if (childrenLeft === 0) {
                                            if (firstError) {
                                                callback(firstError);
                                            }
                                            else {
                                                fs.rmdir(path, callback);
                                            }
                                        }
                                    });
                                });
                            }
                        });
                    }
                });
            }
        });
    }
    function pipe(arg1, prependBuffer, path, noAtomicOverwrite, tempPath, callback) {
        var tmpFileVal;
        sequence(function onError(error) {
            callback(error);
        }, function createTempFile() {
            // Do not pipe into target directly, but write to tmp
            if (!noAtomicOverwrite) {
                temp.createTempFile({
                    parentDirectory: tempPath,
                    prefix: _path.basename(path) + '.',
                    suffix: '.mncbak'
                }, this);
            }
            else {
                this(null, path);
            }
        }, function pumpContentsIntoFile(targetFile) {
            var _this = this;
            var errorHandled = false;
            var errorHandler = function (err) {
                errorHandled = true;
                callback(err);
            };
            var outputStream = fs.createWriteStream(targetFile);
            outputStream.on('error', errorHandler);
            outputStream.on('close', function () {
                if (errorHandled) {
                    return;
                }
                // Since the file is new we can return early here
                if (noAtomicOverwrite) {
                    return callback();
                }
                // Otherwise continue
                return _this(null, targetFile);
            });
            // Handle prepender
            if (prependBuffer) {
                outputStream.write(prependBuffer);
            }
            // Contents are provided, so write them all
            if (types.isString(arg1) || arg1 instanceof Buffer) {
                outputStream.write(arg1);
                outputStream.end();
                outputStream.destroySoon();
            }
            else {
                var stream = arg1;
                stream.on('error', errorHandler);
                stream.on('data', function (chunk) {
                    outputStream.write(chunk);
                });
                stream.on('end', function () {
                    outputStream.end();
                    outputStream.destroySoon();
                });
            }
        }, function pumpContentsIntoTarget(tmpFile) {
            tmpFileVal = tmpFile;
            pipeFs(tmpFile, path, this);
        }, function deleteTempFile() {
            fs.unlink(tmpFileVal, this); // Delete tmp file when operation is done
        }, function done() {
            callback();
        });
    }
    exports.pipe = pipe;
    function mv(source, target, callback) {
        if (source === target) {
            return callback(null);
        }
        function updateMtime(err) {
            if (err) {
                return callback(err);
            }
            fs.stat(target, function (error, stat) {
                if (error) {
                    return callback(error);
                }
                if (stat.isDirectory()) {
                    return callback(null);
                }
                fs.open(target, 'a', null, function (err, fd) {
                    if (err) {
                        return callback(err);
                    }
                    fs.futimes(fd, stat.atime, new Date(), function (err) {
                        if (err) {
                            return callback(err);
                        }
                        fs.close(fd, callback);
                    });
                });
            });
        }
        // Try native rename()
        fs.rename(source, target, function (err) {
            if (!err) {
                return updateMtime(null);
            }
            // In two cases we fallback to classic copy and delete:
            //
            // 1.) The EXDEV error indicates that source and target are on different devices
            // In this case, fallback to using a copy() operation as there is no way to
            // rename() between different devices.
            //
            // 2.) The user tries to rename a file/folder that ends with a dot. This is not
            // really possible to move then, at least on UNC devices.
            if (err && source.toLowerCase() !== target.toLowerCase() && (err.code === 'EXDEV') || strings.endsWith(source, '.')) {
                return copy(source, target, function (err) {
                    if (err) {
                        return callback(err);
                    }
                    rmRecursive(source, updateMtime);
                });
            }
            return callback(err);
        });
    }
    exports.mv = mv;
    function countChildren(directory, callback) {
        fs.readdir(directory, function (error, result) {
            if (error) {
                callback(null, 0);
            }
            else {
                callback(null, result.length);
            }
        });
    }
    exports.countChildren = countChildren;
    function readdir(path, accept, callback) {
        fs.readdir(path, function (error, files) {
            if (error) {
                return callback(error, null);
            }
            flow.parallel(files, function (file, loopCallback) {
                var absFilePath = _path.normalize(extpath.join(path, file));
                fs.stat(absFilePath, function (error, stat) {
                    if (error) {
                        return loopCallback(error, null);
                    }
                    if (!accept || accept(stat, file)) {
                        return loopCallback(null, {
                            name: file,
                            stat: stat
                        });
                    }
                    return loopCallback(null, null);
                });
            }, function (error, results) {
                if (error && error[0]) {
                    return callback(error[0], null);
                }
                var cleanedResults = [];
                for (var i = 0; i < results.length; i++) {
                    if (results[i]) {
                        cleanedResults.push(results[i]);
                    }
                }
                return callback(null, cleanedResults);
            });
        });
    }
    exports.readdir = readdir;
    var FilePollingDataEmitter = (function (_super) {
        __extends(FilePollingDataEmitter, _super);
        function FilePollingDataEmitter(fileDescriptor) {
            _super.call(this);
            this.fileDescriptor = fileDescriptor;
            this.position = 0;
        }
        FilePollingDataEmitter.prototype.start = function () {
            this.read(true);
        };
        FilePollingDataEmitter.prototype.read = function (usePolling, callback) {
            var _this = this;
            this.doRead(function (error, bytesRead) {
                // Error - stop
                if (error) {
                    if (callback) {
                        callback(error, false);
                    }
                }
                else if (bytesRead === FilePollingDataEmitter.BUFFER_LENGTH) {
                    _this.read(usePolling, callback);
                }
                else if (usePolling && !_this.isClosing) {
                    setTimeout(function () {
                        if (!_this.isClosing) {
                            _this.read(true);
                        }
                    }, FilePollingDataEmitter.READ_POLL_INTERVAL);
                }
                else if (callback) {
                    callback(null, true);
                }
            });
        };
        FilePollingDataEmitter.prototype.doRead = function (callback) {
            var _this = this;
            var wasClosing = this.isClosing;
            var buffer = new Buffer(FilePollingDataEmitter.BUFFER_LENGTH);
            fs.read(this.fileDescriptor, buffer, 0, buffer.length, this.position, function (error, bytesRead, buffer) {
                if (error) {
                    return callback(error, 0);
                }
                // Return if no new data to read
                if (bytesRead === 0) {
                    return callback(null, 0);
                }
                // Prevent a potential race condition by returning early if closing: In this case the user asked the emitter to finish
                // while we where in the middle of a read. We return without emitting data or incrementing the position and rely on the
                // close() method to read the file to the end without polling.
                if (wasClosing !== _this.isClosing) {
                    return callback(null, 0);
                }
                _this.position += bytesRead;
                var data = buffer.toString('utf8', 0, bytesRead);
                _this.emit('data', data);
                callback(null, bytesRead);
            });
        };
        FilePollingDataEmitter.prototype.close = function (callback) {
            var _this = this;
            this.isClosing = true;
            // Read to end without polling
            this.read(false, function (error, done) {
                // Dispose once done to clear listeners
                _this.dispose();
                callback(error, done);
            });
        };
        FilePollingDataEmitter.BUFFER_LENGTH = 16384;
        FilePollingDataEmitter.READ_POLL_INTERVAL = 100;
        return FilePollingDataEmitter;
    })(events.EventEmitter);
    exports.FilePollingDataEmitter = FilePollingDataEmitter;
    /**
     * Sets atime and mtime of the provided file to "now", if it exists.
     */
    function touch(path, callback) {
        var now = new Date();
        fs.exists(path, function (exists) {
            if (exists) {
                fs.utimes(path, now, now, function () {
                    callback(true);
                });
            }
            else {
                callback(false);
            }
        });
    }
    exports.touch = touch;
    function etag(arg1, arg2) {
        var size;
        var mtime;
        if (arg2) {
            size = arg1;
            mtime = arg2;
        }
        else {
            size = arg1.size;
            mtime = arg1.mtime.getTime();
        }
        return '"' + crypto.createHash('sha1').update(String(size)).update(String(mtime)).digest('hex') + '"';
    }
    exports.etag = etag;
    var FSWalker = (function () {
        function FSWalker(_selectPattern, _excludePattern, _limit) {
            this._selectPattern = _selectPattern;
            this._excludePattern = _excludePattern;
            this._limit = _limit;
            // nothing
        }
        FSWalker.prototype.walk = function (root) {
            var collection = [];
            return this._run(root, collection, true).then(function () {
                return collection;
            });
        };
        FSWalker.prototype._run = function (root, collection, ignoreError) {
            var _this = this;
            if (this._limit && collection.length >= this._limit) {
                return; // escape early when limit is reached
            }
            if (minimatch(root, this._selectPattern, { dot: true })) {
                collection.push(root);
            }
            return pfs_readdir(root).then(function (filenames) {
                var promises = [];
                for (var i = 0, len = filenames.length; i < len; i++) {
                    var path = _path.join(root, filenames[i]);
                    if (minimatch(path, _this._excludePattern, { dot: true })) {
                        continue;
                    }
                    promises.push(_this._run(path, collection, true));
                }
                return winjs.TPromise.join(promises);
            }, function (err) {
                if (ignoreError) {
                    return winjs.TPromise.as(null);
                }
                throw err;
            });
        };
        return FSWalker;
    })();
    exports.FSWalker = FSWalker;
    function pfs_readdir(path) {
        return promises.as(function (clb) { return fs.readdir(path, clb); });
    }
    exports.pfs_readdir = pfs_readdir;
});
