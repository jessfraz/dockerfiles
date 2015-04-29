/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
/// <reference path="../declare/node.d.ts" />
'use strict';
define(["require", "exports", 'glob', '../platform', '../lib/system', '../lib/types', '../lib/performance', '../lib/env'], function (require, exports, glob, platform, winjs, types, performance, env) {
    var AbstractContribution = (function () {
        function AbstractContribution(id, dependencies) {
            if (dependencies === void 0) { dependencies = []; }
            this.id = id;
            this.dependencies = dependencies;
        }
        return AbstractContribution;
    })();
    exports.AbstractContribution = AbstractContribution;
    var registryKey = 'com.microsoft.vs.platform.contributionRegistry';
    var contributions = {};
    platform.Registry.add(registryKey, {
        registerContribution: function (contribution) {
            contributions[contribution.id] = contribution;
        },
        getContribution: function (id) {
            return contributions[id];
        },
        getContributions: function () {
            var result = [];
            Object.keys(contributions).forEach(function (key) {
                result.push(contributions[key]);
            });
            return result;
        }
    });
    exports.Registry = platform.Registry.as(registryKey);
    function mixin(destination, source) {
        if (types.isObject(source)) {
            Object.keys(source).forEach(function (key) {
                if (types.isObject(source[key])) {
                    if (!(key in destination)) {
                        destination[key] = {};
                    }
                    mixin(destination[key], source[key]);
                }
                else {
                    destination[key] = source[key];
                }
            });
        }
        return destination;
    }
    var Flags;
    (function (Flags) {
        Flags[Flags["CONFIGURED"] = 1 << 0] = "CONFIGURED";
        Flags[Flags["EXTENSIONS_REGISTERED"] = 1 << 1] = "EXTENSIONS_REGISTERED";
        Flags[Flags["ROUTED"] = 1 << 2] = "ROUTED";
        Flags[Flags["EXIT_CALLED"] = 1 << 3] = "EXIT_CALLED";
        Flags[Flags["CHANNELED"] = 1 << 4] = "CHANNELED";
    })(Flags || (Flags = {}));
    var ContributionNode = (function () {
        function ContributionNode(contribution) {
            this.dependsOn = [];
            this.isRoot = true;
            this.flags = 0;
            this.contribution = contribution;
        }
        ContributionNode.prototype.executeAction = function (action) {
            var result = null;
            if (action) {
                result = action(this.contribution);
            }
            // Make sure we unwind the stack and have real async beahviour when a value is return from the contribution
            // This ensures that node stays responsive
            // TODO@Dirk - what about the Promise's onCancel?
            return winjs.Promise.is(result) ? result : new winjs.Promise(function (c, e, p) {
                process.nextTick(function () {
                    c(result);
                });
            });
        };
        ContributionNode.prototype.walk = function (preAction, postAction, flag) {
            var _this = this;
            if (flag && (this.flags & flag) !== 0) {
                return winjs.Promise.as(null);
            }
            if (flag) {
                this.flags = this.flags | flag;
            }
            var result = [];
            return this.executeAction(preAction).then(function (value) {
                result.push(value);
                var promises = [];
                _this.dependsOn.forEach(function (node) {
                    promises.push(node.walk(preAction, postAction, flag));
                });
                return winjs.Promise.join(promises);
            }).then(function (values) {
                result.push(values);
                return _this.executeAction(postAction);
            }).then(function (value) {
                result.push(value);
                return result;
            });
        };
        ContributionNode.prototype.registerExtensions = function (server) {
            return this.walk(null, function (contribution) {
                return typeof contribution.registerExtensions === 'function' ? contribution.registerExtensions(server) : null;
            }, Flags.EXTENSIONS_REGISTERED);
        };
        ContributionNode.prototype.configure = function (server) {
            return this.walk(null, function (contribution) {
                return typeof contribution.configure === 'function' ? contribution.configure(server) : null;
            }, Flags.CONFIGURED);
        };
        ContributionNode.prototype.getRestEndPoints = function (server, workspace) {
            var result = {};
            return this.walk(null, function (contribution) {
                return typeof contribution.getRestEndPoints === 'function' ? contribution.getRestEndPoints(server, workspace) : null;
            }).then(function (values) {
                // values is an array of length 3. 
                // [0] is pre action result
                // [1] is an array of dependency results
                // [2] is post action result;
                var merged = false;
                values.forEach(function (value) {
                    if (types.isObject(value)) {
                        merged = true;
                        mixin(result, value);
                    }
                });
                return merged ? result : null;
            });
        };
        ContributionNode.prototype.route = function (server) {
            return this.walk(null, function (contribution) {
                return typeof contribution.route === 'function' ? contribution.route(server) : null;
            }, Flags.ROUTED);
        };
        ContributionNode.prototype.channel = function (server, eventChannels) {
            return this.walk(null, function (contribution) {
                return typeof contribution.channel === 'function' ? contribution.channel(server, eventChannels) : null;
            }, Flags.CHANNELED);
        };
        ContributionNode.prototype.onExit = function (server) {
            return this.walk(function (contribution) {
                return typeof contribution.onExit === 'function' ? contribution.onExit(server) : null;
            }, null, Flags.EXIT_CALLED);
        };
        return ContributionNode;
    })();
    var _ContributionManager = (function () {
        function _ContributionManager() {
            this.roots = [];
        }
        _ContributionManager.prototype.init = function () {
            var _this = this;
            var options = {
                cwd: __dirname
            };
            var files = glob.sync('**/*.contribution.js', options);
            var promises = files.map(function (file) { return env.loadRelativeModule(require, './' + file.replace(/\.js$/, '')); });
            return winjs.Promise.join(promises).then(function () {
                var nodes = {};
                function createContributionNode(contribution) {
                    var result = new ContributionNode(contribution);
                    nodes[contribution.id] = result;
                    if (typeof contribution.dependencies !== 'undefined') {
                        var dependencies = contribution.dependencies;
                        if (dependencies && dependencies.length > 0) {
                            dependencies.forEach(function (dependency) {
                                var node = nodes[dependency];
                                if (!node) {
                                    node = createContributionNode(contributions[dependency]);
                                    result.dependsOn.push(node);
                                    node.isRoot = false;
                                }
                            });
                        }
                    }
                    return result;
                }
                Object.keys(contributions).forEach(function (key) {
                    if (!nodes[key]) {
                        createContributionNode(contributions[key]);
                    }
                });
                Object.keys(nodes).forEach(function (key) {
                    var node = nodes[key];
                    if (node.isRoot) {
                        _this.roots.push(node);
                    }
                });
            });
        };
        _ContributionManager.prototype.execute = function (server, action) {
            var promises = [];
            this.roots.forEach(function (contrib) {
                var result = action(server, contrib);
                if (winjs.Promise.is(result)) {
                    promises.push(result);
                }
            });
            return winjs.Promise.join(promises);
        };
        _ContributionManager.prototype.registerExtensions = function (server) {
            return this.execute(server, function (server, contrib) {
                return contrib.registerExtensions(server);
            });
        };
        _ContributionManager.prototype.injectServices = function (server) {
            var injectorService = platform.ServiceRegistry.getInjectorService();
            return this.execute(server, function (server, contribNode) {
                injectorService.injectTo(contribNode.contribution);
                return null;
            });
        };
        _ContributionManager.prototype.configure = function (server) {
            return this.execute(server, function (server, contrib) {
                return performance.logDuration(contrib.contribution.id + ' configure()', contrib.configure(server));
            });
        };
        _ContributionManager.prototype.getRestEndPoints = function (server, workspace) {
            return winjs.Promise.join(this.roots.map(function (contrib) {
                return contrib.getRestEndPoints(server, workspace);
            })).then(function (endPoints) {
                var result = {};
                endPoints.forEach(function (endPoint) {
                    if (endPoint) {
                        mixin(result, endPoint);
                    }
                });
                return result;
            });
        };
        _ContributionManager.prototype.route = function (server) {
            return this.execute(server, function (server, contrib) {
                return contrib.route(server);
            });
        };
        _ContributionManager.prototype.channel = function (server, eventChannels) {
            return this.execute(server, function (server, contrib) {
                return contrib.channel(server, eventChannels);
            });
        };
        _ContributionManager.prototype.onExit = function (server) {
            return this.execute(server, function (server, contrib) {
                return contrib.onExit(server);
            });
        };
        return _ContributionManager;
    })();
    exports.ContributionManager = new _ContributionManager();
});
