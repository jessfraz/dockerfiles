/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
/// <reference path="../declare/node.d.ts" />
'use strict';
define(["require", "exports", '../lib/logger'], function (require, exports, logger) {
    function configure(server, next) {
        var loggers = [];
        // Console
        var consoleLogger = new logger.ConsoleLogger({
            colorize: !!process.stdout.isTTY,
            level: logger.LogLevel.INFO
        });
        if (server.options.enableConsoleLogger) {
            loggers.push(consoleLogger);
        }
        // File DB (JSON)
        if (server.options.logFile) {
            loggers.push(new logger.FileDBLogger({
                filename: server.options.logFile,
                level: logger.LogLevel.HTTP
            }));
        }
        // File (Raw)
        if (server.options.logsFolder) {
            loggers.push(new logger.FileLogger({
                logsFolder: server.options.logsFolder,
                level: logger.LogLevel.INFO
            }));
        }
        //Antares MDS
        if (server.options.enableMDSLogger) {
            loggers.push(new logger.MDSLogger({
                logsFolder: server.options.mdsLogFolder,
                level: logger.LogLevel.ERROR
            }));
        }
        server.logger = new logger.MultiLogger(loggers);
        next();
    }
    exports.configure = configure;
});
