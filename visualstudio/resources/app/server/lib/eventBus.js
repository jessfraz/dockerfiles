/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
/// <reference path="../declare/node.d.ts" />
'use strict';
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", 'net', './events'], function (require, exports, net, events) {
    function connectBus(bus, socket) {
        var eventStack = [];
        socket.setEncoding('utf8');
        socket.setNoDelay();
        function emit(type, data) {
            eventStack.push({
                type: type,
                data: data
            });
            bus.emit(type, data);
        }
        var unbind = bus.addBulkListener(function (events) {
            for (var i = 0, len = events.length; i < len; i++) {
                var event = events[i];
                var type = event.getType();
                var data = event.getData();
                var lastKnownEvent = eventStack[eventStack.length - 1];
                if (lastKnownEvent && lastKnownEvent.type === type && lastKnownEvent.data === data) {
                    eventStack.pop();
                }
                else {
                    socket.write(JSON.stringify({
                        type: type,
                        data: data
                    }) + '\n');
                }
            }
        });
        socket.on('data', function (data) {
            var dataArray = data.split('\n');
            for (var i = 0, len = dataArray.length; i < len; i++) {
                var eventData = dataArray[i];
                if (eventData) {
                    var event = JSON.parse(eventData);
                    emit(event.type, event.data);
                }
            }
        });
        socket.on('error', function (err) {
            emit('error', err);
        });
        socket.on('close', function () {
            socket.removeAllListeners(); // TODO@Alex method does not exist?
            unbind();
            emit('close');
        });
        return function () {
            socket.close(); // TODO@Alex method does not exist?
        };
    }
    var ConnectedBus = (function (_super) {
        __extends(ConnectedBus, _super);
        function ConnectedBus(socket) {
            _super.call(this);
            this.socket = socket;
            connectBus(this, socket);
        }
        ConnectedBus.prototype.disconnect = function () {
            this.socket.end();
        };
        return ConnectedBus;
    })(events.EventEmitter);
    exports.ConnectedBus = ConnectedBus;
    function connect(hook, callback) {
        var socket = net.createConnection(hook, function () {
            callback(null, new ConnectedBus(socket));
        });
    }
    exports.connect = connect;
    function publish(hook, bus) {
        var server = net.createServer(function (socket) {
            connectBus(bus, socket);
        });
        server.on('error', function (err) {
            console.error(err);
        });
        server.listen(hook);
        return server;
    }
    exports.publish = publish;
});
