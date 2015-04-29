/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
/// <reference path="../../declares.d.ts" />
'use strict';
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", 'vs/base/lifecycle', 'child_process', 'http', 'path', 'readline', './omnisharpLauncher.native', '../omnisharp', 'monaco'], function (require, exports, lifecycle, cp, http, path, readline, omnisharpLauncher, omnisharp, monaco) {
    var SimpleListenersListItem = (function () {
        function SimpleListenersListItem(papa, token, listener) {
            this._papa = papa;
            this._token = token;
            this._listener = listener;
        }
        SimpleListenersListItem.prototype.dispose = function () {
            if (this._papa) {
                this._papa._removeSimpleListenersListItem(this);
                this._papa = null;
            }
            this._token = -1;
            this._listener = null;
        };
        return SimpleListenersListItem;
    })();
    var SimpleListenersList = (function () {
        function SimpleListenersList() {
            this._lastListenerToken = 0;
            this._listeners = [];
        }
        SimpleListenersList.prototype.addSimpleListener = function (listener) {
            var list = new SimpleListenersListItem(this, (++this._lastListenerToken), listener);
            this._listeners.push(list);
            return list;
        };
        SimpleListenersList.prototype._removeSimpleListenersListItem = function (list) {
            for (var i = 0; i < this._listeners.length; i++) {
                if (this._listeners[i] === list) {
                    this._listeners.splice(i, 1);
                    break;
                }
            }
        };
        SimpleListenersList.prototype.getAllListeners = function () {
            return this._listeners.map(function (l) { return l._listener; });
        };
        return SimpleListenersList;
    })();
    var OmnisharpServer = (function () {
        function OmnisharpServer() {
            this._state = omnisharp.ServerState.Stopped;
            this._queue = [];
            this._isProcessingQueue = false;
            this._listeners = new SimpleListenersList();
            this._extraArgv = [];
        }
        OmnisharpServer.prototype.addListener = function (listener) {
            return this._listeners.addSimpleListener(listener);
        };
        OmnisharpServer.prototype.getState = function () {
            return this._state;
        };
        OmnisharpServer.prototype.setState = function (value) {
            if (typeof value !== 'undefined' && value !== this._state) {
                this._state = value;
                this._fireEvent('stateChanged', this._state);
            }
        };
        OmnisharpServer.prototype._fireEvent = function (type, args) {
            var listeners = this._listeners.getAllListeners();
            for (var i = 0; i < listeners.length; i++) {
                listeners[i].onOmnisharpServerEvent(type, args);
            }
        };
        OmnisharpServer.prototype._fireStdout = function (str) {
            this._fireEvent('stdout', String(str));
        };
        OmnisharpServer.prototype._fireStderr = function (str) {
            this._fireEvent('stderr', String(str));
        };
        OmnisharpServer.prototype.start = function (solutionPath) {
            if (!this._start) {
                this._start = this._doStart(solutionPath);
            }
            return this._start;
        };
        OmnisharpServer.prototype._doStart = function (solutionPath) {
            var _this = this;
            this.setState(omnisharp.ServerState.Starting);
            var cwd = path.dirname(solutionPath), argv = ['-s', solutionPath, '--hostPID', process.pid.toString(), 'aspnet5:enablePackageRestore=false'].concat(this._extraArgv);
            this._fireStdout("Starting OmniSharp at '" + solutionPath + "'...\n");
            return omnisharpLauncher(cwd, argv).then(function (cp) {
                _this._serverProcess = cp;
                return _this._doConnect();
            }).then(function (_) {
                _this.setState(omnisharp.ServerState.Started);
                _this._processQueue();
            });
        };
        OmnisharpServer.prototype._doConnect = function () {
            throw new Error('implement me');
            // wait for /checkreadystatus
        };
        OmnisharpServer.prototype.stop = function () {
            var _this = this;
            var ret;
            if (!this._serverProcess) {
                // nothing to kill
                ret = monaco.Promise.as(undefined);
            }
            else if (/^win/.test(process.platform)) {
                // when killing a process in windows its child
                // processes are *not* killed but become root
                // processes. Therefore we use TASKKILL.EXE
                ret = new monaco.Promise(function (c, e) {
                    var killer = cp.exec("taskkill /F /T /PID " + _this._serverProcess.pid, function (err, stdout, stderr) {
                        if (err) {
                            return e(err);
                        }
                    });
                    killer.on('exit', c);
                    killer.on('error', e);
                });
            }
            else {
                this._serverProcess.kill('SIGTERM');
                ret = monaco.Promise.as(undefined);
            }
            return ret.then(function (_) {
                _this._start = null;
                _this._serverProcess = null;
                _this.setState(omnisharp.ServerState.Stopped);
                return;
            });
        };
        OmnisharpServer.prototype.makeRequest = function (path, data) {
            var _this = this;
            if (this.getState() === omnisharp.ServerState.Stopped) {
                return monaco.Promise.wrapError('server has been stopped or not started');
            }
            var request;
            return new monaco.Promise(function (c, e) {
                request = {
                    path: path,
                    data: data,
                    onSuccess: c,
                    onError: e,
                    _enqueued: Date.now()
                };
                _this._queue.push(request);
                _this._statOnRequestStart(request);
                if (_this.getState() === omnisharp.ServerState.Started && !_this._isProcessingQueue) {
                    _this._processQueue();
                }
            }, function () {
                var idx = _this._queue.indexOf(request);
                if (idx !== -1) {
                    _this._queue.splice(idx, 1);
                }
            });
        };
        OmnisharpServer.prototype._processQueue = function () {
            var _this = this;
            if (this._queue.length === 0) {
                // nothing to do
                this._isProcessingQueue = false;
                return;
            }
            // signal that we are working on it
            this._isProcessingQueue = true;
            // send next request and recurse when done
            var thisRequest = this._queue.shift();
            this._makeNextRequest(thisRequest.path, thisRequest.data).then(function (value) {
                thisRequest.onSuccess(value);
                _this._processQueue();
                _this._statOnRequestEnd(thisRequest, true);
            }, function (err) {
                thisRequest.onError(err);
                _this._processQueue();
                _this._statOnRequestEnd(thisRequest, false);
            }).done(null, function (err) {
                console.error(err);
                _this._processQueue();
            });
        };
        OmnisharpServer.prototype._makeNextRequest = function (path, data) {
            throw new Error('implement me');
        };
        OmnisharpServer.prototype._statOnRequestStart = function (request) {
            console.log("[DEBUG] *enqueuing* request '" + request.path + "' (queue size is " + this._queue.length + ")\n");
        };
        OmnisharpServer.prototype._statOnRequestEnd = function (request, successfully) {
            var duration = Date.now() - request._enqueued, state = successfully ? 'successfully' : 'with errors';
            console.log("[DEBUG] request '" + request.path + "' finished *" + state + "* after " + duration + "ms\n");
        };
        return OmnisharpServer;
    })();
    exports.OmnisharpServer = OmnisharpServer;
    var HttpOmnisharpServer = (function (_super) {
        __extends(HttpOmnisharpServer, _super);
        function HttpOmnisharpServer() {
            _super.call(this);
            this._port = 37000 + Math.floor(Math.random() * 1000);
            // extra argv
            this._extraArgv.push('-p');
            this._extraArgv.push(this._port.toString());
        }
        HttpOmnisharpServer.prototype._doConnect = function () {
            var _this = this;
            // wait for /checkreadystatus
            return new monaco.Promise(function (c, e) {
                // forward console output
                _this._serverProcess.stdout.on('data', _this._fireStdout.bind(_this));
                _this._serverProcess.stderr.on('data', _this._fireStderr.bind(_this));
                var count = 0, handle, lastError, t1 = Date.now();
                handle = setInterval(function () {
                    if (++count > 250) {
                        clearInterval(handle);
                        _this.stop();
                        return e(lastError || new Error('Omniserver NOT getting ready (tried for ' + (Date.now() - t1) / 1000 + 'seconds)...'));
                    }
                    _this.makeRequest('/checkreadystatus').then(function (ready) {
                        if (ready) {
                            clearInterval(handle);
                            c(_this);
                        }
                        lastError = null;
                    }, function (err) {
                        lastError = err;
                    });
                }, 500);
            });
        };
        HttpOmnisharpServer.prototype._makeNextRequest = function (path, data) {
            var _this = this;
            return new monaco.Promise(function (c, e) {
                var options = {
                    hostname: 'localhost',
                    port: _this._port,
                    path: path,
                    method: 'POST',
                    headers: {
                        'Connection': 'keep-alive',
                        'Content-Type': 'application/json'
                    }
                };
                var req = http.request(options, function (res) {
                    var b = '';
                    res.setEncoding('utf8');
                    res.on('data', function (chunk) {
                        b += chunk.toString();
                    });
                    res.on('end', function () {
                        if (!b) {
                            return c(null);
                        }
                        var data;
                        try {
                            data = JSON.parse(b);
                        }
                        catch (err) {
                            data = null;
                        }
                        c(data);
                    });
                });
                req.on('error', e);
                if (typeof data !== 'undefined') {
                    req.write(JSON.stringify(data));
                }
                req.end();
            });
        };
        return HttpOmnisharpServer;
    })(OmnisharpServer);
    exports.HttpOmnisharpServer = HttpOmnisharpServer;
    var StdioOmnisharpServer = (function (_super) {
        __extends(StdioOmnisharpServer, _super);
        function StdioOmnisharpServer() {
            _super.call(this);
            this._activeRequest = Object.create(null);
            this._callOnStop = [];
            // extra argv
            this._extraArgv.push('--stdio');
        }
        StdioOmnisharpServer.prototype.stop = function () {
            this._callOnStop = lifecycle.cAll(this._callOnStop);
            return _super.prototype.stop.call(this);
        };
        StdioOmnisharpServer.prototype._doConnect = function () {
            var _this = this;
            this._serverProcess.stderr.on('data', this._fireStderr.bind(this));
            this._rl = readline.createInterface({
                input: this._serverProcess.stdout,
                output: this._serverProcess.stdin,
                terminal: false
            });
            this._startListening();
            return this._awaitLine(function (line) { return line === 'Solution has finished loading'; }, StdioOmnisharpServer.StartupTimeout).then(function (_) { return _this; });
        };
        StdioOmnisharpServer.prototype._startListening = function () {
            var _this = this;
            var onLineReceived = function (line) {
                if (line[0] !== '{') {
                    return;
                }
                var packet;
                try {
                    packet = JSON.parse(line);
                }
                catch (e) {
                    // not json
                    return;
                }
                if (!packet.Type) {
                    // bogous packet
                    return;
                }
                switch (packet.Type) {
                    case 'response':
                        _this._handleResponsePacket(packet);
                        break;
                    case 'event':
                        _this._handleEventPacket(packet);
                        break;
                    default:
                        console.warn('unknown packet: ', packet);
                        break;
                }
            };
            this._rl.addListener('line', onLineReceived);
            this._callOnStop.push(function () { return _this._rl.removeListener('line', onLineReceived); });
        };
        StdioOmnisharpServer.prototype._handleResponsePacket = function (packet) {
            var requestSeq = packet.Request_seq, entry = this._activeRequest[requestSeq];
            if (!entry) {
                console.warn('Received a response WITHOUT a request', packet);
                return;
            }
            delete this._activeRequest[requestSeq];
            if (packet.Success) {
                entry.onSuccess(packet.Body);
            }
            else {
                entry.onError(packet.Message || packet.Body);
            }
        };
        StdioOmnisharpServer.prototype._handleEventPacket = function (packet) {
            if (packet.Event === 'log') {
                // handle log events
                var entry = packet.Body;
                this._fireStdout("[" + entry.LogLevel + ":" + entry.Name + "] " + entry.Message + "\n");
                return;
            }
            else {
                // fwd all other events
                this._fireEvent(packet.Event, packet.Body);
            }
        };
        StdioOmnisharpServer.prototype._makeNextRequest = function (path, data) {
            var _this = this;
            var thisRequestPacket = {
                Type: 'request',
                Seq: StdioOmnisharpServer._seqPool++,
                Command: path,
                Arguments: data
            };
            return new monaco.Promise(function (c, e) {
                _this._activeRequest[thisRequestPacket.Seq] = {
                    onSuccess: c,
                    onError: e
                };
                _this._serverProcess.stdin.write(JSON.stringify(thisRequestPacket) + '\n');
            });
        };
        StdioOmnisharpServer.prototype._awaitLine = function (condition, timeout) {
            var _this = this;
            if (timeout === void 0) { timeout = StdioOmnisharpServer.ResponsePacketTimeout; }
            return new monaco.Promise(function (c, e) {
                var onLineReceived, timeoutHandle;
                onLineReceived = function (line) {
                    if (condition(line)) {
                        _this._rl.removeListener('line', onLineReceived);
                        clearTimeout(timeoutHandle);
                        c(line);
                    }
                };
                timeoutHandle = setTimeout(function () {
                    _this._rl.removeListener('line', onLineReceived);
                    e(new Error('Failed to connect to OmniSharp'));
                }, timeout);
                _this._rl.addListener('line', onLineReceived);
            });
        };
        StdioOmnisharpServer._seqPool = 1;
        StdioOmnisharpServer.StartupTimeout = 1000 * 60;
        StdioOmnisharpServer.ResponsePacketTimeout = 1000 * 60 * 15; // helps debugging
        return StdioOmnisharpServer;
    })(OmnisharpServer);
    exports.StdioOmnisharpServer = StdioOmnisharpServer;
});
