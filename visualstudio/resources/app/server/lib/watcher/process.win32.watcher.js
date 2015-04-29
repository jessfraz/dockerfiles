/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
/// <reference path="../../declare/node.d.ts" />
'use strict';
define(["require", "exports", 'path', 'child_process', './base.win32.watcher', '../strings', '../async', '../system'], function (require, exports, _path, cp, baseWatcher, strings, async, winjs) {
    var OutOfProcessWin32FolderWatcher = (function () {
        function OutOfProcessWin32FolderWatcher(watchedFolder, errorLogger, eventCallback, delay, limitBeforeFlush) {
            this.watchedFolder = watchedFolder;
            this.eventCallback = eventCallback;
            this.errorLogger = errorLogger;
            this.delay = delay;
            this.limitBeforeFlush = limitBeforeFlush;
            this.startWatcher();
        }
        OutOfProcessWin32FolderWatcher.prototype.startWatcher = function () {
            var _this = this;
            this.handle = cp.spawn(_path.join(__dirname, 'CodeHelper.exe'), [this.watchedFolder]);
            var stdoutLineDecoder = new strings.LineDecoder();
            var fileEventDelayer = new async.ThrottledDelayer(this.delay);
            var undeliveredRawEvents = [];
            // Events over stdout
            this.handle.stdout.on('data', function (data) {
                // Collect raw events from output
                var rawEvents = [];
                stdoutLineDecoder.write(data).forEach(function (line) {
                    var eventParts = line.split('|');
                    if (eventParts.length === 2) {
                        var changeType = Number(eventParts[0]);
                        // File Change Event (Changed, Added, Deleted, Renamed)
                        if (changeType >= 0 && changeType < 4) {
                            rawEvents.push({
                                changeType: changeType,
                                path: eventParts[1]
                            });
                        }
                        else {
                            _this.errorLogger('[FileWatcher] error: ' + eventParts[1]);
                        }
                    }
                });
                // Trigger processing of events through the delayer to batch them up properly
                undeliveredRawEvents = undeliveredRawEvents.concat(rawEvents);
                fileEventDelayer.trigger(function () {
                    var buffer = undeliveredRawEvents;
                    undeliveredRawEvents = [];
                    var events = _this.processWin32FileEvents(buffer);
                    _this.eventCallback([events]);
                    return winjs.Promise.as(null);
                }, undeliveredRawEvents.length >= _this.limitBeforeFlush ? 0 : _this.delay);
            });
            // Errors
            this.handle.on('error', function (error) { return _this.onError(error); });
            this.handle.stderr.on('data', function (data) { return _this.onError(data); });
            // Exit
            this.handle.on('exit', function (code, signal) { return _this.onExit(code, signal); });
        };
        OutOfProcessWin32FolderWatcher.prototype.onError = function (error) {
            this.errorLogger('[FileWatcher] process error: ' + error.toString());
        };
        OutOfProcessWin32FolderWatcher.prototype.onExit = function (code, signal) {
            if (this.handle) {
                this.errorLogger('[FileWatcher] terminated unexpectedly (code: ' + code + ', signal: ' + signal + ')');
                this.startWatcher(); // restart
            }
        };
        OutOfProcessWin32FolderWatcher.prototype.processWin32FileEvents = function (events) {
            var deltaBuilder = new baseWatcher.Win32DeltaBuilder();
            for (var i = 0; i < events.length; i++) {
                var event = events[i];
                deltaBuilder.processEvent(event);
            }
            return {
                deltaTree: deltaBuilder.root
            };
        };
        OutOfProcessWin32FolderWatcher.prototype.dispose = function () {
            if (this.handle) {
                this.handle.kill();
                this.handle = null;
            }
        };
        return OutOfProcessWin32FolderWatcher;
    })();
    exports.OutOfProcessWin32FolderWatcher = OutOfProcessWin32FolderWatcher;
});
