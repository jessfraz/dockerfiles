/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
/// <reference path="declare/express.d.ts" />
'use strict';
define(["require", "exports", './lib/errors', './lib/system', './controller/public', './controller/monaco', './controller/workspace', './controller/events', './controller/eventChannel', './controller/ping', './controller/log', './controller/cdn'], function (require, exports, errors, system, puplic, monaco, workspace, events, eventChannel, ping, log, cdn) {
    function route(server, contributionManager) {
        // Public Static Content
        puplic.route(server);
        // Services
        workspace.route(server);
        events.events.route(server);
        eventChannel.route(server);
        log.route(server);
        ping.route(server);
        cdn.route(server);
        // Plugins
        var promise = null;
        if (contributionManager) {
            promise = contributionManager.route(server);
        }
        return system.Promise.as(promise).then(function (ignore) {
            // Monaco Redirects
            monaco.route(server);
            // Anything else is a 404
            server.www.all('*', function (req, res, next) {
                return next(errors.httpError(404, 'Not Found'));
            });
        });
    }
    exports.route = route;
});
