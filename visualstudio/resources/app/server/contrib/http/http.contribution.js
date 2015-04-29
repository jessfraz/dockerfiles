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
define(["require", "exports", 'http', 'https', '../contributions', '../../lib/errors'], function (require, exports, http, https, Contributions, errors) {
    var HTTPContribution = (function (_super) {
        __extends(HTTPContribution, _super);
        function HTTPContribution() {
            _super.call(this, 'com.microsoft.vs.http');
        }
        HTTPContribution.prototype.route = function (server) {
            server.www.get('/api/http', function (req, res, next) {
                var url = req.query['url'];
                if (!url) {
                    return next(errors.httpError(400, "Invalid request on the http service."));
                }
                var forwardResponse = function (pres) {
                    res.writeHead(pres.statusCode, {
                        'content-type': pres.headers['content-type']
                    });
                    pres.pipe(res);
                };
                if (url.indexOf('https://') === 0) {
                    https.get(url, forwardResponse);
                }
                else if (url.indexOf('http://') === 0) {
                    http.get(url, forwardResponse);
                }
            });
        };
        HTTPContribution.prototype.getRestEndPoints = function (server, workspace) {
            return {
                http: '/api/http/'
            };
        };
        return HTTPContribution;
    })(Contributions.AbstractContribution);
    Contributions.Registry.registerContribution(new HTTPContribution());
});
