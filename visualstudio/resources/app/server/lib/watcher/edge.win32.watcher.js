/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
/// <reference path="../../declare/node.d.ts" />
/// <reference path="../../declare/express.d.ts" />
'use strict';
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", 'path', './base.win32.watcher', '../edge'], function (require, exports, _path, baseWatcher, edge) {
    var Win32FileWatcher = (function () {
        function Win32FileWatcher(proxy) {
            this.proxy = proxy;
        }
        Win32FileWatcher.prototype.includeSubdirectories = function (value) {
            this.proxy.includeSubdirectories(value, true);
        };
        Win32FileWatcher.prototype.enableRaisingEvents = function (value) {
            this.proxy.enableRaisingEvents(value, true);
        };
        return Win32FileWatcher;
    })();
    exports.Win32FileWatcher = Win32FileWatcher;
    var Win32WorkspaceWatcher = (function (_super) {
        __extends(Win32WorkspaceWatcher, _super);
        function Win32WorkspaceWatcher(watchedFolder, server, eventCallback) {
            var _this = this;
            var assemblyFile = _path.join(server.options.wwwRoot, 'lib\\watcher\\fileWatcher.dll');
            var create = edge.func({
                assemblyFile: assemblyFile,
                typeName: 'Monaco.FileSystem.WorkspaceFileWatcher',
                methodName: 'create'
            });
            _super.call(this, create({
                path: watchedFolder,
                eventCallback: function (data, callback) {
                    try {
                        var events = _this.processWin32FileEvents(data);
                        eventCallback(events);
                    }
                    catch (e) {
                        server.logger.error(e, 'Win32WorkspaceWatcher');
                    }
                    finally {
                        callback();
                    }
                },
                info: function (msg, callback) {
                    server.logger.info(msg);
                    callback();
                }
            }, true));
        }
        Win32WorkspaceWatcher.prototype.processWin32FileEvents = function (events) {
            var deltaBuilders = {};
            var lastBuilder = null;
            for (var i = 0; i < events.length; i++) {
                var event = events[i];
                var workspace = event.workspace;
                if (lastBuilder !== null && workspace === lastBuilder.workspace) {
                    lastBuilder.processEvent(event);
                }
                else {
                    var deltaBuilder = deltaBuilders[workspace];
                    if (!deltaBuilder) {
                        deltaBuilder = new Win32DeltaBuilderWithWorkspace(workspace);
                        deltaBuilders[workspace] = deltaBuilder;
                    }
                    deltaBuilder.processEvent(event);
                    lastBuilder = deltaBuilder;
                }
            }
            var publish = [];
            Object.keys(deltaBuilders).forEach(function (key) {
                var deltaBuilder = deltaBuilders[key];
                var fileEvent = {
                    workspace: key,
                    deltaTree: deltaBuilder.root
                };
                publish.push(fileEvent);
            });
            return publish;
        };
        return Win32WorkspaceWatcher;
    })(Win32FileWatcher);
    exports.Win32WorkspaceWatcher = Win32WorkspaceWatcher;
    var Win32DeltaBuilderWithWorkspace = (function (_super) {
        __extends(Win32DeltaBuilderWithWorkspace, _super);
        function Win32DeltaBuilderWithWorkspace(workspace) {
            _super.call(this);
            this.workspace = workspace;
        }
        return Win32DeltaBuilderWithWorkspace;
    })(baseWatcher.Win32DeltaBuilder);
    exports.Win32DeltaBuilderWithWorkspace = Win32DeltaBuilderWithWorkspace;
    var Win32FolderWatcher = (function (_super) {
        __extends(Win32FolderWatcher, _super);
        function Win32FolderWatcher(watchedFolder, server, eventCallback) {
            var assemblyFile = _path.join(server.options.wwwRoot, 'lib\\watcher\\fileWatcher.dll');
            var create = edge.func({
                assemblyFile: assemblyFile,
                typeName: 'Monaco.FileSystem.FolderFileWatcher',
                methodName: 'create'
            });
            _super.call(this, create({
                path: watchedFolder,
                eventCallback: function (rawEvents, callback) {
                    try {
                        var builder = new baseWatcher.Win32DeltaBuilder();
                        for (var i = 0; i < rawEvents.length; i++) {
                            builder.processEvent(rawEvents[i]);
                        }
                        eventCallback(builder.root);
                    }
                    catch (e) {
                        server.logger.error(e, 'Win32FolderWatcher');
                    }
                    finally {
                        callback();
                    }
                },
                info: function (msg, callback) {
                    server.logger.info(msg);
                    callback();
                }
            }, true));
        }
        return Win32FolderWatcher;
    })(Win32FileWatcher);
    exports.Win32FolderWatcher = Win32FolderWatcher;
});
