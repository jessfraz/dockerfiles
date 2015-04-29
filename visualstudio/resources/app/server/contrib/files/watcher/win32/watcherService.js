/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
/// <reference path="../../../../declare/node.d.ts" />
'use strict';
define(["require", "exports", 'path', '../../../../lib/uri', '../../../../lib/watcher/watcher', '../../../../lib/watcher/process.win32.watcher'], function (require, exports, _path, uri, watcher, processWin32Watcher) {
    var FileWatcher = (function () {
        function FileWatcher(basePath, eventEmitter, errorLogger, delay, limitBeforeFlush) {
            this.basePath = basePath;
            this.eventEmitter = eventEmitter;
            this.errorLogger = errorLogger;
            this.delay = delay;
            this.limitBeforeFlush = limitBeforeFlush;
            //
        }
        FileWatcher.prototype.startWatching = function () {
            var _this = this;
            var watcher = new processWin32Watcher.OutOfProcessWin32FolderWatcher(this.basePath, this.errorLogger, function (events) {
                _this.onFileChanges(events);
            }, this.delay, this.limitBeforeFlush);
            return function () { return watcher.dispose(); };
        };
        FileWatcher.prototype.onFileChanges = function (events) {
            // Compute changes we want to broadcast to clients
            var changes = [];
            for (var i = 0, len = events.length; i < len; i++) {
                changes = changes.concat(this.toFileChanges(events[i]));
            }
            // If changes are found, emit through broadcast service
            if (changes.length > 0) {
                this.eventEmitter.emit('files:rawFileChanges', changes);
            }
        };
        FileWatcher.prototype.toFileChanges = function (event) {
            var children = event.deltaTree.children;
            if (!children) {
                return [];
            }
            var changes = [];
            for (var i = 0, len = children.length; i < len; i++) {
                this.computePaths(children[i], changes);
            }
            return changes;
        };
        FileWatcher.prototype.computePaths = function (delta, out) {
            // Ignore .git/objects because this folder typically has very large contents
            if (delta.pathArray[0] === '.git' && delta.pathArray[1] === 'objects') {
                return;
            }
            if (delta.changeType !== null) {
                var path = '/' + delta.pathArray.join('/');
                var resource = uri.file(_path.join(this.basePath, path)).toString();
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
                        this.computePaths(children[i], out);
                    }
                }
            }
        };
        return FileWatcher;
    })();
    exports.FileWatcher = FileWatcher;
});
