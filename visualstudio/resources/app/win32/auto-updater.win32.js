/*!---------------------------------------------------------
* Copyright (C) Microsoft Corporation. All rights reserved.
*--------------------------------------------------------*/
/// <reference path="../declare/node.d.ts" />
/// <reference path="../declare/atom-browser.d.ts" />
'use strict';
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var events = require('events');
var squirrel = require('./squirrel.win32');
var app = require('app');
var Win32AutoUpdaterImpl = (function (_super) {
    __extends(Win32AutoUpdaterImpl, _super);
    function Win32AutoUpdaterImpl() {
        _super.call(this);
        this._squirrel = null;
        this.url = null;
    }
    Object.defineProperty(Win32AutoUpdaterImpl.prototype, "squirrel", {
        get: function () {
            return this._squirrel || (this._squirrel = new squirrel.Squirrel(process.execPath, this.url));
        },
        enumerable: true,
        configurable: true
    });
    Win32AutoUpdaterImpl.prototype.setFeedUrl = function (url) {
        this.url = url;
    };
    Win32AutoUpdaterImpl.prototype.checkForUpdates = function () {
        var _this = this;
        if (!this.url) {
            throw new Error('No feed url set.');
        }
        if (!this.squirrel) {
            this.squirrel = new squirrel.Squirrel(process.execPath, this.url);
        }
        this.emit('checking-for-update');
        if (!this.squirrel.isAvailable) {
            this.emit('update-not-available');
            return;
        }
        this.squirrel.download(function (err, update) {
            if (err || !update) {
                return _this.emit('update-not-available');
            }
            _this.squirrel.update(function (err) {
                if (err) {
                    return _this.emit('update-not-available');
                }
                _this.emit('update-available');
                _this.emit('update-downloaded', {}, update.releaseNotes, update.version, new Date(), _this.url, function () { return _this.quitAndUpdate(); });
            });
        });
    };
    Win32AutoUpdaterImpl.prototype.quitAndUpdate = function () {
        var _this = this;
        app.once('will-quit', function () { return _this.squirrel.processStart(null); });
        app.quit();
    };
    return Win32AutoUpdaterImpl;
})(events.EventEmitter);
var instance = new Win32AutoUpdaterImpl();
module.exports = instance;
