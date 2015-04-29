/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
/// <reference path="../declare/node.d.ts" />
'use strict';
define(["require", "exports", 'fs', 'path', '../lib/temp', '../lib/utils'], function (require, exports, fs, path, temp, utils) {
    function configure(server, next) {
        // Used to do inter process communication from node.js server to other running apps like git.exe
        server.options.ipcEventBusHook = createNamedPipe();
        next();
    }
    exports.configure = configure;
    function createNamedPipe() {
        var result = utils.randomString(20);
        if (utils.isWindows()) {
            result = '\\\\.\\pipe\\monaco-event-bus-' + result;
        }
        else {
            result = path.join(temp.getOSTempPathSync(), 'monaco-event-bus-' + result);
            if (fs.existsSync(result)) {
                fs.unlinkSync(result);
            }
        }
        return result;
    }
});
