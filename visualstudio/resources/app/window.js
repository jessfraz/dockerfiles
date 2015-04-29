/*!---------------------------------------------------------
* Copyright (C) Microsoft Corporation. All rights reserved.
*--------------------------------------------------------*/
/// <reference path="./declare/node.d.ts" />
/// <reference path="./declare/atom-browser.d.ts" />
'use strict';
var Shell = require('shell');
var BrowserWindow = require('browser-window');
var env = require('./env');
var storage = require('./storage');
(function (WindowMode) {
    WindowMode[WindowMode["Maximized"] = 0] = "Maximized";
    WindowMode[WindowMode["Normal"] = 1] = "Normal";
    WindowMode[WindowMode["Minimized"] = 2] = "Minimized";
})(exports.WindowMode || (exports.WindowMode = {}));
var WindowMode = exports.WindowMode;
exports.defaultWindowState = function () {
    return {
        width: 1024,
        height: 768,
        mode: WindowMode.Normal
    };
};
var enableDebugLogging = false;
var TicinoWindow = (function () {
    function TicinoWindow(state) {
        this._lastFocusTime = -1;
        // Load window state
        this.restoreWindowState(state);
        // For VS theme we can show directly because background is white
        var showDirectly = storage.getItem(TicinoWindow.themeStorageKey) === 'vs' /* light theme */;
        if (showDirectly && !global.windowShow) {
            global.windowShow = new Date().getTime();
        }
        var options = {
            width: this.windowState.width,
            height: this.windowState.height,
            x: typeof this.windowState.x === 'number' ? this.windowState.x : undefined,
            y: typeof this.windowState.x === 'number' ? this.windowState.y : undefined,
            'min-width': 200,
            'min-height': 80,
            show: showDirectly,
            title: env.appNameLong
        };
        if (env.isLinux) {
            options.icon = env.appRoot + (env.isBuiltTicino ? '/vso.png' : '/tools/resources/vso-orange.png'); // Windows and Mac are better off using the embedded icon(s)
        }
        // Create the browser window.
        this._win = new BrowserWindow(options);
        if (showDirectly && this.currentWindowMode === WindowMode.Maximized) {
            this.win.maximize();
        }
        if (showDirectly) {
            this._lastFocusTime = new Date().getTime(); // since we show directly, we need to set the last focus time too
        }
        this.registerListeners();
    }
    Object.defineProperty(TicinoWindow.prototype, "win", {
        get: function () {
            return this._win;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TicinoWindow.prototype, "lastFocusTime", {
        get: function () {
            return this._lastFocusTime;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TicinoWindow.prototype, "openedWorkspacePath", {
        get: function () {
            return this._openedWorkspacePath;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TicinoWindow.prototype, "openedFilePath", {
        get: function () {
            return this._openedFilePath;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TicinoWindow.prototype, "isLoaded", {
        get: function () {
            return this._isLoaded;
        },
        enumerable: true,
        configurable: true
    });
    TicinoWindow.prototype.registerListeners = function () {
        var _this = this;
        // Remember that we loaded
        this._win.webContents.on('did-finish-load', function () {
            _this._isLoaded = true;
            // To prevent flashing, we set the window visible after the page has finished to load but before Ticino is loaded
            if (!_this.win.isVisible()) {
                if (!global.windowShow) {
                    global.windowShow = new Date().getTime();
                }
                if (_this.currentWindowMode === WindowMode.Maximized) {
                    _this.win.maximize();
                }
                if (!_this.win.isVisible()) {
                    _this.win.show();
                }
            }
        });
        // Handle code that wants to open links
        this._win.webContents.on('new-window', function (event, url) {
            event.preventDefault();
            Shell.openExternal(url);
        });
        // Window Focus
        this._win.on('focus', function () {
            _this._lastFocusTime = new Date().getTime();
        });
        // Window Closing
        this._win.on('close', function () {
            _this.saveWindowState();
        });
        // Window Failed to load
        this._win.webContents.on('did-fail-load', function (event, errorCode, errorDescription) {
            console.warn('[atom event]: fail to load, ', errorDescription);
        });
    };
    TicinoWindow.prototype.load = function (config) {
        var _this = this;
        this._isLoaded = false;
        // Remember the path we open in instance
        this._openedWorkspacePath = config.workspacePath;
        this._openedFilePath = config.filesToOpen && config.filesToOpen[0];
        // Load URL
        this._win.loadUrl(this.getUrl(config));
        // Make window visible if it did not open in N seconds because this indicates an error
        this.showTimeoutHandle = setTimeout(function () {
            if (_this._win && !_this._win.isVisible()) {
                _this._win.show();
                _this._win.focus();
                _this._win.openDevTools();
            }
        }, 10000);
    };
    TicinoWindow.prototype.getUrl = function (config) {
        var url = 'file://' + __dirname.replace(/\\/g, '/') + '/index.html';
        // Config
        url += '?config=' + encodeURIComponent(JSON.stringify(config));
        return url;
    };
    TicinoWindow.prototype.dumpWindowState = function () {
        if (this.win.isFullScreen()) {
            return; // do not store anything when window is fullscreen
        }
        if (!this.windowState) {
            this.windowState = {};
        }
        // get window mode
        if (!env.isMac && this.win.isMaximized()) {
            this.currentWindowMode = WindowMode.Maximized;
        }
        else if (this.win.isMinimized()) {
            this.currentWindowMode = WindowMode.Minimized;
        }
        else {
            this.currentWindowMode = WindowMode.Normal;
        }
        // we don't want to save minimized state, only maximized or normal
        if (this.currentWindowMode === WindowMode.Maximized) {
            this.windowState.mode = WindowMode.Maximized;
        }
        else if (this.currentWindowMode !== WindowMode.Minimized) {
            this.windowState.mode = WindowMode.Normal;
        }
        // only consider non-minimized window states
        if (this.currentWindowMode === WindowMode.Normal || this.currentWindowMode === WindowMode.Maximized) {
            this.windowState.x = this.win.getPosition()[0];
            this.windowState.y = this.win.getPosition()[1];
            this.windowState.width = this.win.getSize()[0];
            this.windowState.height = this.win.getSize()[1];
        }
        if (enableDebugLogging) {
            this.printWindowState();
        }
    };
    TicinoWindow.prototype.saveWindowState = function () {
        this.dumpWindowState();
        storage.setItem(TicinoWindow.windowUIStateStorageKey, this.windowState);
    };
    TicinoWindow.prototype.restoreWindowState = function (state) {
        var windowState = state || exports.defaultWindowState();
        if (!state) {
            var storedState = storage.getItem(TicinoWindow.windowUIStateStorageKey);
            if (storedState && typeof storedState.x === 'number' && typeof storedState.y === 'number') {
                var storedBounds = { x: storedState.x, y: storedState.y, width: storedState.width, height: storedState.height };
                var screen = require('screen'); // Do not move, cannot import screen top level until app is ready
                var display = screen.getDisplayMatching(storedBounds);
                if (display && display.bounds.x + display.bounds.width > storedBounds.x && display.bounds.y + display.bounds.height > storedBounds.y) {
                    windowState = storedState; // only take stored state if bounds are within monitor
                }
            }
        }
        this.windowState = windowState;
        this.currentWindowMode = this.windowState.mode;
        if (typeof this.windowState.x === 'number' && this.windowState.x + this.windowState.width <= 0) {
            this.windowState.x = 0; // prevent window from falling out of the screen to the left
        }
        if (typeof this.windowState.y === 'number' && this.windowState.y + this.windowState.height <= 0) {
            this.windowState.y = 0; // prevent window from falling out of the screen to the top
        }
    };
    TicinoWindow.prototype.printWindowState = function (event) {
        if (!event) {
            console.log(' ### Window State ### ');
        }
        else {
            console.log(' ### Window State: ' + event + ' ### ');
        }
        if (!this.windowState) {
            console.log('No window state');
        }
        var mode = 'normal';
        if (this.windowState.mode === WindowMode.Maximized) {
            mode = 'maximized';
        }
        else if (this.windowState.mode === WindowMode.Minimized) {
            mode = 'minimized';
        }
        console.log('Mode: ' + mode + ', X: ' + this.windowState.x + ', Y: ' + this.windowState.y + ', Width: ' + this.windowState.width + ', Height: ' + this.windowState.height);
        console.log('\n');
    };
    TicinoWindow.prototype.getBounds = function () {
        var pos = this.win.getPosition();
        var dimension = this.win.getSize();
        return { x: pos[0], y: pos[1], width: dimension[0], height: dimension[1] };
    };
    TicinoWindow.prototype.dispose = function () {
        if (this.showTimeoutHandle) {
            clearTimeout(this.showTimeoutHandle);
        }
        this._win = null; // Important to dereference the window object to allow for GC
    };
    TicinoWindow.themeStorageKey = 'theme';
    TicinoWindow.windowUIStateStorageKey = 'windowUIState';
    return TicinoWindow;
})();
exports.TicinoWindow = TicinoWindow;
