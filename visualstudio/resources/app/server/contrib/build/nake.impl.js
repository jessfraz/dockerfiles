/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
/// <reference path="../../declare/node.d.ts" />
/// <reference path="../../declare/optimist.d.ts" />
'use strict';
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", 'path', 'child_process', 'optimist', '../../lib/system', '../../lib/pfs'], function (require, exports, path, cp, optimist, System, pfs) {
    // https://github.com/joyent/node/commit/448eab2587d35893bb9c3c05464643b40d0ce600
    var NODE_PATH_SEPARATOR = process.platform === 'win32' ? ';' : ':';
    var TaskDescription = (function () {
        function TaskDescription(name, args) {
            if (args === void 0) { args = {}; }
            this.name = name;
            this.args = args;
        }
        TaskDescription.prototype.toJson = function () {
            var task = {
                name: this.name
            };
            if (this.args) {
                task.args = this.args;
            }
            return {
                command: 'executeTask',
                task: task
            };
        };
        TaskDescription.prototype.resolveConflict = function (other) {
            throw Error('Subclass responsibility');
        };
        TaskDescription.prototype.merge = function (other) {
            throw Error('Subclass responsibility');
        };
        TaskDescription.prototype.forceNewNakeInstance = function () {
            return false;
        };
        return TaskDescription;
    })();
    exports.TaskDescription = TaskDescription;
    // note: because of http://typescript.codeplex.com/workitem/619 this must not be at 
    // the beginning of the file
    (function (TaskConflictResolution) {
        TaskConflictResolution[TaskConflictResolution["IGNORE"] = 0] = "IGNORE";
        TaskConflictResolution[TaskConflictResolution["ADD"] = 1] = "ADD";
        TaskConflictResolution[TaskConflictResolution["REPLACE"] = 2] = "REPLACE";
        TaskConflictResolution[TaskConflictResolution["MERGE"] = 3] = "MERGE";
        TaskConflictResolution[TaskConflictResolution["CONTINUE"] = 4] = "CONTINUE";
    })(exports.TaskConflictResolution || (exports.TaskConflictResolution = {}));
    var TaskConflictResolution = exports.TaskConflictResolution;
    var BuildConfigurationTaskDescription = (function (_super) {
        __extends(BuildConfigurationTaskDescription, _super);
        function BuildConfigurationTaskDescription() {
            _super.call(this, 'buildConfiguration');
        }
        BuildConfigurationTaskDescription.prototype.resolveConflict = function (other) {
            return TaskConflictResolution.ADD;
        };
        BuildConfigurationTaskDescription.prototype.merge = function (other) {
        };
        return BuildConfigurationTaskDescription;
    })(TaskDescription);
    var GenericTaskDescription = (function (_super) {
        __extends(GenericTaskDescription, _super);
        function GenericTaskDescription(name, args) {
            _super.call(this, name, args);
        }
        GenericTaskDescription.prototype.resolveConflict = function (other) {
            return TaskConflictResolution.ADD;
        };
        GenericTaskDescription.prototype.merge = function (other) {
        };
        return GenericTaskDescription;
    })(TaskDescription);
    var CommandDescription = (function (_super) {
        __extends(CommandDescription, _super);
        function CommandDescription(name, args) {
            _super.call(this, name, args);
        }
        CommandDescription.prototype.toJson = function () {
            var task = {
                name: this.name
            };
            if (this.args) {
                task.args = this.args;
            }
            return {
                command: 'executeCommand',
                task: task
            };
        };
        CommandDescription.prototype.resolveConflict = function (other) {
            return TaskConflictResolution.ADD;
        };
        CommandDescription.prototype.merge = function (other) {
        };
        return CommandDescription;
    })(TaskDescription);
    var FullBuildTaskDescription = (function (_super) {
        __extends(FullBuildTaskDescription, _super);
        function FullBuildTaskDescription(args) {
            _super.call(this, 'fullBuild', args);
        }
        FullBuildTaskDescription.prototype.resolveConflict = function (other) {
            if (other instanceof FullBuildTaskDescription || other instanceof IncrementalBuildTaskDescription) {
                return TaskConflictResolution.IGNORE;
            }
            return TaskConflictResolution.ADD;
        };
        FullBuildTaskDescription.prototype.merge = function (other) {
        };
        FullBuildTaskDescription.prototype.forceNewNakeInstance = function () {
            return true;
        };
        return FullBuildTaskDescription;
    })(TaskDescription);
    var IncrementalBuildTaskDescription = (function (_super) {
        __extends(IncrementalBuildTaskDescription, _super);
        function IncrementalBuildTaskDescription(args) {
            _super.call(this, 'incrementalBuild', args);
        }
        IncrementalBuildTaskDescription.prototype.toJson = function () {
            var result = _super.prototype.toJson.call(this);
            result.task.alternativeName = 'fullBuild';
            return result;
        };
        IncrementalBuildTaskDescription.prototype.resolveConflict = function (other) {
            if (other instanceof FullBuildTaskDescription) {
                return TaskConflictResolution.REPLACE;
            }
            else if (other instanceof IncrementalBuildTaskDescription) {
                return TaskConflictResolution.MERGE;
            }
            return TaskConflictResolution.ADD;
        };
        IncrementalBuildTaskDescription.prototype.merge = function (other) {
            var thisChangedFiles = {};
            var thisDelta = this.args.delta;
            thisDelta.changed.forEach(function (file) {
                thisChangedFiles[file] = true;
            });
            var otherDelta = other.args.delta;
            otherDelta.changed.forEach(function (file) {
                if (!thisChangedFiles[file]) {
                    thisDelta.changed.push(file);
                }
            });
        };
        return IncrementalBuildTaskDescription;
    })(TaskDescription);
    var BuildResult = (function () {
        function BuildResult(workspaceRoot, callback, progress) {
            if (progress === void 0) { progress = null; }
            this.workspaceRoot = workspaceRoot;
            this.callback = callback;
            this.progress = progress;
            this.output = '';
            this.code = 0;
            this.killed = false;
        }
        BuildResult.prototype.write = function (data) {
            this.output += data;
            if (this.progress) {
                this.progress(data);
            }
        };
        BuildResult.prototype.unqueued = function () {
            this.output = '';
            this.code = 0;
            this.type = null;
            this.killed = true;
            this.callback(this);
        };
        BuildResult.prototype.done = function () {
            this.callback(this);
        };
        return BuildResult;
    })();
    var NakeBuildInfo = (function () {
        function NakeBuildInfo(request, taskDescription, callback, progress) {
            this.request = request;
            this.taskDescription = taskDescription;
            this.result = new BuildResult(request.workspace.toAbsolutePath(), callback, progress);
            this.token = NakeBuildInfo.TOKEN_COUNTER++;
        }
        NakeBuildInfo.prototype.write = function (data) {
            this.result.write(data);
        };
        NakeBuildInfo.prototype.setCode = function (code) {
            this.result.code = code;
        };
        NakeBuildInfo.prototype.setKilled = function () {
            this.result.killed = true;
        };
        NakeBuildInfo.prototype.setCanceled = function () {
            this.result.killed = true;
        };
        NakeBuildInfo.prototype.unqueued = function () {
            this.result.unqueued();
        };
        NakeBuildInfo.prototype.done = function (buildSystem) {
            this.result.type = buildSystem.toJson();
            this.result.done();
        };
        NakeBuildInfo.TOKEN_COUNTER = 0;
        return NakeBuildInfo;
    })();
    var NakeProcess = (function () {
        function NakeProcess(key, owner, server, options) {
            if (options === void 0) { options = null; }
            this.nake = null;
            this.activeBuild = null;
            this.queue = [];
            this.key = key;
            this.owner = owner;
            this.server = server;
            this.options = options;
        }
        NakeProcess.prototype.startNake = function (workspaceRoot) {
            var _this = this;
            var args = [];
            var nakeModule = path.join(this.server.options.wwwRoot, '..', 'node_modules', 'nake', 'nake.js');
            args.push('--workspaceRoot');
            args.push(workspaceRoot);
            if (this.options !== null) {
                Object.keys(this.options).forEach(function (key) {
                    args.push('--' + key);
                    args.push(_this.options[key]);
                });
            }
            args.push('--forked');
            args.push(true);
            var env = {};
            Object.keys(process.env).forEach(function (key) {
                env[key] = process.env[key];
            });
            env['NODE_PATH'] = path.join(this.server.options.wwwRoot, 'contrib', 'typescript', 'build');
            var launchOptions = {
                silent: true,
                cwd: workspaceRoot,
                execArgv: [],
                env: env
            };
            this.nake = cp.fork(nakeModule, args, launchOptions);
            this.nake.on('message', function (message) {
                var command = message.command;
                if ('done' === command) {
                    // console.log('Build done (' + this.activeBuild.token + ')');
                    _this.activeBuild.setCode(message.code);
                    _this.activeBuild.done(_this.owner);
                    _this.activeBuild = null;
                    if (_this.queue.length > 0) {
                        process.nextTick(function () {
                            _this.executeNextRequest();
                        });
                    }
                }
                else if ('stdout' === command || 'stderr' === command) {
                    if (_this.activeBuild === null) {
                        console.error('Received ' + command + ' data after done message: ' + message.data);
                    }
                    else {
                        _this.activeBuild.write(message.data);
                    }
                }
            });
            this.nake.stdout.on('data', function (data) {
                // still read the data to read the kernal buffers
                // but don't do anything with it. All stdout and stderr
                // is send via the message channel
                // if (this.activeRequest === null) {
                //	console.error('Received out data after done message: ' + data.toString());
                // } else {
                //	this.activeRequest.write(data);			
                // }
            });
            this.nake.stderr.on('data', function (data) {
                // still read the data to read the kernal buffers
                // but don't do anything with it. All stdout and stderr
                // is send via the message channel
                // if (this.activeRequest === null) {
                //	console.error('Received err data after done message: ' + data.toString());
                // } else {
                //	this.activeRequest.write(data);
                // }
            });
            this.nake.on('error', function (error) {
                _this.server.logger.warn("nake execution error: " + error.toString());
            });
            this.nake.on('exit', function (code) {
                if (_this.activeBuild) {
                    _this.activeBuild.setCode(code);
                    if (_this.owner.isKilled(_this)) {
                        _this.activeBuild.setKilled();
                    }
                    _this.activeBuild.done(_this.owner);
                }
                _this.activeBuild = null;
                _this.queue = [];
                _this.owner.died(_this);
                _this.nake = null;
            });
        };
        NakeProcess.prototype.queueRequest = function (request, taskDescription, callback, progress) {
            var newBuild = new NakeBuildInfo(request, taskDescription, callback, progress);
            if (this.queue.length === 0) {
                this.queue.push(newBuild);
            }
            else if (taskDescription instanceof FullBuildTaskDescription) {
                this.queue.forEach(function (buildInfo) {
                    buildInfo.unqueued();
                });
                this.queue = [];
                this.queue.push(newBuild);
            }
            else {
                for (var i = 0; i < this.queue.length; i++) {
                    var ctd = this.queue[i].taskDescription;
                    switch (ctd.resolveConflict(taskDescription)) {
                        case TaskConflictResolution.IGNORE:
                            // console.log('Ignore new request: ' + taskDescription);
                            newBuild.unqueued();
                            return;
                        case TaskConflictResolution.ADD:
                            // console.log('Add new request: ' + taskDescription);
                            this.queue.push(newBuild);
                            return;
                        case TaskConflictResolution.REPLACE:
                            // console.log('Replace new request: ' + taskDescription);
                            this.queue[i].unqueued();
                            this.queue[i] = newBuild;
                            return;
                        case TaskConflictResolution.MERGE:
                            // console.log('Merge new request: ' + taskDescription);					
                            ctd.merge(taskDescription);
                            newBuild.unqueued();
                            return;
                        case TaskConflictResolution.CONTINUE:
                    }
                }
                // console.log('Add new request: ' + taskDescription);
                this.queue.push(newBuild);
            }
        };
        NakeProcess.prototype.executeNextRequest = function () {
            if (this.queue.length === 0 || this.activeBuild !== null)
                return;
            this.activeBuild = this.queue.shift();
            // console.log('Requesting build (' + this.activeBuild.token + '): ' + JSON.stringify(this.activeBuild.taskDescription.toJson()));
            this.send(this.activeBuild.taskDescription.toJson());
            this.lastUsed = new Date();
        };
        NakeProcess.prototype.getKey = function () {
            return this.key;
        };
        NakeProcess.prototype.getLastUsed = function () {
            return this.lastUsed;
        };
        NakeProcess.prototype.isActive = function () {
            if (this.nake === null || (this.activeBuild === null && this.queue.length === 0))
                return false;
            return true;
        };
        NakeProcess.prototype.getPid = function () {
            if (this.nake) {
                return this.nake.pid;
            }
            else {
                return -1;
            }
        };
        NakeProcess.prototype.execute = function (request, taskDescription, callback, progress) {
            if (!taskDescription)
                throw new Error('Task description must not be null');
            if (this.nake === null) {
                this.startNake(request.workspace.toAbsolutePath());
            }
            this.queueRequest(request, taskDescription, callback, progress);
            if (this.activeBuild === null) {
                this.executeNextRequest();
            }
        };
        NakeProcess.prototype.cancel = function () {
            if (this.activeBuild !== null) {
                this.activeBuild.setCanceled();
                this.send({
                    command: 'cancel'
                });
            }
        };
        NakeProcess.prototype.kill = function () {
            if (!this.nake) {
                this.owner.died(this);
                return;
            }
            // For now really kill the build. However we should think about
            // sending an exit command first and send the kill only if the
            // exit doesn't work. That would allow the build system to write
            // some state to disk.
            this.nake.kill('SIGINT');
        };
        NakeProcess.prototype.send = function (message) {
            if (!this.nake)
                return;
            this.nake.send(message);
        };
        return NakeProcess;
    })();
    exports.NakeProcess = NakeProcess;
    var NakeProcessMap = (function () {
        function NakeProcessMap() {
            this._size = 0;
            this._elements = {};
        }
        NakeProcessMap.prototype.get = function (key) {
            return this._elements[key];
        };
        NakeProcessMap.prototype.put = function (key, process) {
            var old = this._elements[key];
            if (!old) {
                this._size++;
            }
            this._elements[key] = process;
            return old;
        };
        NakeProcessMap.prototype.remove = function (key) {
            var current = this._elements[key];
            if (current) {
                this._size--;
            }
            delete this._elements[key];
            return current;
        };
        NakeProcessMap.prototype.size = function () {
            return this._size;
        };
        NakeProcessMap.prototype.findRemovable = function () {
            var _this = this;
            var candidates = [];
            Object.keys(this._elements).forEach(function (key) {
                var nakeProcess = _this._elements[key];
                if (!nakeProcess.isActive()) {
                    candidates.push(nakeProcess);
                }
            });
            if (candidates.length === 0)
                return null;
            candidates.sort(function (a, b) {
                return a.getLastUsed().getTime() - b.getLastUsed().getTime();
            });
            return candidates[0];
        };
        return NakeProcessMap;
    })();
    var NakeBuildSystem = (function () {
        function NakeBuildSystem() {
            this.nakeFileTimestamp = null;
            this.nakeProcesses = new NakeProcessMap();
            this.killedBuilds = {};
        }
        NakeBuildSystem.prototype.toJson = function () {
            return {
                name: this.getName(),
                errorPattern: NakeBuildSystem.TypeScriptErrorPattern,
                taskPattern: NakeBuildSystem.TypeScriptTaskPattern
            };
        };
        NakeBuildSystem.prototype.getName = function () {
            return 'nake';
        };
        NakeBuildSystem.prototype.createProcessKey = function (workspace) {
            return workspace.id;
        };
        NakeBuildSystem.prototype.getNakeProcess = function (workspace) {
            return this.nakeProcesses.get(this.createProcessKey(workspace));
        };
        NakeBuildSystem.prototype.createNakeProcess = function (request, options) {
            var key = this.createProcessKey(request.workspace);
            if (this.nakeProcesses.size() >= NakeBuildSystem.MAX_NAKE_PROCESSES) {
                var toRemove = this.nakeProcesses.findRemovable();
                if (toRemove !== null) {
                    this.nakeProcesses.remove(toRemove.getKey());
                    toRemove.kill();
                    this.killedBuilds[toRemove.getKey()] = toRemove;
                }
            }
            var result = new NakeProcess(key, this, request.server, options);
            this.nakeProcesses.put(key, result);
            return result;
        };
        NakeBuildSystem.prototype.getOptions = function (request) {
            return System.Promise.as({
                file: path.join(request.workspace.toAbsolutePath(), 'nakefile.js')
            });
        };
        NakeBuildSystem.prototype.getTaskDescription = function (request) {
            if (request.delta) {
                return new IncrementalBuildTaskDescription({ delta: request.delta });
            }
            else {
                return new FullBuildTaskDescription({});
            }
        };
        NakeBuildSystem.prototype.internalExecuteTask = function (request, executeOptions) {
            var _this = this;
            // TODO@Dirk - onCancel?
            return new System.Promise(function (c, e, p) {
                _this.getOptions(request).then(function (options) {
                    var file = options.file;
                    pfs.stat(file).then(function (stat) {
                        var taskDescription = executeOptions.taskDescription(request);
                        if (taskDescription.forceNewNakeInstance() || (_this.nakeFileTimestamp !== null && _this.nakeFileTimestamp !== stat.mtime.getTime())) {
                            _this.shutdown(request);
                        }
                        _this.nakeFileTimestamp = stat.mtime.getTime();
                        var nakeProcess = _this.getNakeProcess(request.workspace);
                        if (!nakeProcess) {
                            nakeProcess = _this.createNakeProcess(request, options);
                        }
                        nakeProcess.execute(request, taskDescription, c, p);
                    }, e).done(null, e);
                }, e).done(null, e);
            });
        };
        NakeBuildSystem.prototype.executeConsoleCommand = function (request, args) {
            var argv = optimist.parse(args);
            if (argv.tasks || argv.t) {
                return this.internalExecuteTask(request, {
                    taskDescription: function (request) { return new CommandDescription('tasks', []); },
                    clearRequest: function () { return null; }
                });
            }
            else if (argv._ && argv._.length === 1) {
                return this.internalExecuteTask(request, {
                    taskDescription: function (request) { return new GenericTaskDescription(argv._[0], {}); },
                    clearRequest: function () { return null; }
                });
            }
            else {
                // TODO@Dirk - onCancel?
                return new System.Promise(function (c, e, p) {
                    p("Unknown console command: " + args.join(' '));
                    c({
                        code: -1
                    });
                });
            }
        };
        NakeBuildSystem.prototype.getConfiguration = function (request) {
            return this.internalExecuteTask(request, {
                taskDescription: function (request) {
                    return new BuildConfigurationTaskDescription();
                },
                clearRequest: function () {
                }
            });
        };
        NakeBuildSystem.prototype.build = function (request) {
            var _this = this;
            return this.internalExecuteTask(request, {
                taskDescription: function (request) {
                    return _this.getTaskDescription(request);
                },
                clearRequest: function () {
                    request.delta = null;
                }
            });
        };
        NakeBuildSystem.prototype.shutdown = function (request) {
            var nakeProcess = this.getNakeProcess(request.workspace);
            if (!nakeProcess)
                return System.Promise.as(undefined);
            this.nakeProcesses.remove(nakeProcess.getKey());
            nakeProcess.kill();
            this.killedBuilds[nakeProcess.getKey()] = nakeProcess;
            // ToDo@dirkb for now we simply return a promise since we don't
            // need to wait for the acutal shutdown. However if we need to
            // we need to react on the died call.
            return System.Promise.as(undefined);
        };
        NakeBuildSystem.prototype.cancel = function (request) {
            var nakeProcess = this.getNakeProcess(request.workspace);
            if (nakeProcess === null)
                return;
            nakeProcess.cancel();
            return System.Promise.as(null);
        };
        NakeBuildSystem.prototype.kill = function (request) {
            var _this = this;
            // TODO@Dirk - onCancel?
            return new System.Promise(function (c, e, p) {
                var nakeProcess = _this.getNakeProcess(request.workspace);
                if (nakeProcess) {
                    nakeProcess.cancel();
                }
                var result = {
                    status: 'failed'
                };
                c(result);
            });
        };
        NakeBuildSystem.prototype.isKilled = function (nakeProcess) {
            var key = nakeProcess.getKey();
            return !!this.killedBuilds[key];
        };
        NakeBuildSystem.prototype.died = function (nakeProcess) {
            var key = nakeProcess.getKey();
            // Did we request the kill
            if (this.killedBuilds[key]) {
                delete this.killedBuilds[key];
            }
            else {
                // console.error('Nake Process ' + nakeProcess.getPid() + ' died unexpected.');
                this.nakeProcesses.remove(key);
            }
        };
        NakeBuildSystem.MAX_NAKE_PROCESSES = 30;
        NakeBuildSystem.TypeScriptErrorPattern = {
            // example line: "languages/typescript/src/typescript.str(19,10): Unresolved symbol tokenMap"
            pattern: '(SyntaxError:)*\\s*(.*)\\((\\d*),(\\d*)\\):\\s*(.*)',
            matches: 6,
            file: 2,
            line: 3,
            column: 4,
            message: 5,
            columnZeroBased: true
        };
        // example line: "[11:08:43] Compiling..."
        NakeBuildSystem.TypeScriptTaskPattern = '\\.\\.\\.$';
        return NakeBuildSystem;
    })();
    exports.NakeBuildSystem = NakeBuildSystem;
    var LegacyBuildSystem = (function (_super) {
        __extends(LegacyBuildSystem, _super);
        function LegacyBuildSystem() {
            _super.call(this);
        }
        LegacyBuildSystem.prototype.getOptions = function (request) {
            return this.getBuildConfigFile(request).then(function (config) {
                if (!config) {
                    throw new Error("Unable to read configuration file");
                }
                request.optionalData = config;
                var workspaceRoot = request.workspace.toAbsolutePath();
                var result = {
                    monacoBuildFile: config.buildFile,
                    file: path.join(request.server.options.wwwRoot, 'lib/build/legacyCompile.js')
                };
                return result;
            });
        };
        LegacyBuildSystem.prototype.isMetaFile = function (delta) {
            if (!delta.changed)
                return false;
            var changed = delta.changed;
            for (var i = 0; i < changed.length; i++) {
                var file = changed[i];
                if (file.indexOf(LegacyBuildSystem.MONACO_BUILD_JSON) === file.length - LegacyBuildSystem.MONACO_BUILD_JSON.length || file.indexOf(LegacyBuildSystem.BUILD_JSON) === file.length - LegacyBuildSystem.BUILD_JSON.length || file.indexOf(LegacyBuildSystem.MANIFEST_JSON) === file.length - LegacyBuildSystem.MANIFEST_JSON.length)
                    return true;
            }
        };
        LegacyBuildSystem.prototype.executeConsoleCommand = function (request, args) {
            var argv = optimist.parse(args);
            if (argv._ && argv._.length === 1) {
                var taskName = argv._[0];
                if ('fullBuild' === taskName) {
                    return this.internalExecuteTask(request, {
                        taskDescription: function (request) { return new FullBuildTaskDescription({ buildType: 'selfhost' }); },
                        clearRequest: function () { return null; }
                    });
                }
                else if ('incrementalBuild' === taskName) {
                    return this.internalExecuteTask(request, {
                        taskDescription: function (request) { return new IncrementalBuildTaskDescription({ buildType: 'selfhost', delta: {} }); },
                        clearRequest: function () { return null; }
                    });
                }
            }
            return _super.prototype.executeConsoleCommand.call(this, request, args);
        };
        LegacyBuildSystem.prototype.getTaskDescription = function (request) {
            var config = request.optionalData;
            if (request.delta && !this.isMetaFile(request.delta)) {
                return new IncrementalBuildTaskDescription({ buildType: config.content.type, delta: request.delta });
            }
            else {
                return new FullBuildTaskDescription({ buildType: config.content.type });
            }
        };
        LegacyBuildSystem.prototype.getConfiguration = function (request) {
            return this.getBuildConfigFile(request).then(function (content) {
                var config = content.buildConfiguration;
                if (!config) {
                    return null;
                }
                return config[request.id] || null;
            });
        };
        LegacyBuildSystem.prototype.getBuildConfigFile = function (request) {
            var monacoBuildFile = path.join(request.workspace.toAbsolutePath(), 'monaco.build.json');
            var buildFile = path.join(request.workspace.toAbsolutePath(), 'build.json');
            return pfs.exists(monacoBuildFile).then(function (value) {
                if (value) {
                    return pfs.readFile(monacoBuildFile).then(function (content) {
                        return {
                            buildFile: monacoBuildFile,
                            content: JSON.parse(content)
                        };
                    });
                }
                else {
                    return pfs.exists(buildFile).then(function (value) {
                        if (value) {
                            return pfs.readFile(buildFile).then(function (content) {
                                return {
                                    buildFile: buildFile,
                                    content: JSON.parse(content)
                                };
                            });
                        }
                        else {
                            return undefined;
                        }
                    });
                }
            });
        };
        LegacyBuildSystem.BUILD_JSON = 'build.json';
        LegacyBuildSystem.MONACO_BUILD_JSON = 'monaco.build.json';
        LegacyBuildSystem.MANIFEST_JSON = 'manifest.json';
        return LegacyBuildSystem;
    })(NakeBuildSystem);
    exports.LegacyBuildSystem = LegacyBuildSystem;
});
