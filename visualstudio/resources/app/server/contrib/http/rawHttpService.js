/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
/// <reference path="../../declare/node.d.ts" />
/// <reference path="../../declare/xmlhttprequest.d.ts" />
'use strict';
define(["require", "exports", '../../lib/system', 'xmlhttprequest'], function (require, exports, winjs, xmlhttprequest) {
    function xhr(options) {
        var req; //TODO@Martin - add a d.ts file
        return new winjs.Promise(function (c, e, p) {
            req = new xmlhttprequest.XMLHttpRequest();
            req.onreadystatechange = function () {
                if (req._canceled) {
                    return;
                }
                if (req.readyState === 4) {
                    // MONACO CHANGE: Handle 1223: http://bugs.jquery.com/ticket/1450
                    if ((req.status >= 200 && req.status < 300) || req.status === 1223) {
                        c(req);
                    }
                    else if (options.followRedirects > 0 && (req.status >= 300 && req.status <= 303 || req.status === 307)) {
                        var location = req.getResponseHeader('location');
                        if (location) {
                            var newOptions = {
                                type: options.type,
                                url: location,
                                user: options.user,
                                password: options.password,
                                responseType: options.responseType,
                                headers: options.headers,
                                customRequestConfiguration: options.customRequestConfiguration,
                                followRedirects: options.followRedirects - 1,
                                data: options.data
                            };
                            xhr(newOptions).then(c, e, p);
                            return;
                        }
                        e(req);
                    }
                    else {
                        e(req);
                    }
                    req.onreadystatechange = function () {
                    };
                }
                else {
                    p(req);
                }
            };
            req.open(options.type || "GET", options.url, true, options.user, options.password);
            req.responseType = options.responseType || "";
            if (options.customRequestConfiguration) {
                for (var key in options.customRequestConfiguration) {
                    req[key] = options.customRequestConfiguration[key];
                }
            }
            for (var h in options.headers) {
                if (options.headers.hasOwnProperty(h)) {
                    req.setRequestHeader(h, options.headers[h]);
                }
            }
            req.send(options.data);
        }, function () {
            req._canceled = true;
            req.abort();
        });
    }
    exports.xhr = xhr;
});
