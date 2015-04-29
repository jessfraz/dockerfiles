/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
'use strict';
define(["require", "exports", './types'], function (require, exports, types) {
    function clone(obj) {
        if (!obj || typeof obj !== 'object') {
            return obj;
        }
        var result = (Array.isArray(obj)) ? [] : {};
        Object.keys(obj).forEach(function (key) {
            if (obj[key] && typeof obj[key] === 'object') {
                result[key] = clone(obj[key]);
            }
            else {
                result[key] = obj[key];
            }
        });
        return result;
    }
    exports.clone = clone;
    /**
     * Recursively call Object.freeze on object and any properties that are objects.
     */
    function deepFreeze(obj) {
        Object.freeze(obj);
        Object.keys(obj).forEach(function (key) {
            if (!(typeof obj[key] === 'object') || Object.isFrozen(obj[key])) {
                return;
            }
            deepFreeze(obj[key]);
        });
    }
    exports.deepFreeze = deepFreeze;
    /**
     * Copies all properties of source into destination. The optional parameter "overwrite" allows to control
     * if existing properties on the destination should be overwritten or not. Defaults to true (overwrite).
     */
    function mixin(destination, source, overwrite) {
        if (overwrite === void 0) { overwrite = true; }
        if (!types.isObject(destination)) {
            return source;
        }
        if (types.isObject(source)) {
            Object.keys(source).forEach(function (key) {
                if (key in destination) {
                    if (overwrite) {
                        if (types.isObject(destination[key]) && types.isObject(source[key])) {
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
     * Returns a new object that has all values of {{obj}}
     * plus those from {{defaults}}.
     */
    function withDefaults(obj, defaults) {
        return mixin(clone(defaults), obj || {});
    }
    exports.withDefaults = withDefaults;
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
    function ensureProperty(obj, property, defaultValue) {
        if (typeof obj[property] === 'undefined') {
            obj[property] = defaultValue;
        }
    }
    exports.ensureProperty = ensureProperty;
    function arrayToHash(array) {
        var result = {};
        for (var i = 0; i < array.length; ++i) {
            result[array[i]] = true;
        }
        return result;
    }
    exports.arrayToHash = arrayToHash;
    /**
     * Given an array of strings, returns a function which, given a string
     * returns true or false whether the string is in that array.
     */
    function createKeywordMatcher(arr, caseInsensitive) {
        if (caseInsensitive === void 0) { caseInsensitive = false; }
        if (caseInsensitive) {
            arr = arr.map(function (x) {
                return x.toLowerCase();
            });
        }
        var hash = arrayToHash(arr);
        if (caseInsensitive) {
            return function (word) {
                return hash[word.toLowerCase()] !== undefined && hash.hasOwnProperty(word.toLowerCase());
            };
        }
        else {
            return function (word) {
                return hash[word] !== undefined && hash.hasOwnProperty(word);
            };
        }
    }
    exports.createKeywordMatcher = createKeywordMatcher;
    /**
     * Copied from WinJS.Class.Derive to make a type a subclass of a specific class.
     */
    function derive(baseClass, constructor) {
        constructor = constructor || function () {
        };
        var basePrototype = baseClass.prototype;
        constructor.prototype = Object.create(basePrototype);
        // Cast to any due to Bug 16188:PropertyDescriptor set and get function should be optional.
        Object.defineProperty(constructor.prototype, 'constructor', { value: constructor, writable: true, configurable: true, enumerable: true });
        return constructor;
    }
    exports.derive = derive;
});
