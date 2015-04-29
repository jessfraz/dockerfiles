/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
'use strict';
define(["require", "exports", 'child_process', '../../lib/system', '../../lib/extfs', '../../lib/mime', '../../lib/utils', '../../lib/uuid', '../../lib/strings'], function (require, exports, cp, winjs, extfs, mime, utils, uuid, strings) {
    (function (RawServiceState) {
        RawServiceState[RawServiceState["OK"] = 0] = "OK";
        RawServiceState[RawServiceState["GitNotFound"] = 1] = "GitNotFound";
    })(exports.RawServiceState || (exports.RawServiceState = {}));
    var RawServiceState = exports.RawServiceState;
    exports.ConfigScope = {
        Local: 'local',
        Global: 'global'
    };
    exports.GitErrorCodes = {
        BadConfigFile: 'BadConfigFile',
        CantCreatePipe: 'CantCreatePipe',
        CantAccessRemote: 'CantAccessRemote',
        AuthenticationFailed: 'AuthenticationFailed',
        NoUserNameConfigured: 'NoUserNameConfigured',
        NoUserEmailConfigured: 'NoUserEmailConfigured',
        NoRemoteRepositorySpecified: 'NoRemoteRepositorySpecified',
        NotAGitRepository: 'NotAGitRepository',
        NotAtRepositoryRoot: 'NotAtRepositoryRoot',
        Conflict: 'Conflict',
        UnmergedChanges: 'UnmergedChanges',
        PushRejected: 'PushRejected',
        RemoteConnectionError: 'RemoteConnectionError',
        DirtyWorkTree: 'DirtyWorkTree',
        RepositoryNotFound: 'RepositoryNotFound'
    };
    var GitError = (function () {
        function GitError(data) {
            if (data.error) {
                this.error = data.error;
                this.message = data.error.message;
            }
            else {
                this.error = null;
            }
            this.message = this.message || data.message || 'Git error';
            this.stdout = data.stdout || null;
            this.stderr = data.stderr || null;
            this.exitCode = data.exitCode || null;
            this.gitErrorCode = data.gitErrorCode || null;
            this.gitCommand = data.gitCommand || null;
        }
        GitError.prototype.toString = function () {
            var result = this.message + ' ' + JSON.stringify({
                exitCode: this.exitCode,
                gitErrorCode: this.gitErrorCode,
                gitCommand: this.gitCommand,
                stdout: this.stdout,
                stderr: this.stderr
            }, null, 2);
            if (this.error) {
                result += this.error.stack;
            }
            return result;
        };
        return GitError;
    })();
    exports.GitError = GitError;
    var Git = (function () {
        function Git(options) {
            this.gitPath = options.gitPath;
            this.tmpPath = options.tmpPath;
            this.env = options.env || {};
            this.outputListeners = [];
        }
        Git.prototype.run = function (cwd, args, options) {
            if (options === void 0) { options = {}; }
            options = utils.mixin({ cwd: cwd }, options || {});
            return this.exec(args, options);
        };
        Git.prototype.stream = function (cwd, args, options) {
            if (options === void 0) { options = {}; }
            options = utils.mixin({ cwd: cwd }, options || {});
            return this.spawn(args, options);
        };
        Git.prototype.open = function (repository, env) {
            if (env === void 0) { env = {}; }
            return new Repository(this, repository, env);
        };
        Git.prototype.clone = function (repository, repoURL) {
            var _this = this;
            return this.exec(['clone', repoURL, repository]).then(function () { return true; }, function (err) {
                return new winjs.TPromise(function (c, e) {
                    // If there's any error, git will still leave the folder in the FS,
                    // so we need to remove it.
                    extfs.del(repository, _this.tmpPath, function (err) {
                        if (err) {
                            return e(err);
                        }
                        c(true);
                    });
                });
            });
        };
        Git.prototype.config = function (name, value) {
            return this.exec(['config', '--global', name, value]);
        };
        Git.prototype.exec = function (args, options) {
            var _this = this;
            if (options === void 0) { options = {}; }
            var child = this.spawn(args, options);
            if (options.input) {
                child.stdin.end(options.input, 'utf8');
            }
            return winjs.TPromise.join([
                new winjs.TPromise(function (c, e) {
                    child.on('error', e);
                    child.on('exit', c);
                }),
                new winjs.TPromise(function (c) {
                    var buffer = '';
                    child.stdout.setEncoding('utf8');
                    child.stdout.on('data', function (data) { return buffer += data; });
                    child.stdout.on('close', function () { return c(buffer); });
                }),
                new winjs.TPromise(function (c) {
                    var buffer = '';
                    child.stderr.setEncoding('utf8');
                    child.stderr.on('data', function (data) { return buffer += data; });
                    child.stderr.on('close', function () { return c(buffer); });
                })
            ]).then(function (values) {
                var exitCode = values[0];
                var stdout = values[1];
                var stderr = values[2];
                if (exitCode) {
                    var gitErrorCode = null;
                    if (/Authentication failed/.test(stderr)) {
                        gitErrorCode = exports.GitErrorCodes.AuthenticationFailed;
                    }
                    else if (/bad config file/.test(stderr)) {
                        gitErrorCode = exports.GitErrorCodes.BadConfigFile;
                    }
                    else if (/cannot make pipe for command substitution|cannot create standard input pipe/.test(stderr)) {
                        gitErrorCode = exports.GitErrorCodes.CantCreatePipe;
                    }
                    else if (/Repository not found/.test(stderr)) {
                        gitErrorCode = exports.GitErrorCodes.RepositoryNotFound;
                    }
                    else if (/unable to access/.test(stderr)) {
                        gitErrorCode = exports.GitErrorCodes.CantAccessRemote;
                    }
                    if (options.log !== false) {
                        _this.log(stderr);
                    }
                    return winjs.TPromise.wrapError(new GitError({
                        message: 'Failed to execute git',
                        stdout: stdout,
                        stderr: stderr,
                        exitCode: exitCode,
                        gitErrorCode: gitErrorCode,
                        gitCommand: args[0]
                    }));
                }
                return winjs.TPromise.as({
                    code: values[0],
                    stdout: values[1],
                    stderr: values[2]
                });
            });
        };
        Git.prototype.spawn = function (args, options) {
            if (options === void 0) { options = {}; }
            if (!this.gitPath) {
                throw new Error('git could not be found in the system.');
            }
            if (!options) {
                options = {};
            }
            if (!options.stdio && !options.input) {
                options.stdio = ['ignore', null, null]; // Unless provided, ignore stdin and leave default streams for stdout and stderr
            }
            options.env = utils.mixin({}, options.env || {});
            options.env = utils.mixin(options.env, this.env);
            options.env = utils.mixin(options.env, {
                MONACO_REQUEST_GUID: uuid.v4().asHex(),
                MONACO_GIT_COMMAND: args[0]
            });
            if (options.log !== false) {
                this.log(strings.format('git {0}\n', args.join(' ')));
            }
            return cp.spawn(this.gitPath, args, options);
        };
        Git.prototype.onOutput = function (listener) {
            var _this = this;
            this.outputListeners.push(listener);
            return function () { return _this.outputListeners.splice(_this.outputListeners.indexOf(listener), 1); };
        };
        Git.prototype.log = function (output) {
            this.outputListeners.forEach(function (l) { return l(output); });
        };
        return Git;
    })();
    exports.Git = Git;
    var Repository = (function () {
        function Repository(git, repository, env) {
            if (env === void 0) { env = {}; }
            this.git = git;
            this.repository = repository;
            this.env = env;
        }
        Object.defineProperty(Repository.prototype, "path", {
            get: function () {
                return this.repository;
            },
            enumerable: true,
            configurable: true
        });
        Repository.prototype.run = function (args, options) {
            if (options === void 0) { options = {}; }
            options.env = utils.mixin({}, options.env || {});
            options.env = utils.mixin(options.env, this.env);
            return this.git.run(this.repository, args, options);
        };
        Repository.prototype.stream = function (args, options) {
            if (options === void 0) { options = {}; }
            options.env = utils.mixin({}, options.env || {});
            options.env = utils.mixin(options.env, this.env);
            return this.git.stream(this.repository, args, options);
        };
        Repository.prototype.spawn = function (args, options) {
            if (options === void 0) { options = {}; }
            options.env = utils.mixin({}, options.env || {});
            options.env = utils.mixin(options.env, this.env);
            return this.git.spawn(args, options);
        };
        Repository.prototype.init = function () {
            return this.run(['init']);
        };
        Repository.prototype.config = function (scope, key, value, options) {
            var args = ['config'];
            if (scope) {
                args.push('--' + scope);
            }
            args.push(key);
            if (value) {
                args.push(value);
            }
            return this.run(args, options).then(function (result) { return result.stdout; });
        };
        Repository.prototype.show = function (object) {
            return this.stream(['show', object]);
        };
        Repository.prototype.buffer = function (object) {
            var child = this.show(object);
            return winjs.TPromise.join([
                new winjs.TPromise(function (c, e) {
                    child.on('error', e);
                    child.on('exit', c);
                }),
                new winjs.TPromise(function (c) {
                    var buffer = '';
                    child.stdout.setEncoding('utf8');
                    child.stdout.on('data', function (data) { return buffer += data; });
                    child.stdout.on('close', function () { return c(buffer); });
                }),
                new winjs.Promise(function (c) {
                    child.stderr.on('data', function (data) {
                    });
                    child.stderr.on('close', function () { return c(null); });
                })
            ]).then(function (values) {
                var exitCode = values[0];
                var result = values[1];
                if (exitCode) {
                    return winjs.TPromise.wrapError(new GitError({
                        message: "Could not buffer object.",
                        exitCode: exitCode
                    }));
                }
                return winjs.TPromise.as(result);
            });
        };
        Repository.prototype.add = function (paths) {
            var args = ['add', '-A', '--'];
            if (paths && paths.length) {
                args.push.apply(args, paths);
            }
            else {
                args.push('.');
            }
            return this.run(args);
        };
        Repository.prototype.stage = function (path, data) {
            var _this = this;
            var child = this.stream(['hash-object', '--stdin', '-w'], { stdio: [null, null, null] });
            child.stdin.end(data, 'utf8');
            return winjs.TPromise.join([
                new winjs.TPromise(function (c, e) {
                    child.on('error', e);
                    child.on('exit', c);
                }),
                new winjs.TPromise(function (c) {
                    var id = '';
                    child.stdout.setEncoding('utf8');
                    child.stdout.on('data', function (data) { return id += data; });
                    child.stdout.on('close', function () { return c(id); });
                }),
                new winjs.Promise(function (c) {
                    child.stderr.on('data', function (data) {
                    });
                    child.stderr.on('close', function () { return c(null); });
                })
            ]).then(function (values) {
                var exitCode = values[0];
                var id = values[1];
                if (exitCode) {
                    return winjs.TPromise.wrapError(new GitError({
                        message: "Could not hash object.",
                        exitCode: exitCode
                    }));
                }
                return _this.run(['update-index', '--cacheinfo', '100644', id, path]);
            });
        };
        Repository.prototype.checkout = function (treeish, paths) {
            var args = ['checkout', '-q'];
            if (treeish) {
                args.push(treeish);
            }
            if (paths && paths.length) {
                args.push('--');
                args.push.apply(args, paths);
            }
            return this.run(args).then(null, function (err) {
                if (/Please, commit your changes or stash them/.test(err.stderr)) {
                    err.gitErrorCode = exports.GitErrorCodes.DirtyWorkTree;
                }
                return winjs.Promise.wrapError(err);
            });
        };
        Repository.prototype.commit = function (message, all, amend) {
            var _this = this;
            var args = ['commit', '--quiet', '--allow-empty-message', '--file', '-'];
            if (all) {
                args.push('--all');
            }
            if (amend) {
                args.push('--amend');
            }
            return this.run(args, { input: message || '' }).then(null, function (commitErr) {
                if (/not possible because you have unmerged files/.test(commitErr.stderr)) {
                    commitErr.gitErrorCode = exports.GitErrorCodes.UnmergedChanges;
                    return winjs.Promise.wrapError(commitErr);
                }
                return _this.run(['config', '--get-all', 'user.name']).then(null, function (err) {
                    err.gitErrorCode = exports.GitErrorCodes.NoUserNameConfigured;
                    return winjs.Promise.wrapError(err);
                }).then(function () {
                    return _this.run(['config', '--get-all', 'user.email']).then(null, function (err) {
                        err.gitErrorCode = exports.GitErrorCodes.NoUserEmailConfigured;
                        return winjs.Promise.wrapError(err);
                    }).then(function () {
                        return winjs.Promise.wrapError(commitErr);
                    });
                });
            });
        };
        Repository.prototype.branch = function (name, checkout) {
            var args = checkout ? ['checkout', '-q', '-b', name] : ['branch', '-q', name];
            return this.run(args);
        };
        Repository.prototype.clean = function (paths) {
            var args = ['clean', '-f', '-q', '--'].concat(paths);
            return this.run(args);
        };
        Repository.prototype.undo = function () {
            var _this = this;
            return this.run(['clean', '-fd']).then(function () {
                return _this.run(['checkout', '--', '.']).then(null, function (err) {
                    if (/did not match any file\(s\) known to git\./.test(err.stderr)) {
                        return winjs.Promise.as(null);
                    }
                    return winjs.Promise.wrapError(err);
                });
            });
        };
        Repository.prototype.reset = function (treeish, paths) {
            var _this = this;
            return this.run(['branch']).then(function (result) {
                var args;
                // In case there are no branches, we must use rm --cached
                if (!result.stdout) {
                    args = ['rm', '--cached', '-r', '--'];
                }
                else {
                    args = ['reset', '-q', treeish, '--'];
                }
                if (paths && paths.length) {
                    args.push.apply(args, paths);
                }
                else {
                    args.push('.');
                }
                return _this.run(args).then(null, function (err) {
                    // In case there are merge conflicts to be resolved, git reset will output
                    // some "needs merge" data. We try to get around that. 
                    if (/([^:]+: needs merge\n)+/m.test(err.stdout)) {
                        return winjs.Promise.as(null);
                    }
                    return winjs.Promise.wrapError(err);
                });
            });
        };
        Repository.prototype.fetch = function () {
            return this.run(['fetch'], { log: false }).then(null, function (err) {
                if (/No remote repository specified\./.test(err.stderr)) {
                    err.gitErrorCode = exports.GitErrorCodes.NoRemoteRepositorySpecified;
                }
                else if (/Not a git repository/.test(err.stderr)) {
                    err.gitErrorCode = exports.GitErrorCodes.NotAGitRepository;
                }
                else if (/Could not read from remote repository/.test(err.stderr)) {
                    err.gitErrorCode = exports.GitErrorCodes.RemoteConnectionError;
                }
                return winjs.Promise.wrapError(err);
            });
        };
        Repository.prototype.pull = function () {
            return this.run(['pull']).then(null, function (err) {
                if (/^CONFLICT \([^)]+\): \b/m.test(err.stdout)) {
                    err.gitErrorCode = exports.GitErrorCodes.Conflict;
                }
                else if (/Please tell me who you are\./.test(err.stderr)) {
                    err.gitErrorCode = exports.GitErrorCodes.NoUserNameConfigured;
                }
                else if (/Could not read from remote repository/.test(err.stderr)) {
                    err.gitErrorCode = exports.GitErrorCodes.RemoteConnectionError;
                }
                else if (/Pull is not possible because you have unmerged files|Cannot pull with rebase: You have unstaged changes|Your local changes to the following files would be overwritten|Please, commit your changes before you can merge/.test(err.stderr)) {
                    err.gitErrorCode = exports.GitErrorCodes.DirtyWorkTree;
                }
                return winjs.Promise.wrapError(err);
            });
        };
        Repository.prototype.push = function () {
            return this.run(['push']).then(null, function (err) {
                if (/^error: failed to push some refs to\b/m.test(err.stderr)) {
                    err.gitErrorCode = exports.GitErrorCodes.PushRejected;
                }
                else if (/Could not read from remote repository/.test(err.stderr)) {
                    err.gitErrorCode = exports.GitErrorCodes.RemoteConnectionError;
                }
                return winjs.Promise.wrapError(err);
            });
        };
        Repository.prototype.sync = function () {
            var _this = this;
            return this.pull().then(function () { return _this.push(); });
        };
        Repository.prototype.getRoot = function () {
            return this.run(['rev-parse', '--show-toplevel'], { log: false }).then(function (result) { return result.stdout.trim(); });
        };
        Repository.prototype.getStatus = function () {
            return this.run(['status', '-z', '-u'], { log: false }).then(function (executionResult) {
                var status = executionResult.stdout;
                var result = [];
                var current;
                var i = 0;
                function readName() {
                    var start = i, c;
                    while ((c = status.charAt(i)) !== '\u0000') {
                        i++;
                    }
                    return status.substring(start, i++);
                }
                while (i < status.length) {
                    current = {
                        x: status.charAt(i++),
                        y: status.charAt(i++)
                    };
                    i++;
                    if (current.x === 'R') {
                        current.rename = readName();
                    }
                    current.path = readName();
                    current.mimetype = mime.guessMimeTypes(current.path)[0];
                    // If path ends with slash, it must be a nested git repo
                    if (current.path[current.path.length - 1] === '/') {
                        continue;
                    }
                    result.push(current);
                }
                return winjs.TPromise.as(result);
            });
        };
        Repository.prototype.getHEAD = function () {
            var _this = this;
            return this.run(['symbolic-ref', '--short', 'HEAD'], { log: false }).then(function (result) {
                if (!result.stdout) {
                    return winjs.TPromise.wrapError(new Error('Not in a branch'));
                }
                return winjs.TPromise.as({ name: result.stdout.trim() });
            }, function (err) {
                return _this.run(['rev-parse', 'HEAD'], { log: false }).then(function (result) {
                    if (!result.stdout) {
                        return winjs.TPromise.wrapError(new Error('Error parsing HEAD'));
                    }
                    return winjs.TPromise.as({ commit: result.stdout.trim() });
                });
            });
        };
        Repository.prototype.getHeads = function () {
            return this.run(['for-each-ref', '--format', '%(refname:short) %(objectname)', 'refs/heads/'], { log: false }).then(function (result) {
                return result.stdout.trim().split('\n').filter(function (b) { return !!b; }).map(function (b) { return b.trim().split(' '); }).map(function (a) { return ({ name: a[0], commit: a[1] }); });
            });
        };
        Repository.prototype.getTags = function () {
            return this.run(['for-each-ref', '--format', '%(refname:short) %(objectname)', 'refs/tags/'], { log: false }).then(function (result) {
                return result.stdout.trim().split('\n').filter(function (b) { return !!b; }).map(function (b) { return b.trim().split(' '); }).map(function (a) { return ({ name: a[0], commit: a[1] }); });
            });
        };
        Repository.prototype.getBranch = function (branch) {
            var _this = this;
            if (branch === 'HEAD') {
                return this.getHEAD();
            }
            return this.run(['rev-parse', branch], { log: false }).then(function (result) {
                if (!result.stdout) {
                    return winjs.TPromise.wrapError(new Error('No such branch'));
                }
                var commit = result.stdout.trim();
                return _this.run(['rev-parse', '--symbolic-full-name', '--abbrev-ref', branch + '@{u}'], { log: false }).then(function (result) {
                    var upstream = result.stdout.trim();
                    return _this.run(['rev-list', '--left-right', branch + '...' + upstream], { log: false }).then(function (result) {
                        var ahead = 0, behind = 0;
                        var i = 0;
                        while (i < result.stdout.length) {
                            switch (result.stdout.charAt(i)) {
                                case '<':
                                    ahead++;
                                    break;
                                case '>':
                                    behind++;
                                    break;
                                default:
                                    i++;
                                    break;
                            }
                            while (result.stdout.charAt(i++) !== '\n') {
                            }
                        }
                        return {
                            name: branch,
                            commit: commit,
                            upstream: upstream,
                            ahead: ahead,
                            behind: behind
                        };
                    });
                }, function () {
                    return { name: branch, commit: commit };
                });
            });
        };
        Repository.prototype.onOutput = function (listener) {
            return this.git.onOutput(listener);
        };
        return Repository;
    })();
    exports.Repository = Repository;
});
