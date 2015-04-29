/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
/// <reference path="../declare/node.d.ts" />
/// <reference path="../declare/express.d.ts" />
'use strict';
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", 'events'], function (require, exports, events) {
    /**
     * TypeScript class to subclass from node's NodeEventEmitter
     */
    var EventEmitter = (function () {
        function EventEmitter() {
            events.EventEmitter.call(this);
        }
        EventEmitter.prototype.addListener = function (event, listener) {
            events.EventEmitter.prototype.addListener.call(this, event, listener);
        };
        EventEmitter.prototype.on = function (event, listener) {
            return events.EventEmitter.prototype.on.call(this, event, listener);
        };
        EventEmitter.prototype.once = function (event, listener) {
            events.EventEmitter.prototype.once.call(this, event, listener);
        };
        EventEmitter.prototype.removeListener = function (event, listener) {
            events.EventEmitter.prototype.removeListener.call(this, event, listener);
        };
        EventEmitter.prototype.removeAllListener = function (event) {
            events.EventEmitter.prototype.removeAllListener.call(this, event);
        };
        EventEmitter.prototype.setMaxListeners = function (n) {
            events.EventEmitter.prototype.setMaxListeners.call(this, n);
        };
        EventEmitter.prototype.listeners = function (event) {
            return events.EventEmitter.prototype.listeners.call(this, event);
        };
        EventEmitter.prototype.emit = function (event, arg1, arg2) {
            events.EventEmitter.prototype.emit.call(this, event, arg1, arg2);
        };
        return EventEmitter;
    })();
    exports.EventEmitter = EventEmitter;
    ///**
    // * TypeScript class to subclass from node's Stream
    // */
    //export class Stream extends EventEmitter implements stream.NodeStream {
    //	constructor() {
    //		super();
    //		(<any>stream.Stream).call(this);
    //	}
    //
    //	public pipe(destination: WritableStream, options?: { end?: boolean; }): void {
    //		(<any>stream.Stream).prototype.pipe.call(this, destination, options);
    //	}
    //}
    /**
     * TypeScript class to subclass from node's Stream
     */
    var Stream = (function (_super) {
        __extends(Stream, _super);
        function Stream() {
            _super.call(this);
            //		(<any>stream.Stream).call(this);
        }
        return Stream;
    })(EventEmitter);
    exports.Stream = Stream;
});
