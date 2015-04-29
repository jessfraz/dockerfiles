/*!---------------------------------------------------------
* Copyright (C) Microsoft Corporation. All rights reserved.
*--------------------------------------------------------*/
/// <reference path="./declare/node.d.ts" />
/// <reference path="./declare/atom-browser.d.ts" />
'use strict';
var ipc = require('ipc');
var servant = require('./servant');
var env = require('./env');
var ServantsManager = (function () {
    function ServantsManager() {
        this.map = {};
        this.reqId2Id = {};
    }
    ServantsManager.prototype.ready = function () {
        this.registerListeners();
    };
    ServantsManager.prototype.registerListeners = function () {
        var _this = this;
        ipc.on('ticino:fromtbw', function (event, msg) {
            var id = msg.$tbw_id;
            if (!_this.map.hasOwnProperty(id)) {
                console.warn('Cannot send message to owner from managed browser window');
                return;
            }
            var bw = _this.map[id];
            bw.sendMessageToOwner(msg);
        });
        ipc.on('ticino:totbw', function (event, msg) {
            var id = msg.$tbw_id;
            if (!_this.map.hasOwnProperty(id)) {
                console.warn('Cannot send message to managed browser window');
                return;
            }
            var bw = _this.map[id];
            bw.postMessage(msg.payload);
        });
        ipc.on('ticino:servant:cancelOpen', function (event, opts) {
            var reqId = opts.reqId;
            if (!_this.reqId2Id.hasOwnProperty(reqId)) {
                console.warn('Cannot cancel unknown managed browser window');
                return;
            }
            var id = _this.reqId2Id[reqId];
            if (!_this.map.hasOwnProperty(id)) {
                console.warn('Cannot cancel unknown managed browser window');
                return;
            }
            var bw = _this.map[id];
            bw.dispose();
        });
        ipc.on('ticino:servant:dispose', function (event, opts) {
            var id = opts.$tbw_id;
            if (!_this.map.hasOwnProperty(id)) {
                console.warn('Cannot dispose unknown managed browser window');
                return;
            }
            var bw = _this.map[id];
            bw.dispose();
        });
        ipc.on('ticino:servant:reveal', function (event, opts) {
            var id = opts.$tbw_id;
            if (!_this.map.hasOwnProperty(id)) {
                console.warn('Cannot reveal unknown managed browser window');
                return;
            }
            var bw = _this.map[id];
            bw.reveal();
        });
        ipc.on('ticino:servant:hide', function (event, opts) {
            var id = opts.$tbw_id;
            if (!_this.map.hasOwnProperty(id)) {
                console.warn('Cannot hide unknown managed browser window');
                return;
            }
            var bw = _this.map[id];
            bw.hide();
        });
        ipc.on('ticino:servant:open', function (event, opts) {
            env.log('IPC#ticino-servant-open');
            var id, reqId = opts.reqId;
            var bw = new servant.ManagedBrowserWindow(opts, event.sender, function () {
                delete _this.map[id];
                delete _this.reqId2Id[reqId];
            });
            id = bw.getId();
            _this.map[id] = bw;
            _this.reqId2Id[reqId] = id;
        });
    };
    return ServantsManager;
})();
exports.ServantsManager = ServantsManager;
exports.manager = new ServantsManager();
