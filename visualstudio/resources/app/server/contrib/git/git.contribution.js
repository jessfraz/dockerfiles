/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
/// <reference path="../../declare/express.d.ts" />
/// <reference path="../../declare/node.d.ts" />
'use strict';
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", 'fs', 'path', '../contributions', '../../platform', '../../lib/mime', '../../lib/store', '../../lib/system', '../../lib/errors', '../../lib/async', '../../lib/uuid', '../../lib/route', './git.config', './git.lib', './rawGitService', '../../model/workspace', '../../controller/workspace', '../../lib/env'], function (require, exports, fs, path, contrib, platform, mime, store, winjs, errors, async, uuid, route, config, gitlib, raw, workspace, workspaceRoute, env) {
    var AbstractGitRoute = (function (_super) {
        __extends(AbstractGitRoute, _super);
        function AbstractGitRoute(server, type) {
            _super.call(this, server, type);
        }
        AbstractGitRoute.prototype.handleRequest = function (req, res, next) {
            var workspace = workspaceRoute.getWorkspace(req);
            var root = workspace.toAbsolutePath();
            var repo = this.server.tools.git.open(root, {
                MONACO_WORKSPACE: workspace.id
            });
            return this.handleGitRequest(repo, req, res, next);
        };
        AbstractGitRoute.prototype.handleGitRequest = function (repo, req, res, next) {
            return winjs.Promise.wrapError(new Error('to be implemented'));
        };
        /* protected */ AbstractGitRoute.prototype.onError = function (err, req, res, next) {
            if (err.gitErrorCode || err instanceof gitlib.GitError) {
                var gitErrorCode = err.gitErrorCode || '';
                err = errors.asHttpError(400, err);
                err.errorCode = 'git:' + gitErrorCode;
                this.server.logger.warn(err);
                next(err);
            }
            else {
                _super.prototype.onError.call(this, err, req, res, next);
            }
        };
        return AbstractGitRoute;
    })(route.AbstractRoute);
    var AbstractStatusRoute = (function (_super) {
        __extends(AbstractStatusRoute, _super);
        function AbstractStatusRoute(server, type) {
            _super.call(this, server, type);
        }
        AbstractStatusRoute.prototype.handleGitRequest = function (repo, req, res, next) {
            var service = new raw.RawGitService(repo);
            return this.handleStatusRequest(service, req, res, next).then(function (result) {
                if (!result) {
                    res.send(204);
                    return;
                }
                res.set('Content-Type', 'application/json');
                res.send(200, req.xhr ? JSON.stringify(result) : result);
            });
        };
        AbstractStatusRoute.prototype.handleStatusRequest = function (service, req, res, next) {
            throw new Error('implement me');
        };
        return AbstractStatusRoute;
    })(AbstractGitRoute);
    var StatusRoute = (function (_super) {
        __extends(StatusRoute, _super);
        function StatusRoute(server) {
            _super.call(this, server, 'get');
        }
        StatusRoute.prototype.handleStatusRequest = function (service, req, res) {
            return service.status();
        };
        return StatusRoute;
    })(AbstractStatusRoute);
    var InitRoute = (function (_super) {
        __extends(InitRoute, _super);
        function InitRoute(server) {
            _super.call(this, server, 'post');
        }
        InitRoute.prototype.handleStatusRequest = function (service, req, res) {
            return service.init();
        };
        return InitRoute;
    })(AbstractStatusRoute);
    var StageRoute = (function (_super) {
        __extends(StageRoute, _super);
        function StageRoute(server) {
            _super.call(this, server, 'put');
        }
        StageRoute.prototype.handleStatusRequest = function (service, req, res) {
            return new winjs.Promise(function (c, e) {
                var data = '';
                req.setEncoding('utf8');
                req.on('data', function (chunk) { return data += chunk; });
                req.on('end', function () { return c(data); });
            }).then(function (data) { return service.stage(req.params.filePath, data); });
        };
        return StageRoute;
    })(AbstractStatusRoute);
    var AddRoute = (function (_super) {
        __extends(AddRoute, _super);
        function AddRoute(server) {
            _super.call(this, server, 'post');
        }
        AddRoute.prototype.handleStatusRequest = function (service, req, res) {
            var files = (req.body && req.body.paths) || null;
            return service.add(files);
        };
        return AddRoute;
    })(AbstractStatusRoute);
    var CommitRoute = (function (_super) {
        __extends(CommitRoute, _super);
        function CommitRoute(server) {
            _super.call(this, server, 'post');
        }
        CommitRoute.prototype.handleStatusRequest = function (service, req, res) {
            var _this = this;
            var body = req.body;
            var message = body.message || '';
            var amend = body.amend || false;
            var stage = body.stage || false;
            var commit = function () { return service.commit(message, amend, stage); };
            return commit().then(null, function (err) {
                if (/no changes added to commit|nothing added to commit/.test(err.stdout)) {
                    return winjs.Promise.wrapError(errors.asHttpError(400, err, "There are no changes to commit"));
                }
                if (err.gitErrorCode === gitlib.GitErrorCodes.NoUserNameConfigured || err.gitErrorCode === gitlib.GitErrorCodes.NoUserEmailConfigured) {
                    var principalMail = req.header('X-MS-CLIENT-PRINCIPAL-NAME');
                    var principalName = req.header('X-MS-CLIENT-DISPLAY-NAME') || principalMail;
                    if (!principalMail) {
                        return winjs.Promise.wrapError(err);
                    }
                    return _this.server.tools.git.config('user.name', principalName).then(function () {
                        return _this.server.tools.git.config('user.email', principalMail).then(function () {
                            return commit();
                        });
                    });
                }
                return winjs.Promise.wrapError(err);
            });
        };
        return CommitRoute;
    })(AbstractStatusRoute);
    var BranchRoute = (function (_super) {
        __extends(BranchRoute, _super);
        function BranchRoute(server) {
            _super.call(this, server, 'post');
        }
        BranchRoute.prototype.handleStatusRequest = function (service, req, res) {
            if (!req.body) {
                return winjs.Promise.wrapError(errors.httpError(400, "Bad request"));
            }
            var branch = req.body.name;
            var checkout = req.body.checkout || false;
            if (!branch) {
                return winjs.Promise.wrapError(errors.httpError(400, "Bad request"));
            }
            return service.branch(branch, checkout);
        };
        return BranchRoute;
    })(AbstractStatusRoute);
    var CheckoutRoute = (function (_super) {
        __extends(CheckoutRoute, _super);
        function CheckoutRoute(server) {
            _super.call(this, server, 'post');
        }
        CheckoutRoute.prototype.handleStatusRequest = function (service, req, res) {
            var treeish = decodeURIComponent(req.params.treeish || '');
            var paths = null;
            var body = req.body;
            if (!body || !body.paths) {
                if (!treeish) {
                    return winjs.Promise.wrapError(errors.httpError(400, "Invalid git checkout request."));
                }
                paths = null;
            }
            else {
                paths = body.paths;
            }
            return service.checkout(treeish, body.paths);
        };
        return CheckoutRoute;
    })(AbstractStatusRoute);
    var CleanRoute = (function (_super) {
        __extends(CleanRoute, _super);
        function CleanRoute(server) {
            _super.call(this, server, 'post');
        }
        CleanRoute.prototype.handleStatusRequest = function (service, req, res) {
            var body = req.body;
            if (!body || !body.paths) {
                return winjs.Promise.wrapError(errors.httpError(400, "Invalid git clean request."));
            }
            return service.clean(body.paths);
        };
        return CleanRoute;
    })(AbstractStatusRoute);
    var UndoRoute = (function (_super) {
        __extends(UndoRoute, _super);
        function UndoRoute(server) {
            _super.call(this, server, 'post');
        }
        UndoRoute.prototype.handleStatusRequest = function (service, req, res) {
            return service.undo();
        };
        return UndoRoute;
    })(AbstractStatusRoute);
    var ResetRoute = (function (_super) {
        __extends(ResetRoute, _super);
        function ResetRoute(server) {
            _super.call(this, server, 'post');
        }
        ResetRoute.prototype.handleStatusRequest = function (service, req, res) {
            var treeish = req.params.treeish || 'HEAD';
            var body = req.body;
            var paths = null;
            if (body && body.paths) {
                paths = body.paths;
            }
            return service.reset(treeish, paths);
        };
        return ResetRoute;
    })(AbstractStatusRoute);
    var FetchRoute = (function (_super) {
        __extends(FetchRoute, _super);
        function FetchRoute(server) {
            _super.call(this, server, 'post');
        }
        FetchRoute.prototype.handleStatusRequest = function (service, req, res) {
            return service.fetch();
        };
        return FetchRoute;
    })(AbstractStatusRoute);
    var PullRoute = (function (_super) {
        __extends(PullRoute, _super);
        function PullRoute(server) {
            _super.call(this, server, 'post');
        }
        PullRoute.prototype.handleStatusRequest = function (service, req, res) {
            return service.pull();
        };
        return PullRoute;
    })(AbstractStatusRoute);
    var PushRoute = (function (_super) {
        __extends(PushRoute, _super);
        function PushRoute(server) {
            _super.call(this, server, 'post');
        }
        PushRoute.prototype.handleStatusRequest = function (service, req, res) {
            return service.push();
        };
        return PushRoute;
    })(AbstractStatusRoute);
    var SyncRoute = (function (_super) {
        __extends(SyncRoute, _super);
        function SyncRoute(server) {
            _super.call(this, server, 'post');
        }
        SyncRoute.prototype.handleStatusRequest = function (service, req, res) {
            return service.sync();
        };
        return SyncRoute;
    })(AbstractStatusRoute);
    var ShowRoute = (function (_super) {
        __extends(ShowRoute, _super);
        function ShowRoute(server) {
            _super.call(this, server, 'get');
        }
        ShowRoute.prototype.handleGitRequest = function (repo, req, res) {
            var filePath = req.params.filePath;
            var treeish = req.params.treeish || '';
            var service = new raw.RawGitService(repo);
            if (req.get('accept') !== 'application/json') {
                var child = repo.show(treeish + ':' + filePath);
                // Best we can do here is to guess the mime from the file path
                var guessedMimes = mime.guessMimeTypes(filePath);
                res.set('Content-Type', guessedMimes[0]);
                res.set('X-Content-Types', guessedMimes.join(', '));
                res.status(200);
                child.stdout.pipe(res);
                return winjs.Promise.as(null);
            }
            return service.detectMimetypes(filePath, treeish).then(function (mimetypes) {
                res.set('Content-Type', 'application/json');
                res.send(200, { mimetypes: mimetypes });
            }, function (err) {
                return winjs.Promise.wrapError(errors.asHttpError(404, err));
            });
        };
        return ShowRoute;
    })(AbstractGitRoute);
    var GitContribution = (function (_super) {
        __extends(GitContribution, _super);
        function GitContribution() {
            _super.call(this, 'com.microsoft.vs.git');
            this.channels = {};
            this.credentialHandlers = [];
        }
        GitContribution.prototype.injectInterProcessCommunicationService = function (ipcService) {
            var _this = this;
            if (this.ipcService) {
                return;
            }
            this.ipcService = ipcService;
            ipcService.addListener('credentials:request', function (data) { return _this.onCredentialRequest(data); });
        };
        GitContribution.prototype.registerExtensions = function (server) {
            platform.ServiceRegistry.registerService(this);
        };
        GitContribution.prototype.name = function () {
            return 'gitService';
        };
        GitContribution.prototype.configure = function (server) {
            var _this = this;
            var credFolder = path.join(__dirname, 'cred');
            var promises = [];
            if (fs.existsSync(credFolder)) {
                var files = fs.readdirSync(credFolder);
                promises = files.filter(function (f) { return /.cred.js$/.test(f); }).map(function (f) { return env.loadRelativeModule(require, './cred/' + f.replace(/\.js$/, '')); });
            }
            return winjs.Promise.join(promises).then(function (credentialHandlers) {
                _this.credentialHandlers = _this.credentialHandlers.concat(credentialHandlers);
                _this.lastCredentialHandler = new EventChannelCredentialHandler(server, _this.channels);
                return new winjs.Promise(function (c, e, p) {
                    config.configure(server, function (error) {
                        if (error) {
                            e(error);
                        }
                        else {
                            c(true);
                        }
                    });
                });
            });
        };
        GitContribution.prototype.route = function (server) {
            var TREEISH = ':treeish([^\/\\s]+)';
            var PATH = ':filePath(*)';
            var BRANCH = ':branch(*)'; // TODO: branch name regex
            new InitRoute(server).register('/api/git/{0}/init', workspace);
            new StatusRoute(server).register('/api/git/{0}/status', workspace);
            var showRoute = new ShowRoute(server);
            showRoute.register('/api/git/{0}/show/~/{1}', workspace, PATH); // Index
            showRoute.register('/api/git/{0}/show/{1}/{2}', workspace, TREEISH, PATH);
            new StageRoute(server).register('/api/git/{0}/add/{1}', workspace, PATH);
            new AddRoute(server).register('/api/git/{0}/add', workspace);
            new CommitRoute(server).register('/api/git/{0}/commit', workspace);
            new BranchRoute(server).register('/api/git/{0}/branch', workspace);
            var checkoutRoute = new CheckoutRoute(server);
            checkoutRoute.register('/api/git/{0}/checkout/{1}', workspace, TREEISH);
            checkoutRoute.register('/api/git/{0}/checkout', workspace);
            new CleanRoute(server).register('/api/git/{0}/clean', workspace);
            new UndoRoute(server).register('/api/git/{0}/undo', workspace);
            new ResetRoute(server).register('/api/git/{0}/reset/{1}', workspace, TREEISH);
            new FetchRoute(server).register('/api/git/{0}/fetch', workspace);
            new PullRoute(server).register('/api/git/{0}/pull', workspace);
            new PushRoute(server).register('/api/git/{0}/push', workspace);
            new SyncRoute(server).register('/api/git/{0}/sync', workspace);
            // Anything else is a 404
            server.www.all('/api/git/*', function (req, res, next) {
                return next(errors.httpError(404, "Invalid request on the git service."));
            });
        };
        GitContribution.prototype.channel = function (server, eventChannels) {
            var _this = this;
            eventChannels.bind('git', function (req) {
                var workspaceID = req.$workspace.id;
                var channel = req.accept();
                var channels = _this.channels[workspaceID] || [];
                channels.push(channel);
                _this.channels[workspaceID] = channels;
                channel.addListener('close', function () {
                    var channels = _this.channels[workspaceID] || [];
                    var index = channels.indexOf(channel);
                    if (index > -1) {
                        channels.splice(index, 1);
                        if (channels.length === 0) {
                            delete _this.channels[workspaceID];
                        }
                    }
                });
            });
        };
        GitContribution.prototype.registerCredentialHander = function (handler) {
            this.credentialHandlers.push(handler);
        };
        GitContribution.prototype.onCredentialRequest = function (data) {
            var _this = this;
            var guid = data.guid;
            var command = data.command;
            var handlers = this.credentialHandlers.slice();
            handlers.push(this.lastCredentialHandler);
            var handle = function (i) {
                var promise;
                if (i === handlers.length) {
                    promise = winjs.Promise.as(null);
                }
                else {
                    var handler = handlers[i];
                    switch (command) {
                        case 'get':
                            promise = handler.getCredentials(data);
                            break;
                        case 'store':
                            promise = handler.storeCredentials(data);
                            break;
                        case 'erase':
                            promise = handler.eraseCredentials(data);
                            break;
                        default:
                            promise = winjs.Promise.as(null);
                            break;
                    }
                }
                promise.done(function (credentials) {
                    var event = { guid: guid };
                    if (credentials) {
                        event.credentials = credentials;
                    }
                    _this.ipcService.emit('credentials:response', event);
                }, function () {
                    handle(i + 1);
                });
            };
            handle(0);
        };
        GitContribution.prototype.getRestEndPoints = function (server, workspace) {
            return {
                git: '/api/git' + workspace.getQualifier()
            };
        };
        return GitContribution;
    })(contrib.AbstractContribution);
    var EventChannelCredentialHandler = (function () {
        function EventChannelCredentialHandler(server, channels) {
            this.persistentStore = new store.FileStore(path.join(server.options.home, '.monaco-gitcredentials'));
            this.volatileStore = new store.InMemoryStore();
            this.channels = channels;
        }
        EventChannelCredentialHandler.prototype.getCredentials = function (request) {
            var _this = this;
            var key = request.scope.protocol + '://' + request.scope.host + '/' + request.scope.path;
            return this.volatileStore.getValue(key).then(function (credentials) {
                if (credentials) {
                    return winjs.TPromise.as({
                        username: credentials.username,
                        password: credentials.password
                    });
                }
                return new winjs.TPromise(function (c) {
                    var channels = _this.channels[request.workspace] || [];
                    if (!channels) {
                        return c(null);
                    }
                    var listeners;
                    var onCredentials = async.once(function (credentials) {
                        if (credentials === void 0) { credentials = {}; }
                        if (listeners) {
                            listeners.forEach(function (f) { return f(); });
                            listeners = null;
                        }
                        if (credentials.store) {
                            _this.persistentStore.setValue(key, { store: true }).done();
                        }
                        return c(credentials);
                    });
                    _this.persistentStore.getValue(key).done(function (credentials) {
                        if (credentials) {
                            onCredentials(credentials);
                        }
                        else {
                            var guid = uuid.v4().asHex();
                            listeners = channels.map(function (c) {
                                var unbindClient = c.addListener('client', function (data) {
                                    if (data.guid === guid && data.credentials) {
                                        onCredentials(data.credentials);
                                    }
                                });
                                var unbindClose = c.addListener('close', function (data) {
                                    if (!listeners) {
                                        return;
                                    }
                                    var index = listeners.indexOf(unbind);
                                    if (index > -1) {
                                        listeners.splice(index, 1);
                                    }
                                    if (listeners.length === 0) {
                                        onCredentials();
                                    }
                                });
                                var unbind = function () {
                                    unbindClient();
                                    unbindClose();
                                };
                                c.emit({
                                    guid: guid,
                                    credentialScope: request.scope
                                });
                                return unbind;
                            });
                        }
                    });
                });
            });
        };
        EventChannelCredentialHandler.prototype.storeCredentials = function (request) {
            var _this = this;
            var key = request.scope.protocol + '://' + request.scope.host + '/' + request.scope.path;
            return this.persistentStore.getValue(key).then(function (storedCredentials) {
                var credentials = {
                    store: true,
                    username: request.scope.username,
                    password: request.scope.password
                };
                if (storedCredentials && storedCredentials.store) {
                    return _this.persistentStore.setValue(key, credentials);
                }
                else {
                    return _this.volatileStore.setValue(key, credentials);
                }
            });
        };
        EventChannelCredentialHandler.prototype.eraseCredentials = function (request) {
            var _this = this;
            var key = request.scope.protocol + '://' + request.scope.host + '/' + request.scope.path;
            return this.volatileStore.getValue(key).then(function (storedCredentials) {
                if (storedCredentials) {
                    return _this.volatileStore.deleteValue(key);
                }
                else {
                    return _this.persistentStore.getValue(key).then(function (storedCredentials) {
                        if (storedCredentials) {
                            return _this.persistentStore.deleteValue(key);
                        }
                        else {
                            return winjs.Promise.wrapError(null);
                        }
                    });
                }
            });
        };
        return EventChannelCredentialHandler;
    })();
    contrib.Registry.registerContribution(new GitContribution());
});
