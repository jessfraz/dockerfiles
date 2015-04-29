/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
'use strict';
define(["require", "exports", 'path', '../../lib/system', '../../lib/mime', '../../lib/pfs', './git.lib'], function (require, exports, path, winjs, mime, pfs, gitlib) {
    function pathsAreEqual(p1, p2) {
        if (/^(win32|darwin)$/.test(process.platform)) {
            p1 = p1.toLowerCase();
            p2 = p2.toLowerCase();
        }
        return p1 === p2;
    }
    var RawGitService = (function () {
        function RawGitService(repo) {
            this.repo = repo;
            this.repoRealRootPath = null;
        }
        RawGitService.prototype.serviceState = function () {
            return winjs.TPromise.as(this.repo ? gitlib.RawServiceState.OK : gitlib.RawServiceState.GitNotFound);
        };
        RawGitService.prototype.status = function () {
            var _this = this;
            return this.checkRoot().then(function () { return _this.repo.getStatus(); }).then(function (status) { return _this.repo.getHEAD().then(function (HEAD) {
                if (HEAD.name) {
                    return _this.repo.getBranch(HEAD.name).then(null, function () { return HEAD; });
                }
                else {
                    return HEAD;
                }
            }, function () { return null; }).then(function (HEAD) { return winjs.Promise.join([_this.repo.getHeads(), _this.repo.getTags()]).then(function (r) {
                return {
                    status: status,
                    HEAD: HEAD,
                    heads: r[0],
                    tags: r[1]
                };
            }); }); }).then(null, function (err) {
                if (err.gitErrorCode === gitlib.GitErrorCodes.BadConfigFile) {
                    return winjs.Promise.wrapError(err);
                }
                else if (err.gitErrorCode === gitlib.GitErrorCodes.NotAtRepositoryRoot) {
                    return winjs.Promise.wrapError(err);
                }
                return null;
            });
        };
        RawGitService.prototype.init = function () {
            var _this = this;
            return this.repo.init().then(function () { return _this.status(); });
        };
        RawGitService.prototype.add = function (filePaths) {
            var _this = this;
            return this.repo.add(filePaths).then(function () { return _this.status(); });
        };
        RawGitService.prototype.stage = function (filePath, content) {
            var _this = this;
            return this.repo.stage(filePath, content).then(function () { return _this.status(); });
        };
        RawGitService.prototype.branch = function (name, checkout) {
            var _this = this;
            return this.repo.branch(name, checkout).then(function () { return _this.status(); });
        };
        RawGitService.prototype.checkout = function (treeish, filePaths) {
            var _this = this;
            return this.repo.checkout(treeish, filePaths).then(function () { return _this.status(); });
        };
        RawGitService.prototype.clean = function (filePaths) {
            var _this = this;
            return this.repo.clean(filePaths).then(function () { return _this.status(); });
        };
        RawGitService.prototype.undo = function () {
            var _this = this;
            return this.repo.undo().then(function () { return _this.status(); });
        };
        RawGitService.prototype.reset = function (treeish, filePaths) {
            var _this = this;
            return this.repo.reset(treeish, filePaths).then(function () { return _this.status(); });
        };
        RawGitService.prototype.fetch = function () {
            var _this = this;
            return this.repo.fetch().then(null, function (err) {
                if (err.gitErrorCode === gitlib.GitErrorCodes.NoRemoteRepositorySpecified) {
                    return winjs.Promise.as(null);
                }
                return winjs.Promise.wrapError(err);
            }).then(function () { return _this.status(); });
        };
        RawGitService.prototype.pull = function () {
            var _this = this;
            return this.repo.pull().then(function () { return _this.status(); });
        };
        RawGitService.prototype.push = function () {
            var _this = this;
            return this.repo.push().then(function () { return _this.status(); });
        };
        RawGitService.prototype.sync = function () {
            var _this = this;
            return this.repo.sync().then(function () { return _this.status(); });
        };
        RawGitService.prototype.commit = function (message, amend, stage) {
            var _this = this;
            var promise = winjs.Promise.as(null);
            if (stage) {
                promise = this.repo.add(null);
            }
            return promise.then(function () { return _this.repo.commit(message, stage, amend); }).then(function () { return _this.status(); });
        };
        RawGitService.prototype.detectMimetypes = function (filePath, treeish) {
            var _this = this;
            return pfs.exists(path.join(this.repo.path, filePath)).then(function (exists) {
                if (exists) {
                    return new winjs.TPromise(function (c, e) {
                        mime.detectMimesFromFile(path.join(_this.repo.path, filePath), function (err, result) {
                            if (err) {
                                e(err);
                            }
                            else {
                                c(result.mimes);
                            }
                        });
                    });
                }
                var child = _this.repo.show(treeish + ':' + filePath);
                return new winjs.TPromise(function (c, e) {
                    mime.detectMimesFromStream(child.stdout, filePath, function (err, result) {
                        if (err) {
                            e(err);
                        }
                        else {
                            c(result.mimes);
                        }
                    });
                });
            });
        };
        // careful, this buffers the whole object into memory 
        RawGitService.prototype.show = function (filePath, treeish) {
            treeish = treeish === '~' ? '' : treeish;
            return this.repo.buffer(treeish + ':' + filePath).then(null, function () { return ''; });
        };
        RawGitService.prototype.onOutput = function () {
            var _this = this;
            var cancel;
            return new winjs.Promise(function (c, e, p) {
                cancel = _this.repo.onOutput(p);
            }, function () { return cancel(); });
        };
        RawGitService.prototype.checkRoot = function () {
            var _this = this;
            if (!this.repoRealRootPath) {
                this.repoRealRootPath = pfs.realpath(this.repo.path);
            }
            return this.repo.getRoot().then(function (root) {
                return winjs.Promise.join([
                    _this.repoRealRootPath,
                    pfs.realpath(root)
                ]).then(function (paths) {
                    if (!pathsAreEqual(paths[0], paths[1])) {
                        return winjs.Promise.wrapError(new gitlib.GitError({
                            message: "Not at the repository root",
                            gitErrorCode: gitlib.GitErrorCodes.NotAtRepositoryRoot
                        }));
                    }
                });
            });
        };
        return RawGitService;
    })();
    exports.RawGitService = RawGitService;
});
