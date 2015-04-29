/*!---------------------------------------------------------
* Copyright (C) Microsoft Corporation. All rights reserved.
*--------------------------------------------------------*/
/// <reference path="./declare/node.d.ts" />
/// <reference path="./declare/atom-browser.d.ts" />
'use strict';
var app = require('app');
var Menu = require('menu');
var MenuItem = require('menu-item');
var Dialog = require('dialog');
var shell = require('shell');
var nls = require('./nls');
var windows = require('./windows');
var window = require('./window');
var env = require('./env');
var storage = require('./storage');
var arrays = require('./arrays');
var ipc = require('ipc');
var um = require('./update-manager');
var UpdateManager = um.Instance;
var mapKeyToCompatible = {
    'uparrow': 'Up',
    'downarrow': 'Down',
    'leftarrow': 'Left',
    'rightarrow': 'Right'
};
var TicinoMenu = (function () {
    function TicinoMenu() {
        this.actionIdKeybindingRequests = [];
        this.mapKeybindingToActionId = Object.create(null);
        this.registerListeners();
    }
    TicinoMenu.prototype.registerListeners = function () {
        var _this = this;
        // Listen to "open" & "close" / "quit" event from window manager
        windows.onOpen(function (paths) { return _this.onOpen(paths); });
        windows.onClose(function (remainingWindowCount) { return _this.onClose(remainingWindowCount); });
        windows.onQuit(function () { return _this.isQuitting = true; });
        // Resolve keybindings when workbench is loaded
        ipc.on('ticino:workbenchLoaded', function () { return _this.resolveKeybindings(); });
        // Listen to ticino window
        ipc.on('ticino:toggleAutoSave', function () {
            _this.toggleAutoSave();
        });
        // Listen to resolved keybindings
        ipc.on('ticino:keybindingsResolved', function (event, rawKeybindings) {
            var keybindings = [];
            try {
                keybindings = JSON.parse(rawKeybindings);
            }
            catch (error) {
            }
            var updateMenu = false;
            keybindings.forEach(function (keybinding) {
                var accelerator = _this.toAccelerator(keybinding.binding);
                if (accelerator) {
                    _this.mapKeybindingToActionId[keybinding.id] = accelerator;
                    updateMenu = true;
                }
            });
            if (updateMenu) {
                _this.updateMenu();
            }
        });
        // Listen to openRecentFolder
        ipc.on('ticino:openRecentFolder', function (event, path) {
            _this.openRecent(path, false);
        });
        // Listen to update manager
        UpdateManager.on('change', function () { return _this.updateMenu(); });
    };
    TicinoMenu.prototype.resolveKeybindings = function () {
        if (this.keybindingsResolved) {
            return; // only resolve once
        }
        this.keybindingsResolved = true;
        // Resolve keybindings when workbench window is up
        if (this.actionIdKeybindingRequests.length) {
            windows.manager.sendToLastActive('ticino:resolveKeybindings', JSON.stringify(this.actionIdKeybindingRequests));
        }
    };
    TicinoMenu.prototype.toAccelerator = function (binding) {
        if (binding.chord || !binding.key) {
            return null;
        }
        return [
            binding.ctrlCmd ? 'CmdOrCtrl+' : '',
            binding.winCtrl && env.isMac ? 'Ctrl+' : '',
            binding.shift ? 'Shift+' : '',
            binding.alt ? 'Alt+' : '',
            mapKeyToCompatible[binding.key.toLowerCase()] || binding.key
        ].join('');
    };
    TicinoMenu.prototype.toggleAutoSave = function () {
        var currentAutoSaveDelay = storage.getItem(windows.WindowsManager.autoSaveDelayStorageKey) || -1;
        if (typeof currentAutoSaveDelay !== 'number') {
            currentAutoSaveDelay = TicinoMenu.AUTO_SAVE_DELAY_DEFAULT;
        }
        var newAutoSaveDelay = (currentAutoSaveDelay === TicinoMenu.AUTO_SAVE_DELAY_DEFAULT) ? TicinoMenu.AUTO_SAVE_DISABLED : TicinoMenu.AUTO_SAVE_DELAY_DEFAULT;
        storage.setItem(windows.WindowsManager.autoSaveDelayStorageKey, newAutoSaveDelay);
        windows.manager.sendToAll('ticino:optionsChange', JSON.stringify({ autoSaveDelay: newAutoSaveDelay }));
        if (newAutoSaveDelay >= 0) {
            windows.manager.sendToFocused('ticino:runAction', 'workbench.action.files.saveFiles');
        }
        this.updateMenu();
    };
    TicinoMenu.prototype.updateMenu = function () {
        var _this = this;
        // TODO@Ben due to limitations in Atom, it is not possible to update menu items dynamically. The suggested
        // workaround from Atom Shell is to set the application menu again.
        // See also https://github.com/atom/atom-shell/issues/846
        //
        // Run delayed to prevent updating menu while it is open
        if (!this.isQuitting) {
            setTimeout(function () {
                if (!_this.isQuitting) {
                    _this.install();
                }
            }, 10);
        }
    };
    TicinoMenu.prototype.onOpen = function (path) {
        this.addToOpenedPathsList(path.filePath || path.workspacePath, !!path.filePath);
        this.updateMenu();
    };
    TicinoMenu.prototype.onClose = function (remainingWindowCount) {
        if (remainingWindowCount === 0 && env.isMac) {
            this.updateMenu();
        }
    };
    TicinoMenu.prototype.install = function () {
        // Menus
        var menubar = new Menu();
        // Mac: Application
        var macApplicationMenuItem;
        if (env.isMac) {
            var applicationMenu = new Menu();
            macApplicationMenuItem = new MenuItem({ label: env.appNameShort, submenu: applicationMenu });
            this.setMacApplicationMenu(applicationMenu);
        }
        // File
        var fileMenu = new Menu();
        var fileMenuItem = new MenuItem({ label: mnemonicLabel(nls.localize('mFile', "&&File")), submenu: fileMenu });
        this.setFileMenu(fileMenu);
        // Edit
        var editMenu = new Menu();
        var editMenuItem = new MenuItem({ label: mnemonicLabel(nls.localize('mEdit', "&&Edit")), submenu: editMenu });
        this.setEditMenu(editMenu);
        // View
        var viewMenu = new Menu();
        var viewMenuItem = new MenuItem({ label: mnemonicLabel(nls.localize('mView', "&&View")), submenu: viewMenu });
        this.setViewMenu(viewMenu);
        // Goto
        var gotoMenu = new Menu();
        var gotoMenuItem = new MenuItem({ label: mnemonicLabel(nls.localize('mGoto', "&&Goto")), submenu: gotoMenu });
        this.setGotoMenu(gotoMenu);
        // Mac: Window
        var macWindowMenuItem;
        if (env.isMac) {
            var windowMenu = new Menu();
            macWindowMenuItem = new MenuItem({ label: mnemonicLabel(nls.localize('mWindow', "Window")), submenu: windowMenu });
            this.setMacWindowMenu(windowMenu);
        }
        // Help
        var helpMenu = new Menu();
        var helpMenuItem = new MenuItem({ label: mnemonicLabel(nls.localize('mHelp', "&&Help")), submenu: helpMenu });
        this.setHelpMenu(helpMenu);
        // Menu Structure
        if (macApplicationMenuItem) {
            menubar.append(macApplicationMenuItem);
        }
        menubar.append(fileMenuItem);
        menubar.append(editMenuItem);
        menubar.append(viewMenuItem);
        menubar.append(gotoMenuItem);
        if (macWindowMenuItem) {
            menubar.append(macWindowMenuItem);
        }
        menubar.append(helpMenuItem);
        Menu.setApplicationMenu(menubar);
    };
    TicinoMenu.prototype.addToOpenedPathsList = function (path, isFile) {
        if (!path) {
            return;
        }
        var mru = this.getOpenedPathsList();
        if (isFile || env.isMac) {
            mru.files.unshift(path);
            mru.files = arrays.distinct(mru.files);
        }
        else {
            mru.folders.unshift(path);
            mru.folders = arrays.distinct(mru.folders);
        }
        storage.setItem(TicinoMenu.openedPathsListStorageKey, mru);
    };
    TicinoMenu.prototype.removeFromOpenedPathsList = function (path, isFile) {
        var mru = this.getOpenedPathsList();
        if (isFile || env.isMac) {
            mru.files.splice(mru.files.indexOf(path), 1);
        }
        else {
            mru.folders.splice(mru.folders.indexOf(path), 1);
        }
        storage.setItem(TicinoMenu.openedPathsListStorageKey, mru);
    };
    TicinoMenu.prototype.clearOpenedPathsList = function () {
        storage.setItem(TicinoMenu.openedPathsListStorageKey, { folders: [], files: [] });
        this.updateMenu();
    };
    TicinoMenu.prototype.getOpenedPathsList = function () {
        var mru = storage.getItem(TicinoMenu.openedPathsListStorageKey);
        if (!mru) {
            mru = { folders: [], files: [] };
        }
        return mru;
    };
    TicinoMenu.prototype.setMacApplicationMenu = function (macApplicationMenu) {
        var _this = this;
        var about = new MenuItem({ label: nls.localize('mAbout', "About {0}", env.appNameLong), selector: 'orderFrontStandardAboutPanel:' });
        var checkForUpdates = this.getUpdateMenuItems();
        var preferences = this.getPreferencesMenu();
        var hide = new MenuItem({ label: nls.localize('mHide', "Hide {0}", env.appNameLong), selector: 'hide:', accelerator: 'Command+H' });
        var hideOthers = new MenuItem({ label: nls.localize('mHideOthers', "Hide Others"), selector: 'hideOtherApplications:', accelerator: 'Command+Shift+H' });
        var showAll = new MenuItem({ label: nls.localize('mShowAll', "Show All"), selector: 'unhideAllApplications:' });
        var quit = new MenuItem({ label: nls.localize('miQuit', "Quit {0}", env.appNameLong), click: function () { return _this.quit(); }, accelerator: 'Command+Q' });
        var actions = [about];
        actions = actions.concat(checkForUpdates);
        actions = actions.concat([
            __separator__(),
            preferences,
            __separator__(),
            hide,
            hideOthers,
            showAll,
            __separator__(),
            quit
        ]);
        actions.forEach(function (i) { return macApplicationMenu.append(i); });
    };
    TicinoMenu.prototype.setFileMenu = function (fileMenu) {
        var _this = this;
        var hasNoWindows = (windows.manager.getWindowCount() === 0);
        var newFile = this.createMenuItem(nls.localize('miNewFile', "&&New File"), 'workbench.action.files.newUntitledFile');
        var open;
        if (hasNoWindows) {
            open = new MenuItem({ label: mnemonicLabel(nls.localize('miOpen', "&&Open...")), click: function () { return windows.manager.openFilePicker(); } });
        }
        else {
            open = this.createMenuItem(nls.localize('miOpen', "&&Open..."), 'workbench.action.files.openFileFolder');
        }
        var openFile = this.createMenuItem(nls.localize('miOpenFile', "&&Open File..."), 'workbench.action.files.openFile');
        var openFolder = this.createMenuItem(nls.localize('miOpenFolder', "Open &&Folder..."), 'workbench.action.files.openFolder');
        var openRecentMenu = new Menu();
        this.setOpenRecentMenu(openRecentMenu);
        var openRecent = new MenuItem({ label: mnemonicLabel(nls.localize('miOpenRecent', "Open &&Recent")), submenu: openRecentMenu, enabled: openRecentMenu.items.length > 0 });
        var autoSaveDelay = storage.getItem(windows.WindowsManager.autoSaveDelayStorageKey) || -1 /* Disabled by default */;
        var saveFile = this.createMenuItem(nls.localize('miSave', "&&Save"), 'workbench.action.files.save', autoSaveDelay === -1 && windows.manager.getWindowCount() > 0);
        var saveFileAs = this.createMenuItem(nls.localize('miSaveAs', "Save As..."), 'workbench.action.files.saveAs', windows.manager.getWindowCount() > 0);
        var saveAllFiles = this.createMenuItem(nls.localize('miSaveAll', "Save &&All"), 'workbench.action.files.saveAll', autoSaveDelay === -1 && windows.manager.getWindowCount() > 0);
        var revertFile = this.createMenuItem(nls.localize('miRevert', "Revert File"), 'workbench.action.files.revert', autoSaveDelay === -1 && windows.manager.getWindowCount() > 0);
        var autoSave = new MenuItem({ label: mnemonicLabel(nls.localize('miAutoSave', "Enable Auto Save")), type: 'checkbox', checked: autoSaveDelay !== -1, enabled: windows.manager.getWindowCount() > 0, click: function () { return windows.manager.sendToFocused('ticino:runAction', 'workbench.action.files.toggleAutoSave'); } });
        var preferences = this.getPreferencesMenu();
        var newWindow;
        if (hasNoWindows) {
            newWindow = new MenuItem({ label: mnemonicLabel(nls.localize('miNewWindow', "&&New Window")), click: function () { return windows.manager.openNewWindow(); } });
        }
        else {
            newWindow = this.createMenuItem(nls.localize('miNewWindow', "&&New Window"), 'workbench.action.newWindow');
        }
        var closeWindow = this.createMenuItem(nls.localize('miCloseWindow', "&&Close Window"), 'workbench.action.closeWindow');
        var closeEditor = this.createMenuItem(nls.localize('miCloseEditor', "&&Close Editor"), 'workbench.action.closeActiveEditor');
        var exit = this.createMenuItem(nls.localize('miExit', "E&&xit"), function () { return _this.quit(); });
        arrays.coalesce([
            newFile,
            newWindow,
            __separator__(),
            env.isMac ? open : null,
            !env.isMac ? openFile : null,
            !env.isMac ? openFolder : null,
            openRecent,
            __separator__(),
            saveFile,
            saveFileAs,
            saveAllFiles,
            revertFile,
            autoSave,
            __separator__(),
            !env.isMac ? preferences : null,
            !env.isMac ? __separator__() : null,
            closeEditor,
            !env.isMac ? closeWindow : null,
            !env.isMac ? __separator__() : null,
            !env.isMac ? exit : null
        ]).forEach(function (item) { return fileMenu.append(item); });
    };
    TicinoMenu.prototype.getPreferencesMenu = function () {
        var userSettings = this.createMenuItem(nls.localize('miOpenSettings', "&&User Settings"), 'workbench.action.openGlobalSettings');
        var workspaceSettings = this.createMenuItem(nls.localize('miOpenSettings', "&&Workspace Settings"), 'workbench.action.openWorkspaceSettings');
        var kebindingSettings = this.createMenuItem(nls.localize('miOpenKeymap', "&&Keyboard Shortcuts"), 'workbench.action.openGlobalKeybindings');
        var preferencesMenu = new Menu();
        preferencesMenu.append(userSettings);
        preferencesMenu.append(workspaceSettings);
        preferencesMenu.append(__separator__());
        preferencesMenu.append(kebindingSettings);
        return new MenuItem({ label: mnemonicLabel(nls.localize('miPreferences', "&&Preferences")), submenu: preferencesMenu });
    };
    TicinoMenu.prototype.quit = function () {
        var _this = this;
        setTimeout(function () {
            _this.isQuitting = true;
            app.quit();
        }, 10);
    };
    TicinoMenu.prototype.setOpenRecentMenu = function (openRecentMenu) {
        var _this = this;
        var recentList = this.getOpenedPathsList();
        // Folders
        recentList.folders.forEach(function (folder, index) {
            if (index < TicinoMenu.MAX_RECENT_ENTRIES) {
                openRecentMenu.append(_this.createOpenRecentMenuItem(folder));
            }
        });
        // Files
        if (recentList.files.length > 0) {
            openRecentMenu.append(__separator__());
            recentList.files.forEach(function (file, index) {
                if (index < TicinoMenu.MAX_RECENT_ENTRIES) {
                    openRecentMenu.append(_this.createOpenRecentMenuItem(file, true));
                }
            });
        }
        if (recentList.folders.length || recentList.files.length) {
            openRecentMenu.append(__separator__());
            openRecentMenu.append(new MenuItem({ label: mnemonicLabel(nls.localize('miClearItems', "&&Clear Items")), click: function () { return _this.clearOpenedPathsList(); } }));
        }
    };
    TicinoMenu.prototype.createOpenRecentMenuItem = function (path, isFile) {
        var _this = this;
        return new MenuItem({ label: path, click: function () {
            var handleInBrowser = false;
            // We handle the opening from the renderer to give it a chance to perform tasks (e.g. save dirty files)
            if ((!isFile || env.isMac) && windows.manager.getWindowCount() > 0) {
                var msgSend = windows.manager.sendToLastActive('ticino:openRecentFolder', path);
                if (!msgSend) {
                    handleInBrowser = true;
                }
            }
            else {
                handleInBrowser = true;
            }
            // We handle the opening from the browser side
            if (handleInBrowser) {
                _this.openRecent(path, isFile);
            }
        } });
    };
    TicinoMenu.prototype.openRecent = function (path, isFile) {
        var success = windows.manager.open(env.cliArgs, [path]);
        if (!success) {
            this.removeFromOpenedPathsList(path, isFile);
            this.updateMenu();
        }
    };
    TicinoMenu.prototype.setEditMenu = function (winLinuxEditMenu) {
        var undo = this.createMenuItem(nls.localize('miUndo', "&&Undo"), 'undo');
        var redo = this.createMenuItem(nls.localize('miRedo', "&&Redo"), 'redo');
        var cut = this.createMenuItem(nls.localize('miCut', "&&Cut"), 'editor.action.clipboardCutAction');
        var copy = this.createMenuItem(nls.localize('miCopy', "C&&opy"), 'editor.action.clipboardCopyAction');
        var paste = this.createMenuItem(nls.localize('miPaste', "&&Paste"), 'editor.action.clipboardPasteAction');
        var selectAll = this.createMenuItem(nls.localize('miSelectAll', "&&Select All"), 'editor.action.selectAll');
        var find = this.createMenuItem(nls.localize('miFind', "&&Find"), 'actions.find');
        var replace = this.createMenuItem(nls.localize('miReplace', "&&Replace"), 'editor.action.startFindReplaceAction');
        var findInFiles = this.createMenuItem(nls.localize('miFindInFiles', "Find &&in Files"), 'workbench.view.search');
        [
            undo,
            redo,
            __separator__(),
            cut,
            copy,
            paste,
            selectAll,
            __separator__(),
            find,
            replace,
            __separator__(),
            findInFiles
        ].forEach(function (item) { return winLinuxEditMenu.append(item); });
    };
    TicinoMenu.prototype.setViewMenu = function (viewMenu) {
        var _this = this;
        var commands = this.createMenuItem(nls.localize('miCommandPalette', "&&Command Palette..."), 'workbench.action.showCommands');
        var markers = this.createMenuItem(nls.localize('miMarker', "&&Errors and Warnings..."), 'workbench.action.showErrorsWarnings');
        var output = this.createMenuItem(nls.localize('miShowOutput', "&&Output"), 'workbench.action.output.showOutput');
        var fullscreen = this.createMenuItem(nls.localize('miToggleFullScreen', "Toggle &&Full Screen"), 'workbench.action.toggleFullScreen');
        var splitEditor = this.createMenuItem(nls.localize('miSplitEditor', "Split &&Editor"), 'workbench.action.splitEditor');
        var toggleSidebar = this.createMenuItem(nls.localize('miToggleSidebar', "&&Toggle Sidebar"), 'workbench.action.toggleSidebarVisibility');
        var moveSidebar = this.createMenuItem(nls.localize('miMoveSidebar', "&&Move Sidebar"), 'workbench.action.toggleSidebarPosition');
        var zoomIn = this.createMenuItem(nls.localize('miZoomIn', "&&Zoom in"), 'workbench.action.zoomIn');
        var zoomOut = this.createMenuItem(nls.localize('miZoomOut', "Zoom o&&ut"), 'workbench.action.zoomOut');
        var currentTheme = storage.getItem(window.TicinoWindow.themeStorageKey) || 'vs-dark';
        var lightTheme = new MenuItem({ label: mnemonicLabel(nls.localize('miLightTheme', "&&Light Theme")), type: 'radio', enabled: windows.manager.getWindowCount() > 0, checked: currentTheme === 'vs', click: function () { return _this.changeTheme('vs'); } });
        var darkTheme = new MenuItem({ label: mnemonicLabel(nls.localize('miDarkTheme', "&&Dark Theme")), type: 'radio', enabled: windows.manager.getWindowCount() > 0, checked: currentTheme === 'vs-dark', click: function () { return _this.changeTheme('vs-dark'); } });
        var hcTheme = new MenuItem({ label: mnemonicLabel(nls.localize('miHighTheme', "&&High Contrast Theme")), type: 'radio', enabled: windows.manager.getWindowCount() > 0, checked: currentTheme === 'hc-black', click: function () { return _this.changeTheme('hc-black'); } });
        var themeMenu = new Menu();
        themeMenu.append(lightTheme);
        themeMenu.append(darkTheme);
        if (env.isWindows) {
            themeMenu.append(hcTheme);
        }
        var theme = new MenuItem({ label: mnemonicLabel(nls.localize('miTheme', "&&Theme")), submenu: themeMenu });
        [
            commands,
            markers,
            output,
            __separator__(),
            fullscreen,
            __separator__(),
            splitEditor,
            toggleSidebar,
            moveSidebar,
            __separator__(),
            zoomIn,
            zoomOut,
            __separator__(),
            theme
        ].forEach(function (item) { return viewMenu.append(item); });
    };
    TicinoMenu.prototype.changeTheme = function (theme) {
        storage.setItem(window.TicinoWindow.themeStorageKey, theme);
        var action = 'workbench.action.changeToLightTheme';
        if (theme === 'vs-dark') {
            action = 'workbench.action.changeToDarkTheme';
        }
        else if (theme === 'hc-black') {
            action = 'workbench.action.changeToHighContrastTheme';
        }
        windows.manager.sendToAll('ticino:runAction', action);
    };
    TicinoMenu.prototype.setGotoMenu = function (gotoMenu) {
        var back = this.createMenuItem(nls.localize('miBack', "&&Back"), 'workbench.action.navigateBack');
        var forward = this.createMenuItem(nls.localize('miForward', "&&Forward"), 'workbench.action.navigateForward');
        var navigateHistory = this.createMenuItem(nls.localize('miNavigateHistory', "&&Navigate History"), 'workbench.action.openPreviousEditor');
        var gotoFile = this.createMenuItem(nls.localize('miGotoFile', "Go to &&File..."), 'workbench.action.quickOpen');
        var gotoSymbol = this.createMenuItem(nls.localize('miGotoSymbol', "Go to &&Symbol..."), 'workbench.action.gotoSymbol');
        var gotoDefinition = this.createMenuItem(nls.localize('miGotoDefinition', "Go to &&Definition"), 'editor.action.goToDeclaration');
        var gotoLine = this.createMenuItem(nls.localize('miGotoLine', "Go to &&Line..."), 'workbench.action.gotoLine');
        [
            back,
            forward,
            __separator__(),
            navigateHistory,
            __separator__(),
            gotoFile,
            gotoSymbol,
            gotoDefinition,
            gotoLine
        ].forEach(function (item) { return gotoMenu.append(item); });
    };
    TicinoMenu.prototype.setMacWindowMenu = function (macWindowMenu) {
        var minimize = new MenuItem({ label: nls.localize('mMinimize', "Minimize"), selector: 'performMiniaturize:', accelerator: 'Command+M', enabled: windows.manager.getWindowCount() > 0 });
        var close = new MenuItem({ label: nls.localize('mClose', "Close"), selector: 'performClose:', accelerator: 'Command+W', enabled: windows.manager.getWindowCount() > 0 });
        var bringAllToFront = new MenuItem({ label: nls.localize('mBringToFront', "Bring All to Front"), selector: 'arrangeInFront:', enabled: windows.manager.getWindowCount() > 0 });
        [
            minimize,
            close,
            __separator__(),
            bringAllToFront
        ].forEach(function (item) { return macWindowMenu.append(item); });
    };
    TicinoMenu.prototype.setHelpMenu = function (helpMenu) {
        helpMenu.append(this.createMenuItem(nls.localize('miShowWelcome', "&&Show Welcome"), 'workbench.action.markdown.showWelcome'));
        var documentation = new MenuItem({ label: mnemonicLabel(nls.localize('miDocumentation', "&&Documentation")), click: openDocumentationUrl });
        var twitter = new MenuItem({ label: mnemonicLabel(nls.localize('miTwitter', "&&Join us on Twitter")), click: openTwitterUrl });
        var licence = new MenuItem({ label: mnemonicLabel(nls.localize('miLicense', "&&View License")), click: openLicenseUrl });
        var privacyStatement = new MenuItem({ label: mnemonicLabel(nls.localize('miPrivacyStatement', "&&Privacy Statement")), click: openPrivacyStatement });
        var releaseNotes = new MenuItem({ label: mnemonicLabel(nls.localize('miReleaseNotes', "&&Release Notes")), click: openReleaseNotesUrl });
        var userVoice = new MenuItem({ label: mnemonicLabel(nls.localize('miUserVoice', "&&Request Features")), click: openUserVoiceUrl });
        var reportIssues = new MenuItem({ label: mnemonicLabel(nls.localize('miReportIssues', "&&Report Issues")), click: openReportIssues });
        [
            documentation,
            __separator__(),
            twitter,
            userVoice,
            reportIssues,
            __separator__(),
            licence,
            privacyStatement,
            __separator__(),
            releaseNotes,
        ].forEach(function (item) { return helpMenu.append(item); });
        if (!env.isMac) {
            helpMenu.append(__separator__());
            this.getUpdateMenuItems().forEach(function (i) { return helpMenu.append(i); });
            helpMenu.append(__separator__());
            helpMenu.append(new MenuItem({ label: mnemonicLabel(nls.localize('miAbout', "&&About")), click: openAboutDialog }));
        }
    };
    TicinoMenu.prototype.getUpdateMenuItems = function () {
        switch (UpdateManager.state) {
            case um.State.Uninitialized:
                return [new MenuItem({ label: nls.localize('miUpdatesNotAvailable', "Updates Not Available"), enabled: false })];
            case um.State.UpdateDownloaded:
                var update = UpdateManager.availableUpdate;
                return [new MenuItem({ label: nls.localize('miRestartToUpdate', "Restart To Update..."), click: function () {
                    reportMenuActionTelemetry('RestartToUpdate');
                    update.quitAndUpdate();
                } })];
            case um.State.CheckingForUpdate:
                return [new MenuItem({ label: nls.localize('miCheckingForUpdates', "Checking For Updates..."), enabled: false })];
            case um.State.UpdateAvailable:
                return [new MenuItem({ label: nls.localize('miInstallingUpdate', "Installing Update..."), enabled: false })];
            default:
                var result = [new MenuItem({ label: nls.localize('miCheckForUpdates', "Check For Updates..."), click: function () { return setTimeout(function () {
                    reportMenuActionTelemetry('CheckForUpdate');
                    UpdateManager.checkForUpdates(true);
                }, 0); } })];
                if (UpdateManager.lastCheckDate) {
                    result.push(new MenuItem({ label: nls.localize('miLastCheckedAt', "Last checked at {0}", UpdateManager.lastCheckDate.toLocaleTimeString()), enabled: false }));
                }
                return result;
        }
    };
    TicinoMenu.prototype.createMenuItem = function (arg1, arg2, arg3) {
        var label = mnemonicLabel(arg1);
        var click = (typeof arg2 === 'function') ? arg2 : function () { return windows.manager.sendToFocused('ticino:runAction', arg2); };
        var enabled = typeof arg3 === 'boolean' ? arg3 : windows.manager.getWindowCount() > 0;
        var actionId;
        if (typeof arg2 === 'string') {
            actionId = arg2;
        }
        // Lookup accelerator or store for future request
        var accelerator = void (0);
        if (actionId) {
            var resolvedKeybinding = this.mapKeybindingToActionId[actionId];
            accelerator = resolvedKeybinding;
            if (!accelerator && !this.keybindingsResolved) {
                this.actionIdKeybindingRequests.push(actionId);
            }
        }
        var options = {
            label: label,
            accelerator: accelerator,
            click: click,
            enabled: enabled
        };
        return new MenuItem(options);
    };
    TicinoMenu.openedPathsListStorageKey = 'openedPathsList';
    TicinoMenu.MAX_RECENT_ENTRIES = 10;
    TicinoMenu.AUTO_SAVE_DELAY_DEFAULT = 1000; // in ms
    TicinoMenu.AUTO_SAVE_DISABLED = -1;
    return TicinoMenu;
})();
exports.TicinoMenu = TicinoMenu;
function openAboutDialog() {
    Dialog.showMessageBox(windows.manager.getLastActiveWindow().win, {
        message: env.appNameLong,
        detail: nls.localize('aboutDetail', "\nVersion {0}\nCommit {1}\nShell {2}\nRenderer {3}", app.getVersion(), env.commit || 'undefined', process.versions['atom-shell'], process.versions['chrome']),
        buttons: [nls.localize('okButton', "OK")]
    }, function (result) { return null; });
    reportMenuActionTelemetry('showAboutDialog');
}
function openDocumentationUrl() {
    shell.openExternal('http://go.microsoft.com/fwlink/?LinkID=533484');
    reportMenuActionTelemetry('openDocumentationUrl');
}
function openTwitterUrl() {
    shell.openExternal('http://go.microsoft.com/fwlink/?LinkID=533687');
    reportMenuActionTelemetry('openTwitterUrl');
}
function openLicenseUrl() {
    shell.openExternal('http://go.microsoft.com/fwlink/?LinkID=533485');
    reportMenuActionTelemetry('openLicenseUrl');
}
function openPrivacyStatement() {
    shell.openExternal('http://go.microsoft.com/fwlink/?LinkID=528096&clcid=0x409');
    reportMenuActionTelemetry('openPrivacyStatement');
}
function openReleaseNotesUrl() {
    shell.openExternal('http://go.microsoft.com/fwlink/?LinkID=533484');
    reportMenuActionTelemetry('openReleaseNotesUrl');
}
function openUserVoiceUrl() {
    shell.openExternal('http://go.microsoft.com/fwlink/?LinkID=533482');
    reportMenuActionTelemetry('openUserVoiceUrl');
}
function openReportIssues() {
    shell.openExternal('http://go.microsoft.com/fwlink/?LinkId=534872');
    reportMenuActionTelemetry('openReportIssues');
}
function reportMenuActionTelemetry(id) {
    windows.manager.sendToFocused('ticino:reportMenuActionTelemetry', id);
}
function __separator__() {
    return new MenuItem({ type: 'separator' });
}
function mnemonicLabel(label) {
    if (env.isMac) {
        return label.replace(/&&/g, ''); // no mnemonic support on mac
    }
    return label.replace(/&&/g, '&');
}
exports.manager = new TicinoMenu();
