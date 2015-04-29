/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
/// <reference path="../../../../declare/express.d.ts" />
/// <reference path="../../../../declare/node.d.ts" />
'use strict';
define(["require", "exports", '../../../../monaco', '../../../../lib/async', '../../../../lib/system', '../../../../lib/extpath', '../../../../lib/uri', '../../../../lib/watcher/watcher', '../../../../lib/watcher/edge.win32.watcher'], function (require, exports, server, async, winjs, extpath, URI, watcher, edgeWin32Watcher) {
    var FileWatcher = (function () {
        function FileWatcher() {
        }
        FileWatcher.startWatching = function (server, broadcastService, delay, limitBeforeFlush) {
            var fileEventDelayer = new async.ThrottledDelayer(delay);
            var undeliveredFileEvents = [];
            var fileWatcher = new edgeWin32Watcher.Win32WorkspaceWatcher(server.options.workspacesRoot, server, function (events) {
                undeliveredFileEvents = undeliveredFileEvents.concat(events);
                fileEventDelayer.trigger(function () {
                    var buffer = undeliveredFileEvents;
                    undeliveredFileEvents = [];
                    FileWatcher.onFileChanges(server, broadcastService, buffer);
                    return winjs.Promise.as(null);
                }, undeliveredFileEvents.length >= limitBeforeFlush ? 0 : delay);
            });
            fileWatcher.includeSubdirectories(true);
            fileWatcher.enableRaisingEvents(true);
        };
        FileWatcher.onFileChanges = function (server, broadcastService, events) {
            // Compute changes we want to broadcast to clients
            var changes = [];
            for (var i = 0, len = events.length; i < len; i++) {
                changes = changes.concat(this.toFileChanges(events[i]));
            }
            // If changes are found, emit through broadcast service to clients of the workspace
            if (changes.length > 0) {
                broadcastService.broadcast('files:rawFileChanges', changes, events[0].workspace);
            }
        };
        FileWatcher.toFileChanges = function (event) {
            var children = event.deltaTree.children;
            if (!children) {
                return [];
            }
            var changes = [];
            for (var i = 0, len = children.length; i < len; i++) {
                this.computePaths(children[i], changes, event);
            }
            return changes;
        };
        FileWatcher.computePaths = function (delta, out, event) {
            // Ignore .git/objects because this folder typically has very large contents
            if (delta.pathArray[0] === '.git' && delta.pathArray[1] === 'objects') {
                return;
            }
            if (delta.changeType !== null) {
                var path = '/' + delta.pathArray.join('/');
                var resource;
                if (event.workspace) {
                    resource = URI.file(extpath.join(server.options.workspacesRoot, event.workspace, path)).toString();
                }
                else {
                    resource = URI.file(extpath.join(server.options.workspacesRoot, path)).toString();
                }
                var change = {
                    path: path,
                    resource: resource,
                    type: delta.changeType
                };
                out.push(change);
            }
            // Only continue in delta tree if this is not a delete because a delete will only be reported
            // for the top level folder that actually got deleted to avoid event spam
            if (delta.changeType !== watcher.ChangeTypes.DELETED) {
                var children = delta.children;
                if (children) {
                    for (var i = 0, len = children.length; i < len; i++) {
                        this.computePaths(children[i], out, event);
                    }
                }
            }
        };
        return FileWatcher;
    })();
    exports.FileWatcher = FileWatcher;
});
