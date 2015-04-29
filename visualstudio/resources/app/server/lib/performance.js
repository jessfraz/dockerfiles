/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
/// <reference path="../declare/node.d.ts" />
/// <reference path="../declare/express.d.ts" />
'use strict';
define(["require", "exports", './types', './strings'], function (require, exports, types, strings) {
    var isVerbosePerformanceLoggingEnabled = false;
    exports.startTime;
    /**
     * Configures the server to be enabled for performance measurements
     */
    function configure(server) {
        isVerbosePerformanceLoggingEnabled = server.options.verbosePerformanceLogging;
        server.www.use(function (req, res, next) {
            req.$startTime = new Date().getTime();
            req.$timeline = [];
            next();
        });
    }
    exports.configure = configure;
    /**
     * Adds a header to the request to indicate the time the request has taken so far.
     */
    function addPerformanceHeader(req, res) {
        res.setHeader('X-Trace-Duration', (new Date().getTime() - req.$startTime).toString());
    }
    exports.addPerformanceHeader = addPerformanceHeader;
    /**
     * Adds a new entry with message to the list of timeline entries.
     */
    function mark(message, req) {
        if (isVerbosePerformanceLoggingEnabled && req) {
            req.$timeline.push({
                message: message,
                time: new Date().getTime()
            });
        }
    }
    exports.mark = mark;
    /**
     * Returns a logable representation of the performance enabled request.
     */
    function toLogMessage(req) {
        var message;
        if (isVerbosePerformanceLoggingEnabled) {
            var timeline = req.$timeline;
            if (timeline.length > 0) {
                message = 'start (0)\n';
            }
            for (var i = 0; i < timeline.length; i++) {
                var entry = timeline[i];
                message += entry.message + ' (' + (entry.time - req.$startTime) + ')\n';
            }
            if (timeline.length > 0) {
                message += 'end (' + (new Date().getTime() - req.$startTime) + ')\n';
            }
        }
        return message || 'request';
    }
    exports.toLogMessage = toLogMessage;
    // Overwrites require() and compile() to add perf counters
    function requireWithPerfNative() {
        var c = console.log;
        var m = require('module');
        var oldLoad = m._load;
        m._load = function (request, parent) {
            var start = new Date().getTime();
            var res = oldLoad.apply(this, arguments);
            var end = new Date().getTime() - start;
            c('[' + end + 'ms]\trequire ' + request);
            return res;
        };
        var oldCompile = m.prototype._compile;
        m.prototype._compile = function () {
            var start = new Date().getTime();
            var res = oldCompile.apply(this, arguments);
            var end = new Date().getTime() - start;
            c('[' + end + 'ms]\tcompile ' + this.id);
            return res;
        };
    }
    exports.requireWithPerfNative = requireWithPerfNative;
    // Logs a message with time from startup to the logger
    var perflogs = [];
    function log(msg, time) {
        if (time === void 0) { time = new Date().getTime(); }
        perflogs.push('at ' + strings.pad(time - exports.startTime, 5, ' ') + 'ms' + '\t' + msg);
    }
    exports.log = log;
    function logDuration(msg, arg, arg2) {
        var start = new Date().getTime();
        if (types.isFunction(arg)) {
            var result = arg();
            var end = new Date().getTime();
            perflogs.push('at ' + strings.pad(start - exports.startTime, 5, ' ') + 'ms\ttime ' + strings.pad(end - start, 5, ' ') + 'ms' + '\t' + msg);
            return result;
        }
        else if (types.isNumber(arg)) {
            perflogs.push('at ' + strings.pad(arg - exports.startTime, 5, ' ') + 'ms\ttime ' + strings.pad(arg2 - arg, 5, ' ') + 'ms' + '\t' + msg);
        }
        else {
            return arg.then(function () {
                var end = new Date().getTime();
                perflogs.push('at ' + strings.pad(start - exports.startTime, 5, ' ') + 'ms\ttime ' + strings.pad(end - start, 5, ' ') + 'ms' + '\t' + msg);
            });
        }
    }
    exports.logDuration = logDuration;
    // Sends the buffered logs to the logger
    function flushLog(logger) {
        perflogs.forEach(function (log) {
            logger.perf(log);
        });
    }
    exports.flushLog = flushLog;
});
