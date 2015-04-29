/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
'use strict';
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", 'fs', '../../platform', '../../lib/eventBus', '../contributions', './ipcImpl'], function (require, exports, fs, platform, eventBus, contributions, ipcImpl) {
    var IPCContribution = (function (_super) {
        __extends(IPCContribution, _super);
        function IPCContribution() {
            _super.call(this, 'com.microsoft.vs.ipc');
            this.ipcService = null;
        }
        IPCContribution.prototype.registerExtensions = function (server) {
            if (!this.ipcService) {
                this.ipcService = ipcImpl.service;
            }
            platform.ServiceRegistry.registerService(this.ipcService);
        };
        IPCContribution.prototype.configure = function (server) {
            this.hook = server.options.ipcEventBusHook;
            eventBus.publish(this.hook, this.ipcService);
        };
        IPCContribution.prototype.onExit = function (server) {
            if (fs.existsSync(this.hook)) {
                try {
                    fs.unlinkSync(this.hook);
                }
                catch (e) {
                }
            }
        };
        return IPCContribution;
    })(contributions.AbstractContribution);
    contributions.Registry.registerContribution(new IPCContribution());
});
