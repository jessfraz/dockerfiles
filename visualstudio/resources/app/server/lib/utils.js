/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
/// <reference path="../declare/node.d.ts" />
'use strict';
define(["require", "exports", 'crypto', './uuid'], function (require, exports, crypto, uuid) {
    var rndStrChars = '0123456789abcdefghiklmnopkqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var rndStrCharsLen = rndStrChars.length;
    function randomString(length) {
        if (length === void 0) { length = 20; }
        var result = '';
        for (var i = 0; i < length; i++) {
            result += rndStrChars[Math.floor(Math.random() * rndStrCharsLen)];
        }
        return result;
    }
    exports.randomString = randomString;
    function md5(value) {
        return crypto.createHash('md5').update(value).digest('hex');
    }
    exports.md5 = md5;
    function sha256(value, salt) {
        return crypto.createHash('sha256').update(value + salt).digest('hex');
    }
    exports.sha256 = sha256;
    function generateUuid() {
        return uuid.v4().asHex();
    }
    exports.generateUuid = generateUuid;
    function isWindows() {
        return (/^win/i).test(process.platform);
    }
    exports.isWindows = isWindows;
    function isOSX() {
        return (/^darwin/i).test(process.platform);
    }
    exports.isOSX = isOSX;
    function getLoggedInUser() {
        if (isWindows()) {
            return process.env.USERNAME;
        }
        return process.env.USER;
    }
    exports.getLoggedInUser = getLoggedInUser;
    function mixin(destination, source) {
        if (source && typeof source === 'object' && !Array.isArray(source)) {
            Object.keys(source).forEach(function (key) {
                if (Array.isArray(source[key])) {
                    destination[key] = source[key].slice(0);
                }
                else if (source[key] && typeof source[key] === 'object') {
                    if (!(key in destination)) {
                        destination[key] = {};
                    }
                    mixin(destination[key], source[key]);
                }
                else {
                    destination[key] = source[key];
                }
            });
        }
        return destination;
    }
    exports.mixin = mixin;
});
