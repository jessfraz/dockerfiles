/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
'use strict';
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", '../lib/assert', '../lib/system', '../lib/strings', '../lib/errors'], function (require, exports, assert, winjs, strings, errors) {
    exports.Messages = {
        RequestHandlerFailed: 'request handler failed'
    };
    var AbstractRoute = (function () {
        function AbstractRoute(server, type) {
            this.server = server;
            this.type = type;
        }
        AbstractRoute.prototype.register = function (name) {
            var _this = this;
            var params = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                params[_i - 1] = arguments[_i];
            }
            params.unshift(name);
            name = strings.bind.apply(null, params);
            this.server.www[this.type](name, function (req, res, next) {
                _this._doHandleRequest(req, res, next);
            });
        };
        AbstractRoute.prototype._doHandleRequest = function (req, res, next) {
            var _this = this;
            try {
                var p = this.handleRequest(req, res, next);
                if (!winjs.Promise.is(p)) {
                    p = winjs.Promise.as(p);
                }
                p.done(null, function (err) {
                    _this.onError(err, req, res, next);
                });
            }
            catch (err) {
                this.onError(err, req, res, next);
            }
        };
        AbstractRoute.prototype.handleRequest = function (req, res, next) {
            throw new Error('implement me');
        };
        /* protected */ AbstractRoute.prototype.onError = function (err, req, res, next) {
            if (!err.statusCode) {
                var logAsWarning = false;
                if (err.code === 'EBUSY' || err.code === 'EPERM' || err.code === 'UNKNOWN') {
                    logAsWarning = true; // WAWS issues that we do not want to count against our reliability numbers
                }
                if (!logAsWarning) {
                    this.server.logger.error(err, 'AbstractRoute');
                }
                else {
                    this.server.logger.warn(err);
                }
                err = errors.asHttpError(500, err, exports.Messages.RequestHandlerFailed);
            }
            next(err);
        };
        return AbstractRoute;
    })();
    exports.AbstractRoute = AbstractRoute;
    var GETRoute = (function (_super) {
        __extends(GETRoute, _super);
        function GETRoute(server) {
            _super.call(this, server, 'get');
        }
        return GETRoute;
    })(AbstractRoute);
    exports.GETRoute = GETRoute;
    var POSTRoute = (function (_super) {
        __extends(POSTRoute, _super);
        function POSTRoute(server) {
            _super.call(this, server, 'post');
        }
        return POSTRoute;
    })(AbstractRoute);
    exports.POSTRoute = POSTRoute;
    var PARAMRoute = (function (_super) {
        __extends(PARAMRoute, _super);
        function PARAMRoute(server, name) {
            _super.call(this, server, 'param');
            this.name = name;
        }
        PARAMRoute.prototype.register = function () {
            _super.prototype.register.call(this, this.name);
        };
        PARAMRoute.prototype.handleRequest = function (req, res, next) {
            return this.handleParameter(req, res, next).then(function (value) {
                next(value);
            }, function (err) {
                next(err);
            });
        };
        PARAMRoute.prototype.handleParameter = function (req, res, next) {
            throw new Error('implement me');
        };
        return PARAMRoute;
    })(AbstractRoute);
    exports.PARAMRoute = PARAMRoute;
    var StaticAllRoute = (function (_super) {
        __extends(StaticAllRoute, _super);
        function StaticAllRoute(server, response) {
            _super.call(this, server, 'all');
            this.response = response;
        }
        StaticAllRoute.prototype.handleRequest = function (req, res, next) {
            next(this.response);
            return winjs.Promise.as(null);
        };
        return StaticAllRoute;
    })(AbstractRoute);
    exports.StaticAllRoute = StaticAllRoute;
    var Resource = (function (_super) {
        __extends(Resource, _super);
        function Resource(server) {
            _super.call(this, server, 'all');
        }
        Resource.prototype.handleRequest = function (req, res, next) {
            switch (req.method) {
                case 'GET': return this.GET(req, res, next);
                case 'POST': return this.POST(req, res, next);
                case 'PUT': return this.PUT(req, res, next);
                case 'DELETE': return this.DELETE(req, res, next);
                default: return this.handleMethod(req.method, req, res, next);
            }
        };
        Resource.prototype.GET = function (req, res, next) {
            throw errors.httpError(405, 'Method not allowed.');
        };
        Resource.prototype.PUT = function (req, res, next) {
            throw errors.httpError(405, 'Method not allowed.');
        };
        Resource.prototype.POST = function (req, res, next) {
            throw errors.httpError(405, 'Method not allowed.');
        };
        Resource.prototype.DELETE = function (req, res, next) {
            throw errors.httpError(405, 'Method not allowed.');
        };
        Resource.prototype.handleMethod = function (method, req, res, next) {
            throw errors.httpError(405, 'Method not allowed.');
        };
        return Resource;
    })(AbstractRoute);
    exports.Resource = Resource;
    var util;
    (function (util) {
        function getQueryParameterString(req, name, defaultValue) {
            if (defaultValue === void 0) { defaultValue = null; }
            return String(req.query[name] || defaultValue);
        }
        util.getQueryParameterString = getQueryParameterString;
        function hasQueryParameter(req, name) {
            return typeof req.query[name] !== 'undefined';
        }
        util.hasQueryParameter = hasQueryParameter;
        function writeChunked(res, header, content) {
            assert.ok(!header['Content-Length']);
            for (var key in header) {
                if (header.hasOwnProperty(key)) {
                    var value = header[key];
                    res.write(key);
                    res.write(': ');
                    res.write(String(value));
                    res.write('\n');
                }
            }
            // write content length
            res.write('Content-Length: ');
            res.write(String(content.length));
            res.write('\n');
            // write content
            res.write('\r\n\r\n');
            res.write(content);
        }
        util.writeChunked = writeChunked;
    })(util = exports.util || (exports.util = {}));
});
