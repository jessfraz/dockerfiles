/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
'use strict';
define(["require", "exports", 'url', 'https', '../../lib/utils'], function (require, exports, url, https, utils) {
    var defaultOptions = {
        eventBatchSize: 100,
        eventInterval: 30 * 1000
    };
    var TelemetryClient = (function () {
        function TelemetryClient(config, options) {
            if (options === void 0) { options = {}; }
            this.endpoint = config.endpoint;
            this.workspaceId = config.workspaceId;
            this.versionInfo = config.versionInfo;
            this.logger = config.logger;
            this.enablePrivateTelemetry = config.enablePrivateTelemetry;
            this.options = utils.mixin(utils.mixin({}, defaultOptions), options);
            this.eventQueue = [];
            this.pendingSubmit = false;
            this.failureCount = 0;
            this.waitIntervalId = null;
        }
        TelemetryClient.prototype.log = function (eventName, data, sessionId, userId) {
            if (this.enablePrivateTelemetry) {
                this.handleEvent('restricted', eventName, data, sessionId, userId);
            }
        };
        TelemetryClient.prototype.publicLog = function (eventName, data, sessionId, userId) {
            this.handleEvent('public', eventName, data, sessionId, userId);
        };
        TelemetryClient.prototype.handleClientEvents = function (events, userId) {
            var _this = this;
            // tag all client events with the user id & workspace Id
            this.eventQueue.push.apply(this.eventQueue, events.map(function (event) {
                event.user = userId;
                event.workspace = _this.workspaceId;
                return event;
            }));
            this.onEventQueueAdd();
        };
        TelemetryClient.prototype.handleEvent = function (kind, eventName, data, sessionId, userId) {
            data = data || {};
            data.source = 'server';
            data.version = this.versionInfo; // === { version: version.version, siteExtension: version.siteExtensionVersion }
            this.eventQueue.push({
                name: eventName,
                kind: kind,
                timestamp: new Date(),
                data: JSON.stringify(data),
                sessionID: sessionId,
                user: userId,
                workspace: this.workspaceId
            });
            this.onEventQueueAdd();
        };
        TelemetryClient.prototype.onEventQueueAdd = function () {
            var _this = this;
            if (this.pendingSubmit || this.failureCount > 0) {
                return;
            }
            // send now or later
            if (this.eventQueue.length > this.options.eventBatchSize) {
                clearTimeout(this.waitIntervalId);
                this.waitIntervalId = null;
                process.nextTick(function () {
                    _this.sendEvents();
                });
            }
            else {
                this.sendSoon();
            }
        };
        TelemetryClient.prototype.sendSoon = function () {
            var _this = this;
            if (this.waitIntervalId === null) {
                this.waitIntervalId = setTimeout(function () {
                    _this.waitIntervalId = null;
                    _this.sendEvents();
                }, this.options.eventInterval * Math.pow(2, this.failureCount));
            }
        };
        TelemetryClient.prototype.sendEvents = function () {
            var _this = this;
            if (this.pendingSubmit) {
                return;
            }
            var events = this.eventQueue.splice(0, this.options.eventBatchSize);
            if (events.length > 0) {
                this.pendingSubmit = true;
                this.submitToServer(events, function (error) {
                    _this.pendingSubmit = false;
                    if (error) {
                        _this.eventQueue.unshift.apply(_this.eventQueue, events);
                        _this.failureCount++;
                    }
                    else {
                        _this.failureCount = 0;
                    }
                    // re-schedule iff there is more
                    if (_this.eventQueue.length > 0) {
                        _this.sendSoon();
                    }
                });
            }
        };
        TelemetryClient.prototype.submitToServer = function (events, callback) {
            var _this = this;
            var body = JSON.stringify(events);
            var count = events.length + this.eventQueue.length;
            var dest = url.parse(this.endpoint);
            var callbackCalled = false;
            var options = {
                host: dest.hostname,
                port: 443,
                secureProtocol: 'SSLv3_method',
                path: dest.path,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'charset': 'utf-8',
                    'Content-Length': body.length
                }
            };
            var req = https.request(options, function (res) {
                if (callbackCalled) {
                    return;
                }
                if (res.statusCode !== 201) {
                    _this.logger && _this.logger.warn("Unable to send telemetry events to server. Response was " + res.statusCode + ". Queue length is " + count);
                    callbackCalled = true;
                    callback(true);
                }
                else {
                    if (_this.failureCount) {
                        _this.logger && _this.logger.info("Telemetry buffer successfully sent to server.");
                    }
                    callbackCalled = true;
                    callback(false);
                }
            });
            req.on('error', function (e) {
                if (callbackCalled) {
                    return;
                }
                _this.logger && _this.logger.warn("Unable to contact telemetry service: " + e);
                callbackCalled = true;
                callback(true);
            });
            req.write(body);
            req.end();
        };
        return TelemetryClient;
    })();
    exports.TelemetryClient = TelemetryClient;
});
