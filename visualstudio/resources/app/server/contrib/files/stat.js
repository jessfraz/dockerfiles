/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
/// <reference path="../../declare/node.d.ts" />
'use strict';
define(["require", "exports", 'fs', 'path', '../../lib/extfs', '../../lib/extpath', '../../lib/mime', '../../lib/types', '../../lib/flow', '../../lib/uri'], function (require, exports, fs, npath, extfs, extpath, mime, types, flow, URI) {
    var parallel = flow.parallel;
    var sequence = flow.sequence;
    // In case we get an EPERM/ENOENT/EBUSY error this indicates that a call to fs.stat() failed with insufficient permissions
    // or that the file does not exist anymore at the time where the call was made.
    // This can mean monaco is unable to read the node in the file system and we will simply ignore it. This enables
    // monaco to run over partially readable filesystems without failing big time.
    var errorsToIgnore = ['EPERM', 'ENOENT', 'EBUSY'];
    var Stat = (function () {
        function Stat(resource, basePath, workspaceRelativePath, isDirectory, mtime, size) {
            this.resource = resource;
            this.basePath = basePath;
            if (!workspaceRelativePath) {
                var root = URI.file(this.basePath).path;
                if (this.resource.path.indexOf(root + '/') === 0) {
                    this.workspaceRelativePath = extpath.normalize(this.resource.path.substr(root.length));
                }
            }
            else {
                this.workspaceRelativePath = extpath.normalize(workspaceRelativePath);
            }
            this.isDirectory = isDirectory;
            this.mtime = mtime;
            this.name = extpath.getName(resource.path);
            this.mime = !this.isDirectory ? mime.guessMimeTypes(resource.path).join(', ') : null;
            this.etag = extfs.etag(size, mtime);
        }
        Stat.prototype.serialize = function (options, callback) {
            var _this = this;
            // General Data
            var serialized = {
                resource: this.resource,
                isDirectory: this.isDirectory,
                path: this.workspaceRelativePath,
                name: this.name,
                etag: this.etag,
                hasChildren: undefined,
                size: undefined,
                mtime: this.mtime,
                mime: this.mime
            };
            // Set default options if needed
            if (!options) {
                options = {};
            }
            // File Specific Data
            if (!this.isDirectory) {
                callback(null, serialized);
                return;
            }
            else {
                // Convert the paths from options.resolveTo to absolute paths
                var absoluteTargetPaths = null;
                if (options.resolveTo) {
                    absoluteTargetPaths = [];
                    options.resolveTo.forEach(function (path) {
                        absoluteTargetPaths.push(extpath.join(_this.basePath, path));
                    });
                }
                // Load children
                var errorBucket = [];
                this.serializeChildren(this.basePath, this.workspaceRelativePath, absoluteTargetPaths, options.resolveSingleChildDescendants, errorBucket, function (error, children) {
                    // Remove null entries
                    error = types.coalesce(error);
                    errorBucket = types.coalesce(errorBucket);
                    children = types.coalesce(children);
                    // Send any errors back to client
                    if (error && error.length > 0) {
                        if (_this.workspaceRelativePath === '\\' || _this.workspaceRelativePath === '/') {
                            var errorMsg = 'Error reading workspace. If this error persists, please restart this website (' + error[0].toString() + ').';
                            callback(new Error(errorMsg), null, errorBucket);
                        }
                        else {
                            callback(error[0], null, errorBucket);
                        }
                        return;
                    }
                    serialized.hasChildren = children && children.length > 0;
                    serialized.children = children || [];
                    callback(null, serialized, errorBucket);
                });
            }
        };
        Stat.prototype.serializeChildren = function (basePath, relativePath, absoluteTargetPaths, resolveSingleChildDescendants, errorBucket, callback) {
            var _this = this;
            var absolutePath = extpath.join(basePath, relativePath);
            fs.readdir(absolutePath, function (error, files) {
                if (error) {
                    if (errorsToIgnore.some(function (ignore) { return error.code === ignore; })) {
                        return callback(null, null);
                    }
                    errorBucket.push(error);
                    return callback([error], null);
                }
                parallel(files, function (file, clb) {
                    var filePath = npath.resolve(absolutePath, file);
                    var relativeFilePath = npath.join(relativePath, file);
                    var fileStat;
                    var $this = _this;
                    sequence(function onError(error) {
                        clb(errorsToIgnore.some(function (ignore) { return error.code === ignore; }) ? null : error, null);
                    }, function stat() {
                        fs.stat(filePath, this);
                    }, function countChildren(fsstat) {
                        fileStat = fsstat;
                        if (fileStat.isDirectory()) {
                            extfs.countChildren(filePath, this);
                        }
                        else {
                            this(null, 0);
                        }
                    }, function serialize(childCount) {
                        var childStat = {
                            resource: URI.file(filePath),
                            isDirectory: fileStat.isDirectory(),
                            hasChildren: childCount > 0,
                            name: file,
                            mtime: fileStat.mtime.getTime(),
                            path: relativeFilePath,
                            etag: extfs.etag(fileStat),
                            mime: !fileStat.isDirectory() ? mime.guessMimeTypes(filePath).join(', ') : undefined
                        };
                        // Return early for files
                        if (!fileStat.isDirectory()) {
                            return clb(null, childStat);
                        }
                        // Handle Folder
                        var resolveFolderChildren = false;
                        if (files.length === 1 && resolveSingleChildDescendants) {
                            resolveFolderChildren = true;
                        }
                        else if (childCount > 0 && absoluteTargetPaths && absoluteTargetPaths.some(function (targetPath) { return targetPath.indexOf(filePath) === 0; })) {
                            resolveFolderChildren = true;
                        }
                        // Continue resolving children based on condition
                        if (resolveFolderChildren) {
                            $this.serializeChildren(basePath, relativeFilePath, absoluteTargetPaths, resolveSingleChildDescendants, errorBucket, function (error, children) {
                                // Remove null entries
                                error = types.coalesce(error);
                                children = types.coalesce(children);
                                if (error && error.length > 0) {
                                    clb(error[0], null);
                                    return;
                                }
                                childStat.hasChildren = children && children.length > 0;
                                childStat.children = children || [];
                                clb(null, childStat);
                            });
                        }
                        else {
                            clb(null, childStat);
                        }
                    });
                }, function (errors, result) {
                    if (errors && errors.length > 0) {
                        errorBucket.push.apply(errorBucket, errors);
                    }
                    callback(errors, result);
                });
            });
        };
        Stat.prototype.matches = function (etag) {
            return this.etag === etag;
        };
        return Stat;
    })();
    exports.Stat = Stat;
});
