/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
'use strict';
define(["require", "exports"], function (require, exports) {
    function createStringDictionary() {
        return Object.create(null);
    }
    exports.createStringDictionary = createStringDictionary;
    function createNumberDictionary() {
        return Object.create(null);
    }
    exports.createNumberDictionary = createNumberDictionary;
    function lookup(from, what, alternate) {
        if (alternate === void 0) { alternate = null; }
        var key = String(what);
        if (contains(from, key)) {
            return from[key];
        }
        return alternate;
    }
    exports.lookup = lookup;
    function lookupOrInsert(from, stringOrNumber, alternate) {
        var key = String(stringOrNumber);
        if (contains(from, key)) {
            return from[key];
        }
        else {
            if (typeof alternate === 'function') {
                alternate = alternate();
            }
            from[key] = alternate;
            return alternate;
        }
    }
    exports.lookupOrInsert = lookupOrInsert;
    function insert(into, data, hashFn) {
        into[hashFn(data)] = data;
    }
    exports.insert = insert;
    var hasOwnProperty = Object.prototype.hasOwnProperty;
    function contains(from, what) {
        return hasOwnProperty.call(from, what);
    }
    exports.contains = contains;
    function keys(from) {
        return {
            every: function (callback) {
                for (var key in from) {
                    if (hasOwnProperty.call(from, key)) {
                        if (!callback(key)) {
                            return false;
                        }
                    }
                }
                return true;
            }
        };
    }
    exports.keys = keys;
    function values(from) {
        var result = [];
        for (var key in from) {
            if (hasOwnProperty.call(from, key)) {
                result.push(from[key]);
            }
        }
        return result;
    }
    exports.values = values;
    function forEach(from, callback) {
        for (var key in from) {
            if (hasOwnProperty.call(from, key)) {
                var result = callback({ key: key, value: from[key] }, function () {
                    delete from[key];
                });
                if (result === false) {
                    return;
                }
            }
        }
    }
    exports.forEach = forEach;
    function remove(from, key) {
        if (!hasOwnProperty.call(from, key)) {
            return false;
        }
        delete from[key];
        return true;
    }
    exports.remove = remove;
    /**
     * Groups the collection into a dictionary based on the provided
     * group function.
     */
    function groupBy(data, groupFn) {
        var result = createStringDictionary();
        data.forEach(function (element) { return lookupOrInsert(result, groupFn(element), []).push(element); });
        return result;
    }
    exports.groupBy = groupBy;
    exports.EmptyIterable = {
        every: function (callback) {
            return true;
        }
    };
    function combine(iterables) {
        var len = iterables.length;
        if (len === 0) {
            return exports.EmptyIterable;
        }
        else if (len === 1) {
            return iterables[0];
        }
        return {
            every: function (callback) {
                for (var i = 0; i < len; i++) {
                    if (!iterables[i].every(callback)) {
                        return false;
                    }
                }
                return true;
            }
        };
    }
    exports.combine = combine;
    function singleton(element) {
        return {
            every: function (callback) {
                return callback(element);
            }
        };
    }
    exports.singleton = singleton;
    function toArray(iterable) {
        if (Array.isArray(iterable)) {
            return iterable;
        }
        else {
            var result = [];
            iterable.every(function (e) {
                result.push(e);
                return true;
            });
            return result;
        }
    }
    exports.toArray = toArray;
});
///**
// * ECMAScript 6 iterator
// */
//export interface IIterator<T> {
//	next(): { done: boolean; value?: T; };
//}
//
//export function empty<T>():IIterator<T> {
//	return {
//		next: function() { return { done: true }; }
//	};
//}
//
//export function iterator<T>(array: T[]): IIterator<T> { 
//	var i = 0;
//	return {
//		next: () => { 
//			if(i < array.length) {
//				return {
//					done: false,
//					value: array[i++]
//				};
//			} else {
//				return {
//					done: true
//				};
//			}
//		}
//	};
//} 
