/*!---------------------------------------------------------
* Copyright (C) Microsoft Corporation. All rights reserved.
*--------------------------------------------------------*/
/// <reference path="./declare/node.d.ts" />
/// <reference path="./declare/atom-browser.d.ts" />
'use strict';
function localize(key, message) {
    var args = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        args[_i - 2] = arguments[_i];
    }
    return _format(message, args);
}
exports.localize = localize;
function _format(message, args) {
    return message.replace(/\{(\d+)\}/g, function (match, rest) {
        var index = rest[0];
        return typeof args[index] !== 'undefined' ? args[index] : match;
    });
}
