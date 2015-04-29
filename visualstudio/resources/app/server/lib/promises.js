/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
'use strict';
define(["require", "exports", './system'], function (require, exports, winjs) {
    function StopIteration() {
        this.name = 'Stop Iteration';
        this.message = 'Thrown to stop an iteration';
    }
    exports.StopIteration = StopIteration;
    ;
    StopIteration.prototype = new Error();
    var PromiseFunctionIterator = (function () {
        function PromiseFunctionIterator(array) {
            this.index = -1;
            this.array = array;
        }
        PromiseFunctionIterator.prototype.next = function () {
            this.index++;
            if (this.index >= this.array.length) {
                throw StopIteration;
            }
            return this.array[this.index]();
        };
        return PromiseFunctionIterator;
    })();
    var PromiseAccessFunctionIterator = (function () {
        function PromiseAccessFunctionIterator(objects, paf) {
            this.index = -1;
            this.objects = objects;
            this.paf = paf;
        }
        PromiseAccessFunctionIterator.prototype.next = function () {
            var index = ++this.index;
            if (index >= this.objects.length) {
                throw StopIteration;
            }
            return this.paf(this.objects[index], index);
        };
        return PromiseAccessFunctionIterator;
    })();
    function iterator(promises, paf) {
        if (!promises) {
            return null;
        }
        if (Array.isArray(promises)) {
            if (promises.length === 0) {
                return new PromiseFunctionIterator(promises);
            }
            else {
                if (typeof promises[0] === 'function') {
                    return new PromiseFunctionIterator(promises);
                }
                else if (typeof promises[0] === 'object' && paf) {
                    return new PromiseAccessFunctionIterator(promises, paf);
                }
            }
        }
        else if (typeof promises === 'object' && typeof promises.next === 'function') {
            return promises;
        }
        return null;
    }
    exports.iterator = iterator;
    function sequence(arg, paf) {
        return _sequence(iterator(arg, paf));
    }
    exports.sequence = sequence;
    function _sequence(iter) {
        if (iter === null) {
            return winjs.Promise.wrapError('Invalid iterator provided');
        }
        // TODO@Dirk - onCancel?
        return new winjs.Promise(function (c, e, p) {
            var values = [];
            var looper = function () {
                try {
                    var promise = iter.next();
                    if (promise === null) {
                        values.push(null);
                        process.nextTick(function () {
                            looper();
                        });
                    }
                    else {
                        promise.then(function (value) {
                            values.push(value);
                            looper();
                        }, e).done(null, e);
                    }
                }
                catch (exp) {
                    if (exp === StopIteration) {
                        c(values);
                    }
                    else {
                        e(exp);
                    }
                }
            };
            looper();
        });
    }
    function some(iter, tf) {
        if (iter === null) {
            return winjs.Promise.wrapError('Invalid iterator provided');
        }
        // TODO@Dirk - onCancel?
        return new winjs.Promise(function (c, e, p) {
            var looper = function (index) {
                try {
                    var promise = iter.next();
                    var result = false;
                    if (!promise) {
                        if (tf) {
                            result = tf(promise, index);
                        }
                        if (result) {
                            c(true);
                        }
                        else {
                            process.nextTick(function () {
                                looper(index + 1);
                            });
                        }
                    }
                    else {
                        promise.then(function (value) {
                            if (tf) {
                                result = tf(value, index);
                            }
                            else {
                                result = !!value;
                            }
                            if (result) {
                                c(true);
                            }
                            else {
                                looper(index + 1);
                            }
                        }, e).done(null, e);
                    }
                }
                catch (exp) {
                    if (exp === StopIteration) {
                        c(false);
                    }
                    else {
                        e(exp);
                    }
                }
            };
            looper(0);
        });
    }
    exports.some = some;
    function as(fn) {
        return new winjs.TPromise(function (c, e) {
            fn(function (error, result) {
                if (error) {
                    e(error);
                }
                else {
                    c(result);
                }
            });
        });
    }
    exports.as = as;
});
