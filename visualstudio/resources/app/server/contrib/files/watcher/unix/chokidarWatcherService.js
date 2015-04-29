/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
/// <reference path="../../../../declare/node.d.ts" />
/// <reference path="../../../../declare/graceful-fs.d.ts" />
/// <reference path="../../../../declare/chokidar.d.ts" />
// require graceful-fs once. It will patch the
// fs-module so it does not fail with too many
// open files
/// <amd-dependency path="graceful-fs" />
'use strict';
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", 'chokidar', '../../../../lib/system', '../../../../lib/extpath', '../../../../lib/uri', './watcherService', "graceful-fs"], function (require, exports, chokidar, winjs, extpath, URI, watcherService) {
    var ChokidarWatcherService = (function (_super) {
        __extends(ChokidarWatcherService, _super);
        function ChokidarWatcherService() {
            _super.apply(this, arguments);
        }
        ChokidarWatcherService.prototype.watch = function (request) {
            var watcherOpts = {
                ignoreInitial: true,
                ignorePermissionErrors: true,
                followSymlinks: false,
                /**
                 * Mac/Linux: 	/.git/objects: ignored because of potentially large contents
                 * Linux: 		/node_modules/<anything>: ignored because of potentially large contents (we only consider top level node_modules changes)
                 */
                ignored: process.platform === 'darwin' ? /[\/](\.git[\/]objects)/ : /[\/](\.git[\/]objects|node_modules[\/].+[\/])/
            };
            var watcher = chokidar.watch(request.basePath, watcherOpts);
            return new winjs.Promise(function (c, e, p) {
                watcher.on('all', function (type, path) {
                    if (path.indexOf(request.basePath) < 0) {
                        return; // we really only care about absolute paths here in our basepath context here
                    }
                    var relativePath = path.substring(request.basePath.length);
                    var event = null;
                    if (type === 'add' || type === 'addDir') {
                        event = {
                            kind: type === 'add' ? watcherService.FileChangeKind.FILE : watcherService.FileChangeKind.DIRECTORY,
                            type: watcherService.FileChangeType.ADDED,
                            resource: URI.file(extpath.join(request.basePath, relativePath)).toString(),
                            path: relativePath
                        };
                    }
                    else if (type === 'change') {
                        event = {
                            kind: watcherService.FileChangeKind.UNKNOWN,
                            type: watcherService.FileChangeType.UPDATED,
                            resource: URI.file(extpath.join(request.basePath, relativePath)).toString(),
                            path: relativePath
                        };
                    }
                    else if (type === 'unlink' || type === 'unlinkDir') {
                        event = {
                            kind: type === 'unlink' ? watcherService.FileChangeKind.FILE : watcherService.FileChangeKind.DIRECTORY,
                            type: watcherService.FileChangeType.DELETED,
                            resource: URI.file(extpath.join(request.basePath, relativePath)).toString(),
                            path: relativePath
                        };
                    }
                    if (event) {
                        p(event);
                    }
                });
                watcher.on('error', function (error) {
                    if (error) {
                        p(error.toString());
                    }
                });
            }, function () {
                watcher.close();
            });
        };
        return ChokidarWatcherService;
    })(watcherService.WatcherService);
    return ChokidarWatcherService;
});
