/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
/// <reference path="../../declares.d.ts" />
'use strict';
define(["require", "exports", 'vs/base/monoHelper.native', 'fs', 'child_process', 'monaco'], function (require, exports, monoHelper, fs, cp, monaco) {
    var omnisharpEnv = 'OMNISHARP';
    var isWindows = /^win/.test(process.platform);
    function launch(cwd, argv) {
        return checkRuntime().then(function (_) {
            return launchDetails(argv);
        }).then(function (details) {
            try {
                var result = cp.spawn(details.command, details.argv, {
                    detached: false,
                    env: details.env,
                    cwd: cwd
                });
                return result;
            }
            catch (err) {
                return monaco.Promise.wrapError(err);
            }
        });
    }
    function checkRuntime() {
        if (isWindows) {
            return monaco.Promise.as(null);
        }
        return monoHelper.hasMono('>=3.10.0').then(function (hasIt) {
            if (!hasIt) {
                throw new Error('Cannot start Omnisharp because Mono version >=3.10.0 is required');
            }
        });
    }
    function launchDetails(argv) {
        return new monaco.Promise(function (c, e) {
            if (typeof process.env[omnisharpEnv] === 'string') {
                // trust the env variable
                return c(process.env[omnisharpEnv]);
            }
            else {
                // check for the built version
                var local = require.toUrl('./bin/omnisharp').replace(/^file:\/\//, '');
                local = isWindows ? local + '.cmd' : local;
                fs.exists(local, function (localExists) {
                    if (localExists) {
                        c(local);
                    }
                    else {
                        e(new Error('Local OmniSharp bin folder not found and OMNISHARP env variable not set'));
                    }
                });
            }
        }).then(function (command) {
            return {
                command: command,
                argv: argv
            };
        });
    }
    return launch;
});
