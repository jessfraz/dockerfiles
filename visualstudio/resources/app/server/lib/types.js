/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
// This is a copy of vs/base/types. We should come to a model
// in the future were we can share server and client code.
'use strict';
define(["require", "exports"], function (require, exports) {
    /**
     * Returns whether the provided parameter is a JavaScript Array or not.
     */
    function isArray(array) {
        if (Array.isArray) {
            return Array.isArray(array);
        }
        if (array && typeof (array.length) === 'number' && array.constructor === Array) {
            return true;
        }
        return false;
    }
    exports.isArray = isArray;
    /**
     * Returns whether the provided parameter is a JavaScript String or not.
     */
    function isString(str) {
        if (typeof (str) === 'string' || str instanceof String) {
            return true;
        }
        return false;
    }
    exports.isString = isString;
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
    /**
     * Returns whether the provided parameter is a JavaScript Number or not.
     */
    function isNumber(obj) {
        if ((typeof (obj) === 'number' || obj instanceof Number) && !isNaN(obj)) {
            return true;
        }
        return false;
    }
    exports.isNumber = isNumber;
    /**
     * Returns whether the provided parameter is undefined.
     */
    function isUndefined(obj) {
        return typeof (obj) === 'undefined';
    }
    exports.isUndefined = isUndefined;
    /**
     * Returns whether the provided parameter is undefined or null.
     */
    function isUndefinedOrNull(obj) {
        return isUndefined(obj) || obj === null;
    }
    exports.isUndefinedOrNull = isUndefinedOrNull;
    /**
     * Returns whether the provided parameter is an empty JavaScript Object or not.
     */
    function isEmptyObject(obj) {
        if (!isObject(obj)) {
            return false;
        }
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                return false;
            }
        }
        return true;
    }
    exports.isEmptyObject = isEmptyObject;
    /**
     * Returns whether the provided parameter is a JavaScript Function or not.
     */
    function isFunction(obj) {
        return Object.prototype.toString.call(obj) === '[object Function]';
    }
    exports.isFunction = isFunction;
    /**
     * Creates a new object of the provided class and will call the constructor with
     * any additional argument supplied.
     */
    function create(ctor) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var obj = Object.create(ctor.prototype);
        ctor.apply(obj, args);
        return obj;
    }
    exports.create = create;
    /**
     * Creates a new object which delegates every function call to
     * the provided invocation handler.
     */
    function proxy(target, invocationHandler, inherited) {
        if (inherited === void 0) { inherited = true; }
        var prop, result = {};
        for (prop in target) {
            if (inherited || target.hasOwnProperty(prop)) {
                if (isFunction(target[prop])) {
                    result[prop] = function (method) {
                        return function () {
                            return invocationHandler(target, method, arguments);
                        };
                    }(prop);
                }
            }
        }
        return result;
    }
    exports.proxy = proxy;
    /**
     * Returns a new array with all undefined or null values removed. The original array is not modified at all.
     */
    function coalesce(array) {
        if (!array) {
            return array;
        }
        var result = [];
        for (var i = 0; i < array.length; i++) {
            var element = array[i];
            if (element) {
                result.push(element);
            }
        }
        return result;
    }
    exports.coalesce = coalesce;
});
