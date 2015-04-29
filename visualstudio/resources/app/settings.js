/*!---------------------------------------------------------
* Copyright (C) Microsoft Corporation. All rights reserved.
*--------------------------------------------------------*/
/// <reference path="./declare/node.d.ts" />
/// <reference path="./declare/atom-browser.d.ts" />
'use strict';
var fs = require('fs');
var events = require('events');
var path = require('path');
var app = require('app');
var env = require('./env');
var json = require('./json');
var objects = require('./objects');
var eventEmitter = new events.EventEmitter();
var EventTypes = {
    CHANGE: 'change'
};
function onChange(clb) {
    eventEmitter.addListener(EventTypes.CHANGE, clb);
    return function () { return eventEmitter.removeListener(EventTypes.CHANGE, clb); };
}
exports.onChange = onChange;
var SettingsManager = (function () {
    function SettingsManager() {
        this.registerWatchers();
    }
    SettingsManager.prototype.registerWatchers = function () {
        var _this = this;
        var watcher = fs.watch(path.dirname(env.appSettingsPath));
        watcher.on('change', function (eventType, fileName) { return _this.onSettingsFileChange(eventType, fileName); });
        app.on('will-quit', function () {
            watcher.close();
        });
    };
    SettingsManager.prototype.onSettingsFileChange = function (eventType, fileName) {
        var _this = this;
        // we can get multiple change events for one change, so we buffer through a timeout
        if (this.timeoutHandle) {
            global.clearTimeout(this.timeoutHandle);
            delete this.timeoutHandle;
        }
        this.timeoutHandle = global.setTimeout(function () {
            // Reload
            var didChange = _this.load();
            // Emit event
            if (didChange) {
                eventEmitter.emit(EventTypes.CHANGE, _this.globalSettings);
            }
        }, SettingsManager.CHANGE_BUFFER_DELAY);
    };
    SettingsManager.prototype.load = function () {
        var loadedSettings = this.doLoad();
        if (!objects.equals(loadedSettings, this.globalSettings)) {
            // Keep in class
            this.globalSettings = loadedSettings;
            // Store into global
            global.globalSettingsValue = JSON.stringify(this.globalSettings);
            return true; // changed value
        }
        return false; // no changed value
    };
    SettingsManager.prototype.doLoad = function () {
        var settings = this.doLoadSettings();
        return {
            settings: settings.contents,
            settingsParseErrors: settings.parseErrors,
            keybindings: this.doLoadKeybindings()
        };
    };
    SettingsManager.prototype.doLoadSettings = function () {
        function setNode(root, key, value) {
            var segments = key.split('.');
            var last = segments.pop();
            var curr = root;
            segments.forEach(function (s) {
                var obj = curr[s];
                switch (typeof obj) {
                    case 'undefined':
                        obj = curr[s] = {};
                        break;
                    case 'object':
                        break;
                    default:
                        console.log('Conflicting user settings: ' + key + ' at ' + s + ' with ' + JSON.stringify(obj));
                }
                curr = obj;
            });
            curr[last] = value;
        }
        try {
            var root = {};
            var content = '{}';
            try {
                content = fs.readFileSync(env.appSettingsPath).toString();
            }
            catch (error) {
            }
            var contents = JSON.parse(json.stripComments(content));
            for (var key in contents) {
                setNode(root, key, contents[key]);
            }
            return {
                contents: root
            };
        }
        catch (error) {
            // parse problem
            return {
                contents: {},
                parseErrors: [env.appSettingsPath]
            };
        }
    };
    SettingsManager.prototype.doLoadKeybindings = function () {
        try {
            return JSON.parse(json.stripComments(fs.readFileSync(env.appKeybindingsPath).toString()));
        }
        catch (error) {
        }
        return [];
    };
    SettingsManager.CHANGE_BUFFER_DELAY = 300;
    return SettingsManager;
})();
exports.SettingsManager = SettingsManager;
exports.manager = new SettingsManager();
