/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
/// <reference path="../declare/node.d.ts" />
'use strict';
define(["require", "exports", '../lib/system'], function (require, exports, winjs) {
    function loadRelativeModule(_requireFunc, relativeFilePath) {
        if (/\.js$/.test(relativeFilePath)) {
            console.warn('[WARN]: Trying to load module with .js ending. Please remove the .js ending');
        }
        var requireFunc = _requireFunc;
        if (typeof requireFunc.resolve === 'function') {
            // This is the common js require
            return winjs.Promise.as(requireFunc(relativeFilePath));
        }
        else {
            // This is the AMD require
            var C, E;
            var result = new winjs.Promise(function (c, e, p) {
                C = c;
                E = e;
            });
            requireFunc([relativeFilePath], C, E);
            return result;
        }
    }
    exports.loadRelativeModule = loadRelativeModule;
});
