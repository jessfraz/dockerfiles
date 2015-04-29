/*!---------------------------------------------------------
* Copyright (C) Microsoft Corporation. All rights reserved.
*--------------------------------------------------------*/
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/// <reference path="./declare/node.d.ts" />
/// <reference path="./declare/atom-browser.d.ts" />
var events = require('events');
var autoupdater = require('auto-updater');
var env = require('./env');
'use strict';
(function (State) {
    State[State["Uninitialized"] = 0] = "Uninitialized";
    State[State["Idle"] = 1] = "Idle";
    State[State["CheckingForUpdate"] = 2] = "CheckingForUpdate";
    State[State["UpdateAvailable"] = 3] = "UpdateAvailable";
    State[State["UpdateDownloaded"] = 4] = "UpdateDownloaded";
})(exports.State || (exports.State = {}));
var State = exports.State;
(function (ExplicitState) {
    ExplicitState[ExplicitState["Implicit"] = 0] = "Implicit";
    ExplicitState[ExplicitState["Explicit"] = 1] = "Explicit";
})(exports.ExplicitState || (exports.ExplicitState = {}));
var ExplicitState = exports.ExplicitState;
var UpdateManager = (function (_super) {
    __extends(UpdateManager, _super);
    function UpdateManager() {
        var _this = this;
        _super.call(this);
        this._state = State.Uninitialized;
        this.explicitState = ExplicitState.Implicit;
        this._availableUpdate = null;
        this._lastCheckDate = null;
        if (env.isWindows) {
            this.raw = require('./win32/auto-updater.win32');
        }
        else {
            this.raw = autoupdater;
        }
        this.raw.on('error', function (event, message) {
            _this.emit('error', event, message);
        });
        this.raw.on('checking-for-update', function () {
            _this.emit('checking-for-update');
            _this.setState(State.CheckingForUpdate);
        });
        this.raw.on('update-available', function () {
            _this.emit('update-available');
            _this.setState(State.UpdateAvailable);
        });
        this.raw.on('update-not-available', function () {
            _this.emit('update-not-available', _this.explicitState === ExplicitState.Explicit);
            _this.setState(State.Idle);
        });
        this.raw.on('update-downloaded', function (event, releaseNotes, version, date, url, quitAndUpdate) {
            var data = {
                releaseNotes: releaseNotes,
                version: version,
                date: date,
                quitAndUpdate: quitAndUpdate
            };
            _this.emit('update-downloaded', data);
            _this.setState(State.UpdateDownloaded, data);
        });
    }
    UpdateManager.prototype.initialize = function (feedurl) {
        this.raw.setFeedUrl(feedurl);
        this.setState(State.Idle);
    };
    Object.defineProperty(UpdateManager.prototype, "state", {
        get: function () {
            return this._state;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(UpdateManager.prototype, "availableUpdate", {
        get: function () {
            return this._availableUpdate;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(UpdateManager.prototype, "lastCheckDate", {
        get: function () {
            return this._lastCheckDate;
        },
        enumerable: true,
        configurable: true
    });
    UpdateManager.prototype.checkForUpdates = function (explicit) {
        if (explicit === void 0) { explicit = false; }
        this.explicitState = explicit ? ExplicitState.Explicit : ExplicitState.Implicit;
        this._lastCheckDate = new Date();
        this.raw.checkForUpdates();
    };
    UpdateManager.prototype.setState = function (state, availableUpdate) {
        if (availableUpdate === void 0) { availableUpdate = null; }
        this._state = state;
        this._availableUpdate = availableUpdate;
        this.emit('change');
    };
    return UpdateManager;
})(events.EventEmitter);
exports.UpdateManager = UpdateManager;
exports.Instance = new UpdateManager();
