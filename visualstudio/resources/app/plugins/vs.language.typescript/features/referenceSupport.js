/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
/// <reference path="../../declares.d.ts" />
'use strict';
define(["require", "exports", 'monaco'], function (require, exports, monaco) {
    var ReferenceSupport = (function () {
        function ReferenceSupport(ctx, client) {
            this.tokens = [];
            this.client = client;
        }
        ReferenceSupport.prototype.findReferences = function (resource, position, includeDeclaration) {
            var _this = this;
            var args = {
                file: this.client.asAbsolutePath(resource),
                line: position.lineNumber,
                offset: position.column
            };
            if (!args.file) {
                return monaco.Promise.as([]);
            }
            return this.client.execute('references', args).then(function (msg) {
                var result = [];
                var refs = msg.body.refs;
                for (var i = 0; i < refs.length; i++) {
                    var ref = refs[i];
                    var url = _this.client.asUrl(ref.file);
                    result.push({
                        resourceUrl: url,
                        range: {
                            startLineNumber: ref.start.line,
                            startColumn: ref.start.offset,
                            endLineNumber: ref.end.line,
                            endColumn: ref.end.offset
                        }
                    });
                }
                return result;
            }, function () {
                return [];
            });
        };
        return ReferenceSupport;
    })();
    return ReferenceSupport;
});
