/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
'use strict';
define(["require", "exports", './lib/flow', './config/events', './config/home', './config/logger', './config/tools', './config/db', './config/workspaces'], function (require, exports, flow, events, home, logger, tools, db, workspaces) {
    // Require all configuration modules
    var moduleConfigures = [
        events.configure,
        home.configure,
        logger.configure,
        tools.configure,
        db.configure,
        workspaces.configure
    ];
    function configure(server, callback) {
        // Prepare all configuration functions
        var configures = moduleConfigures.map(function (fn) {
            return function () {
                fn(server, this);
            };
        });
        // Error handler
        configures.unshift(callback);
        // Exit function
        configures.push(callback);
        // Run the thing
        flow.sequence(configures);
    }
    exports.configure = configure;
});
