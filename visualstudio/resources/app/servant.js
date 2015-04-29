/*!---------------------------------------------------------
* Copyright (C) Microsoft Corporation. All rights reserved.
*--------------------------------------------------------*/
/// <reference path="./declare/node.d.ts" />
/// <reference path="./declare/atom-browser.d.ts" />
'use strict';
var BrowserWindow = require('browser-window');
var env = require('./env');
var ManagedBrowserWindow = (function () {
    function ManagedBrowserWindow(opts, owner, onDisposedCallback) {
        var _this = this;
        this.id = String(++ManagedBrowserWindow.INSTANCE_COUNT);
        this.owner = owner;
        this._onDisposedCallback = onDisposedCallback;
        this.masterProcessId = opts.pid;
        this.masterRequestId = opts.reqId;
        var bounds = require('screen').getPrimaryDisplay().bounds;
        this.browserWindow = new BrowserWindow({
            x: 10 + bounds.x + (ManagedBrowserWindow.INSTANCE_COUNT * 50) % Math.floor(bounds.width / 2),
            y: 10 + bounds.y + (ManagedBrowserWindow.INSTANCE_COUNT * 50) % Math.floor(bounds.height / 2),
            width: 800,
            height: 600,
            show: false,
            frame: true,
            kiosk: false
        });
        this.browserWindow.setTitle(opts.name);
        this._onFrameFinishLoad = function () {
            _this.postMessage({
                $tbw: true,
                ownerProcessId: _this.masterProcessId,
                communicationId: _this.id,
                appRoot: env.appRoot,
                module: opts.module,
                initData: opts.initData
            });
            _this.owner.send('ticino:servant:opened', {
                reqId: _this.masterRequestId,
                id: _this.id
            });
        };
        this.browserWindow.webContents.on('did-frame-finish-load', this._onFrameFinishLoad);
        this.browserWindow.loadUrl('file://' + __dirname.replace(/\\/g, '/') + '/index-servant.html');
        this._onCrashed = function () {
            try {
                _this.owner.send('ticino:servant:crashed', {
                    $tbw_id: _this.id
                });
            }
            catch (e) {
                console.warn('Could not notify owner that managed browser process crashed: ', e);
            }
            _this._dispose(true);
        };
        this.browserWindow.webContents.on('crashed', this._onCrashed);
    }
    ManagedBrowserWindow.prototype._dispose = function (isCrash) {
        try {
            this.browserWindow.webContents.removeAllListeners();
        }
        catch (e) {
            console.warn('Could not remove all listeners from managed browser process: ', e);
        }
        try {
            this.browserWindow.destroy();
        }
        catch (e) {
            console.warn('Could not destroy managed browser process: ', e);
        }
        this.id = null;
        this.masterProcessId = -1;
        this.masterRequestId = -1;
        this.browserWindow = null;
        this.owner = null;
        this._onFrameFinishLoad = null;
        this._onCrashed = null;
        var onDisposed = this._onDisposedCallback;
        this._onDisposedCallback = null;
        onDisposed();
    };
    ManagedBrowserWindow.prototype.dispose = function () {
        this._dispose(false);
    };
    ManagedBrowserWindow.prototype.getId = function () {
        return this.id;
    };
    ManagedBrowserWindow.prototype.postMessage = function (msg) {
        if (this.browserWindow.webContents) {
            this.browserWindow.webContents.send('tbw', msg);
        }
        else {
            console.warn('Cannot send message to managed browser window (because [I am]|[it is] shutting down?)');
        }
    };
    ManagedBrowserWindow.prototype.sendMessageToOwner = function (msg) {
        this.owner.send('tbw', msg);
    };
    ManagedBrowserWindow.prototype.reveal = function () {
        this.browserWindow.openDevTools();
        this.browserWindow.show();
    };
    ManagedBrowserWindow.prototype.hide = function () {
        this.browserWindow.closeDevTools();
        this.browserWindow.hide();
    };
    ManagedBrowserWindow.INSTANCE_COUNT = 0;
    return ManagedBrowserWindow;
})();
exports.ManagedBrowserWindow = ManagedBrowserWindow;
