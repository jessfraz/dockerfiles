/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
/// <reference path="../../declare/express.d.ts" />
/// <reference path="../../declare/node.d.ts" />
'use strict';
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", 'path', 'zlib', 'url', '../contributions', '../../lib/errors', '../../monaco', '../../lib/strings', '../../lib/route', '../../lib/stream', '../../lib/mime', '../../middleware/upload', '../../lib/system', '../../lib/promises', '../../lib/extnet', '../../lib/extpath', '../../lib/uri', '../../lib/extfs', '../../lib/compress', '../../lib/pfs', '../../lib/types', '../../model/workspace', '../../controller/workspace', './files', './watcher/waws/watcherService', './fileService', '../../lib/http2'], function (require, exports, npath, zlib, url, contributions, errors, server, strings, route, stream, mime, upload, winjs, promises, extnet, extpath, URI, extfs, compress, pfs, types, workspace, workspaceRoute, files, edgeWatcherService, fileService, http2) {
    var VALID_FILENAME = /^[^\\:\*\?"<>\|]*\/?$/;
    var SERVICES = {};
    var AbstractFileRoute = (function (_super) {
        __extends(AbstractFileRoute, _super);
        function AbstractFileRoute() {
            _super.apply(this, arguments);
        }
        AbstractFileRoute.prototype.handleRequest = function (req, res, next) {
            var _this = this;
            var workspace = workspaceRoute.getWorkspace(req);
            var root = workspace.toAbsolutePath();
            // File Service (shared per root)
            var raw = SERVICES[root];
            if (!raw) {
                raw = fileService.createService(root, this.server.eventbus, {
                    tmpDir: this.server.options.monacodataTempPath,
                    errorLogger: function (msg) { return _this.server.logger.error(msg); },
                    prependBom: true,
                    disableWatcher: true
                });
                SERVICES[root] = raw;
            }
            // Path
            var path = req.params.monacoFilePath;
            if (path[0] !== '/') {
                path = '/' + path;
            }
            if (!VALID_FILENAME.test(npath.basename(path))) {
                return winjs.Promise.wrapError(errors.httpError(400, 'Invalid file path.'));
            }
            return this.handleFilesRequest(path, raw, req, res, next);
        };
        AbstractFileRoute.prototype.handleFilesRequest = function (path, raw, req, res, next) {
            return winjs.Promise.wrapError(new Error('to be implemented'));
        };
        AbstractFileRoute.prototype.resolveStatOrNotFound = function (raw, path, resolveTo, resolveSingleChildDescendants) {
            return raw.resolveFileStat(path, resolveTo, resolveSingleChildDescendants).then(function (stat) { return stat; }, function () { return winjs.Promise.wrapError(errors.httpError(404, 'Not found')); });
        };
        /* protected */ AbstractFileRoute.prototype.onError = function (error, req, res, next) {
            if (error.fileOperationResult === files.FileOperationResult.FILE_NOT_FOUND) {
                return next(errors.httpError(404, 'Not found'));
            }
            if (error.fileOperationResult === files.FileOperationResult.FILE_IS_BINARY) {
                return next(errors.httpError(406, 'Requested file is binary but client only accepts text.'));
            }
            if (error.fileOperationResult === files.FileOperationResult.FILE_NOT_MODIFIED_SINCE) {
                return next(errors.httpError(304, 'Not modified since'));
            }
            if (error.fileOperationResult === files.FileOperationResult.FILE_MOVE_CONFLICT) {
                return next(errors.httpError(412, 'Move conflict'));
            }
            return _super.prototype.onError.call(this, error, req, res, next);
        };
        return AbstractFileRoute;
    })(route.AbstractRoute);
    var GetRoute = (function (_super) {
        __extends(GetRoute, _super);
        function GetRoute(server) {
            _super.call(this, server, 'get');
        }
        GetRoute.prototype.handleFilesRequest = function (path, raw, req, res, next) {
            // Set this flag since we negotiate content on this service through accept header
            res.set('Vary', 'Accept, Accept-Encoding');
            // GET Multi stat
            if (!strings.isFalsyOrWhitespace(req.query['glob'])) {
                return this.getFileStats(path, raw, req, res, next);
            }
            // GET Stat
            if (req.get('accept') === 'application/json') {
                return this.getFileStat(path, raw, req, res, next);
            }
            // GET Content
            return this.getFileContent(path, raw, req, res, next);
        };
        GetRoute.prototype.getFileStats = function (path, raw, req, res, next) {
            var globPattern = decodeURIComponent(req.query['glob']);
            return raw.resolveFileStats(path, globPattern).then(function (stats) {
                var stream;
                var accept = req.headers['accept-encoding'];
                if (accept && accept.match(/gzip/)) {
                    res.writeHead(200, { 'content-encoding': 'gzip' });
                    var t = zlib.createGzip({});
                    t.pipe(res);
                    stream = t;
                }
                else {
                    stream = res;
                }
                stats.forEach(function (stat) {
                    http2.writeChunked(stream, {}, new Buffer(JSON.stringify(stat)));
                });
                stream.end();
            });
        };
        GetRoute.prototype.getFileStat = function (path, raw, req, res, next) {
            return this.resolveStatOrNotFound(raw, path).then(function (stat) {
                res.set('Content-Type', 'application/json');
                res.send(200, stat);
            });
        };
        GetRoute.prototype.getFileContent = function (path, raw, req, res, next) {
            var _this = this;
            var textOnly = req.get('accept') === 'text/plain';
            var etag = req.get('if-none-match');
            return this.resolveStatOrNotFound(raw, path).then(function (stat) {
                if (stat.isDirectory) {
                    if (textOnly) {
                        return winjs.Promise.wrapError({
                            message: 'Requested file is binary but client only accepts text',
                            fileOperationResult: files.FileOperationResult.FILE_IS_BINARY
                        });
                    }
                    return _this.downloadFolder(path, raw, req, res, next);
                }
                res.setHeader('X-Frame-Options', 'SAMEORIGIN');
                res.setHeader('ETag', stat.etag);
                res.setHeader('X-Resource', URI.file(extpath.join(server.options.workspacesRoot, path)).toString());
                res.setHeader('X-Filepath', path);
                return raw.resolveContent(path, textOnly, etag).then(function (content) {
                    var mimes = content.mime.split(', ');
                    var contentType = mimes[0].trim(); // Use the most concrete mime type as header
                    var isText = mimes.indexOf(mime.MIME_BINARY) === -1;
                    if (isText) {
                        contentType = contentType + '; charset=' + _this.server.options.defaultEncoding;
                    }
                    res.set('Content-Type', contentType);
                    res.set('X-Content-Charset', content.charset);
                    res.set('X-Content-Types', mimes.join(', '));
                    extnet.send(req, res, stat.path, next, workspaceRoute.getWorkspace(req).toAbsolutePath());
                    return winjs.Promise.as(null);
                });
            });
        };
        GetRoute.prototype.downloadFolder = function (path, raw, req, res, next) {
            var options = {
                tmpPath: this.server.options.osTempPath,
                wwwRoot: this.server.options.wwwRoot
            };
            var workspace = workspaceRoute.getWorkspace(req);
            var absolutePath = workspace.toAbsolutePath(path);
            return promises.as(function (clb) { return compress.compressFolder(absolutePath, options, clb); }).then(function (archiveFile) {
                res.set('Content-disposition', 'attachment; filename=' + workspace.name + '.zip');
                res.set('Content-Type', mime.MIME_BINARY);
                extnet.send(req, res, archiveFile, next);
            });
        };
        return GetRoute;
    })(AbstractFileRoute);
    var PostRoute = (function (_super) {
        __extends(PostRoute, _super);
        function PostRoute(server) {
            _super.call(this, server, 'post');
        }
        PostRoute.prototype.handleFilesRequest = function (path, raw, req, res, next) {
            var body = req.body;
            // Upload
            if (req.get('content-type').indexOf('multipart/form-data') === 0) {
                return this.upload(path, raw, req, res, next);
            }
            else if (body.resolveTo || body.resolveSingleChildDescendants) {
                return this.getFileStat(path, raw, req, res, next);
            }
            else if (body.pathsToResolve) {
                return this.getFilesContents(path, raw, req, res, next);
            }
            else if (body.moveTo || body.copyTo) {
                return this.moveCopyFile(path, raw, req, res, next);
            }
            return winjs.Promise.wrapError(errors.httpError(400, 'Invalid post request on the file service.'));
        };
        PostRoute.prototype.upload = function (path, raw, req, res, next) {
            var _this = this;
            var workspace = workspaceRoute.getWorkspace(req);
            var absolutePath = workspace.toAbsolutePath(path);
            var newPath = path;
            var newAbsolutePath = absolutePath;
            // append name of uploaded file only to targetpath, if targetpath is a folder 
            if (path.charAt(path.length - 1) === '/') {
                newPath = npath.join(path, upload.toFiles(req).data.name);
                newAbsolutePath = npath.join(absolutePath, upload.toFiles(req).data.name);
            }
            return pfs.exists(newAbsolutePath).then(function (exists) {
                // Delete target
                return promises.as(function (clb) { return extfs.del(newAbsolutePath, _this.server.options.monacodataTempPath, clb); }).then(function () {
                    // Make target
                    return promises.as(function (clb) { return extfs.mkdirp(npath.dirname(newAbsolutePath), null, clb); }).then(function () {
                        // Move upload
                        return promises.as(function (clb) { return extfs.mv(upload.toFiles(req).data.path, newAbsolutePath, clb); }).then(function () {
                            // Resolve
                            return raw.resolveFileStat(newPath).then(function (stat) {
                                var parsed = url.parse(req.url, true);
                                if (parsed.query) {
                                    var queryargs = parsed.query;
                                    if (queryargs.redirect) {
                                        res.set('Location', _this.toRedirectUrl(queryargs.redirect, newPath));
                                        res.send(301, stat);
                                        return;
                                    }
                                }
                                res.set('Location', server.options.siteRoot + _this.toFileUrl(_this.server, workspace.id, newPath));
                                res.send(exists ? 200 : 201, stat);
                            });
                        });
                    });
                });
            }).then(null, function () {
                return winjs.Promise.wrapError(errors.httpError(409, 'Unable to upload "' + path + '". Please try again later.'));
            });
        };
        PostRoute.prototype.toFileUrl = function (server, workspaceId, path) {
            path = path.replace(/\\/g, '/');
            if (path.charAt(0) === '/') {
                path = path.substring(1);
            }
            return strings.bind('/api/files/{0}/{1}', workspaceId, path);
        };
        PostRoute.prototype.toRedirectUrl = function (redirectUrl, path) {
            if (redirectUrl.charAt(redirectUrl.length - 1) === '/') {
                redirectUrl = redirectUrl.substring(0, redirectUrl.length - 1);
            }
            path = path.replace(/\\/g, '/');
            if (path.charAt(0) === '/') {
                path = path.substring(1);
            }
            return redirectUrl + '/#/' + path;
        };
        PostRoute.prototype.getFileStat = function (path, raw, req, res, next) {
            return this.resolveStatOrNotFound(raw, path, req.body.resolveTo, req.body.resolveSingleChildDescendants).then(function (stat) {
                res.set('Content-Type', 'application/json');
                res.send(200, stat);
            });
        };
        PostRoute.prototype.getFilesContents = function (path, raw, req, res, next) {
            return raw.resolveContents(req.body.pathsToResolve).then(function (contents) {
                var stream;
                var accept = req.headers['accept-encoding'];
                if (accept && accept.match(/gzip/)) {
                    res.writeHead(200, { 'content-encoding': 'gzip' });
                    var t = zlib.createGzip({});
                    t.pipe(res);
                    stream = t;
                }
                else {
                    stream = res;
                }
                contents.forEach(function (content) {
                    var header = Object.create(null);
                    header['X-Filepath'] = content.path;
                    header['X-Resource'] = URI.file(extpath.join(server.options.workspacesRoot, content.path)).toString();
                    header['Last-Modified'] = new Date(content.mtime).toUTCString();
                    header['Content-Type'] = content.mime.split(',')[0].trim();
                    header['ETag'] = content.etag;
                    http2.writeChunked(stream, header, new Buffer(content.value));
                });
                stream.end();
            });
        };
        PostRoute.prototype.moveCopyFile = function (path, raw, req, res, next) {
            var isMove = !!req.body.moveTo;
            var toPath = req.body.moveTo || req.body.copyTo;
            var overwrite = req.body.overwrite;
            if (!VALID_FILENAME.test(npath.basename(toPath))) {
                return winjs.Promise.wrapError(errors.httpError(400, 'Invalid file name.'));
            }
            if (toPath[0] !== '/') {
                return winjs.Promise.wrapError(errors.httpError(400, 'Path must be absolute to the root.'));
            }
            return this.resolveStatOrNotFound(raw, path).then(function (stat) {
                var filePromise;
                if (isMove) {
                    filePromise = raw.moveFile(stat, toPath, overwrite);
                }
                else {
                    filePromise = raw.copyFile(stat, toPath);
                }
                return filePromise.then(function (stat) {
                    res.set('Content-Type', 'application/json');
                    res.send(200, stat);
                }).then(null, function (error) {
                    if (!types.isUndefinedOrNull(error.fileOperationResult) || error.statusCode) {
                        return winjs.Promise.wrapError(error); // bubble up - they are handled in base class
                    }
                    return winjs.Promise.wrapError(errors.httpError(409, isMove ? 'Unable to move. Please try again later.' : 'Unable to copy. Please try again later.'));
                });
            });
        };
        return PostRoute;
    })(AbstractFileRoute);
    var PutRoute = (function (_super) {
        __extends(PutRoute, _super);
        function PutRoute(server) {
            _super.call(this, server, 'put');
        }
        PutRoute.prototype.handleFilesRequest = function (path, raw, req, res, next) {
            if (strings.endsWith(path, '/')) {
                return this.createFolder(path, raw, req, res, next);
            }
            return this.createOrUpdateFile(path, raw, req, res, next);
        };
        PutRoute.prototype.createFolder = function (path, raw, req, res, next) {
            return raw.resolveFileStat(path).then(function (stat) { return stat; }, function (error) { return null; }).then(function (stat) {
                if (stat) {
                    if (!stat.isDirectory) {
                        return winjs.Promise.wrapError(errors.httpError(403, 'You can not replace a file with a directory.'));
                    }
                    return winjs.Promise.wrapError(errors.httpError(409, 'The directory already exists.'));
                }
                return raw.createFileOrFolder(path, true).then(function (stat) {
                    res.set('Content-Type', 'application/json');
                    res.send(201, stat);
                });
            });
        };
        PutRoute.prototype.createOrUpdateFile = function (path, raw, req, res, next) {
            return raw.resolveFileStat(path).then(function (stat) { return stat; }, function (error) { return null; }).then(function (stat) {
                var isNew = !stat;
                if (stat && stat.isDirectory) {
                    return winjs.Promise.wrapError(errors.httpError(403, 'You can not replace a directory with a file'));
                }
                return stream.consume(req).then(function (contents) {
                    var contentPromise;
                    if (!stat) {
                        contentPromise = raw.createFile(path, contents.toString());
                    }
                    else {
                        contentPromise = raw.updateContent({
                            resource: stat.resource,
                            path: stat.path,
                            name: stat.name,
                            mtime: stat.mtime,
                            mime: stat.mime,
                            etag: stat.etag,
                            value: contents.toString(),
                            charset: req.get('X-Content-Charset')
                        }, true);
                    }
                    return contentPromise.then(function (stat) {
                        res.setHeader('Last-Modified', new Date(stat.mtime).toUTCString());
                        res.send(isNew ? 201 : 200, stat);
                        return winjs.Promise.as(null);
                    });
                });
            }).then(null, function (error) {
                if (!types.isUndefinedOrNull(error.fileOperationResult) || error.statusCode) {
                    return winjs.Promise.wrapError(error); // bubble up - they are handled in base class
                }
                return winjs.Promise.wrapError(errors.httpError(409, 'Unable to save "' + path + '". Please try again later.'));
            });
        };
        return PutRoute;
    })(AbstractFileRoute);
    var DeleteRoute = (function (_super) {
        __extends(DeleteRoute, _super);
        function DeleteRoute(server) {
            _super.call(this, server, 'del');
        }
        DeleteRoute.prototype.handleFilesRequest = function (path, raw, req, res, next) {
            return this.resolveStatOrNotFound(raw, path).then(function (stat) {
                var deletePromise;
                if (stat.isDirectory) {
                    deletePromise = raw.deleteFolder(stat);
                }
                else {
                    deletePromise = raw.deleteFile(stat);
                }
                return deletePromise.then(function () {
                    res.send(200, '');
                }, function (error) {
                    return winjs.Promise.wrapError(errors.httpError(409, 'Unable to delete "' + path + '". Please try again later.'));
                });
            });
        };
        return DeleteRoute;
    })(AbstractFileRoute);
    var FileContribution = (function (_super) {
        __extends(FileContribution, _super);
        function FileContribution() {
            _super.call(this, 'com.microsoft.vs.file');
        }
        FileContribution.prototype.configure = function (server) {
            // File watcher (if enabled)
            if (!server.options.disableFileWatching) {
                edgeWatcherService.FileWatcher.startWatching(server, this.broadcastService, FileContribution.FS_EVENT_DELAY, FileContribution.FS_EVENT_LIMIT);
            }
        };
        FileContribution.prototype.injectBroadcastService = function (service) {
            this.broadcastService = service;
        };
        FileContribution.prototype.route = function (server) {
            var url = strings.bind('/api/files/{0}/{1}', workspace, ':monacoFilePath(*)');
            new GetRoute(server).register(url, workspace);
            new PostRoute(server).register(url, workspace);
            new PutRoute(server).register(url, workspace);
            new DeleteRoute(server).register(url, workspace);
            // Handle Invalid Requests
            server.www.all('/api/files/*', function (req, res, next) {
                return next(errors.httpError(400, 'Invalid request on the file service.'));
            });
        };
        FileContribution.prototype.getRestEndPoints = function (server, workspace) {
            return {
                root: '/api/files' + workspace.getQualifier()
            };
        };
        FileContribution.FS_EVENT_DELAY = 300; // timeout in ms to aggregate multiple fs events before emitting them
        FileContribution.FS_EVENT_LIMIT = 50; // total number of events to aggregate before emitting them
        return FileContribution;
    })(contributions.AbstractContribution);
    contributions.Registry.registerContribution(new FileContribution());
});
