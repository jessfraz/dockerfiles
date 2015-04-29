/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
/// <reference path="../../declare/node.d.ts" />
'use strict';
define(["require", "exports", '../../lib/system', '../../lib/extcp'], function (require, exports, System, Extcp) {
    var SimpleBuildResult = (function () {
        function SimpleBuildResult(workspaceRoot, callback, progress) {
            if (progress === void 0) { progress = null; }
            this.workspaceRoot = workspaceRoot;
            this.callback = callback;
            this.progress = progress;
            this.output = '';
            this.code = 0;
            this.killed = false;
        }
        SimpleBuildResult.prototype.write = function (data) {
            this.output += data;
            if (this.progress) {
                this.progress(data);
            }
        };
        SimpleBuildResult.prototype.done = function () {
            this.callback(this);
        };
        return SimpleBuildResult;
    })();
    /**
     * A base class for simple build systems that are command based like MSBuild and that are
     * not supporting incremental builds.
     */
    var SimpleBuildBuildSystem = (function () {
        function SimpleBuildBuildSystem() {
            this.activeBuilds = {};
            this.killedBuilds = {};
        }
        SimpleBuildBuildSystem.prototype.getConfiguration = function (request) {
            return System.Promise.as({});
        };
        SimpleBuildBuildSystem.prototype.kill = function (request) {
            var _this = this;
            // TODO@Dirk - onCancel?
            return new System.Promise(function (c, e, p) {
                var key = _this.createProcessKey(request.workspace);
                var result = {
                    status: 'failed'
                };
                var child = _this.activeBuilds[key];
                if (child) {
                    child.process.kill('SIGINT');
                    _this.killedBuilds[child.process.pid] = 'killed';
                    child.cancelled = true;
                    result.status = 'ok';
                }
                c(result);
            });
        };
        SimpleBuildBuildSystem.prototype.removeFromActiveBuilds = function (child) {
            var pid = child.pid;
            for (var key in this.activeBuilds) {
                if (this.activeBuilds.hasOwnProperty(key)) {
                    if (this.activeBuilds[key].process.pid === pid) {
                        delete this.activeBuilds[key];
                        return;
                    }
                }
            }
        };
        SimpleBuildBuildSystem.prototype.createProcessKey = function (workspace) {
            return workspace.id;
        };
        SimpleBuildBuildSystem.prototype.cancel = function (request) {
            return System.Promise.as(false);
        };
        SimpleBuildBuildSystem.prototype.shutdown = function (request) {
            return this.kill(request);
        };
        SimpleBuildBuildSystem.prototype.executeConsoleCommand = function (request, args) {
            // TODO@Dirk - onCancel?
            return new System.Promise(function (c, e, p) {
                p("This build type is currently not supported inside the console.");
                c({
                    code: -1
                });
            });
        };
        SimpleBuildBuildSystem.prototype._getBuildCommand = function (request) {
            throw new Error("Subclass to implement");
        };
        SimpleBuildBuildSystem.prototype._getBuildSystem = function () {
            throw new Error('Subclasses to implement');
        };
        SimpleBuildBuildSystem.prototype.build = function (request) {
            var _this = this;
            // TODO@Dirk - onCancel?
            return new System.Promise(function (c, e, p) {
                _this._getBuildCommand(request).then(function (command) {
                    var result = new SimpleBuildResult(request.workspace.toAbsolutePath(), c, p);
                    result.type = _this._getBuildSystem();
                    var cp = new Extcp.FileStreamingChildProcess(null, command.cmd, command.args, command.options, true);
                    cp.on('stdout', function (data) {
                        result.write(data);
                    });
                    cp.on('stderr', function (data) {
                        result.write(data);
                    });
                    cp.spawn(function (error, child) {
                        var key = _this.createProcessKey(request.workspace);
                        _this.activeBuilds[key] = {
                            process: child,
                            cancelled: false
                        };
                        var onExit = function (code) {
                            var killed = false;
                            if (_this.killedBuilds[child.pid]) {
                                killed = true;
                                delete _this.killedBuilds[child.pid];
                            }
                            _this.removeFromActiveBuilds(child);
                            result.killed = killed;
                            result.code = code;
                            result.done();
                        };
                        cp.on('error', function (error) {
                            onExit(1);
                        });
                        cp.on('exit', function (code) {
                            onExit(code);
                        });
                    });
                }, e);
            });
        };
        return SimpleBuildBuildSystem;
    })();
    exports.SimpleBuildBuildSystem = SimpleBuildBuildSystem;
});
