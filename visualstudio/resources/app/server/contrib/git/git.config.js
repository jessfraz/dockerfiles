/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
/// <reference path="../../declare/node.d.ts" />
'use strict';
define(["require", "exports", 'path', 'fs', 'child_process', './git.lib', '../../lib/utils', '../../lib/system'], function (require, exports, path, fs, cp, git, utils, winjs) {
    var SITE_EXTENSION_ENV_USERNAME = 'SITE_EXTENSION_ENV_userName';
    var placeholder = '# Do not change. Used by git contribution config phase.\r\n#[user]\r\n#\tname = NAME\r\n#\temail = EMAIL';
    function configure(server, next) {
        // First configure the git command
        configureGitPath(server, function (error) {
            if (error) {
                return next(error);
            }
            // Auto configure user.name and user.email from environment if present and not yet configured
            var user = process.env[SITE_EXTENSION_ENV_USERNAME];
            if (!user) {
                return next();
            }
            var globalGitConfigPath = path.join(server.options.home, '.gitconfig');
            var globalGitConfig = fs.readFileSync(globalGitConfigPath, 'utf8');
            globalGitConfig = globalGitConfig.replace(placeholder, '[user]\r\n\tname = ' + user + '\r\n\temail = ' + user);
            fs.writeFileSync(globalGitConfigPath, globalGitConfig, 'utf8');
            return next();
        });
    }
    exports.configure = configure;
    function configureGitPath(server, next) {
        var env = utils.mixin({}, process.env);
        env = utils.mixin(env, {
            HOME: server.options.home,
            NODE: process.execPath,
            MONACO_SERVER_HOOK: server.options.ipcEventBusHook,
            MONACO_SERVER_ROOT: server.options.wwwRoot,
            GIT_CEILING_DIRECTORIES: server.options.workspacesRoot
        });
        if (server.options.overrideGitAskpass) {
            env['GIT_ASKPASS'] = server.tools.empty;
        }
        // Return early if already defined
        if (server.options.gitPath) {
            server.tools.git = new git.Git({
                gitPath: server.options.gitPath,
                tmpPath: server.options.monacodataTempPath,
                env: env
            });
            return next();
        }
        // Check if git is available
        var gitPath = utils.isWindows() ? 'git.exe' : 'git';
        cp.exec(gitPath + ' --version', function (err, stdout, stderr) {
            if (err) {
                return next(err);
            }
            server.tools.git = new git.Git({
                gitPath: gitPath,
                tmpPath: server.options.monacodataTempPath,
                env: env
            });
            return next();
        });
    }
    function findSpecificGit(gitPath) {
        return new winjs.Promise(function (c, e) {
            var child = cp.spawn(gitPath, ['--version']);
            child.on('error', e);
            child.on('exit', function (code) { return code ? e(new Error('Not found')) : c(gitPath); });
        });
    }
    exports.findSpecificGit = findSpecificGit;
    function findGitDarwin() {
        return new winjs.Promise(function (c, e) {
            cp.exec('which git', function (err, gitPath) {
                if (err) {
                    return e('git not found');
                }
                gitPath = gitPath.replace(/^\s+|\s+$/g, '');
                if (gitPath !== '/usr/bin/git') {
                    return c(gitPath);
                }
                // must check if XCode is installed
                cp.exec('xcode-select -p', function (err) {
                    if (err && err.code === 2) {
                        // git is not installed, and launching /usr/bin/git
                        // will prompt the user to install it
                        return e('git not found');
                    }
                    return c(gitPath);
                });
            });
        });
    }
    exports.findGitDarwin = findGitDarwin;
    function findGitWin32() {
        return findSpecificGit('git').then(null, function () { return findSpecificGit(path.join(process.env['ProgramFiles(x86)'], 'Git', 'cmd', 'git.exe')); }).then(null, function () { return findSpecificGit(path.join(process.env['ProgramFiles'], 'Git', 'cmd', 'git.exe')); });
    }
    exports.findGitWin32 = findGitWin32;
    function findGit() {
        switch (process.platform) {
            case 'darwin': return findGitDarwin();
            case 'win32': return findGitWin32();
            default: return findSpecificGit('git');
        }
    }
    exports.findGit = findGit;
});
