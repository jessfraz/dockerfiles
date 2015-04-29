/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
/// <reference path="../../declares.d.ts" />
'use strict';
define(["require", "exports", 'monaco'], function (require, exports, monaco) {
    var RenameSupport = (function () {
        function RenameSupport(ctx, client) {
            this.tokens = [];
            this.client = client;
        }
        RenameSupport.prototype.rename = function (resource, position, newName) {
            var _this = this;
            var args = {
                file: this.client.asAbsolutePath(resource),
                line: position.lineNumber,
                offset: position.column,
                findInStrings: false,
                findInComments: false
            };
            if (!args.file) {
                return monaco.Promise.as(null);
            }
            return this.client.execute('rename', args).then(function (response) {
                var renameResponse = response.body;
                var renameInfo = renameResponse.info;
                var result = {
                    currentName: renameInfo.displayName,
                    edits: []
                };
                if (!renameInfo.canRename) {
                    result.rejectReason = renameInfo.localizedErrorMessage;
                    return result;
                }
                renameResponse.locs.forEach(function (spanGroup) {
                    var resource = _this.client.asUrl(spanGroup.file);
                    if (!resource) {
                        return;
                    }
                    spanGroup.locs.forEach(function (textSpan) {
                        result.edits.push({
                            resource: resource.toString(),
                            newText: newName,
                            range: {
                                startLineNumber: textSpan.start.line,
                                startColumn: textSpan.start.offset,
                                endLineNumber: textSpan.end.line,
                                endColumn: textSpan.end.offset
                            }
                        });
                    });
                });
                return result;
            }, function (err) {
                return null;
            });
        };
        return RenameSupport;
    })();
    return RenameSupport;
});
