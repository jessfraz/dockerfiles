/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
/// <reference path="../../declare/node.d.ts" />
/// <reference path="../../declare/express.d.ts" />
'use strict';
define(["require", "exports", '../../lib/system', './build'], function (require, exports, System, Build) {
    var BuildService = (function () {
        function BuildService() {
            this._currentBuildSystem = null;
        }
        BuildService.prototype.findBuildSystem = function (request) {
            var contributions = Build.BuildSystemRegistry.getContributions();
            if (contributions.length === 0)
                return System.Promise.as(null);
            var promises = [];
            contributions.forEach(function (contribution) {
                promises.push(contribution.canHandle(request));
            });
            return System.Promise.join(promises).then(function (values) {
                var candidates = [];
                for (var i = 0; i < values.length; i++) {
                    if (values[i]) {
                        candidates.push(contributions[i]);
                    }
                }
                if (candidates.length === 0)
                    return null;
                if (candidates.length === 1)
                    return candidates[0];
                candidates.sort(function (a, b) {
                    return b.priority - a.priority;
                });
                return candidates[0];
            });
        };
        BuildService.prototype.execute = function (request, action) {
            var _this = this;
            return this.findBuildSystem(request).then(function (buildSystemContribution) {
                if (buildSystemContribution === null)
                    return null;
                var promise = null;
                if (_this._currentBuildSystem !== null && _this._currentBuildSystem !== buildSystemContribution) {
                    promise = _this._currentBuildSystem.getBuildSystem(request).then(function (buildSystem) {
                        buildSystem.shutdown(request);
                    });
                }
                else {
                    promise = System.Promise.as(null);
                }
                return promise.then(function () {
                    _this._currentBuildSystem = buildSystemContribution;
                    return action(buildSystemContribution);
                });
            });
        };
        BuildService.prototype.name = function () {
            return 'buildService';
        };
        BuildService.prototype.build = function (request) {
            return this.execute(request, function (bsc) {
                return bsc.getBuildSystem(request).then(function (buildSystem) {
                    return buildSystem.build(request);
                });
            });
        };
        BuildService.prototype.getConfiguration = function (request) {
            return this.execute(request, function (bsc) {
                return bsc.getBuildSystem(request).then(function (buildSystem) {
                    return buildSystem.getConfiguration(request);
                });
            });
        };
        BuildService.prototype.cancel = function (request) {
            if (this._currentBuildSystem === null)
                return null;
            return this._currentBuildSystem.getBuildSystem(request).then(function (buildSystem) {
                return buildSystem.cancel(request);
            });
        };
        BuildService.prototype.kill = function (request) {
            if (this._currentBuildSystem === null)
                return null;
            return this._currentBuildSystem.getBuildSystem(request).then(function (buildSystem) {
                return buildSystem.kill(request);
            });
        };
        BuildService.prototype.getBuildSystemContribution = function (id) {
            var contributions = Build.BuildSystemRegistry.getContributions();
            if (contributions.length === 0)
                return null;
            for (var i = 0; i < contributions.length; i++) {
                if (id === contributions[i].id)
                    return contributions[i];
            }
            return null;
        };
        return BuildService;
    })();
    exports.buildService = new BuildService();
    function createBuildRequest(server, workspace, filter) {
        var result = {
            server: server,
            workspace: workspace
        };
        if (filter) {
            var delta = {
                changed: [filter]
            };
            result.delta = delta;
        }
        return result;
    }
    var nullErrorPattern = {
        pattern: '',
        matches: 0,
        file: 0,
        line: 0,
        column: 0,
        message: 0,
        columnZeroBased: true
    };
    var nullTaskPattern = '';
    function handleRequest(server, workspace, eventChannel, request) {
        var command = request.command;
        var requestId = request.requestId;
        if ('start' === command) {
            var buffer = null;
            var buildStarted = Date.now();
            exports.buildService.build(createBuildRequest(server, workspace, request.filter || null)).done(function (result) {
                if (buffer !== null) {
                    eventChannel.emit({
                        requestId: requestId,
                        logOutput: buffer.join('')
                    });
                    buffer = null;
                }
                if (result === null) {
                    eventChannel.emit({
                        requestId: requestId,
                        buildOutput: {
                            workspaceRoot: '',
                            output: "No build system configured. To configure a build system either add\na nakefile.js for a msbuild.xml file to the workspace root.",
                            code: 1,
                            type: {
                                name: 'nullBuildType',
                                errorPattern: nullErrorPattern,
                                taskPattern: nullTaskPattern
                            },
                            killed: false
                        }
                    });
                }
                else {
                    eventChannel.emit({
                        requestId: requestId,
                        logOutput: 'Build request finished in ' + ((Date.now() - buildStarted) / 1000) + ' seconds.'
                    });
                    eventChannel.emit({
                        requestId: requestId,
                        buildOutput: {
                            workspaceRoot: result.workspaceRoot,
                            output: '',
                            code: result.code,
                            type: result.type,
                            killed: result.killed
                        }
                    });
                }
            }, function (err) {
                eventChannel.emit({
                    requestId: requestId,
                    error: err
                });
            }, function (progress) {
                if (buffer) {
                    buffer.push(progress);
                }
                else {
                    buffer = [];
                    buffer.push(progress);
                    setTimeout(function () {
                        if (buffer !== null) {
                            eventChannel.emit({
                                requestId: requestId,
                                logOutput: buffer.join('')
                            });
                            buffer = null;
                        }
                    }, 500);
                }
            });
        }
        else if (command === 'kill') {
            exports.buildService.kill({ server: server, workspace: workspace }).done(function (result) {
                eventChannel.emit({
                    requestId: requestId,
                    killOutput: {
                        status: result.status
                    }
                });
            }, function (err) {
                eventChannel.emit({
                    requestId: requestId,
                    error: err
                });
            });
        }
    }
    exports.handleRequest = handleRequest;
});
