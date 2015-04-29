/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
/// <reference path="declare/node.d.ts" />
/// <reference path="declare/express.d.ts" />
'use strict';
define(["require", "exports", 'path', 'http', 'fs', 'express', './config', './middleware', './platform', './monaco', './routes', './lib/performance', './lib/utils', './lib/types', './lib/events', './contrib/contributions', './lib/injectorService', './lib/jshtm'], function (require, exports, path, http, fs, express, config, middleware, platform, server, routes, performance, utils, types, events, contributions, injectorService, jshtm) {
    var Server = (function () {
        function Server(options) {
            // Options
            this._options = options;
            // External tools such as git
            this._tools = {};
            // Create an event bus
            this._eventbus = new events.EventEmitter();
        }
        Server.prototype.init = function () {
            this._www = express();
            this._http = http.createServer(this._www);
            this.enableSiteRoot(); // Support options.siteRoot for URL mapping in Express
        };
        Server.prototype.enableSiteRoot = function () {
            if (!server.options.siteRoot) {
                server.options.siteRoot = '';
            }
            else if (server.options.siteRoot.indexOf('/') !== 0) {
                server.options.siteRoot = '/' + server.options.siteRoot; // Require the site root to begin with a '/'
            }
            this.patchExpressFunction('get');
            this.patchExpressFunction('post');
            this.patchExpressFunction('put');
            this.patchExpressFunction('del');
            this.patchExpressFunction('all');
        };
        Server.prototype.patchExpressFunction = function (name) {
            var root = this._options.siteRoot;
            var oldFn = this._www[name];
            this._www[name] = function () {
                var args = Array.prototype.slice.apply(arguments);
                if (args.length === 2 && types.isString(args[0]) && types.isFunction(args[1])) {
                    args[0] = root + args[0];
                }
                return oldFn.apply(this, args);
            };
        };
        Object.defineProperty(Server.prototype, "eventbus", {
            get: function () {
                return this._eventbus;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Server.prototype, "options", {
            get: function () {
                return this._options;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Server.prototype, "tools", {
            get: function () {
                return this._tools;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Server.prototype, "www", {
            get: function () {
                return this._www;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Server.prototype, "http", {
            get: function () {
                return this._http;
            },
            enumerable: true,
            configurable: true
        });
        Server.prototype.start = function () {
            this.http.listen(this._options.port || 9888, process.env.HOST);
        };
        return Server;
    })();
    exports.Server = Server;
    function createServer(options, callback) {
        performance.log('createServer() - start');
        var errorHandler = function (err) {
            return callback(err, null);
        };
        // Create a new Monaco server
        var server = new Server(options);
        // Init Contributions & Extensions
        var contributionManager = contributions.ContributionManager;
        performance.logDuration('contributionManager init()', function () {
            return contributionManager.init();
        }).then(function () {
            performance.logDuration('contributionManager registerExtensions()', contributionManager.registerExtensions(server)).then(function (ignore) {
                // Setup service container and inject to contributions
                var service = injectorService.create(platform.ServiceRegistry.getServicesMap());
                platform.ServiceRegistry.registerService(service);
                contributionManager.injectServices(server).then(function (ignore) {
                    // Configure Server
                    var start = new Date().getTime();
                    config.configure(server, function (err) {
                        if (err) {
                            return errorHandler(err);
                        }
                        performance.logDuration('config.configure()', start, new Date().getTime());
                        // Init Server
                        server.init();
                        // Install performance tools
                        performance.configure(server);
                        // Allow contributions to configure
                        performance.logDuration('contributionManager configure()', contributionManager.configure(server)).then(function (ignore) {
                            // Configure Express
                            start = new Date().getTime();
                            server.www.configure(function () {
                                // Enable Gzip/Deflate
                                server.www.use(express.compress());
                                // Parse POST requests that use application/x-www-form-urlencoded
                                // or application/json and place the variables into req.body
                                server.www.use(express.urlencoded());
                                var expressJsonOptions = {};
                                if (server.options.jsonRequestLimit) {
                                    expressJsonOptions.limit = '15mb';
                                }
                                server.www.use(express.json(expressJsonOptions));
                                // Support Cookies
                                server.www.use(express.cookieParser(utils.generateUuid()));
                                // Allows to have form fields using normal POST to include a hidden
                                // input that defines the actual HTTP Method that should be used (e.g. PUT)
                                server.www.use(express.methodOverride());
                                // Allows to simply define routes using HTTP verbs (GET, POST, etc)
                                // and wildcards in URLs that get mapped to request parameter values
                                server.www.use(server.www.router);
                                // Allow to call response.render() with a static HTML file without redirect
                                server.www.set('views', path.join(server.options.wwwRoot, 'view'));
                                server.www.engine('jshtm', function (path, options, fn) {
                                    fs.readFile(path, 'utf8', function (err, str) {
                                        if (err) {
                                            return fn(err);
                                        }
                                        options = options || {};
                                        fn(null, jshtm.render(str, options));
                                    });
                                });
                                // Error Logging and Handling
                                Error.stackTraceLimit = 100;
                                server.www.use(function (err, req, res, next) {
                                    // Typical node.js error:
                                    //	code: "EBUSY"
                                    //	errno: 10
                                    //	message: "EBUSY, open '<path>'"
                                    //	path: "<path>"
                                    //	stack: undefined
                                    //	type: undefined
                                    var error = {
                                        statusCode: err.statusCode,
                                        message: err.message,
                                        code: err.statusCode
                                    };
                                    if (err.stack) {
                                        error.stack = err.stack.split('\n');
                                    }
                                    if (err.data) {
                                        error.data = err.data;
                                    }
                                    var logged = false;
                                    if ('Unexpected end of input' === err.message) {
                                        error.code = error.statusCode = 400;
                                    }
                                    else if (!error.statusCode) {
                                        var logAsWarning = false;
                                        if (err.code === 'EBUSY' || err.code === 'EPERM' || err.code === 'UNKNOWN') {
                                            logAsWarning = true; // WAWS issues that we do not want to count against our reliability numbers
                                        }
                                        if (!logAsWarning) {
                                            server.logger.error(err, 'Express');
                                        }
                                        else {
                                            server.logger.warn(err);
                                        }
                                        logged = true;
                                        error.code = error.statusCode = 500;
                                    }
                                    // Log even requests with status code to get some tracing (as warning)
                                    if (!logged) {
                                        server.logger.http(err.message || 'warning', {
                                            method: req.method,
                                            path: req.path,
                                            statusCode: error.statusCode
                                        });
                                    }
                                    // Return error JSON when being used without public routes
                                    if (req.xhr) {
                                        res.set('Content-type', 'application/json');
                                        return res.send(error.statusCode, JSON.stringify(error, '', 4));
                                    }
                                    else {
                                        res.status(error.statusCode);
                                        var visibleError = utils.mixin({}, error);
                                        res.render('error.jshtm', {
                                            shortVersion: server.options.client.shortVersion,
                                            fsRoot: path.dirname(server.options.wwwRoot),
                                            error: visibleError,
                                            siteRoot: server.options.siteRoot
                                        });
                                        return;
                                    }
                                });
                                performance.logDuration('server.configure()', start, new Date().getTime());
                            });
                            // Middleware Config
                            performance.logDuration('middleware.plugin()', function () {
                                middleware.plugin(server);
                            });
                            // Routes Config
                            start = new Date().getTime();
                            routes.route(server, contributionManager).then(function () {
                                performance.logDuration('routes.route()', start, new Date().getTime());
                                // On 'exit' handler
                                process.on('exit', function () {
                                    server.logger.info('Shutting down...');
                                    // This returns a promise. But no need to then it since we are
                                    // at the end anyways and node runs as long as there are outstanding
                                    // async requests.
                                    contributionManager.onExit(server);
                                });
                                return callback(null, server);
                            }).done(null, errorHandler);
                        }).done(null, errorHandler);
                    });
                }).done(null, errorHandler);
            }).done(null, errorHandler);
        }).done(null, errorHandler);
    }
    exports.createServer = createServer;
});
