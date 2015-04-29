/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
'use strict';
define(["require", "exports", 'child_process', './system', './async'], function (require, exports, cp, winjs, async) {
    var RequestType;
    (function (RequestType) {
        RequestType[RequestType["Common"] = 0] = "Common";
        RequestType[RequestType["Cancel"] = 1] = "Cancel";
    })(RequestType || (RequestType = {}));
    var ResponseType;
    (function (ResponseType) {
        ResponseType[ResponseType["Success"] = 0] = "Success";
        ResponseType[ResponseType["Progress"] = 1] = "Progress";
        ResponseType[ResponseType["Error"] = 2] = "Error";
    })(ResponseType || (ResponseType = {}));
    var Service = (function () {
        function Service(protocol, service) {
            var _this = this;
            this.protocol = protocol;
            this.service = service;
            this.activeRequestPromises = Object.create(null);
            this.protocol.onMessage(function (r) { return _this.onMessage(r); });
        }
        Service.prototype.onMessage = function (request) {
            switch (request.type) {
                case RequestType.Common:
                    this.onCommonRequest(request);
                    break;
                case RequestType.Cancel:
                    this.onCancelRequest(request);
                    break;
            }
        };
        Service.prototype.onCommonRequest = function (request) {
            var _this = this;
            var promise = this.service[request.name].apply(this.service, request.arguments);
            this.activeRequestPromises[request.id] = promise.then(function (data) {
                _this.protocol.send({
                    id: request.id,
                    type: ResponseType.Success,
                    data: data
                });
                delete _this.activeRequestPromises[request.id];
            }, function (err) {
                _this.protocol.send({
                    id: request.id,
                    type: ResponseType.Error,
                    data: err
                });
                delete _this.activeRequestPromises[request.id];
            }, function (data) {
                _this.protocol.send({
                    id: request.id,
                    type: ResponseType.Progress,
                    data: data
                });
            });
        };
        Service.prototype.onCancelRequest = function (request) {
            var promise = this.activeRequestPromises[request.id];
            if (promise) {
                promise.cancel();
                delete this.activeRequestPromises[request.id];
            }
        };
        Service.prototype.dispose = function () {
            var _this = this;
            Object.keys(this.activeRequestPromises).forEach(function (id) {
                _this.activeRequestPromises[id].cancel();
            });
            this.activeRequestPromises = null;
        };
        return Service;
    })();
    var ServiceClient = (function () {
        function ServiceClient(protocol) {
            var _this = this;
            this.protocol = protocol;
            this.activeRequestHandlers = Object.create(null);
            this.lastRequestId = 0;
            this.protocol.onMessage(function (r) { return _this.onMessage(r); });
        }
        ServiceClient.prototype.onMessage = function (response) {
            var handler = this.activeRequestHandlers[response.id];
            if (handler) {
                handler(response);
            }
        };
        ServiceClient.prototype.request = function (name) {
            var _this = this;
            var requestId = this.lastRequestId++;
            var args = Array.prototype.slice.call(arguments, 1);
            return new winjs.Promise(function (c, e, p) {
                _this.activeRequestHandlers[requestId] = function (response) {
                    switch (response.type) {
                        case ResponseType.Success:
                            delete _this.activeRequestHandlers[requestId];
                            c(response.data);
                            break;
                        case ResponseType.Error:
                            delete _this.activeRequestHandlers[requestId];
                            e(response.data);
                            break;
                        case ResponseType.Progress:
                            p(response.data);
                            break;
                    }
                };
                try {
                    _this.protocol.send({
                        id: requestId,
                        type: RequestType.Common,
                        name: name,
                        arguments: args
                    });
                }
                catch (err) {
                }
            }, function () {
                try {
                    _this.protocol.send({
                        id: requestId,
                        type: RequestType.Cancel
                    });
                }
                catch (err) {
                }
            });
        };
        return ServiceClient;
    })();
    function connect(serviceCtor, child) {
        var result = {};
        var serviceClient = new ServiceClient({
            send: function (r) { return child.connected && child.send(r); },
            onMessage: function (cb) { return child.on('message', cb); }
        });
        Object.keys(serviceCtor.prototype).filter(function (key) {
            return key !== 'constructor';
        }).forEach(function (key) {
            result[key] = function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i - 0] = arguments[_i];
                }
                args.unshift(key);
                return serviceClient.request.apply(serviceClient, args);
            };
        });
        return {
            service: result,
            dispose: function () { return child.kill(); }
        };
    }
    function run(serviceImplementation) {
        var service = new Service({
            send: function (r) { return process.send(r); },
            onMessage: function (cb) { return process.on('message', cb); }
        }, serviceImplementation);
        process.once('disconnect', function () { return service.dispose(); });
    }
    exports.run = run;
    function createService(serviceCtor, modulePath, options) {
        var result = {};
        var connectedService = null;
        var activeRequests = [];
        var timeout = options && options.timeout ? options.timeout : Number.MAX_VALUE;
        var disposeDelayer = timeout === Number.MAX_VALUE ? null : new async.Delayer(timeout);
        var disposeConnectedService = function () {
            if (connectedService) {
                connectedService.dispose();
                connectedService = null;
            }
        };
        var scheduleDispose = function () {
            if (!disposeDelayer) {
                return;
            }
            disposeDelayer.trigger(disposeConnectedService);
        };
        var cancelScheduledDispose = function () {
            if (!disposeDelayer) {
                return;
            }
            disposeDelayer.cancel();
        };
        var dispose = function () {
            cancelScheduledDispose();
            disposeDelayer = null;
            disposeConnectedService();
        };
        Object.keys(serviceCtor.prototype).filter(function (key) {
            return key !== 'constructor';
        }).forEach(function (key) {
            result[key] = function () {
                cancelScheduledDispose();
                if (!connectedService) {
                    var args = options && options.args ? options.args : [];
                    var forkOpts = undefined;
                    if (options && options.verbose) {
                        forkOpts = {
                            silent: false
                        };
                    }
                    var child = cp.fork(modulePath, args, forkOpts);
                    connectedService = connect(serviceCtor, child);
                    var onExit = function () { return child.kill(); };
                    process.once('exit', onExit);
                    child.on('exit', function (code, signal) {
                        process.removeListener('exit', onExit);
                        activeRequests.forEach(function (req) { return req.cancel(); });
                        activeRequests = [];
                        if (code && signal !== 'SIGTERM') {
                            console.warn('Service ' + modulePath + ' crashed with exit code ' + code);
                            cancelScheduledDispose();
                            disposeConnectedService();
                        }
                    });
                }
                var request = connectedService.service[key].apply(connectedService.service, arguments);
                // Progress doesn't propagate across 'then', we need to create a promise wrapper
                var promise = new winjs.Promise(function (c, e, p) {
                    request.then(function (data) {
                        c(data);
                    }, function (err) {
                        e(err);
                    }, p).done(function () {
                        activeRequests.splice(activeRequests.indexOf(promise), 1);
                        scheduleDispose();
                    });
                }, function () { return request.cancel(); });
                activeRequests.push(promise);
                return promise;
            };
        });
        return {
            service: result,
            dispose: dispose
        };
    }
    exports.createService = createService;
});
