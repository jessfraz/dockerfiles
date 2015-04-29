/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
/// <reference path="../../declares.d.ts" />
'use strict';
define(["require", "exports", 'monaco'], function (require, exports, monaco) {
    var DeclartionSupport = (function () {
        function DeclartionSupport(ctx, client) {
            this.tokens = [];
            this.client = client;
        }
        DeclartionSupport.prototype.findDeclaration = function (resource, position) {
            var _this = this;
            var args = {
                file: this.client.asAbsolutePath(resource),
                line: position.lineNumber,
                offset: position.column
            };
            if (!args.file) {
                return monaco.Promise.as(null);
            }
            return this.client.execute('definition', args).then(function (response) {
                var locations = response.body;
                if (!locations || locations.length === 0) {
                    return null;
                }
                var location = locations[0];
                var resource = _this.client.asUrl(location.file);
                if (resource === null) {
                    return null;
                }
                else {
                    return {
                        resourceUrl: resource,
                        range: {
                            startLineNumber: location.start.line,
                            startColumn: location.start.offset,
                            endLineNumber: location.end.line,
                            endColumn: location.end.offset
                        }
                    };
                }
            }, function () {
                return null;
            });
        };
        return DeclartionSupport;
    })();
    return DeclartionSupport;
});
