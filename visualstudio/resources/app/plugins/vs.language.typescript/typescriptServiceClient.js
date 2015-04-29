/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
/// <reference path="../declares.d.ts" />
'use strict';
define(["require", "exports", 'vs/languages/lib/wireProtocol', 'monaco', 'child_process', 'path'], function (require, exports, WireProtocol, monaco, cp, path) {
    var isWin = /^win/.test(process.platform);
    var isDarwin = /^darwin/.test(process.platform);
    var isLinux = /^linux/.test(process.platform);
    var arch = process.arch;
    var TypeScriptServiceClient = (function () {
        function TypeScriptServiceClient(host) {
            this.host = host;
            this.pathSeparator = path.sep;
            this.servicePromise = null;
            this.lastError = null;
            this.sequenceNumber = 0;
            this.requestQueue = [];
            this.pendingResponses = 0;
            this.callbacks = Object.create(null);
        }
        TypeScriptServiceClient.prototype.asyncCtor = function () {
            return this.service();
        };
        TypeScriptServiceClient.prototype.service = function () {
            var _this = this;
            if (this.servicePromise) {
                return this.servicePromise;
            }
            if (this.lastError) {
                return monaco.Promise.wrapError(this.lastError);
            }
            this.servicePromise = new monaco.Promise(function (c, e, p) {
                var childProcess = null;
                try {
                    var modulePath = path.join(__dirname, 'lib', 'tsserver.js');
                    if (isWin) {
                        childProcess = cp.spawn(path.join(monaco.Paths.getAppRoot(), 'tools/bin/win/node.exe'), [modulePath]);
                    }
                    else if (isDarwin) {
                        childProcess = cp.spawn(path.join(monaco.Paths.getAppRoot(), 'tools/bin/osx/node'), [modulePath]);
                    }
                    else if (isLinux && arch === 'x64') {
                        childProcess = cp.spawn(path.join(monaco.Paths.getAppRoot(), 'tools/bin/linux/x64/node'), [modulePath]);
                    }
                    else {
                        childProcess = cp.fork(modulePath, [], {
                            silent: true
                        });
                    }
                    childProcess.on('error', function (err) {
                        _this.lastError = err;
                        _this.serviceExited();
                    });
                    childProcess.on('exit', function (err) {
                        _this.serviceExited();
                    });
                    _this.reader = new WireProtocol.Reader(childProcess.stdout, function (msg) {
                        _this.dispatchMessage(msg);
                    });
                    c(childProcess);
                }
                catch (error) {
                    e(error);
                }
            });
            this.serviceStarted();
            return this.servicePromise;
        };
        TypeScriptServiceClient.prototype.serviceStarted = function () {
            /*
            this.mode.getOpenBuffers().forEach((file) => {
                this.execute('open', { file: file }, false);
            });
            */
        };
        TypeScriptServiceClient.prototype.serviceExited = function () {
            var _this = this;
            this.servicePromise = null;
            Object.keys(this.callbacks).forEach(function (key) {
                _this.callbacks[parseInt(key)].e(new Error('Service died.'));
            });
        };
        TypeScriptServiceClient.prototype.asAbsolutePath = function (resource) {
            if (resource.scheme !== 'file') {
                return null;
            }
            var absolutePath = monaco.Paths.toAbsoluteFilePath(resource);
            // Both \ and / must be escaped in regular expressions
            return absolutePath ? absolutePath.replace(new RegExp('\\' + this.pathSeparator, 'g'), '/') : null;
        };
        TypeScriptServiceClient.prototype.asUrl = function (filepath) {
            return new monaco.URL(monaco.URI.file(filepath));
        };
        TypeScriptServiceClient.prototype.execute = function (command, args, expectsResult) {
            var _this = this;
            if (expectsResult === void 0) { expectsResult = true; }
            var request = {
                seq: this.sequenceNumber++,
                type: 'request',
                command: command,
                arguments: args
            };
            var requestInfo = {
                request: request,
                promise: null,
                callbacks: null
            };
            var result = null;
            if (expectsResult) {
                result = new monaco.Promise(function (c, e, p) {
                    requestInfo.callbacks = { c: c, e: e, start: Date.now() };
                }, function () {
                    _this.tryCancelRequest(request.seq);
                });
            }
            requestInfo.promise = result;
            this.requestQueue.push(requestInfo);
            this.sendNextRequests();
            return result;
        };
        TypeScriptServiceClient.prototype.sendNextRequests = function () {
            while (this.pendingResponses === 0 && this.requestQueue.length > 0) {
                this.sendRequest(this.requestQueue.shift());
            }
        };
        TypeScriptServiceClient.prototype.sendRequest = function (requestItem) {
            var _this = this;
            var serverRequest = requestItem.request;
            // console.log('Type Script Service - Sending request ' + serverRequest.seq + '. Current queue length: ' + this.requestQueue.length);
            if (requestItem.callbacks) {
                this.callbacks[serverRequest.seq] = requestItem.callbacks;
                this.pendingResponses++;
            }
            this.service().done(function (childProcess) {
                childProcess.stdin.write(JSON.stringify(serverRequest) + '\r\n', 'utf8');
            }, function (err) {
                var callback = _this.callbacks[serverRequest.seq];
                if (callback) {
                    callback.e(err);
                    delete _this.callbacks[serverRequest.seq];
                    _this.pendingResponses--;
                }
            });
        };
        TypeScriptServiceClient.prototype.tryCancelRequest = function (seq) {
            for (var i = 0; i < this.requestQueue.length; i++) {
                if (this.requestQueue[i].request.seq === seq) {
                    this.requestQueue.splice(i, 1);
                    // console.log('Type Script Service - Canceled request with sequence number ' + seq);
                    return true;
                }
            }
            // console.log('Type Script Service - Tried to cancel request with sequence number ' + seq);
            return false;
        };
        TypeScriptServiceClient.prototype.dispatchMessage = function (message) {
            try {
                if (message.type === 'response') {
                    var response = message;
                    var p = this.callbacks[response.request_seq];
                    if (p) {
                        // console.log('Type Script Service: Request ' + response.command + '(' + response.request_seq + ') took ' + (Date.now() - p.start) + 'ms');
                        delete this.callbacks[response.request_seq];
                        this.pendingResponses--;
                        if (response.success) {
                            p.c(response);
                        }
                        else {
                            p.e(response);
                        }
                    }
                }
                else if (message.type === 'event') {
                    var event = message;
                    if (event.event === 'syntaxDiag') {
                        this.host.syntaxDiagnosticsReceived(event);
                    }
                    if (event.event === 'semanticDiag') {
                        this.host.semanticDiagnosticsReceived(event);
                    }
                }
                else {
                    throw new Error('Unknown message type ' + message.type + ' recevied');
                }
            }
            finally {
                this.sendNextRequests();
            }
        };
        return TypeScriptServiceClient;
    })();
    return TypeScriptServiceClient;
});
