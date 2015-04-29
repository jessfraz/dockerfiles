/*!---------------------------------------------------------
* Copyright (C) Microsoft Corporation. All rights reserved.
*--------------------------------------------------------*/
/// <reference path="./declare/node.d.ts" />
/// <reference path="./declare/atom-browser.d.ts" />
'use strict';
var fs = require('fs');
var os = require('os');
var path = require('path');
var childProcess = require('child_process');
var app = require('app');
var spawn = childProcess.spawn;
var binding = process.binding('atom_common_crash_reporter');
/**
 * A batch of the javascript module of the crash-reporter, bind to atom_common_crash_reporter directly to prevent throwing a caught exception on start
 * bug #14403
 * https://github.com/atom/atom-shell/blob/c6fabf8613530fe0996f699d0b56d3f4200e6860/atom/common/lib/init.coffee
 */
var CrashReporter = (function () {
    function CrashReporter() {
    }
    CrashReporter.prototype.start = function (options) {
        if (!options) {
            options = {};
        }
        this.productName = options.productName || 'Ticino';
        var companyName = options.companyName || 'Microsoft';
        var submitUrl = options.submitUrl || 'https://ticinocrashreporter.azurewebsites.net/crash';
        var autoSubmit = options.autoSubmit ? options.autoSubmit : true;
        var ignoreSystemCrashHandler = options.ignoreSystemCrashHandler ? options.ignoreSystemCrashHandler : false;
        var extra = options.extra || {};
        extra._productName = extra._productName ? extra._productName : this.productName;
        extra._companyName = extra._companyName ? extra._companyName : companyName;
        if (!extra._version) {
            extra._version = process.type === 'browser' ? require('app').getVersion() : require('remote').require('app').getVersion();
        }
        if (process.platform === 'win32') {
            var args = ['--reporter-url=' + submitUrl, '--application-name=' + this.productName, '--v=1'];
            var env = {
                ATOM_SHELL_INTERNAL_CRASH_SERVICE: 1
            };
            var child = spawn(process.execPath, args, {
                env: env,
                detached: true
            });
            app.once('will-quit', function () { return child.kill(); });
        }
        return binding.start(this.productName, companyName, submitUrl, autoSubmit, ignoreSystemCrashHandler, extra);
    };
    CrashReporter.prototype.getLastCrashReport = function () {
        var e, id, log, reports, time, tmpdir, _ref;
        tmpdir = process.platform === 'win32' ? os.tmpdir() : '/tmp';
        log = path.join(tmpdir, '' + this.productName + ' Crashes', 'uploads.log');
        try {
            reports = String(fs.readFileSync(log)).split('\n');
            if (!(reports.length > 1)) {
                return null;
            }
            _ref = reports[reports.length - 2].split(','), time = _ref[0], id = _ref[1];
            return {
                date: new Date(parseInt(time) * 1000),
                id: id
            };
        }
        catch (_error) {
            e = _error;
            return null;
        }
    };
    return CrashReporter;
})();
var crashReporter = new CrashReporter();
module.exports = crashReporter;
