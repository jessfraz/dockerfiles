/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
/// <reference path="../../declare/node.d.ts" />
/// <reference path="../../declare/express.d.ts" />
'use strict';
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", '../contributions', '../../lib/errors', '../../lib/route', '../../lib/system', '../../lib/uri', './ipcRawSearchService', '../../model/workspace', '../../controller/workspace'], function (require, exports, contributions, errors, route, winjs, uri, rawsearch, workspace, workspaceRoute) {
    var SearchRoute = (function (_super) {
        __extends(SearchRoute, _super);
        function SearchRoute(server) {
            _super.call(this, server);
            this.raw = rawsearch.createService();
        }
        SearchRoute.prototype.handleRequest = function (req, res, next) {
            var contentType = req.get('Content-Type');
            if (!contentType || contentType.indexOf('application/json') === -1) {
                return winjs.Promise.wrapError(errors.httpError(400, 'Invalid text search request. Content-Type must be application/json.'));
            }
            if (!req.body) {
                return winjs.Promise.wrapError(errors.httpError(400, 'Invalid text search request. No parameters specified.'));
            }
            res.set('Content-Type', 'text/plain');
            var workspace = workspaceRoute.getWorkspace(req);
            var promise;
            if (req.body.type === 1) {
                promise = this.raw.fileSearch([uri.file(workspace.toAbsolutePath()).toString()], req.body.filePatterns, req.body.excludeResources, req.body.includeResources);
            }
            else {
                promise = this.raw.textSearch([uri.file(workspace.toAbsolutePath()).toString()], req.body.filePatterns, req.body.excludeResources, req.body.includeResources, req.body.contentPattern, req.body.maxResults);
            }
            req.on('close', function () { return promise.cancel(); });
            return promise.then(function () {
                res.end();
            }, function (err) {
                if (errors.isPromiseCanceledError(err)) {
                    res.end();
                    return winjs.Promise.as(null);
                }
                return winjs.Promise.wrapError(err);
            }, function (data) {
                if (data.resource) {
                    res.write(JSON.stringify(data) + '\n');
                }
            });
        };
        return SearchRoute;
    })(route.POSTRoute);
    var SearchContribution = (function (_super) {
        __extends(SearchContribution, _super);
        function SearchContribution() {
            _super.call(this, 'com.microsoft.vs.search');
        }
        SearchContribution.prototype.route = function (server) {
            new SearchRoute(server).register('/api/search/{0}', workspace);
            // Handle Invalid Requests
            server.www.all('/api/search/*', function (req, res, next) {
                return next(errors.httpError(400, 'Invalid request on the search service.'));
            });
        };
        SearchContribution.prototype.getRestEndPoints = function (server, workspace) {
            return {
                search: '/api/search' + workspace.getQualifier()
            };
        };
        return SearchContribution;
    })(contributions.AbstractContribution);
    contributions.Registry.registerContribution(new SearchContribution());
});
