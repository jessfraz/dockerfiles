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
define(["require", "exports", 'fs', 'path', './cli', './utils', './types', './extfs'], function (require, exports, fs, path, cli, utils, types, extfs) {
    exports.LogLevel = {
        TRACE: 0,
        HTTP: 1,
        PERF: 2,
        DEBUG: 3,
        VERBOSE: 4,
        INFO: 5,
        WARN: 6,
        ERROR: 7,
        FATAL: 8
    };
    function getPrefix(level, colorize) {
        switch (level) {
            case exports.LogLevel.TRACE:
                return colorize ? cli.colorize(getColor(level), '[trace]') : '[trace]';
            case exports.LogLevel.HTTP:
                return colorize ? cli.colorize(getColor(level), '[http]') : '[http]';
            case exports.LogLevel.PERF:
                return colorize ? cli.colorize(getColor(level), '[perf]') : '[perf]';
            case exports.LogLevel.DEBUG:
                return colorize ? cli.colorize(getColor(level), '[debug]') : '[debug]';
            case exports.LogLevel.VERBOSE:
                return colorize ? cli.colorize(getColor(level), '[verbo]') : '[verbo]';
            case exports.LogLevel.INFO:
                return colorize ? cli.colorize(getColor(level), '[info]') : '[info]';
            case exports.LogLevel.WARN:
                return colorize ? cli.colorize(getColor(level), '[warn]') : '[warn]';
            case exports.LogLevel.ERROR:
                return colorize ? cli.colorize(getColor(level), '[error]') : '[error]';
            case exports.LogLevel.FATAL:
                return colorize ? cli.colorize(getColor(level), '[fatal]') : '[fatal]';
        }
    }
    exports.getPrefix = getPrefix;
    /**
     * Will match on URLs like http://someone:password@url.com and replace it to http://****:****@url.com
     */
    var userCredentialsInUrlRegExp = new RegExp('(http|https|ftp|ftps)://(\\S+):(\\S+)@(\\S+)', 'igm');
    function stripUserCredentialsFromUrl(msg) {
        return msg.replace(userCredentialsInUrlRegExp, '$1://****:****@$4');
    }
    exports.stripUserCredentialsFromUrl = stripUserCredentialsFromUrl;
    function getColor(level) {
        switch (level) {
            case exports.LogLevel.TRACE:
            case exports.LogLevel.DEBUG:
            case exports.LogLevel.VERBOSE:
                return 35;
            case exports.LogLevel.HTTP:
            case exports.LogLevel.PERF:
                return 32;
            case exports.LogLevel.INFO:
                return 36;
            case exports.LogLevel.WARN:
                return 33;
            case exports.LogLevel.ERROR:
            case exports.LogLevel.FATAL:
                return 31;
        }
    }
    var BaseLogger = (function () {
        function BaseLogger(options) {
            this._options = options;
        }
        Object.defineProperty(BaseLogger.prototype, "options", {
            get: function () {
                return this._options;
            },
            enumerable: true,
            configurable: true
        });
        BaseLogger.prototype.trace = function (msg) {
            this._log(exports.LogLevel.TRACE, msg);
        };
        BaseLogger.prototype.debug = function (msg) {
            this._log(exports.LogLevel.DEBUG, msg);
        };
        BaseLogger.prototype.info = function (msg) {
            this._log(exports.LogLevel.INFO, msg);
        };
        BaseLogger.prototype.warn = function (arg) {
            this._log(exports.LogLevel.WARN, arg);
        };
        BaseLogger.prototype.error = function (arg, category) {
            this._log(exports.LogLevel.ERROR, arg, category);
        };
        BaseLogger.prototype.fatal = function (arg) {
            this._log(exports.LogLevel.FATAL, arg);
        };
        BaseLogger.prototype.verbose = function (msg) {
            this._log(exports.LogLevel.VERBOSE, msg);
        };
        BaseLogger.prototype.perf = function (msg) {
            this._log(exports.LogLevel.PERF, msg);
        };
        BaseLogger.prototype.http = function (msg, details) {
            this._log(exports.LogLevel.HTTP, msg, details);
        };
        BaseLogger.prototype._log = function (level, arg, detailsOrCategory) {
            if (level < this._options.level || !arg) {
                return;
            }
            // Support error stack
            if (arg.stack) {
                arg = arg.stack;
            }
            // Build msg
            var prefix = getPrefix(level, this._options.colorize);
            var category = types.isString(detailsOrCategory) ? detailsOrCategory : null;
            var logmsg;
            if (category) {
                logmsg = prefix + ' [' + category + '] ' + arg.toString();
            }
            else {
                logmsg = prefix + ' ' + arg.toString();
            }
            if (detailsOrCategory && !types.isString(detailsOrCategory)) {
                var details = detailsOrCategory;
                var detailsMsg = [];
                if (details.method) {
                    detailsMsg.push('method: ' + details.method);
                }
                if (details.statusCode) {
                    detailsMsg.push('status: ' + details.statusCode);
                }
                if (details.responseTime) {
                    detailsMsg.push('time: ' + details.responseTime + 'ms');
                }
                if (details.path) {
                    detailsMsg.push('path: ' + details.path);
                }
                if (details.command) {
                    detailsMsg.push('command: ' + details.command);
                }
                if (details.cwd) {
                    detailsMsg.push('cwd: ' + details.cwd);
                }
                if (details.workspaceId) {
                    detailsMsg.push('workspaceId: ' + details.workspaceId);
                }
                logmsg = logmsg + ' (' + detailsMsg.join(', ') + ')';
            }
            this._doLog(logmsg);
        };
        BaseLogger.prototype._doLog = function (msg) {
            throw new Error('Subclasses to implement');
        };
        BaseLogger.prototype.query = function (callback) {
            return callback(null, []);
        };
        return BaseLogger;
    })();
    exports.BaseLogger = BaseLogger;
    var MultiLogger = (function (_super) {
        __extends(MultiLogger, _super);
        function MultiLogger(loggers) {
            _super.call(this, null);
            this.loggers = loggers;
        }
        MultiLogger.prototype._log = function (level, arg, details) {
            this.loggers.forEach(function (logger) {
                logger._log(level, arg, details);
            });
        };
        MultiLogger.prototype.query = function (callback) {
            for (var i = 0; i < this.loggers.length; i++) {
                var logger = this.loggers[i];
                if (logger instanceof FileDBLogger) {
                    return logger.query(callback);
                }
            }
            return callback(null, []);
        };
        MultiLogger.prototype.push = function (logger) {
            this.loggers.push(logger);
        };
        return MultiLogger;
    })(BaseLogger);
    exports.MultiLogger = MultiLogger;
    var ConsoleLogger = (function (_super) {
        __extends(ConsoleLogger, _super);
        function ConsoleLogger() {
            _super.apply(this, arguments);
        }
        ConsoleLogger.prototype._doLog = function (msg) {
            console.log(msg);
        };
        return ConsoleLogger;
    })(BaseLogger);
    exports.ConsoleLogger = ConsoleLogger;
    var FileDBLogger = (function (_super) {
        __extends(FileDBLogger, _super);
        function FileDBLogger(options) {
            _super.call(this, options);
            this.logPath = options.filename;
            this.flushTimer = 0;
            this.buffer = '';
            this.init();
        }
        FileDBLogger.prototype.init = function () {
            try {
                // If log file is larger than 1 MB, delete it first to have fresh session log
                if (fs.existsSync(this.logPath)) {
                    var stat = fs.statSync(this.logPath);
                    if (stat.size > FileDBLogger.MAX_LOG_FILE_SIZE) {
                        fs.unlinkSync(this.logPath);
                    }
                }
                // Ensure Log Directory is present
                var logDir = path.dirname(this.logPath);
                if (!fs.existsSync(logDir)) {
                    extfs.mkdirpSync(logDir);
                }
            }
            catch (error) {
                console.error(error);
            }
        };
        FileDBLogger.prototype._log = function (level, arg, details) {
            var _this = this;
            if (!arg) {
                return;
            }
            var data = {
                level: level,
                message: arg.stack || arg.toString(),
                timestamp: new Date().getTime()
            };
            if (details) {
                utils.mixin(data, details);
            }
            this.buffer += JSON.stringify(data) + '\n';
            if (this.flushTimer > 0) {
                return;
            }
            // Otherwise install timer to flush
            this.flushTimer = setTimeout(function () {
                fs.appendFile(_this.logPath, _this.buffer, null, function (error) {
                    _this.buffer = '';
                    _this.flushTimer = 0;
                    if (error) {
                    }
                });
            }, FileDBLogger.FLUSH_INTERVAL);
        };
        FileDBLogger.prototype.query = function (callback) {
            fs.readFile(this.logPath, 'utf-8', function (error, contents) {
                if (error) {
                    return callback(error, null);
                }
                var entries = contents.toString().split('\n').reverse();
                var result = [];
                for (var i = 0; i < entries.length; i++) {
                    var entry = entries[i];
                    try {
                        result.push(JSON.parse(entry));
                    }
                    catch (error) {
                    }
                    ;
                }
                return callback(null, result);
            });
        };
        FileDBLogger.FLUSH_INTERVAL = 1000;
        FileDBLogger.MAX_LOG_FILE_SIZE = 1000000;
        return FileDBLogger;
    })(BaseLogger);
    exports.FileDBLogger = FileDBLogger;
    var FileLogger = (function (_super) {
        __extends(FileLogger, _super);
        function FileLogger(options) {
            _super.call(this, options);
            this.fileOptions = options;
            this.logPath = path.resolve(this.fileOptions.logsFolder, FileLogger.LOG);
            this.flushTimer = 0;
            this.buffer = '';
            this.init();
        }
        FileLogger.prototype.init = function () {
            try {
                // If log file exists, delete it first to have fresh session log
                if (fs.existsSync(this.logPath)) {
                    fs.unlinkSync(this.logPath);
                }
                // Ensure Log Directory is present
                if (!fs.existsSync(this.fileOptions.logsFolder)) {
                    extfs.mkdirpSync(this.fileOptions.logsFolder);
                }
            }
            catch (error) {
                console.error(error);
            }
        };
        FileLogger.prototype._doLog = function (msg) {
            var _this = this;
            this.buffer += msg + '\n';
            if (this.flushTimer > 0) {
                return;
            }
            // Otherwise install timer to flush
            this.flushTimer = setTimeout(function () {
                fs.appendFile(_this.logPath, _this.buffer, null, function (error) {
                    _this.buffer = '';
                    _this.flushTimer = 0;
                    if (error) {
                        console.error(error);
                    }
                });
            }, FileLogger.FLUSH_INTERVAL);
        };
        FileLogger.LOG = 'monaco.raw.log';
        FileLogger.FLUSH_INTERVAL = 1000;
        return FileLogger;
    })(BaseLogger);
    exports.FileLogger = FileLogger;
    var MDSLogger = (function (_super) {
        __extends(MDSLogger, _super);
        function MDSLogger(options) {
            _super.call(this, options);
            this.buffer = '';
            this.errorCount = 0;
            this.mdsLoggerOptions = options;
            this.logPath = path.resolve(this.mdsLoggerOptions.logsFolder, MDSLogger.LOGFILE);
            this.init();
        }
        MDSLogger.prototype.init = function () {
            try {
                // No need to handle log deletion as it's done by MDS
                // Ensure Log Directory is present
                if (!fs.existsSync(this.mdsLoggerOptions.logsFolder)) {
                    extfs.mkdirpSync(this.mdsLoggerOptions.logsFolder);
                }
            }
            catch (error) {
                console.error(error);
            }
        };
        MDSLogger.prototype._log = function (level, arg, details) {
            var _this = this;
            if (level < this._options.level || !arg) {
                return;
            }
            var levelString = '';
            switch (level) {
                case 7:
                    levelString = 'Error';
                    break;
                case 8:
                    levelString = 'Fatal';
                    break;
            }
            var data = {
                EventName: levelString,
                SiteExtension: 'Monaco',
                Message: arg.stack || arg.toString(),
                EventDate: new Date().toISOString()
            };
            if (details) {
                utils.mixin(data, details);
            }
            // empty the buffer if it's bigger than the limit
            if (this.buffer.length > MDSLogger.MAX_BUFFER_SIZE) {
                this.buffer = '';
            }
            this.buffer += JSON.stringify(data) + '\n';
            if (this.flushTimer > 0) {
                return;
            }
            var flushCallback = function () {
                fs.appendFile(_this.logPath, _this.buffer, null, function (error) {
                    // an error could happen if MDS locked the log file for processing
                    if (error) {
                        _this.errorCount++;
                        console.error(error);
                        // back off and retry to save again 
                        _this.flushTimer = setTimeout(flushCallback, (MDSLogger.FLUSH_INTERVAL * Math.pow(2, _this.errorCount)));
                    }
                    else {
                        _this.buffer = '';
                        _this.flushTimer = 0;
                        _this.errorCount = 0;
                    }
                });
            };
            // Otherwise install timer to flush
            this.flushTimer = setTimeout(flushCallback, MDSLogger.FLUSH_INTERVAL);
        };
        MDSLogger.LOGFILE = 'Monaco.log';
        MDSLogger.FLUSH_INTERVAL = 1000;
        MDSLogger.MAX_BUFFER_SIZE = 50 * 1000;
        return MDSLogger;
    })(BaseLogger);
    exports.MDSLogger = MDSLogger;
});
