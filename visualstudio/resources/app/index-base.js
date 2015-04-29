/*!---------------------------------------------------------
* Copyright (C) Microsoft Corporation. All rights reserved.
*--------------------------------------------------------*/
/// <reference path="./declare/node.d.ts" />
/// <reference path="./declare/atom-renderer.d.ts" />
'use strict';
var remote = require('remote');
var IndexBase = (function () {
    function IndexBase(name, disableReload, disableDevTools, disableDevToolsOnError) {
        this.name = name;
        this.disableDevTools = disableDevTools;
        this.disableDevToolsOnError = disableDevToolsOnError;
        this.registerListeners(disableReload);
    }
    IndexBase.prototype.registerListeners = function (disableReload) {
        var _this = this;
        // Devtools & reload support
        if (process.platform === 'darwin') {
            window.addEventListener('keydown', function (e) {
                if (!_this.disableDevTools && !e.ctrlKey && e.metaKey && e.altKey && !e.shiftKey && e.keyCode === 73) {
                    remote.getCurrentWindow().toggleDevTools();
                }
                else if (!disableReload && !e.ctrlKey && e.metaKey && !e.altKey && e.keyCode === 82) {
                    remote.getCurrentWindow().reload();
                }
            });
        }
        else {
            window.addEventListener('keydown', function (e) {
                if (!_this.disableDevTools && e.ctrlKey && !e.metaKey && !e.altKey && e.shiftKey && e.keyCode === 73) {
                    remote.getCurrentWindow().toggleDevTools();
                }
                else if (!_this.disableDevTools && !e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey && e.keyCode === 123) {
                    remote.getCurrentWindow().toggleDevTools();
                }
                else if (!disableReload && e.ctrlKey && !e.metaKey && !e.altKey && e.keyCode === 82) {
                    remote.getCurrentWindow().reload();
                }
            });
        }
        // Workaround to prevent page navigation when backspace is pressed
        window.addEventListener('keydown', function (e) {
            if (e.which !== 8) {
                return; // only interested in backspace
            }
            var targetTagName = e.target && e.target.tagName && e.target.tagName.toLowerCase();
            var targetReadOnly = e.target && e.target.readOnly;
            if (targetTagName && (targetTagName === 'input' || targetTagName === 'textarea') && !targetReadOnly) {
                return; // allow backspace in editable input/textarea
            }
            e.preventDefault();
        });
        process.on('uncaughtException', function (err) { return _this.onUncaughtException(err); });
    };
    IndexBase.prototype.onUncaughtException = function (err) {
        console.error('[uncaught exception in ' + this.name + ']: ', err);
        if (err.stack) {
            console.error(err.stack);
        }
        if (!this.disableDevTools && !this.disableDevToolsOnError) {
            remote.getCurrentWindow().openDevTools();
            remote.getCurrentWindow().show();
        }
    };
    IndexBase.prototype.createScript = function (src, onload) {
        var script = document.createElement('script');
        script.src = src;
        script.addEventListener('load', onload);
        var head = document.getElementsByTagName('head')[0];
        head.insertBefore(script, head.lastChild);
    };
    IndexBase.prototype.parseURLQueryArgs = function () {
        var result = {};
        var search = window.location.search;
        if (search) {
            var params = search.split(/[?&]/);
            for (var i = 0; i < params.length; i++) {
                var param = params[i];
                if (param) {
                    var keyValue = param.split('=');
                    if (keyValue.length === 2) {
                        result[keyValue[0]] = decodeURIComponent(keyValue[1]);
                    }
                }
            }
        }
        return result;
    };
    return IndexBase;
})();
exports.IndexBase = IndexBase;
