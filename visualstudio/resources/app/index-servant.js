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
var ipc = require('ipc');
var indexBase = require('./index-base');
var IndexServant;
(function (IndexServant) {
    var ServantLoader = (function (_super) {
        __extends(ServantLoader, _super);
        function ServantLoader() {
            _super.call(this, 'servant-window');
        }
        ServantLoader.load = function () {
            new ServantLoader().load();
        };
        ServantLoader.prototype.load = function () {
            var _this = this;
            window.isProcessWorker = true;
            // The first message I will get will contain the initialization payload
            var initializationListener = function (payload) {
                ipc.removeListener('tbw', initializationListener);
                setInterval(function () {
                    try {
                        // throws an exception if the main process doesn't exist anymore.
                        process.kill(payload.ownerProcessId, 0);
                    }
                    catch (e) {
                        process.exit();
                    }
                }, 1000);
                _this.onInitialized(payload.communicationId, payload.appRoot, payload.module, payload.initData);
            };
            ipc.on('tbw', initializationListener);
        };
        ServantLoader.prototype.onInitialized = function (communicationId, appRoot, moduleId, initData) {
            // Remember messages received before we loaded
            var beforeReadyMessages = [];
            var beforeReadyListener = function (msg) {
                beforeReadyMessages.push(msg);
            };
            ipc.on('tbw', beforeReadyListener);
            // TODO@plugins: expose the entire MonacoEnvironment?
            window.MonacoEnvironment = {
                'appRoot': appRoot
            };
            var rootUrl = 'file://' + appRoot.replace(/\\/g, '/');
            this.createScript(rootUrl + '/client/vs/loader.js', function () {
                require.config({
                    paths: {
                        'vs': 'client/vs'
                    },
                    baseUrl: rootUrl,
                    catchError: true
                });
                // Load and run message handler
                require([moduleId], function (handlerModule) {
                    // Remove listener - we are ready now
                    ipc.removeListener('tbw', beforeReadyListener);
                    var messageHandler = handlerModule.create(function (msg) {
                        ipc.send('ticino:fromtbw', {
                            $tbw_id: communicationId,
                            payload: msg
                        });
                    }, initData);
                    ipc.on('tbw', function (data) {
                        messageHandler.onmessage(data);
                    });
                    for (var i = 0; i < beforeReadyMessages.length; i++) {
                        messageHandler.onmessage(beforeReadyMessages[i]);
                    }
                    beforeReadyMessages = null;
                });
            });
        };
        return ServantLoader;
    })(indexBase.IndexBase);
    ServantLoader.load();
})(IndexServant || (IndexServant = {}));
