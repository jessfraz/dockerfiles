/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
'use strict';
define(["require", "exports"], function (require, exports) {
    function parseArgs(args, parameterized) {
        parameterized = parameterized || [];
        var options = {};
        var _args = [];
        for (var i = 0; i < args.length; i++) {
            var arg = args[i];
            if (arg[0] === '-') {
                var name = arg.replace(/^-+/, '');
                if (parameterized.indexOf(name) !== -1 && i < args.length - 1) {
                    options[name] = args[++i];
                }
                else {
                    options[name] = true;
                }
            }
            else {
                _args.push(arg);
            }
        }
        return { options: options, args: _args };
    }
    exports.parseArgs = parseArgs;
    function colorize(code, str) {
        return '\x1b[' + code + 'm' + str + '\x1b[0m';
    }
    exports.colorize = colorize;
});
