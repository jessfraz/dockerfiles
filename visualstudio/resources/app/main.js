/*!---------------------------------------------------------
* Copyright (C) Microsoft Corporation. All rights reserved.
*--------------------------------------------------------*/
/// <reference path="./declare/node.d.ts" />
/// <reference path="./declare/atom-browser.d.ts" />
'use strict';
// Perf measurements
global.ticinoStart = new Date().getTime();
// We handle uncaught exceptions here to prevent atom shell from opening a dialog to the user
process.on('uncaughtException', function (err) { return (function () {
    console.error('[uncaught exception in main]: ', err);
    if (err.stack) {
        console.error(err.stack);
    }
}); });
var env = require('./env'); // do not move this, it should be loaded first!
var app = require('app');
var fs = require('fs');
var path = require('path');
var net = require('net');
var cp = require('child_process');
var windows = require('./windows');
var plugins = require('./servants');
var menu = require('./menu');
var reporter = require('./reporter');
var settings = require('./settings');
var squirrelwin32 = require('./win32/squirrel.win32');
var um = require('./update-manager');
var storage = require('./storage');
var UpdateManager = um.Instance;
// Remember the app ready state, in case someone attaches the listener after the event has fired 
var isAppReady = false;
app.once('ready', function () { return isAppReady = true; });
function onAppReady(cb) {
    if (isAppReady) {
        cb();
    }
    else {
        app.once('ready', cb);
    }
}
var Ticino = (function () {
    function Ticino() {
        this.registerListeners();
        this.startRunningInstanceListener();
        // Load settings
        settings.manager.load();
        // Propagate to clients
        windows.manager.ready();
        plugins.manager.ready();
        // Open our first window
        windows.manager.open(env.cliArgs);
        // Install Menu
        menu.manager.install();
    }
    Ticino.startup = function () {
        if (!!Ticino.INSTANCE) {
            throw new Error('Can only ever have one instance at the same time');
        }
        Ticino.INSTANCE = new Ticino();
    };
    Ticino.prototype.registerListeners = function () {
        var _this = this;
        app.on('will-quit', function () {
            env.log('App#will-quit: deleting running instance handle');
            _this.deleteRunningInstanceHandle();
        });
        app.on('window-all-closed', function () {
            env.log('App#window-all-closed');
            if (process.platform !== 'darwin') {
                app.quit();
            }
        });
    };
    Ticino.prototype.startRunningInstanceListener = function () {
        // We are the one to own this
        this.deleteRunningInstanceHandle();
        // Listen to other instances talking to us
        var runningInstance = net.createServer(function (connection) {
            connection.on('data', function (data) {
                var otherInstanceCliArgs = JSON.parse(data.toString());
                env.log('Received data from other instance', otherInstanceCliArgs);
                if (!otherInstanceCliArgs.pathArgument) {
                    windows.manager.focusLastActive(otherInstanceCliArgs);
                }
                else {
                    windows.manager.open(otherInstanceCliArgs, null, true);
                }
            });
        });
        runningInstance.listen(env.runningInstanceHandle);
        // This can happen when multiple apps fight over the same connection
        runningInstance.on('error', function (error) {
            console.error('Terminating because running instance listener failed:', error.toString());
            setTimeout(function () { return app.terminate(); }, 0); // we cannot allow multiple apps, so we quit
        });
    };
    Ticino.prototype.deleteRunningInstanceHandle = function () {
        if (env.isWindows) {
            return;
        }
        if (fs.existsSync(env.runningInstanceHandle)) {
            try {
                return fs.unlinkSync(env.runningInstanceHandle);
            }
            catch (e) {
                if (e.code !== 'ENOENT') {
                    env.log('Fatal error deleting running instance handle', e);
                    throw e;
                }
            }
        }
    };
    return Ticino;
})();
function getUpdateFeedUrl() {
    if (!env.updateInfo || !env.updateInfo.baseUrl) {
        return null;
    }
    var baseUrl = env.updateInfo.baseUrl;
    var commit = env.commit;
    var channel = storage.getItem('updateChannel');
    if (!channel) {
        channel = 'stable';
        storage.setItem('updateChannel', channel);
    }
    if (process.platform !== 'win32') {
        return "" + baseUrl + "/api/update/" + env.getPlatformIdentifier() + "/" + channel + "/" + commit;
    }
    // We get the name of the parent dir of Ticino.exe. The name of this dir
    // contains the NuGet version which we use for the updates. It is not the
    // actual Ticino version, but a mere version to make Squirrel.Windows work.
    var parentDirName = path.basename(path.dirname(process.execPath));
    var match = /-(\d+\.\d+\.\d+)$/.exec(parentDirName);
    if (!match) {
        return null;
    }
    var nugetVersion = match[1];
    return "" + baseUrl + "/api/update/win32/" + channel + "/" + commit + "/" + nugetVersion;
}
function main() {
    global.programStart = env.cliArgs.programStart;
    // Handle crashes
    reporter.start({
        productName: 'Ticino',
        companyName: 'Microsoft',
        submitUrl: 'https://ticinocrashreporter.azurewebsites.net/crash',
        autoSubmit: true
    });
    // Setup update
    var updateFeedUrl = getUpdateFeedUrl();
    if (updateFeedUrl) {
        UpdateManager.initialize(updateFeedUrl);
        // Check for updates on startup after 30 seconds
        var timer = setTimeout(function () { return UpdateManager.checkForUpdates(); }, 30 * 1000);
        // Clear timer when checking for update
        UpdateManager.on('error', function (error, message) { return console.error(error, message); });
        // Clear timer when checking for update
        UpdateManager.on('checking-for-update', function () { return clearTimeout(timer); });
        // If update not found, try again in 10 minutes
        UpdateManager.on('update-not-available', function () {
            timer = setTimeout(function () { return UpdateManager.checkForUpdates(); }, 10 * 60 * 1000);
        });
    }
    env.log('### Ticino main.js ###');
    env.log(env.appRoot, env.cliArgs);
    // Ready for creating browser windows
    onAppReady(function () {
        // On Mac/Unix we can rely on the server handle to be deleted if the instance is not running
        if (!env.isWindows && !fs.existsSync(env.runningInstanceHandle)) {
            env.log('Mac/Linux: starting ticino because handle does not exist');
            Ticino.startup();
        }
        else {
            var con = net.connect({
                path: env.runningInstanceHandle
            }, function () {
                // Another instance is running, we talk to it and ask it to open a window
                con.write(JSON.stringify(env.cliArgs), function () {
                    env.log('Sending env to running instance and terminating');
                    con.end();
                    setTimeout(function () { return app.terminate(); }, 0); // terminate later to prevent bad things from happen
                });
            });
            con.on('error', function (error) {
                env.log('Starting ticino because connection failed', error);
                Ticino.startup();
            });
        }
    });
}
// On Darwin, the PATH environment will not be correctly set when double clicking
// the application. Need to fix it up before anything starts up.
function fixUnixEnvironment(cb) {
    var didReturn = false;
    var done = function () {
        if (didReturn) {
            return;
        }
        didReturn = true;
        cb();
    };
    var child = cp.spawn(process.env.SHELL, ['-ilc', 'env'], {
        detached: true,
        stdio: ['ignore', 'pipe', process.stderr],
    });
    child.stdout.setEncoding('utf8');
    child.on('error', done);
    var buffer = '';
    child.stdout.on('data', function (d) {
        buffer += d;
    });
    child.on('close', function (code, signal) {
        if (code !== 0) {
            return done();
        }
        var hash = Object.create(null);
        buffer.split('\n').forEach(function (line) {
            var p = line.split('=', 2);
            var key = p[0];
            var value = p[1];
            if (!key || hash[key]) {
                return;
            }
            hash[key] = true;
            process.env[key] = value;
        });
        done();
    });
}
if (env.isMac || env.isLinux) {
    fixUnixEnvironment(main);
}
else if (env.isWindows && squirrelwin32.handleArgv()) {
}
else {
    main();
}
