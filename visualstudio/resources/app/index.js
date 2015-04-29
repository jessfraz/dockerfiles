/*!---------------------------------------------------------
* Copyright (C) Microsoft Corporation. All rights reserved.
*--------------------------------------------------------*/
/// <reference path="./declare/node.d.ts" />
/// <reference path="./declare/atom-renderer.d.ts" />
'use strict';
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var remote = require('remote');
var indexBase = require('./index-base');
var Index;
(function (Index) {
    var TicinoLoader = (function (_super) {
        __extends(TicinoLoader, _super);
        function TicinoLoader() {
            var args = this.parseURLQueryArgs();
            this.configuration = JSON.parse(args['config']);
            var isProduction = !this.configuration.enableSelfhost && this.configuration.isBuiltTicino;
            _super.call(this, 'main-window', isProduction, false, isProduction);
        }
        TicinoLoader.load = function () {
            new TicinoLoader().load();
        };
        TicinoLoader.prototype.load = function () {
            var _this = this;
            var rootUrl = 'file://' + this.configuration.appRoot.replace(/\\/g, '/');
            this.createScript(rootUrl + '/client/vs/loader.js', function () {
                require.config({
                    paths: {
                        'vs': 'client/vs'
                    },
                    baseUrl: rootUrl,
                    'vs/nls': {
                        availableLanguages: {}
                    }
                });
                var hasWorkspaceContext = _this.configuration.workspacePath;
                window.MonacoEnvironment = {
                    'appNameLong': _this.configuration.appNameLong,
                    'appNameShort': _this.configuration.appNameShort,
                    'version': _this.configuration.version,
                    'shortVersion': null,
                    'platform': remote.process.platform,
                    'appRoot': _this.configuration.appRoot,
                    'processWorkers': _this.configuration.enableSelfhost,
                    'appSettingsHome': _this.configuration.appSettingsHome,
                    'appSettingsPath': _this.configuration.appSettingsPath,
                    'appKeybindingsPath': _this.configuration.appKeybindingsPath,
                    'welcomePath': _this.configuration.welcomePath,
                    'enableSearch': true,
                    'enableGit': true,
                    'enableDebug': true,
                    'enableOutput': true,
                    'enableBuild': hasWorkspaceContext && _this.configuration.enableSelfhost,
                    'enableBuildNative': hasWorkspaceContext && !_this.configuration.enableSelfhost,
                    'enableNativeConsole': true,
                    'enableTelemetry': _this.configuration.isBuiltTicino || _this.configuration.enableSelfhost,
                    'enableFeedback': _this.configuration.isBuiltTicino && !_this.configuration.enableSelfhost,
                    'enablePrivateTelemetry': true,
                    'appInsightsInstrumentationKey': '8aa6e059-82b6-46f6-8138-5a43aa3dd621',
                    'enableGlobalCSSRuleChecker': false,
                    'enablePerformanceEvents': _this.configuration.enablePerformance,
                    'enablePerformanceTools': _this.configuration.enablePerformance,
                    'enableTypeScriptServiceMode': !_this.configuration.enableSelfhost,
                    'enableJavaScriptRewriting': true,
                    'enableNLSWarnings': _this.configuration.enableSelfhost,
                    'enableEnhancedEditorTheme': _this.configuration.enableSelfhost,
                    'enableEditorLanguageServiceIndicator': _this.configuration.enableSelfhost,
                    'hideDerivedResources': _this.configuration.enableSelfhost,
                    'enableNativeReload': _this.configuration.enableSelfhost || !_this.configuration.isBuiltTicino,
                    'workersCount': (_this.configuration.enableSelfhost ? 3 : 2)
                };
                if (_this.configuration.workers > 0) {
                    window.MonacoEnvironment.workersCount = _this.configuration.workers;
                }
                var programStart = remote.getGlobal('programStart');
                var ticinoStart = remote.getGlobal('ticinoStart');
                var timers = window.MonacoEnvironment.timers = {
                    start: new Date(programStart || ticinoStart),
                };
                if (programStart) {
                    timers.beforeProgram = new Date(programStart);
                    timers.afterProgram = new Date(ticinoStart);
                }
                timers.ticinoStart = new Date(ticinoStart);
                timers.beforeLoad = new Date();
                require([
                    'vs/monaco/ui/workbench/native/native.main',
                    'vs/nls!vs/monaco/ui/workbench/native/native.main',
                    'vs/css!vs/monaco/ui/workbench/native/native.main'
                ], function () {
                    timers.afterLoad = new Date();
                    // We get the global settings through a remote call from the browser
                    // because its value can change dynamically.
                    var globalSettings;
                    var globalSettingsValue = remote.getGlobal('globalSettingsValue');
                    if (globalSettingsValue) {
                        globalSettings = JSON.parse(globalSettingsValue);
                    }
                    else {
                        globalSettings = {
                            settings: {},
                            keybindings: []
                        };
                    }
                    var runNative = require('vs/monaco/ui/workbench/native/run-native');
                    runNative.startup(_this.configuration, globalSettings);
                });
            });
        };
        return TicinoLoader;
    })(indexBase.IndexBase);
    TicinoLoader.load();
})(Index || (Index = {}));
