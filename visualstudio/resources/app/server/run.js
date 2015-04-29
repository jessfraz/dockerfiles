/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
/// <reference path="declare/node.d.ts" />
// Base class for the run configurations to share common settings
'use strict';
define(["require", "exports", 'path', './lib/strings', './lib/performance', './monaco', './monaco.impl', './lib/db/engines/inmemory'], function (require, exports, path, strings, performance, server, monacoImpl, inmemory) {
    // Find out if the server runs locally or in the cloud by checking for env
    exports.isLocal = !process.env.PORT;
    // Export the wwwRoot of the server
    exports.wwwRoot = __dirname;
    // Enable to run the monaco server off the cloud where an UNC path is being used
    // In this case, use process.cwd() instead of __dirname but be carefuly to set the
    // directory to the server root. This solution is fragile because we can not know for
    // sure from which directory the monaco server is started. This solution below will allow
    // to run the server from the top level package.json as well as from the server directory.
    if (!exports.isLocal) {
        exports.wwwRoot = process.cwd();
        // In this case assume that the server was started from the workspace root and add server to it
        if (!strings.endsWith(exports.wwwRoot, 'server')) {
            exports.wwwRoot = path.join(exports.wwwRoot, 'server');
        }
    }
    // Common run options
    exports.sharedOptions = {
        wwwRoot: exports.wwwRoot,
        defaultEncoding: 'utf-8',
        staticCacheControl: 'no-cache',
        staticCachePragma: 'no-cache',
        requestVerificationCookie: '__RequestVerificationToken'
    };
    function startup(options, created, started) {
        // Make server options accessible to anyone
        server.options = options;
        // Open DB
        inmemory.open(function (err, engine) {
            if (err) {
                return console.error(err.stack || err);
            }
            // Create server
            monacoImpl.createServer(options, function (err, server) {
                if (err) {
                    return console.error(err.stack || err);
                }
                var createdFn = created;
                if (!createdFn) {
                    createdFn = function (server, callback) {
                        callback();
                    };
                }
                // Pass to createdFn
                createdFn(server, function () {
                    // Error handling
                    process.on('uncaughtException', function (err) {
                        if (err.stack) {
                            server.logger.error(err, 'node.js');
                        }
                        else {
                            var title = 'Unknown';
                            if (err.name && err.message) {
                                title = err.name + ' (' + err.message + ')';
                            }
                            else if (err.name || err.message) {
                                title = err.name || err.message;
                            }
                            server.logger.error('Uncaught exception: ' + title, 'node.js');
                        }
                    });
                    // Error handling
                    server.http.on('error', function (e) {
                        server.logger.error(e, 'http');
                        if (exports.isLocal && e && e.errno === 'EADDRINUSE') {
                            server.logger.info('Detected EADDRINUSE, shutting down.');
                            process.exit(1);
                        }
                    });
                    performance.log('createServer() - end');
                    performance.flushLog(server.logger);
                    // Start listening
                    server.start();
                    server.logger.info('Monaco server running at port ' + server.options.port + ' from ' + exports.wwwRoot + ' using node ' + process.version);
                    if (started) {
                        started(server);
                    }
                });
            });
        });
    }
    exports.startup = startup;
});
