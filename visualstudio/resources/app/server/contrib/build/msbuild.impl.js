/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
/// <reference path="../../declare/node.d.ts" />
'use strict';
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", 'path', '../../lib/pfs', '../../lib/system', './base.impl'], function (require, exports, path, pfs, System, Base) {
    var MSBuildBuildSystem = (function (_super) {
        __extends(MSBuildBuildSystem, _super);
        function MSBuildBuildSystem() {
            _super.apply(this, arguments);
        }
        MSBuildBuildSystem.prototype._getBuildCommand = function (request) {
            var _this = this;
            // TODO@Dirk - onCancel?
            return new System.Promise(function (c, e, p) {
                var command = request.server.options.msBuildPath;
                _this.getConfig(request).done(function (config) {
                    if (!config) {
                        e("Invalid MSBuild build request. No MSBuild configuration provided.");
                        return;
                    }
                    var project = config.project;
                    if (!project) {
                        e("Invalid MSBuild build request. No project property provided.");
                        return;
                    }
                    var buildargs = config.arguments;
                    var args = [];
                    args.push(project);
                    //if more than one build argument, push onto stack
                    if (buildargs) {
                        if (Array.isArray(buildargs)) {
                            buildargs.forEach(function (buildarg) {
                                args.push(buildarg);
                            });
                        }
                        else {
                            args.push(buildargs);
                        }
                    }
                    args.push('/consoleloggerparameters:NoSummary');
                    args.push('/property:TSC=' + path.join(request.server.options.wwwRoot, 'lib/typeScript/tsc'));
                    args.push('/property:GenerateFullPaths=true');
                    var cwd = request.workspace.toAbsolutePath();
                    var buildCommand = {
                        cmd: command,
                        args: args,
                        options: {
                            cwd: cwd
                        }
                    };
                    c(buildCommand);
                }, function (err) {
                    e(err);
                });
            });
        };
        MSBuildBuildSystem.prototype._getBuildSystem = function () {
            return {
                name: 'msbuild',
                errorPattern: MSBuildBuildSystem.MSBuildErrorPattern,
                taskPattern: MSBuildBuildSystem.MSBuildTaskPattern
            };
        };
        MSBuildBuildSystem.prototype.getConfig = function (request) {
            var msBuildFile = path.join(request.workspace.toAbsolutePath(), 'msbuild.xml');
            var msBuildConf = path.join(request.workspace.toAbsolutePath(), 'msbuild.json');
            return pfs.exists(msBuildFile).then(function (value) {
                if (value) {
                    return {
                        project: msBuildFile
                    };
                }
                return pfs.exists(msBuildConf).then(function (value) {
                    if (value) {
                        return pfs.readFile(msBuildConf).then(function (content) {
                            return JSON.parse(content);
                        });
                    }
                    else {
                        return undefined;
                    }
                });
            });
        };
        MSBuildBuildSystem.MSBuildErrorPattern = {
            // example line: Program.cs(11,17,11,21): error CS1519: Invalid token 'void' in class, struct, or interface member declaration [C:\vs-test-proj\ConsoleApplication1\ConsoleApplication1\ConsoleApplication1.csproj]
            pattern: '\\s*(.*)\\((\\d*),(\\d*).*\\):[^\\[]*:\\s*(.*)',
            matches: 5,
            file: 1,
            line: 2,
            column: 3,
            message: 4
        };
        // example line: "CoreCompile:"
        MSBuildBuildSystem.MSBuildTaskPattern = ':$';
        return MSBuildBuildSystem;
    })(Base.SimpleBuildBuildSystem);
    exports.MSBuildBuildSystem = MSBuildBuildSystem;
});
