/*!---------------------------------------------------------
* Copyright (C) Microsoft Corporation. All rights reserved.
*--------------------------------------------------------*/
/// <reference path="../declare/atom-browser.d.ts" />
/// <reference path="../declare/node.d.ts" />
/// <reference path="../declare/winreg.d.ts" />
'use strict';
var fs = require('fs');
var path = require('path');
var cp = require('child_process');
var app = require('app');
var winreg = require('winreg');
function asyncMap(array, fn, cb) {
    var loop = function (i) {
        if (i >= array.length) {
            return cb(null);
        }
        fn(array[i], function (err) {
            if (err) {
                return cb(err);
            }
            loop(i + 1);
        });
    };
    loop(0);
}
var Squirrel = (function () {
    function Squirrel(execPath, url) {
        this.url = url;
        this.appPath = path.resolve(execPath, '..');
        this.rootPath = path.resolve(this.appPath, '..');
        this.updateExePath = path.resolve(this.rootPath, 'Update.exe');
        this.exeName = path.basename(execPath);
    }
    Object.defineProperty(Squirrel.prototype, "isAvailable", {
        get: function () {
            return fs.existsSync(this.updateExePath);
        },
        enumerable: true,
        configurable: true
    });
    Squirrel.prototype.download = function (cb) {
        this.spawn(['--download', this.url], function (err, out) {
            if (err) {
                return cb(err);
            }
            try {
                var result = JSON.parse(out.trim().split('\n').pop());
                cb(null, result.releasesToApply.pop());
            }
            catch (err) {
                cb(err);
            }
        });
    };
    Squirrel.prototype.update = function (cb) {
        this.spawn(['--update', this.url], cb);
    };
    Squirrel.prototype.createShortcut = function (cb) {
        this.spawn(['--createShortcut', this.exeName], cb);
    };
    Squirrel.prototype.removeShortcut = function (cb) {
        this.spawn(['--removeShortcut', this.exeName], cb);
    };
    Squirrel.prototype.processStart = function (cb) {
        this.spawn(['--processStart', this.exeName], cb);
    };
    Squirrel.prototype.spawn = function (args, cb) {
        cb = cb || (function () { return null; });
        if (!this.isAvailable) {
            return cb(null, '');
        }
        var child = cp.spawn(this.updateExePath, args, { detached: true });
        var error = null;
        var stdout = '';
        child.stdout.setEncoding('utf8');
        child.stdout.on('data', function (d) { return stdout += d; });
        child.on('error', function (err) { return error = (error || err); });
        child.on('close', function (code) {
            if (code !== 0) {
                error = error || new Error('Command returned ' + code);
            }
            cb(error, stdout);
        });
    };
    return Squirrel;
})();
exports.Squirrel = Squirrel;
var squirrel = new Squirrel(process.execPath, null);
var registryKeys = [
    '\\Software\\Classes\\*\\shell\\Ticino',
    '\\Software\\Classes\\directory\\shell\\Ticino',
    '\\Software\\Classes\\directory\\background\\shell\\Ticino'
];
function installMenuAction(keyName, cb) {
    var key = new winreg({ hive: winreg.HKCU, key: keyName });
    key.set('', winreg.REG_SZ, 'Open with Code', function (err) {
        if (err) {
            return cb(err);
        }
        key.set('Icon', winreg.REG_SZ, process.execPath, function (err) {
            if (err) {
                return cb(err);
            }
            var commandKey = new winreg({ hive: winreg.HKCU, key: keyName + '\\command' });
            commandKey.set('', winreg.REG_SZ, "\"" + process.execPath + "\" \"%1\"", cb);
        });
    });
}
// Nuget packaging excludes .nuspec files. So, at build time
// the .nuspec files are renamed to something else. At install
// time, those files should be renamed back to .nuspec.
function applyRenameJson() {
    var files = null;
    try {
        files = require('./rename.json');
    }
    catch (e) {
        return;
    }
    var root = path.dirname(__dirname);
    files.forEach(function (i) { return fs.renameSync(path.join(root, i.rename), path.join(root, i.original)); });
    fs.unlinkSync(path.join(__dirname, 'rename.json'));
}
var cmdContents = [
    '@echo off',
    '"%~dp0\\..\\Update.exe" --processStart Code.exe -a="%*"'
].join('\r\n');
function addBinDirectoryToPATH(cb) {
    var root = path.resolve(path.join(__dirname, '..', '..', '..', '..'));
    var bin = path.join(root, 'bin');
    var cmd = path.join(bin, 'code.cmd');
    try {
        // create bin directory
        fs.mkdirSync(bin);
    }
    catch (e) {
    }
    try {
        // create bin shortcut
        fs.writeFileSync(cmd, cmdContents);
    }
    catch (e) {
        return cb(e);
    }
    var key = new winreg({ hive: winreg.HKCU, key: '\\Environment' });
    key.get('PATH', function (err, item) {
        var value;
        if (err) {
            value = '';
            console.error(err);
        }
        else {
            value = item.value;
        }
        var paths = value.split(';');
        // do nothing if bin is already in PATH
        if (paths.indexOf(bin) > -1) {
            return cb();
        }
        // add bin directory to PATH
        paths.push(bin);
        key.set('PATH', winreg.REG_SZ, paths.join(';'), cb);
    });
}
function install(cb) {
    applyRenameJson();
    addBinDirectoryToPATH(function (err) {
        if (err) {
            return cb(err);
        }
        squirrel.createShortcut(function (err) {
            if (err) {
                return cb(err);
            }
            asyncMap(registryKeys, installMenuAction, cb);
        });
    });
}
function uninstallMenuAction(keyName, cb) {
    var key = new winreg({ hive: winreg.HKCU, key: keyName });
    key.erase(cb);
}
function removeBinDirectoryFromPATH(cb) {
    var root = path.resolve(path.join(__dirname, '..', '..', '..', '..'));
    var bin = path.join(root, 'bin');
    var key = new winreg({ hive: winreg.HKCU, key: '\\Environment' });
    key.get('PATH', function (err, item) {
        var value;
        if (err) {
            value = '';
            console.error(err);
        }
        else {
            value = item.value;
        }
        var paths = value.split(';');
        var index = paths.indexOf(bin);
        // do nothing if bin is not in PATH
        if (index === -1) {
            return cb();
        }
        // remove bin directory from PATH
        paths.splice(index, 1);
        key.set('PATH', winreg.REG_SZ, paths.join(';'), cb);
    });
}
function uninstall(cb) {
    removeBinDirectoryFromPATH(function (err) {
        if (err) {
            return cb(err);
        }
        squirrel.removeShortcut(function (err) {
            if (err) {
                return cb(err);
            }
            asyncMap(registryKeys, uninstallMenuAction, cb);
        });
    });
}
function handleArgv() {
    var quit = function () { return app.quit(); };
    var commands = process.argv.map(function (a) { return /^--squirrel-(\w+)$/.exec(a); }).filter(function (m) { return !!m; }).map(function (m) { return m[1]; });
    switch (commands[0]) {
        case 'install':
            install(quit);
            return true;
        case 'updated':
            install(quit);
            return true;
        case 'uninstall':
            uninstall(quit);
            return true;
        case 'obsolete':
            quit();
            return true;
    }
    return false;
}
exports.handleArgv = handleArgv;
