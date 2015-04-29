/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
/// <reference path="../../declares.d.ts" />
'use strict';
define(["require", "exports", 'monaco'], function (require, exports, monaco) {
    var OccurrencesSupport = (function () {
        function OccurrencesSupport(ctx, client) {
            this.client = client;
        }
        OccurrencesSupport.prototype.findOccurrences = function (resource, position, strict) {
            var args = {
                file: this.client.asAbsolutePath(resource),
                line: position.lineNumber,
                offset: position.column
            };
            if (!args.file) {
                return monaco.Promise.as([]);
            }
            return this.client.execute('occurrences', args).then(function (response) {
                var data = response.body;
                if (data) {
                    return data.map(function (item) {
                        return {
                            kind: item.isWriteAccess ? 'write' : null,
                            range: {
                                startLineNumber: item.start.line,
                                startColumn: item.start.offset,
                                endLineNumber: item.end.line,
                                endColumn: item.end.offset
                            }
                        };
                    });
                }
            }, function (err) {
                return [];
            });
        };
        return OccurrencesSupport;
    })();
    return OccurrencesSupport;
});
