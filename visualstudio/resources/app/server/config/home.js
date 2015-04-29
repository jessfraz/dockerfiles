/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
/// <reference path="../declare/node.d.ts" />
'use strict';
define(["require", "exports", 'fs', 'path', '../lib/extfs'], function (require, exports, fs, path, extfs) {
    function configure(server, next) {
        var source = path.join(__dirname, '..', 'home');
        var target = server.options.home;
        if (!fs.existsSync(target)) {
            extfs.mkdirpSync(target);
            extfs.copyDirRecursivelySync(source, target);
            next();
        }
        else if (fs.existsSync(path.join(target, 'bin'))) {
            // always copy bin folder
            extfs.copyDirRecursivelySync(path.join(source, 'bin'), path.join(target, 'bin'));
            next();
        }
        else {
            next();
        }
    }
    exports.configure = configure;
});
