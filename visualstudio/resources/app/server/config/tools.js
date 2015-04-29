/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
/// <reference path="../declare/node.d.ts" />
'use strict';
define(["require", "exports", 'path', '../lib/extfs', '../lib/utils'], function (require, exports, path, extfs, utils) {
    function configure(server, next) {
        // Ensure Temp Directory is present
        extfs.mkdirpSync(server.options.osTempPath);
        server.tools.node = process.execPath;
        server.tools.phantomQUnit = path.join(server.options.wwwRoot, 'contrib', 'test', 'run-qunit.js');
        // Windows
        if (utils.isWindows()) {
            server.tools.empty = path.resolve(path.join(server.options.home, 'empty.cmd'));
            if (server.tools.empty.indexOf(' ') > -1) {
                server.logger.warn('The path to the tool "empty.cmd" contains spaces in it. Please beware when git uses it.');
            }
        }
        else if (utils.isOSX()) {
            server.tools.empty = path.resolve(path.join(server.options.home, 'empty.sh'));
        }
        next();
    }
    exports.configure = configure;
});
