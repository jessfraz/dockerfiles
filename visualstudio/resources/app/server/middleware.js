/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
'use strict';
define(["require", "exports", './middleware/access', './middleware/logger', './middleware/security', './middleware/cache', './middleware/encoding', './middleware/domain', './middleware/cors', './middleware/upload'], function (require, exports, access, logger, security, cache, encoding, domain, cors, upload) {
    // Note: Do not change the order of middleware, there are side effects!
    function plugin(server) {
        // CORS
        if (server.options.enableCORS) {
            cors.control(server);
        }
        // Request domain
        domain.control(server);
        // Access Control
        access.control(server);
        // HTTP Logger
        logger.control(server);
        // Upload Control
        upload.control(server);
        // Security Control
        security.control(server);
        // Cache Control
        cache.control(server);
        // Encoding Control
        encoding.control(server);
    }
    exports.plugin = plugin;
});
