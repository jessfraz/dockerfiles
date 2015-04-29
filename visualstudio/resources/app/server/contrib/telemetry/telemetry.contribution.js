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
define(["require", "exports", '../../platform', '../contributions', '../../model/workspace', '../../lib/strings', '../../lib/utils', '../../lib/types', '../../lib/errors', './telemetryClient', '../../lib/logger', './telemetry', '../../version', 'domain'], function (require, exports, platform, contributions, workspace, strings, utils, types, errors, telemetryClient, logger, telemetry, version, domain) {
    var ErrorTelemetryLogger = (function (_super) {
        __extends(ErrorTelemetryLogger, _super);
        function ErrorTelemetryLogger(telemetryService, options) {
            if (options === void 0) { options = { level: logger.LogLevel.WARN }; }
            // override log level 
            options.level = logger.LogLevel.WARN;
            _super.call(this, options);
            this.telemetryService = telemetryService;
        }
        ErrorTelemetryLogger.prototype._log = function (level, arg, detailsOrCategory) {
            if (level < this._options.level) {
                return;
            }
            var data = {
                level: level,
                message: arg ? arg.stack || arg.toString() : 'no message',
                category: 'unknown'
            };
            if (detailsOrCategory) {
                if (types.isString(detailsOrCategory)) {
                    data.category = detailsOrCategory;
                }
                else {
                    utils.mixin(data, detailsOrCategory);
                }
            }
            if (level === logger.LogLevel.WARN) {
                this.telemetryService.log('serverWarning', telemetry.EventType.Public, data);
            }
            else {
                this.telemetryService.log('serverError', telemetry.EventType.Public, data);
            }
        };
        return ErrorTelemetryLogger;
    })(logger.BaseLogger);
    var TelemetryContribution = (function (_super) {
        __extends(TelemetryContribution, _super);
        function TelemetryContribution() {
            _super.call(this, 'com.microsoft.vs.telemetry');
        }
        TelemetryContribution.prototype.injectTelemetryService = function (service) {
            this.telemetryService = service;
        };
        TelemetryContribution.prototype.configure = function (server) {
            if (this.telemetryService) {
                if (server.options.enableErrorTelemetry) {
                    server.logger.push(new ErrorTelemetryLogger(this.telemetryService));
                }
            }
        };
        TelemetryContribution.prototype.route = function (server) {
            var _this = this;
            server.www.post(strings.bind('/api/telemetry/{0}', workspace), function (req, res, next) {
                var contentType = req.get('Content-Type');
                if (!contentType || contentType.indexOf('application/json') === -1) {
                    return next(errors.httpError(400, "Invalid request. Content-Type must be application/json."));
                }
                if (!req.body) {
                    return next(errors.httpError(400, "Invalid request. No JSON body."));
                }
                /*if(Array.isArray(req.body)) {
                    return next(errors.httpError(400, "Invalid request. Not an array."));
                }*/
                _this.telemetryService.handleClientEvents(req.body);
                res.writeHead(201, { 'Content-Type': 'application/json' });
                res.write(JSON.stringify({ result: 'ok' }));
                res.end();
            });
            // Handle Invalid Requests
            server.www.all('/api/telemetry/*', function (req, res, next) {
                return next(errors.httpError(400, "Invalid request to the telemetry service."));
            });
        };
        TelemetryContribution.prototype.getRestEndPoints = function (server, workspace) {
            return {
                telemetry: '/api/telemetry' + workspace.getQualifier()
            };
        };
        return TelemetryContribution;
    })(contributions.AbstractContribution);
    var TelemetryService = (function (_super) {
        __extends(TelemetryService, _super);
        function TelemetryService() {
            _super.call(this, telemetry.id);
        }
        TelemetryService.prototype.name = function () {
            return 'telemetryService';
        };
        TelemetryService.prototype.registerExtensions = function (server) {
            platform.ServiceRegistry.registerService(this);
        };
        TelemetryService.prototype.configure = function (server) {
            this.client = new telemetryClient.TelemetryClient({
                endpoint: server.options.telemetryEndPointAPI,
                versionInfo: {
                    version: version.version,
                    siteExtension: version.siteExtensionVersion
                },
                logger: server.logger,
                enablePrivateTelemetry: server.options.client.enablePrivateTelemetry || false,
                workspaceId: server.options.telemetryWorkspaceId
            });
        };
        TelemetryService.prototype.extractSessionId = function (req) {
            return req ? req.get('X-TelemetrySession') : null;
        };
        TelemetryService.prototype.tryGetUserId = function () {
            var activeDomain = domain.active;
            var req = activeDomain && activeDomain.members && activeDomain.members.length > 0 ? activeDomain.members[0] : null;
            // User Id through SSO
            var userId = req ? req.get('x-ms-client-principal-name') : null;
            // User Id for TryWAWS  
            userId = userId || process.env['USER_ID'];
            // Hash the User Id before sending
            userId = userId ? utils.sha256(userId) : null;
            return userId;
        };
        TelemetryService.prototype.tryGetSessionId = function () {
            var activeDomain = domain.active;
            var req = activeDomain && activeDomain.members && activeDomain.members.length > 0 ? activeDomain.members[0] : null;
            var sessionId = req ? this.extractSessionId(req) : null;
            return sessionId;
        };
        TelemetryService.prototype.log = function (event, type, data, sessionId, userId) {
            // if session id is not provided, try to see if this call is on a request context (domain)
            if (!sessionId) {
                sessionId = this.tryGetSessionId();
            }
            if (sessionId && !userId) {
                userId = this.tryGetUserId();
            }
            if (type === telemetry.EventType.Public) {
                this.client.publicLog(event, data, sessionId, userId);
            }
            else if (type === telemetry.EventType.Restricted) {
                this.client.log(event, data, sessionId, userId);
            }
            else {
                throw new Error('illegal argument');
            }
        };
        TelemetryService.prototype.handleClientEvents = function (events) {
            this.client.handleClientEvents(events, this.tryGetUserId());
        };
        return TelemetryService;
    })(contributions.AbstractContribution);
    contributions.Registry.registerContribution(new TelemetryService());
    contributions.Registry.registerContribution(new TelemetryContribution());
});
