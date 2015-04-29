/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
/// <reference path="../../declare/node.d.ts" />
/// <reference path="../../declare/chokidar.d.ts" />
/// <reference path="../../declare/iconv-lite.d.ts" />
'use strict';
define(["require", "exports", 'graceful-fs', 'path', 'os', 'iconv-lite', './files', '../../lib/strings', '../../lib/system', '../../lib/types', '../../lib/extfs', '../../lib/uri', '../../lib/pfs', '../../lib/encoding', '../../lib/promises', '../../lib/service', '../../lib/mime', './glob/globService', './stat', './watcher/unix/watcherService', './watcher/win32/watcherService'], function (require, exports, gracefulFS, _path, os, iconv, files, strings, winjs, types, extfs, uri, pfs, encoding, promises, service, mime, globService, statModel, unixWatcherService, win32WatcherService) {
    // Force TS reference on gracefulFS
    if (typeof gracefulFS.readFileSync === 'function') {
    }
    function createService(basePath, eventEmitter, options) {
        return new FileService(basePath, eventEmitter, options);
    }
    exports.createService = createService;
    var FileService = (function () {
        function FileService(basePath, eventEmitter, options) {
            this.basePath = basePath ? _path.normalize(basePath) : void 0;
            if (this.basePath && !this.isAbsolute(basePath)) {
                throw new Error('basePath has to be an absolute path');
            }
            this.options = options;
            this.tmpPath = this.options.tmpDir || os.tmpDir();
            this.globServiceConnection = service.createService(globService.GlobRunner, __dirname + '/glob/globApp.js', { timeout: 1000 * 60 });
            if (!options.disableWatcher && this.basePath) {
                if (process.platform === 'win32') {
                    this.setupWin32FileWatching(eventEmitter);
                }
                else {
                    this.setupUnixFileWatching(eventEmitter);
                }
            }
        }
        FileService.prototype.setupWin32FileWatching = function (eventEmitter) {
            this.watcherToDispose = new win32WatcherService.FileWatcher(this.basePath, eventEmitter, this.options.errorLogger, FileService.FS_EVENT_DELAY, FileService.FS_EVENT_LIMIT).startWatching();
        };
        FileService.prototype.setupUnixFileWatching = function (eventEmitter) {
            this.watcherToDispose = new unixWatcherService.FileWatcher(this.basePath, eventEmitter, this.options.errorLogger, FileService.FS_EVENT_DELAY, FileService.FS_EVENT_LIMIT).startWatching();
        };
        FileService.prototype.resolveFileStat = function (filePath, resolveTo, resolveSingleChildDescendants) {
            return this.resolve(filePath, resolveTo, resolveSingleChildDescendants);
        };
        FileService.prototype.resolveFileStats = function (path, globPattern) {
            var _this = this;
            if (!this.basePath) {
                return winjs.TPromise.as([]);
            }
            var absolutePath = this.toAbsolutePath(path);
            // Use glob service to walk the path
            return this.globServiceConnection.service.walk(absolutePath, globPattern, '{**/node_modules/**,**/.git/**}', FileService.BULK_FETCH_LIMIT).then(function (result) {
                if (result.limitHit) {
                    return winjs.TPromise.wrapError(new Error(strings.format('Maximum bulk file operation limit of {0} has been reached', FileService.BULK_FETCH_LIMIT)));
                }
                // Resolve each file to stat
                var resolvePromises = [];
                result.matches.forEach(function (match) {
                    var relativePath = match.path.substring(_this.basePath.length);
                    var statModel = _this.toStat(relativePath, match.isDirectory, match.mtime, match.size);
                    if (!match.isDirectory) {
                        resolvePromises.push(_this.resolve(statModel));
                    }
                });
                return winjs.TPromise.join(resolvePromises);
            });
        };
        FileService.prototype.resolveContent = function (arg1, acceptTextOnly, etag) {
            var _this = this;
            var absolutePath = this.toAbsolutePath(arg1);
            // 1.) detect mimes
            return promises.as(function (clb) { return mime.detectMimesFromFile(absolutePath, clb); }).then(function (result) {
                var isText = result.mimes.indexOf(mime.MIME_BINARY) === -1;
                // Return error early if client only accepts text and this is not text
                if (acceptTextOnly && !isText) {
                    return winjs.Promise.wrapError({
                        message: 'Requested file is binary but client only accepts text',
                        fileOperationResult: files.FileOperationResult.FILE_IS_BINARY
                    });
                }
                // 2.) get content
                return _this.resolveFileContent(arg1, etag, result.encoding).then(function (content) {
                    // set our knowledge about the mime on the content obj
                    content.mime = result.mimes.join(', ');
                    return content;
                });
            }, function (error) {
                // bubble up existing file operation results
                if (!types.isUndefinedOrNull(error.fileOperationResult)) {
                    return winjs.Promise.wrapError(error);
                }
                // on error check if the file does not exist or is a folder and return with proper error result
                return pfs.exists(absolutePath).then(function (exists) {
                    // Return if file not found
                    if (!exists) {
                        return winjs.Promise.wrapError({
                            message: 'File not found',
                            fileOperationResult: files.FileOperationResult.FILE_NOT_FOUND
                        });
                    }
                    // Otherwise check for file being a folder?
                    return pfs.stat(absolutePath).then(function (stat) {
                        if (stat.isDirectory()) {
                            return winjs.Promise.wrapError({
                                message: 'File is directory',
                                fileOperationResult: files.FileOperationResult.FILE_IS_DIRECTORY
                            });
                        }
                        // otherwise just give up
                        return winjs.Promise.wrapError(error);
                    });
                });
            });
        };
        FileService.prototype.resolveContents = function (paths) {
            var _this = this;
            if (paths.length > FileService.BULK_FETCH_LIMIT) {
                return winjs.TPromise.wrapError(new Error(strings.format('Maximum bulk file operation limit is {0} but was asked for {1} files', FileService.BULK_FETCH_LIMIT, paths.length)));
            }
            var contentPromises = [];
            paths.forEach(function (path) {
                contentPromises.push(_this.resolveFileContent(path).then(function (content) { return content; }, function (error) { return winjs.Promise.as(null); }));
            });
            return winjs.TPromise.join(contentPromises).then(function (contents) {
                return types.coalesce(contents);
            });
        };
        FileService.prototype.updateContent = function (content, overwriteReadonly) {
            var _this = this;
            var absolutePath = this.toAbsolutePath(content.resource);
            // 1.) check file
            return this.checkFile(absolutePath, content, overwriteReadonly).then(function (exists) {
                var createParentsPromise;
                if (exists) {
                    createParentsPromise = winjs.Promise.as(null);
                }
                else {
                    createParentsPromise = promises.as(function (clb) { return extfs.mkdirp(_path.dirname(absolutePath), null, clb); });
                }
                // 2.) create parents as needed
                return createParentsPromise.then(function () {
                    var bomPromise;
                    if (exists && _this.options.prependBom) {
                        bomPromise = promises.as(function (clb) { return encoding.detectBOM(absolutePath, clb); });
                    }
                    else {
                        bomPromise = winjs.TPromise.as(null);
                    }
                    // 3.) detect bom
                    return bomPromise.then(function (bom) {
                        var contents;
                        if (content.charset && content.charset !== encoding.UTF8 && iconv.encodingExists(content.charset)) {
                            contents = iconv.encode(content.value, content.charset);
                        }
                        else {
                            contents = content.value;
                        }
                        // 4.) set contents
                        return promises.as(function (clb) { return extfs.pipe(contents, encoding.getBOMBuffer(bom), absolutePath, true, _this.tmpPath, clb); }).then(function () {
                            // 5.) resolve
                            return _this.resolve(content.resource);
                        });
                    });
                });
            });
        };
        FileService.prototype.createFileOrFolder = function (path, isFolder) {
            var _this = this;
            if (isFolder) {
                // 1.) create folder
                var absolutePath = this.toAbsolutePath(path);
                return promises.as(function (clb) { return extfs.mkdirp(absolutePath, null, clb); }).then(function () {
                    // 2.) resolve
                    return _this.resolve(path);
                });
            }
            return this.createFile(path, '');
        };
        FileService.prototype.createFile = function (arg1, arg2, arg3) {
            var parent = types.isString(arg1) ? null : arg1;
            var name = types.isString(arg1) ? arg1 : arg2;
            var contents = (types.isString(arg1) ? arg2 : arg3) || '' /* empty file */;
            var workspaceRelativePath = parent ? _path.join(parent.path, name) : arg1;
            return this.updateContent({
                resource: uri.file(_path.join(this.basePath, workspaceRelativePath)),
                path: workspaceRelativePath,
                value: contents,
                name: name,
                mime: 'text/plain',
                mtime: null,
                etag: null
            });
        };
        FileService.prototype.createFolder = function (parent, name) {
            return this.createFileOrFolder(_path.join(parent.path, name), true);
        };
        FileService.prototype.renameFile = function (file, newName) {
            return this.renameFileOrFolder(file, newName);
        };
        FileService.prototype.renameFolder = function (folder, newName) {
            return this.renameFileOrFolder(folder, newName);
        };
        FileService.prototype.renameFileOrFolder = function (stat, newName) {
            var parent = _path.dirname(stat.path);
            var newPath = _path.join(parent, newName);
            return this.moveFile(stat, newPath);
        };
        FileService.prototype.moveFile = function (stat, path, overwrite) {
            return this.moveOrCopyFile(stat, path, false, overwrite);
        };
        FileService.prototype.copyFile = function (stat, path) {
            return this.moveOrCopyFile(stat, path, true, false);
        };
        FileService.prototype.moveOrCopyFile = function (file, path, keepCopy, overwrite) {
            var _this = this;
            var sourcePath = this.toAbsolutePath(file.path);
            var targetPath = this.toAbsolutePath(path);
            // 1.) move / copy
            return this.doMoveOrCopyFile(sourcePath, targetPath, keepCopy, overwrite).then(function () {
                // 2.) resolve
                return _this.resolve(path);
            });
        };
        FileService.prototype.doMoveOrCopyFile = function (sourcePath, targetPath, keepCopy, overwrite) {
            // 1.) fail early when target exists
            return pfs.exists(targetPath).then(function (exists) {
                var isCaseRename = sourcePath.toLowerCase() === targetPath.toLowerCase();
                // Return early with conflict if target exists and we are not told to overwrite
                if (exists && !isCaseRename && !overwrite) {
                    return winjs.Promise.wrapError({
                        fileOperationResult: files.FileOperationResult.FILE_MOVE_CONFLICT
                    });
                }
                // 2.) make sure parents exists
                return promises.as(function (clb) { return extfs.mkdirp(_path.dirname(targetPath), null, clb); }).then(function () {
                    // 3.) copy/move
                    return promises.as(function (clb) { return keepCopy ? extfs.copy(sourcePath, targetPath, clb) : extfs.mv(sourcePath, targetPath, clb); }).then(function () { return exists; });
                });
            });
        };
        FileService.prototype.uploadData = function (parent, file) {
            var _this = this;
            var sourcePath = file.path; // TODO@Ben this is native only and not nice!
            if (!sourcePath || !this.isAbsolute(sourcePath)) {
                return winjs.Promise.wrapError('Unable to detect path for the copy operation.');
            }
            var targetRelativePath = _path.join(parent.path, _path.basename(sourcePath));
            var targetPath = this.toAbsolutePath(targetRelativePath);
            // 1.) resolve
            return pfs.stat(sourcePath).then(function (stat) {
                if (stat.isDirectory()) {
                    return winjs.Promise.wrapError('Folders cannot be copied into the workspace. Please select individual files to copy them.'); // for now we do not allow to upload a folder into a workspace
                }
                // 2.) copy
                return _this.doMoveOrCopyFile(sourcePath, targetPath, true, true).then(function (exists) {
                    // 3.) resolve
                    return _this.resolve(targetRelativePath).then(function (stat) { return { isNew: !exists, stat: stat }; });
                });
            });
        };
        FileService.prototype.deleteFile = function (file) {
            return this.doDelete(file);
        };
        FileService.prototype.deleteFolder = function (file) {
            return this.doDelete(file);
        };
        FileService.prototype.doDelete = function (file) {
            var _this = this;
            var absolutePath = this.toAbsolutePath(file);
            return promises.as(function (clb) { return extfs.del(absolutePath, _this.tmpPath, clb); }).then(function () { return file; });
        };
        // Helpers
        FileService.prototype.toAbsolutePath = function (arg1) {
            if (!arg1) {
                return this.basePath;
            }
            var path;
            if (typeof arg1 === 'string') {
                path = arg1;
            }
            else if (uri.isURI(arg1)) {
                return _path.normalize(arg1.path);
            }
            else {
                path = arg1.path;
            }
            return _path.normalize(_path.join(this.basePath, this.toRelativePath(path)));
        };
        FileService.prototype.toRelativePath = function (path) {
            if (this.isAbsolute(path)) {
                path = strings.ltrim(path, '/');
                path = strings.ltrim(path, '\\');
                if (this.isAbsolute(path)) {
                    throw new Error(strings.format('Failed to make {0} a relative path!', path));
                }
            }
            return path;
        };
        FileService.prototype.resolve = function (arg1, resolveTo, resolveSingleChildDescendants) {
            var toStatPromise;
            if (typeof arg1 === 'string') {
                toStatPromise = this.resolveStat(arg1);
            }
            else if (uri.isURI(arg1)) {
                toStatPromise = this.resolveStat(arg1);
            }
            else {
                toStatPromise = winjs.TPromise.as(arg1);
            }
            return toStatPromise.then(function (model) {
                var options = {
                    resolveSingleChildDescendants: resolveSingleChildDescendants,
                    resolveTo: resolveTo
                };
                return promises.as(function (clb) { return model.serialize(options, clb); });
            });
        };
        FileService.prototype.resolveStat = function (arg1) {
            var _this = this;
            var absolutePath = this.toAbsolutePath(arg1);
            return pfs.stat(absolutePath).then(function (stat) {
                return _this.toStat(arg1, stat.isDirectory(), stat.mtime.getTime(), stat.size);
            });
        };
        FileService.prototype.toStat = function (arg1, isDirectory, mtime, size) {
            var workspaceRelativePath;
            var resource;
            if (typeof arg1 === 'string') {
                workspaceRelativePath = arg1;
                resource = uri.file(_path.join(this.basePath, workspaceRelativePath));
            }
            else {
                resource = arg1;
            }
            return new statModel.Stat(resource, this.basePath, workspaceRelativePath, isDirectory, mtime, size);
        };
        FileService.prototype.resolveFileContent = function (arg1, etag, enc) {
            if (enc === void 0) { enc = encoding.UTF8; }
            var absolutePath = this.toAbsolutePath(arg1);
            // 1.) stat
            return this.resolve(arg1).then(function (model) {
                // Return early if file not modified since
                if (etag && etag === model.etag) {
                    return winjs.Promise.wrapError({
                        fileOperationResult: files.FileOperationResult.FILE_NOT_MODIFIED_SINCE
                    });
                }
                // 2.) read contents
                return pfs.readFile(absolutePath).then(function (contents) {
                    var content = model;
                    content.charset = enc;
                    // Support encodings
                    if (enc && enc !== encoding.UTF8) {
                        content.value = iconv.decode(contents, enc);
                    }
                    else {
                        content.value = contents.toString(enc);
                    }
                    return content;
                });
            });
        };
        FileService.prototype.checkFile = function (absolutePath, content, overwriteReadonly) {
            var _this = this;
            return pfs.exists(absolutePath).then(function (exists) {
                if (exists) {
                    return pfs.stat(absolutePath).then(function (stat) {
                        if (stat.isDirectory()) {
                            return winjs.Promise.wrapError(new Error('Expected file is actually a directory'));
                        }
                        // Dirty write prevention if enabled
                        if (_this.options.enableDirtyWriteProtection && typeof content.mtime === 'number' && typeof content.etag === 'string' && content.mtime < stat.mtime.getTime()) {
                            // Find out if content length has changed
                            if (content.etag !== extfs.etag(stat.size, content.mtime)) {
                                return winjs.Promise.wrapError({
                                    message: 'File Modified Since',
                                    fileOperationResult: files.FileOperationResult.FILE_MODIFIED_SINCE
                                });
                            }
                        }
                        var mode = stat.mode;
                        var readonly = !(mode & 128);
                        // Throw if file is readonly and we are not instructed to overwrite
                        if (readonly && !overwriteReadonly) {
                            return winjs.Promise.wrapError({
                                message: 'File Read Only',
                                fileOperationResult: files.FileOperationResult.FILE_READ_ONLY
                            });
                        }
                        if (readonly) {
                            mode = mode | 128;
                            return pfs.chmod(absolutePath, mode).then(function () { return exists; });
                        }
                        return winjs.TPromise.as(exists);
                    });
                }
                return winjs.TPromise.as(exists);
            });
        };
        FileService.prototype.isAbsolute = function (path) {
            if (types.isFunction(_path.isAbsolute)) {
                return _path.isAbsolute(path); // node.js 0.11 method
            }
            return process.platform === 'win32' ? path.indexOf(':') >= 0 : path.charAt(0) === '/';
        };
        FileService.prototype.dispose = function () {
            this.globServiceConnection.dispose();
            if (this.watcherToDispose) {
                this.watcherToDispose();
                this.watcherToDispose = null;
            }
        };
        FileService.BULK_FETCH_LIMIT = 8000; // limit of number of files to allow for bulk fetch operations
        FileService.FS_EVENT_DELAY = 200; // timeout in ms to aggregate multiple fs events before emitting them
        FileService.FS_EVENT_LIMIT = 50; // total number of events to aggregate before emitting them
        return FileService;
    })();
    exports.FileService = FileService;
});
