/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
/// <reference path="../../declare/express.d.ts" />
'use strict';
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", '../../platform', '../contributions', './buildImpl'], function (require, exports, Platform, Contributions, build) {
    var BuildContribution = (function (_super) {
        __extends(BuildContribution, _super);
        function BuildContribution() {
            _super.call(this, 'com.microsoft.vs.build');
        }
        BuildContribution.prototype.registerExtensions = function (server) {
            Platform.ServiceRegistry.registerService(build.buildService);
        };
        BuildContribution.prototype.channel = function (server, eventChannels) {
            eventChannels.bind('build', function (eventChannelRequest, request) {
                var workspace = eventChannelRequest.$workspace;
                var eventChannel = eventChannelRequest.accept();
                eventChannel.addListener('client', function (data) {
                    var requestId = data.requestId;
                    try {
                        build.handleRequest(server, workspace, eventChannel, data);
                    }
                    catch (ex) {
                        eventChannel.emit({
                            requestId: requestId,
                            error: ex
                        });
                    }
                });
            });
        };
        return BuildContribution;
    })(Contributions.AbstractContribution);
    Contributions.Registry.registerContribution(new BuildContribution());
});
