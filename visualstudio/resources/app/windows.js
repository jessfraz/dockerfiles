/*!---------------------------------------------------------
* Copyright (C) Microsoft Corporation. All rights reserved.
*--------------------------------------------------------*/
/// <reference path="./declare/node.d.ts" />
/// <reference path="./declare/atom-browser.d.ts" />
'use strict';
var events = require('events');
var path = require('path');
var fs = require('fs');
var BrowserWindow = require('browser-window');
var Dialog = require('dialog');
var app = require('app');
var ipc = require('ipc');
var env = require('./env');
var window = require('./window');
var paths = require('./paths');
var arrays = require('./arrays');
var objects = require('./objects');
var storage = require('./storage');
var settings = require('./settings');
var nls = require('./nls');
var um = require('./update-manager');
var UpdateManager = um.Instance;
var eventEmitter = new events.EventEmitter();
var EventTypes = {
    OPEN: 'open',
    CLOSE: 'close',
    QUIT: 'quit'
};
function onOpen(clb) {
    eventEmitter.addListener(EventTypes.OPEN, clb);
    return function () { return eventEmitter.removeListener(EventTypes.OPEN, clb); };
}
exports.onOpen = onOpen;
function onClose(clb) {
    eventEmitter.addListener(EventTypes.CLOSE, clb);
    return function () { return eventEmitter.removeListener(EventTypes.CLOSE, clb); };
}
exports.onClose = onClose;
function onQuit(clb) {
    eventEmitter.addListener(EventTypes.QUIT, clb);
    return function () { return eventEmitter.removeListener(EventTypes.QUIT, clb); };
}
exports.onQuit = onQuit;
var WindowError;
(function (WindowError) {
    WindowError[WindowError["UNRESPONSIVE"] = 0] = "UNRESPONSIVE";
    WindowError[WindowError["CRASHED"] = 1] = "CRASHED";
})(WindowError || (WindowError = {}));
var WindowsManager = (function () {
    function WindowsManager() {
    }
    WindowsManager.prototype.ready = function () {
        this.registerListeners();
    };
    WindowsManager.prototype.registerListeners = function () {
        var _this = this;
        settings.onChange(function (newSettings) {
            _this.sendToAll('ticino:optionsChange', JSON.stringify({ globalSettings: newSettings }));
        });
        app.on('will-quit', function () {
            eventEmitter.emit(EventTypes.QUIT);
        });
        app.on('activate-with-no-open-windows', function () {
            env.log('App#activate-with-no-open-windows');
            exports.manager.open(env.cliArgs);
        });
        app.on('open-file', function (event, path) {
            env.log('App#open-file: ', path);
            event.preventDefault();
            exports.manager.open(env.cliArgs, [path]);
        });
        ipc.on('ticino:windowOpen', function (event, paths) {
            env.log('IPC#ticino-windowOpen: ', paths);
            if (paths && paths.length) {
                exports.manager.open(env.cliArgs, paths);
            }
        });
        ipc.on('ticino:openFilePicker', function (event) {
            env.log('IPC#ticino-openFilePicker');
            exports.manager.openFilePicker();
        });
        ipc.on('ticino:openFolderPicker', function (event) {
            env.log('IPC#ticino-openFolderPicker');
            exports.manager.openFolderPicker();
        });
        ipc.on('ticino:openNewWindow', function (event) {
            env.log('IPC#ticino-openNewWindow');
            exports.manager.openNewWindow();
        });
        ipc.on('ticino:openFileFolderPicker', function (event) {
            env.log('IPC#ticino-openFileFolderPicker');
            exports.manager.openFolderPicker();
        });
        ipc.on('ticino:quit', function (event) {
            env.log('IPC#ticino:quit');
            setTimeout(function () { return app.quit(); }, 0); // make sure to not run this within the callback to prevent issues
        });
        UpdateManager.on('update-downloaded', function (update) {
            _this.sendToAll('ticino:update-downloaded', JSON.stringify({
                releaseNotes: update.releaseNotes,
                version: update.version,
                date: update.date
            }));
        });
        ipc.on('ticino:update-apply', function (event) {
            env.log('IPC#ticino:update-apply');
            if (UpdateManager.availableUpdate) {
                UpdateManager.availableUpdate.quitAndUpdate();
            }
        });
        UpdateManager.on('update-not-available', function (explicit) {
            if (explicit) {
                _this.sendToFocused('ticino:update-not-available', '');
            }
        });
    };
    WindowsManager.prototype.open = function (cli, pathsToOpen, forceNewWindow, forceEmpty) {
        var _this = this;
        var iPathsToOpen;
        // Find paths from provided paths if any
        if (pathsToOpen && pathsToOpen.length > 0) {
            iPathsToOpen = pathsToOpen.map(function (pathToOpen) {
                var iPath = _this.stringToIPath(pathToOpen);
                // Warn if the requested path to open does not exist
                if (!iPath) {
                    Dialog.showMessageBox({
                        type: 'warning',
                        buttons: [nls.localize('ok', "OK")],
                        title: nls.localize('pathNotExistTitle', "Path does not exist"),
                        detail: nls.localize('pathNotExistDetail', "The path '{0}' does not seem to exist anymore on disk.", pathToOpen)
                    });
                }
                return iPath;
            });
            // get rid of nulls
            iPathsToOpen = arrays.coalesce(iPathsToOpen);
            if (iPathsToOpen.length === 0) {
                return false; // indicate to outside that open failed
            }
        }
        else {
            iPathsToOpen = forceEmpty ? [{}] : [this.envToIPath(cli)];
        }
        var filesToOpen = iPathsToOpen.filter(function (iPath) { return !!iPath.filePath; });
        var foldersToOpen = iPathsToOpen.filter(function (iPath) { return iPath.workspacePath && !iPath.filePath; });
        var emptyToOpen = iPathsToOpen.filter(function (iPath) { return !iPath.workspacePath && !iPath.filePath; });
        // Handle files to open
        if (filesToOpen.length > 0) {
            // Open Files in last instance if any
            var lastActiveWindow = this.getLastActiveWindow();
            if (lastActiveWindow && lastActiveWindow.isLoaded) {
                lastActiveWindow.win.focus();
                lastActiveWindow.win.webContents.send('ticino:openFiles', filesToOpen.map(function (iPath) { return iPath.filePath; }));
            }
            else {
                var configuration = this.toConfiguration(cli, null, filesToOpen.map(function (iPath) { return iPath.filePath; }));
                this.openInBrowserWindow(configuration, true);
                forceNewWindow = true; // any other folders to open must open in new window then
            }
        }
        // Handle folders to open
        if (foldersToOpen.length > 0) {
            // Check for existing instances
            var windowsOnWorkspacePath = arrays.coalesce(foldersToOpen.map(function (iPath) { return _this.findWindow(iPath.workspacePath); }));
            if (windowsOnWorkspacePath.length > 0) {
                windowsOnWorkspacePath[0].win.focus(); // just focus one of them
                forceNewWindow = true; // any other folders to open must open in new window then
            }
            // Open remaining ones
            foldersToOpen.forEach(function (folderToOpen) {
                if (windowsOnWorkspacePath.some(function (win) { return win.openedWorkspacePath === folderToOpen.workspacePath; })) {
                    return; // ignore folders that are already open
                }
                var configuration = _this.toConfiguration(cli, folderToOpen.workspacePath);
                _this.openInBrowserWindow(configuration, forceNewWindow);
                forceNewWindow = true; // any other folders to open must open in new window then
            });
        }
        // Handle empty
        if (emptyToOpen.length > 0) {
            emptyToOpen.forEach(function () {
                var configuration = _this.toConfiguration(cli);
                _this.openInBrowserWindow(configuration, forceNewWindow);
                forceNewWindow = true; // any other folders to open must open in new window then
            });
        }
        // Remember in recent document list
        iPathsToOpen.forEach(function (iPath) {
            if (iPath.filePath || iPath.workspacePath) {
                app.addRecentDocument(iPath.filePath || iPath.workspacePath);
            }
        });
        // Emit events
        iPathsToOpen.forEach(function (iPath) { return eventEmitter.emit(EventTypes.OPEN, iPath); });
        return true;
    };
    WindowsManager.prototype.toConfiguration = function (cli, workspacePath, filesToOpen) {
        var configuration = objects.mixin({}, cli);
        configuration.workspacePath = workspacePath;
        configuration.filesToOpen = filesToOpen;
        configuration.appNameLong = env.appNameLong;
        configuration.appNameShort = env.appNameShort;
        configuration.appRoot = env.appRoot;
        configuration.version = env.version;
        configuration.appSettingsHome = env.appSettingsHome;
        configuration.appSettingsPath = env.appSettingsPath;
        configuration.appKeybindingsPath = env.appKeybindingsPath;
        configuration.isBuiltTicino = env.isBuiltTicino;
        configuration.welcomePath = env.welcomePath;
        // TODO this should be set globally and not as option
        configuration.autoSaveDelay = storage.getItem(WindowsManager.autoSaveDelayStorageKey) || -1;
        return configuration;
    };
    WindowsManager.prototype.stringToIPath = function (anyPath) {
        if (!anyPath) {
            return null;
        }
        var candidate = path.normalize(anyPath);
        try {
            var candidateStat = fs.statSync(candidate);
            if (candidateStat) {
                return candidateStat.isFile() ? { filePath: candidate } : { workspacePath: candidate };
            }
        }
        catch (error) {
        }
        return null;
    };
    WindowsManager.prototype.envToIPath = function (cli) {
        // Check for pass in candidate or last opened path
        var candidate = cli.pathArgument || storage.getItem(WindowsManager.lastActiveOpenedPathStorageKey);
        var iPath = this.stringToIPath(candidate);
        if (iPath) {
            return iPath;
        }
        // No path provided, return empty to open empty
        return {};
    };
    WindowsManager.prototype.openInBrowserWindow = function (configuration, forceNewWindow) {
        var _this = this;
        var ticinoWindow;
        if (!forceNewWindow) {
            ticinoWindow = this.getLastActiveWindow();
        }
        if (!ticinoWindow) {
            ticinoWindow = new window.TicinoWindow(this.ensureNoOverlap(this.getNewWindowState()));
            WindowsManager.WINDOWS.push(ticinoWindow);
            // Window Events
            ticinoWindow.win.on('focus', function () { return _this.onWindowFocus(ticinoWindow); });
            ticinoWindow.win.webContents.on('crashed', function () { return _this.onWindowError(ticinoWindow.win, WindowError.CRASHED); });
            ticinoWindow.win.on('unresponsive', function () { return _this.onWindowError(ticinoWindow.win, WindowError.UNRESPONSIVE); });
            ticinoWindow.win.on('closed', function () { return _this.onWindowClosed(ticinoWindow); });
        }
        // Load it
        ticinoWindow.load(configuration);
        // Store last as active
        this.storeLastActivePath(configuration.workspacePath || (configuration.filesToOpen && configuration.filesToOpen[0]));
    };
    WindowsManager.prototype.getNewWindowState = function () {
        var lastActive = this.getLastActiveWindow();
        if (!lastActive) {
            return null; // let the window restore itself if this is the first window
        }
        var screen = require('screen'); // Do not move, cannot import screen top level until app is ready
        // We want the new window to open on the same display that the last active one is in
        var displayToUse;
        var displays = screen.getAllDisplays();
        // Single Display
        if (displays.length === 1) {
            displayToUse = displays[0];
        }
        else {
            // on mac there is 1 menu per window so we need to use the monitor where the cursor currently is
            if (env.isMac) {
                var cursorPoint = screen.getCursorScreenPoint();
                displayToUse = screen.getDisplayNearestPoint(cursorPoint);
            }
            if (!displayToUse) {
                displayToUse = screen.getDisplayMatching(lastActive.getBounds());
            }
            if (!displayToUse) {
                return window.defaultWindowState(); // this should really not happen
            }
        }
        var defaultState = window.defaultWindowState();
        defaultState.x = displayToUse.bounds.x + (displayToUse.bounds.width / 2) - (defaultState.width / 2);
        defaultState.y = displayToUse.bounds.y + (displayToUse.bounds.height / 2) - (defaultState.height / 2);
        return defaultState;
    };
    WindowsManager.prototype.ensureNoOverlap = function (state) {
        if (!state || WindowsManager.WINDOWS.length === 0) {
            return state;
        }
        var existingWindowBounds = WindowsManager.WINDOWS.map(function (win) { return win.getBounds(); });
        while (existingWindowBounds.some(function (b) { return b.x === state.x || b.y === state.y; })) {
            state.x += 30;
            state.y += 30;
        }
        return state;
    };
    WindowsManager.prototype.openFilePicker = function () {
        var _this = this;
        this.getFileOrFolderPaths(false, function (paths) {
            if (paths && paths.length) {
                _this.open(env.cliArgs, paths);
            }
        });
    };
    WindowsManager.prototype.openFolderPicker = function () {
        var _this = this;
        this.getFileOrFolderPaths(true, function (paths) {
            if (paths && paths.length) {
                _this.open(env.cliArgs, paths);
            }
        });
    };
    WindowsManager.prototype.getFileOrFolderPaths = function (isFolder, clb) {
        var storageKey = isFolder ? WindowsManager.workingDirFolderPickerStorageKey : WindowsManager.workingDirFilePickerStorageKey;
        var workingDir = storage.getItem(storageKey);
        var focussedWindow = this.getFocusedWindow();
        var pickerProperties;
        if (env.isMac) {
            pickerProperties = ['multiSelections', 'openDirectory', 'openFile', 'createDirectory'];
        }
        else {
            pickerProperties = ['multiSelections', isFolder ? 'openDirectory' : 'openFile', 'createDirectory'];
        }
        Dialog.showOpenDialog(focussedWindow && focussedWindow.win, {
            defaultPath: workingDir,
            properties: pickerProperties
        }, function (paths) {
            if (paths && paths.length > 0) {
                // Remember path in storage for next time
                var selectedPath = paths[0];
                storage.setItem(storageKey, isFolder ? path.dirname(selectedPath) : selectedPath);
                // Return
                clb(paths);
            }
            else {
                clb(void (0));
            }
        });
    };
    WindowsManager.prototype.focusLastActive = function (cli) {
        var lastActive = this.getLastActiveWindow();
        if (lastActive) {
            lastActive.win.focus();
        }
        else {
            this.open(cli);
        }
    };
    WindowsManager.prototype.getLastActiveWindow = function () {
        if (WindowsManager.WINDOWS.length) {
            var lastFocussedDate = Math.max.apply(Math, WindowsManager.WINDOWS.map(function (w) { return w.lastFocusTime; }));
            var res = WindowsManager.WINDOWS.filter(function (w) { return w.lastFocusTime === lastFocussedDate; });
            if (res && res.length) {
                return res[0];
            }
        }
        return null;
    };
    WindowsManager.prototype.findWindow = function (workspacePath, filePath) {
        if (WindowsManager.WINDOWS.length) {
            // Sort the last active window to the front of the array of windows to test
            var windowsToTest = WindowsManager.WINDOWS.slice(0);
            var lastActiveWindow = this.getLastActiveWindow();
            if (lastActiveWindow) {
                windowsToTest.splice(windowsToTest.indexOf(lastActiveWindow), 1);
                windowsToTest.unshift(lastActiveWindow);
            }
            // Find it
            var res = windowsToTest.filter(function (w) {
                // match on workspace
                if (typeof w.openedWorkspacePath === 'string' && w.openedWorkspacePath === workspacePath) {
                    return true;
                }
                // match on file
                if (typeof w.openedFilePath === 'string' && w.openedFilePath === filePath) {
                    return true;
                }
                // match on file path
                if (typeof w.openedWorkspacePath === 'string' && filePath && paths.isEqualOrParent(filePath, w.openedWorkspacePath)) {
                    return true;
                }
                return false;
            });
            if (res && res.length) {
                return res[0];
            }
        }
        return null;
    };
    WindowsManager.prototype.openNewWindow = function () {
        this.open(env.cliArgs, null, true, true);
    };
    WindowsManager.prototype.closeActive = function () {
        var ticinoWindow = this.getFocusedWindow();
        if (ticinoWindow) {
            ticinoWindow.win.close();
        }
    };
    WindowsManager.prototype.sendToFocused = function (channel, msg) {
        var focusedWindow = this.getFocusedWindow();
        if (focusedWindow && focusedWindow.isLoaded) {
            focusedWindow.win.webContents.send(channel, msg);
        }
    };
    WindowsManager.prototype.sendToLastActive = function (channel, msg) {
        var lastActiveWindow = this.getLastActiveWindow();
        if (lastActiveWindow && lastActiveWindow.isLoaded) {
            lastActiveWindow.win.webContents.send(channel, msg);
            return true;
        }
        return false;
    };
    WindowsManager.prototype.sendToAll = function (channel, msg) {
        WindowsManager.WINDOWS.forEach(function (window) {
            if (window.isLoaded) {
                window.win.webContents.send(channel, msg);
            }
        });
    };
    WindowsManager.prototype.getFocusedWindow = function () {
        var win = BrowserWindow.getFocusedWindow();
        if (win) {
            var res = WindowsManager.WINDOWS.filter(function (w) { return w.win.id === win.id; });
            if (res && res.length === 1) {
                return res[0];
            }
        }
        return null;
    };
    WindowsManager.prototype.getWindowCount = function () {
        return WindowsManager.WINDOWS.length;
    };
    WindowsManager.prototype.onWindowError = function (win, error) {
        console.error(error === WindowError.CRASHED ? '[atom event]: render process crashed!' : '[atom event]: detected unresponsive');
        // Unresponsive
        if (error === WindowError.UNRESPONSIVE) {
            Dialog.showMessageBox(win, {
                type: 'warning',
                buttons: [nls.localize('exit', "Exit"), nls.localize('wait', "Keep Waiting")],
                title: nls.localize('appStalled', "{0} is no longer responding", env.appNameLong),
                detail: nls.localize('appStalledDetail', "Would you like to exit {0} or just keep waiting?", env.appNameLong)
            }, function (result) {
                if (result === 0) {
                    win.destroy(); // make sure to destroy the window as otherwise quit will just not do anything
                    app.quit();
                }
            });
        }
        else {
            Dialog.showMessageBox(win, {
                type: 'warning',
                buttons: [nls.localize('exit', "Exit")],
                title: nls.localize('appCrashed', "{0} has crashed", env.appNameLong),
                detail: nls.localize('appCrashedDetail', "We are sorry for the inconvenience! Please restart {0}.", env.appNameLong)
            }, function (result) {
                app.quit();
            });
        }
    };
    WindowsManager.prototype.onWindowFocus = function (win) {
        // whenever we get focus, make sure to update the last active opened path for future use
        this.storeLastActivePath(win.openedWorkspacePath || win.openedFilePath);
    };
    WindowsManager.prototype.storeLastActivePath = function (path) {
        if (path) {
            storage.setItem(WindowsManager.lastActiveOpenedPathStorageKey, path);
        }
        else {
            storage.removeItem(WindowsManager.lastActiveOpenedPathStorageKey);
        }
    };
    WindowsManager.prototype.onWindowClosed = function (win) {
        // Tell window
        win.dispose();
        // Remove from our list so that Atom can clean it up
        var index = WindowsManager.WINDOWS.indexOf(win);
        WindowsManager.WINDOWS.splice(index, 1);
        // Emit
        eventEmitter.emit(EventTypes.CLOSE, WindowsManager.WINDOWS.length);
    };
    WindowsManager.autoSaveDelayStorageKey = 'autoSaveDelay';
    WindowsManager.workingDirFilePickerStorageKey = 'filePickerWorkingDir';
    WindowsManager.workingDirFolderPickerStorageKey = 'folderPickerWorkingDir';
    WindowsManager.lastActiveOpenedPathStorageKey = 'lastActiveOpenedPath';
    WindowsManager.WINDOWS = [];
    return WindowsManager;
})();
exports.WindowsManager = WindowsManager;
exports.manager = new WindowsManager();
