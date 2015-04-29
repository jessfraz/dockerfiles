/*!---------------------------------------------------------
* Copyright (C) Microsoft Corporation. All rights reserved.
*--------------------------------------------------------*/
/// <reference path="./declare/node.d.ts" />
/// <reference path="./declare/atom-browser.d.ts" />
'use strict';
var fs = require('fs');
var path = require('path');
var os = require('os');
var app = require('app');
var packageJson = require('./package.json');
exports.isBuiltTicino = fs.existsSync(path.join(__dirname, 'client'));
exports.flavor = packageJson.flavor || void 0;
exports.commit = packageJson.commit || void 0;
exports.updateInfo = packageJson.update || void 0;
// !!! Do not move this down, it needs to run early !!!
var appData = app.getPath('appData');
if (!exports.isBuiltTicino) {
    app.setPath('userData', path.join(appData, 'Ticino-Development'));
}
else if (exports.flavor) {
    app.setPath('userData', path.join(appData, exports.flavor));
}
// !!!
exports.appNameShort = 'Code';
exports.appNameLong = 'Visual Studio Code';
exports.isWindows = (process.platform === 'win32');
exports.isMac = (process.platform === 'darwin');
exports.isLinux = (process.platform === 'linux');
exports.runningInstanceHandle = getRunningInstanceHandle();
exports.appRoot = getAppRoot();
exports.version = app.getVersion();
exports.cliArgs = parseCli();
exports.appHome = app.getPath('userData');
exports.appSettingsHome = path.join(exports.appHome, 'User');
if (!fs.existsSync(exports.appSettingsHome)) {
    fs.mkdirSync(exports.appSettingsHome);
}
exports.appSettingsPath = path.join(exports.appSettingsHome, 'settings.json');
exports.appKeybindingsPath = path.join(exports.appSettingsHome, 'keybindings.json');
exports.welcomePath = path.join(__dirname, 'welcome-win.md');
if (exports.isMac) {
    exports.welcomePath = path.join(__dirname, 'welcome-mac.md');
}
function log() {
    var a = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        a[_i - 0] = arguments[_i];
    }
    if (exports.cliArgs.verboseLogging) {
        console.log.apply(null, a);
    }
}
exports.log = log;
function parseCli() {
    // We need to do some argv massaging. First, remove the Atom executable
    var args = Array.prototype.slice.call(process.argv, 1);
    // Then, when in dev, remove the first non option argument, it will be the app location
    if (!exports.isBuiltTicino) {
        var i = (function () {
            for (var j = 0; j < args.length; j++) {
                if (args[j][0] !== '-') {
                    return j;
                }
            }
            return -1;
        })();
        if (i > -1) {
            args.splice(i, 1);
        }
    }
    // Finally, any extra arguments in the 'argv' file should be prepended
    if (fs.existsSync(path.join(exports.appRoot, 'argv'))) {
        var extraargs = JSON.parse(fs.readFileSync(path.join(exports.appRoot, 'argv'), 'utf8'));
        args = extraargs.concat(args);
    }
    var opts = parseOpts(args);
    return {
        pathArgument: parsePathArgument(args),
        programStart: parseProgramStart(args),
        workers: parseWorkerCount(args),
        enablePerformance: !!opts['p'],
        enableSelfhost: !!opts['m'],
        verboseLogging: !!opts['verbose'],
        firstrun: !!opts['squirrel-firstrun']
    };
}
function getAppRoot() {
    // Built Ticino
    if (exports.isBuiltTicino) {
        return __dirname;
    }
    // In-Development Ticino
    return path.resolve(path.join(__dirname, '..', '..'));
}
function getRunningInstanceHandle() {
    var handleName;
    if (exports.flavor) {
        handleName = exports.flavor;
    }
    else {
        handleName = app.getName();
        if (!exports.isBuiltTicino) {
            handleName += '-dev';
        }
    }
    // Windows: use named pipe
    if (process.platform === 'win32') {
        return '\\\\.\\pipe\\' + handleName + '-sock';
    }
    // Mac/Unix: use socket file
    return path.join(os.tmpdir(), handleName + '.sock');
}
function parseOpts(argv) {
    return argv.filter(function (a) { return /^-/.test(a); }).map(function (a) { return a.replace(/^-*/, ''); }).reduce(function (r, a) {
        r[a] = true;
        return r;
    }, {});
}
function parsePathArgument(argv) {
    var candidate;
    var args = argv.filter(function (a) { return !(/^-/.test(a)); }); // find arguments without leading "-"
    if (args.length > 0) {
        try {
            candidate = fs.realpathSync(args[args.length - 1]);
        }
        catch (error) {
        }
    }
    return candidate;
}
function parseProgramStart(argv) {
    for (var i = 0; i < argv.length; i++) {
        if (argv[i] === '--timestamp') {
            return Number(argv[i + 1]) || 0;
        }
    }
    return 0;
}
function parseWorkerCount(argv) {
    for (var i = 0; i < argv.length; i++) {
        if (argv[i] === '--workers' && argv.length > i + 1) {
            return Number(argv[i + 1]) || -1;
        }
    }
    return -1;
}
function getPlatformIdentifier() {
    if (process.platform === 'linux') {
        return "linux-" + process.arch;
    }
    return process.platform;
}
exports.getPlatformIdentifier = getPlatformIdentifier;
