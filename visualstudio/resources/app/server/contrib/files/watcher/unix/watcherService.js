/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
'use strict';
define(["require", "exports", '../../../../lib/system', '../../../../lib/service', '../../../../lib/types', '../../../../lib/async'], function (require, exports, winjs, service, types, async) {
    var WatcherService = (function () {
        function WatcherService() {
        }
        WatcherService.prototype.watch = function (request) {
            throw new Error('not implemented');
        };
        return WatcherService;
    })();
    exports.WatcherService = WatcherService;
    (function (FileChangeType) {
        FileChangeType[FileChangeType["UPDATED"] = 0] = "UPDATED";
        FileChangeType[FileChangeType["ADDED"] = 1] = "ADDED";
        FileChangeType[FileChangeType["DELETED"] = 2] = "DELETED";
    })(exports.FileChangeType || (exports.FileChangeType = {}));
    var FileChangeType = exports.FileChangeType;
    (function (FileChangeKind) {
        FileChangeKind[FileChangeKind["UNKNOWN"] = 0] = "UNKNOWN";
        FileChangeKind[FileChangeKind["FILE"] = 1] = "FILE";
        FileChangeKind[FileChangeKind["DIRECTORY"] = 2] = "DIRECTORY";
    })(exports.FileChangeKind || (exports.FileChangeKind = {}));
    var FileChangeKind = exports.FileChangeKind;
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
            var undeliveredFileEvents = [];
            var fileEventDelayer = new async.ThrottledDelayer(this.delay);
            this.watcherServiceConnection = service.createService(WatcherService, __dirname + '/watcherApp.js');
            this.watcherServiceConnection.service.watch({ basePath: this.basePath }).then(null, function (err) {
                // the service lib uses the promise cancel error to indicate the process died, we do not want to bubble this up
                if (!(err instanceof Error && err.name === 'Canceled' && err.message === 'Canceled')) {
                    return winjs.Promise.wrapError(err);
                }
            }, function (arg) {
                if (types.isString(arg)) {
                    _this.errorLogger('[chokidar error]: ' + arg);
                    return;
                }
                // Add to buffer
                var event = arg;
                undeliveredFileEvents.push(event);
                // Delay and send buffer
                fileEventDelayer.trigger(function () {
                    var events = undeliveredFileEvents;
                    undeliveredFileEvents = [];
                    // Broadcast to clients
                    _this.eventEmitter.emit('files:rawFileChanges', events);
                    return winjs.Promise.as(null);
                }, undeliveredFileEvents.length >= _this.limitBeforeFlush ? 0 : _this.delay);
            }).done(function () {
                // our watcher app should never be completed because it keeps on watching. being in here indicates
                // that the watcher process died and we want to restart it here.
                if (!_this.isDisposed) {
                    fileEventDelayer.cancel();
                    fileEventDelayer = null;
                    undeliveredFileEvents = null;
                    _this.startWatching();
                }
            }, this.errorLogger);
            return function () {
                _this.watcherServiceConnection.dispose();
                _this.isDisposed = true;
            };
        };
        return FileWatcher;
    })();
    exports.FileWatcher = FileWatcher;
});
