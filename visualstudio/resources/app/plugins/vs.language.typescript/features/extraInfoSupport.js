/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
/// <reference path="../../declares.d.ts" />
'use strict';
define(["require", "exports", 'monaco'], function (require, exports, monaco) {
    var ExtraInfoSupport = (function () {
        function ExtraInfoSupport(ctx, client) {
            this.client = client;
        }
        ExtraInfoSupport.prototype.computeInfo = function (resource, position) {
            var args = {
                file: this.client.asAbsolutePath(resource),
                line: position.lineNumber,
                offset: position.column
            };
            if (!args.file) {
                return monaco.Promise.as(null);
            }
            return this.client.execute('quickinfo', args).then(function (response) {
                var data = response.body;
                if (data) {
                    return {
                        htmlContent: [
                            { formattedText: data.displayString },
                            { formattedText: data.documentation }
                        ],
                        range: {
                            startLineNumber: data.start.line,
                            startColumn: data.start.offset,
                            endLineNumber: data.end.line,
                            endColumn: data.end.offset
                        }
                    };
                }
            }, function (err) {
                return null;
            });
        };
        return ExtraInfoSupport;
    })();
    return ExtraInfoSupport;
});
