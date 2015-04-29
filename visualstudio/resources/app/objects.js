/*!---------------------------------------------------------
* Copyright (C) Microsoft Corporation. All rights reserved.
*--------------------------------------------------------*/
/// <reference path="./declare/node.d.ts" />
/// <reference path="./declare/atom-renderer.d.ts" />
'use strict';
/**
 * Copies all properties of source into destination. The optional parameter "overwrite" allows to control
 * if existing properties on the destination should be overwritten or not. Defaults to true (overwrite).
 */
function mixin(destination, source, overwrite) {
    if (overwrite === void 0) { overwrite = true; }
    if (!isObject(destination)) {
        return source;
    }
    if (isObject(source)) {
        Object.keys(source).forEach(function (key) {
            if (key in destination) {
                if (overwrite) {
                    if (isObject(destination[key]) && isObject(source[key])) {
                        mixin(destination[key], source[key], overwrite);
                    }
                    else {
                        destination[key] = source[key];
                    }
                }
            }
            else {
                destination[key] = source[key];
            }
        });
    }
    return destination;
}
exports.mixin = mixin;
/**
 * Returns whether the provided parameter is a JavaScript Object or not.
 */
function isObject(obj) {
    // Needed for IE8
    if (typeof obj === 'undefined' || obj === null) {
        return false;
    }
    return Object.prototype.toString.call(obj) === '[object Object]';
}
exports.isObject = isObject;
function equals(one, other) {
    if (one === other) {
        return true;
    }
    if (one === null || one === undefined || other === null || other === undefined) {
        return false;
    }
    if (typeof one !== typeof other) {
        return false;
    }
    if (typeof one !== 'object') {
        return false;
    }
    if ((Array.isArray(one)) !== (Array.isArray(other))) {
        return false;
    }
    var i, key;
    if (Array.isArray(one)) {
        if (one.length !== other.length) {
            return false;
        }
        for (i = 0; i < one.length; i++) {
            if (!equals(one[i], other[i])) {
                return false;
            }
        }
    }
    else {
        var oneKeys = [];
        for (key in one) {
            oneKeys.push(key);
        }
        oneKeys.sort();
        var otherKeys = [];
        for (key in other) {
            otherKeys.push(key);
        }
        otherKeys.sort();
        if (!equals(oneKeys, otherKeys)) {
            return false;
        }
        for (i = 0; i < oneKeys.length; i++) {
            if (!equals(one[oneKeys[i]], other[oneKeys[i]])) {
                return false;
            }
        }
    }
    return true;
}
exports.equals = equals;
