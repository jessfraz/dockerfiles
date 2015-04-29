/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
'use strict';
define(["require", "exports"], function (require, exports) {
    var EmitterEvent = (function () {
        function EmitterEvent(eventType, data, emitterType) {
            if (emitterType === void 0) { emitterType = null; }
            this._type = eventType;
            this._data = data;
            this._emitterType = emitterType;
        }
        EmitterEvent.prototype.getType = function () {
            return this._type;
        };
        EmitterEvent.prototype.getData = function () {
            return this._data;
        };
        EmitterEvent.prototype.getEmitterType = function () {
            return this._emitterType;
        };
        return EmitterEvent;
    })();
    exports.EmitterEvent = EmitterEvent;
    var EventEmitter = (function () {
        function EventEmitter() {
            this._listeners = {};
            this._bulkListeners = [];
            this._collectedEvents = [];
            this._deferredCnt = 0;
        }
        EventEmitter.prototype.addListener = function (eventType, listener) {
            var _this = this;
            if (eventType === '*') {
                throw new Error('Use addBulkListener(listener) to register your listener!');
            }
            if (this._listeners.hasOwnProperty(eventType)) {
                this._listeners[eventType].push(listener);
            }
            else {
                this._listeners[eventType] = [listener];
            }
            return function () {
                _this._removeListener(eventType, listener);
            };
        };
        EventEmitter.prototype.on = function (eventType, listener) {
            return this.addListener(eventType, listener);
        };
        EventEmitter.prototype.addOneTimeListener = function (eventType, listener) {
            var unbind = this.addListener(eventType, function (value) {
                unbind();
                listener(value);
            });
            return unbind;
        };
        EventEmitter.prototype.addBulkListener = function (listener) {
            var _this = this;
            this._bulkListeners.push(listener);
            return function () {
                _this._removeBulkListener(listener);
            };
        };
        EventEmitter.prototype.addEmitter = function (eventEmitter, emitterType) {
            var _this = this;
            if (emitterType === void 0) { emitterType = null; }
            return eventEmitter.addBulkListener(function (events) {
                var newEvents = events;
                if (emitterType) {
                    // If the emitter has an emitterType, recreate events
                    newEvents = [];
                    for (var i = 0, len = events.length; i < len; i++) {
                        newEvents.push(new EmitterEvent(events[i].getType(), events[i].getData(), emitterType));
                    }
                }
                if (_this._deferredCnt === 0) {
                    _this._emitEvents(newEvents);
                }
                else {
                    // Collect for later
                    _this._collectedEvents.push.apply(_this._collectedEvents, newEvents);
                }
            });
        };
        EventEmitter.prototype.addEmitterTypeListener = function (eventType, emitterType, listener) {
            if (emitterType) {
                if (eventType === '*') {
                    throw new Error('Bulk listeners cannot specify an emitter type');
                }
                return this.addListener(eventType + '/' + emitterType, listener);
            }
            else {
                return this.addListener(eventType, listener);
            }
        };
        EventEmitter.prototype._removeListener = function (eventType, listener) {
            if (this._listeners.hasOwnProperty(eventType)) {
                var listeners = this._listeners[eventType];
                for (var i = 0, len = listeners.length; i < len; i++) {
                    if (listeners[i] === listener) {
                        listeners.splice(i, 1);
                        break;
                    }
                }
            }
        };
        EventEmitter.prototype._removeBulkListener = function (listener) {
            for (var i = 0, len = this._bulkListeners.length; i < len; i++) {
                if (this._bulkListeners[i] === listener) {
                    this._bulkListeners.splice(i, 1);
                    break;
                }
            }
        };
        EventEmitter.prototype._emitToSpecificTypeListeners = function (eventType, data) {
            if (this._listeners.hasOwnProperty(eventType)) {
                var listeners = this._listeners[eventType].slice(0);
                for (var i = 0, len = listeners.length; i < len; i++) {
                    listeners[i](data);
                }
            }
        };
        EventEmitter.prototype._emitToBulkListeners = function (events) {
            var bulkListeners = this._bulkListeners.slice(0);
            for (var i = 0, len = bulkListeners.length; i < len; i++) {
                bulkListeners[i](events);
            }
        };
        EventEmitter.prototype._emitEvents = function (events) {
            if (this._bulkListeners.length > 0) {
                this._emitToBulkListeners(events);
            }
            for (var i = 0, len = events.length; i < len; i++) {
                var e = events[i];
                this._emitToSpecificTypeListeners(e.getType(), e.getData());
                if (e.getEmitterType()) {
                    this._emitToSpecificTypeListeners(e.getType() + '/' + e.getEmitterType(), e.getData());
                }
            }
        };
        EventEmitter.prototype.emit = function (eventType, data) {
            if (data === void 0) { data = {}; }
            // Early return if no listeners would get this
            if (!this._listeners.hasOwnProperty(eventType) && this._bulkListeners.length === 0) {
                return;
            }
            var emitterEvent = new EmitterEvent(eventType, data);
            if (this._deferredCnt === 0) {
                this._emitEvents([emitterEvent]);
            }
            else {
                // Collect for later
                this._collectedEvents.push(emitterEvent);
            }
        };
        EventEmitter.prototype.deferredEmit = function (callback) {
            this._deferredCnt = this._deferredCnt + 1;
            var result = callback();
            this._deferredCnt = this._deferredCnt - 1;
            if (this._deferredCnt === 0) {
                this._emitCollected();
            }
            return result;
        };
        EventEmitter.prototype._emitCollected = function () {
            // Flush collected events
            var events = this._collectedEvents;
            this._collectedEvents = [];
            if (events.length > 0) {
                this._emitEvents(events);
            }
        };
        EventEmitter.prototype.dispose = function () {
            this._listeners = {};
            this._bulkListeners = [];
            this._collectedEvents = [];
            this._deferredCnt = 0;
        };
        return EventEmitter;
    })();
    exports.EventEmitter = EventEmitter;
});
