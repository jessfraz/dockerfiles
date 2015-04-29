/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
'use strict';
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", './system'], function (require, exports, winjs) {
    /**
     * A helper to prevent accumulation of sequential async tasks.
     *
     * Imagine a mail man with the sole task of delivering letters. As soon as
     * a letter submitted for delivery, he drives to the destination, delivers it
     * and returns to his base. Imagine that during the trip, N more letters were submitted.
     * When the mail man returns, he picks those N letters and delivers them all in a
     * single trip. Even though N+1 submissions occurred, only 2 deliveries were made.
     *
     * The throttler implements this via the queue() method, by providing it a task
     * factory. Following the example:
     *
     * 		var throttler = new Throttler();
     * 		var letters = [];
     *
     * 		function letterReceived(l) {
     * 			letters.push(l);
     * 			throttler.queue(() => { return makeTheTrip(); });
     * 		}
     */
    var Throttler = (function () {
        function Throttler() {
            this.activePromise = null;
            this.queuedPromise = null;
            this.queuedPromiseFactory = null;
        }
        Throttler.prototype.queue = function (promiseFactory) {
            var _this = this;
            if (this.activePromise) {
                this.queuedPromiseFactory = promiseFactory;
                if (!this.queuedPromise) {
                    var onComplete = function () {
                        _this.queuedPromise = null;
                        var result = _this.queue(_this.queuedPromiseFactory);
                        _this.queuedPromiseFactory = null;
                        return result;
                    };
                    this.queuedPromise = this.activePromise.then(onComplete, onComplete);
                }
                return new winjs.Promise(function (c, e) {
                    _this.queuedPromise.then(c, e);
                }, function () {
                    // no-op
                });
            }
            this.activePromise = promiseFactory();
            return this.activePromise.then(function (result) {
                _this.activePromise = null;
                return result;
            }, function (err) {
                _this.activePromise = null;
                return winjs.Promise.wrapError(err);
            });
        };
        return Throttler;
    })();
    exports.Throttler = Throttler;
    /**
     * A helper to delay execution of a task that is being requested often.
     *
     * Following the throttler, now imagine the mail man wants to optimize the number of
     * trips proactively. The trip itself can be long, so the he decides not to make the trip
     * as soon as a letter is submitted. Instead he waits a while, in case more
     * letters are submitted. After said waiting period, if no letters were submitted, he
     * decides to make the trip. Imagine that N more letters were submitted after the first
     * one, all within a short period of time between each other. Even though N+1
     * submissions occurred, only 1 delivery was made.
     *
     * The delayer offers this behavior via the trigger() method, into which both the task
     * to be executed and the waiting period (delay) must be passed in as arguments. Following
     * the example:
     *
     * 		var delayer = new Delayer(WAITING_PERIOD);
     * 		var letters = [];
     *
     * 		function letterReceived(l) {
     * 			letters.push(l);
     * 			delayer.trigger(() => { return makeTheTrip(); });
     * 		}
     */
    var Delayer = (function () {
        function Delayer(defaultDelay) {
            this.defaultDelay = defaultDelay;
            this.timeoutPromise = null;
            this.completionPromise = null;
            this.onSuccess = null;
            this.task = null;
        }
        Delayer.prototype.trigger = function (task, delay) {
            var _this = this;
            if (delay === void 0) { delay = this.defaultDelay; }
            this.task = task;
            this.cancelTimeout();
            if (!this.completionPromise) {
                this.completionPromise = new winjs.Promise(function (c) {
                    _this.onSuccess = c;
                }, function () {
                    // no-op
                }).then(function () {
                    _this.completionPromise = null;
                    _this.onSuccess = null;
                    var result = _this.task();
                    _this.task = null;
                    return result;
                });
            }
            this.timeoutPromise = winjs.Promise.timeout(delay);
            this.timeoutPromise.then(function () {
                _this.timeoutPromise = null;
                _this.onSuccess(null);
            });
            return this.completionPromise;
        };
        Delayer.prototype.isTriggered = function () {
            return !!this.timeoutPromise;
        };
        Delayer.prototype.cancel = function () {
            this.cancelTimeout();
            if (this.completionPromise) {
                this.completionPromise.cancel();
                this.completionPromise = null;
            }
        };
        Delayer.prototype.cancelTimeout = function () {
            if (this.timeoutPromise) {
                this.timeoutPromise.cancel();
                this.timeoutPromise = null;
            }
        };
        return Delayer;
    })();
    exports.Delayer = Delayer;
    /**
     * A helper to delay execution of a task that is being requested often, while
     * preventing accumulation of consecutive executions.
     *
     * Simply combine the two mail man strategies from the Throttler and Delayer
     * helpers, for an analogy.
     */
    var ThrottledDelayer = (function (_super) {
        __extends(ThrottledDelayer, _super);
        function ThrottledDelayer(defaultDelay) {
            _super.call(this, defaultDelay);
            this.throttler = new Throttler();
        }
        ThrottledDelayer.prototype.trigger = function (promiseFactory, delay) {
            var _this = this;
            return _super.prototype.trigger.call(this, function () { return _this.throttler.queue(promiseFactory); }, delay);
        };
        return ThrottledDelayer;
    })(Delayer);
    exports.ThrottledDelayer = ThrottledDelayer;
    function once(fn) {
        var _this = this;
        var didCall = false;
        var result;
        return function () {
            if (didCall) {
                return result;
            }
            didCall = true;
            result = fn.apply(_this, arguments);
            return result;
        };
    }
    exports.once = once;
});
