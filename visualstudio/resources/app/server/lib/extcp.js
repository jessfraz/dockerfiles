/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
/// <reference path='../declare/node.d.ts' />
'use strict';
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", 'fs', 'child_process', 'util', './node', './flow', './temp', './extfs', './process/process'], function (require, exports, fs, cp, util, node, flow, temp, extfs, processUtil) {
    var FakeStream = (function (_super) {
        __extends(FakeStream, _super);
        function FakeStream() {
            _super.apply(this, arguments);
            this.writable = true;
        }
        FakeStream.prototype.write = function (data) {
            if (!data) {
                return false;
            }
            if (typeof data !== 'string') {
                data = data.toString();
            }
            if (data.length) {
                this.emit('data', data);
            }
            return true;
        };
        FakeStream.prototype.end = function (data) {
            this.write(data);
            this.emit('end');
        };
        FakeStream.prototype.toString = function () {
            return 'FakeStream';
        };
        FakeStream.prototype.destroy = function () {
            // no op
        };
        FakeStream.prototype.destroySoon = function () {
            // no op
        };
        return FakeStream;
    })(node.Stream);
    exports.FakeStream = FakeStream;
    var FakeChildProcess = (function (_super) {
        __extends(FakeChildProcess, _super);
        function FakeChildProcess(stdout, stderr) {
            _super.call(this);
            this.pid = -1;
            this.stdout = stdout;
            this.stderr = stderr;
        }
        FakeChildProcess.prototype.exit = function (code) {
            this.stdout.end();
            this.stderr.end();
            this.emit('exit', { code: code });
        };
        FakeChildProcess.prototype.kill = function (signal) {
            this.emit('kill', signal);
            this.exit(1);
        };
        return FakeChildProcess;
    })(node.EventEmitter);
    exports.FakeChildProcess = FakeChildProcess;
    /**
     * This helper class will solve the issue of commands terminating before all output is flushed to the connected
     * stdout/stderr. This is done by using a file descriptor as pipe (files are blocking, so a command terminating
     * will have its output flushed to the file). The class polls constantly on the files used for output and emits
     * it as data events. If "usePolling" is set to false, the output will be retrieved in one chunk when the execution
     * is done.
     */
    var FileStreamingChildProcess = (function (_super) {
        __extends(FileStreamingChildProcess, _super);
        function FileStreamingChildProcess(wwwRoot, cmd, args, spawnOptions, usePolling) {
            if (spawnOptions === void 0) { spawnOptions = {}; }
            if (usePolling === void 0) { usePolling = true; }
            _super.call(this);
            this.wwwRoot = wwwRoot;
            this.cmd = cmd;
            this.args = args;
            this.spawnOptions = spawnOptions;
            // This flag controls if the stdout/stderr should be constantly polled for changes. If false,
            // the output will show up at once, without progress.
            this.usePolling = usePolling;
        }
        FileStreamingChildProcess.prototype.kill = function (signal, entireTree) {
            var _this = this;
            if (entireTree === void 0) { entireTree = false; }
            if (this.runningCommand) {
                if (entireTree) {
                    processUtil.getProcessTree(this.wwwRoot, this.runningCommand.pid, function (error, pids) {
                        if (error || !pids) {
                            _this.runningCommand.kill(signal);
                            return;
                        }
                        pids.forEach(function (pid) {
                            try {
                                process.kill(pid, signal);
                            }
                            catch (e) {
                            }
                        });
                    });
                }
                else {
                    this.runningCommand.kill(signal);
                }
            }
        };
        FileStreamingChildProcess.prototype.spawn = function (callback) {
            var $this = this;
            var stdoutFilePath, stderrFilePath, stdoutFd, stderrFd;
            flow.sequence(function onError(error) {
                $this.emit('exit', 1);
                if (callback) {
                    callback(error, null);
                }
            }, function createStdoutFile() {
                temp.createTempFile(null, this);
            }, function createStderrFile(stdoutFile) {
                stdoutFilePath = stdoutFile;
                temp.createTempFile(null, this);
            }, function openStdout(stderrFile) {
                stderrFilePath = stderrFile;
                fs.open(stdoutFilePath, 'w+', null, this);
            }, function openStderr(stdoutFdVal) {
                stdoutFd = stdoutFdVal;
                fs.open(stderrFilePath, 'w+', null, this);
            }, function runCommandAndReadOutput(stderrFdVal) {
                stderrFd = stderrFdVal;
                var stdoutDataEmitter = new extfs.FilePollingDataEmitter(stdoutFd);
                stdoutDataEmitter.on('data', function (data) {
                    $this.emit('stdout', data);
                });
                stdoutDataEmitter.start();
                var stderrDataEmitter = new extfs.FilePollingDataEmitter(stderrFd);
                stderrDataEmitter.on('data', function (data) {
                    $this.emit('stderr', data);
                });
                stderrDataEmitter.start();
                $this.spawnOptions.stdio = ['ignore', stdoutFd, stderrFd];
                $this.runningCommand = cp.spawn($this.cmd, $this.args, $this.spawnOptions);
                function onExitOrError(code, error) {
                    if ($this.terminated) {
                        return;
                    }
                    $this.terminated = true;
                    flow.sequence(function onError(error) {
                        $this.emit('exit', 1);
                    }, function closeStdoutDataEmitter() {
                        if ($this.usePolling) {
                            stdoutDataEmitter.close(this);
                        }
                        else {
                            this(null, null);
                        }
                    }, function closeStdout() {
                        fs.close(stdoutFd, this);
                    }, function closeStderrDataEmitter() {
                        if ($this.usePolling) {
                            stderrDataEmitter.close(this);
                        }
                        else {
                            this(null, null);
                        }
                    }, function closeStderr() {
                        fs.close(stderrFd, this);
                    }, function pumpStdout() {
                        if (!$this.usePolling) {
                            util.pump(fs.createReadStream(stdoutFilePath, { encoding: 'utf8' }), $this, this); // TODO@Ben remove util.pump
                        }
                        else {
                            this(null, null);
                        }
                    }, function pumpStderr() {
                        if (!$this.usePolling) {
                            util.pump(fs.createReadStream(stderrFilePath, { encoding: 'utf8' }), $this, this); // TODO@Ben remove util.pump
                        }
                        else {
                            this(null, null);
                        }
                    }, function deleteStdoutFile() {
                        fs.unlink(stdoutFilePath, this);
                    }, function deleteStderrFile() {
                        fs.unlink(stderrFilePath, this);
                    }, function exit() {
                        if (code !== null) {
                            $this.emit('exit', code);
                        }
                        else {
                            $this.emit('error', error);
                        }
                    });
                }
                $this.runningCommand.on('error', function (error) {
                    onExitOrError(null, error);
                });
                $this.runningCommand.on('exit', function (code) {
                    onExitOrError(code, null);
                });
                if (callback) {
                    callback(null, $this.runningCommand);
                }
            });
        };
        return FileStreamingChildProcess;
    })(node.EventEmitter);
    exports.FileStreamingChildProcess = FileStreamingChildProcess;
});
