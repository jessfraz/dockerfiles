/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
/// <reference path="../../declares.d.ts" />
'use strict';
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", '../omnisharp', './abstractSupport', 'monaco'], function (require, exports, omnisharp, AbstractSupport, monaco) {
    var RenameSupport = (function (_super) {
        __extends(RenameSupport, _super);
        function RenameSupport() {
            _super.apply(this, arguments);
        }
        RenameSupport.prototype.rename = function (resource, position, newName) {
            if (this.isInMemory(resource)) {
                return monaco.Promise.as(null);
            }
            var word = this._modelService.getModel(monaco.URL.fromUri(resource)).getWordAtPosition(position, false), request;
            request = {
                WantsTextChanges: true,
                Filename: this.filename(resource),
                Line: position.lineNumber,
                Column: position.column,
                RenameTo: newName
            };
            return this.server().then(function (value) { return value.makeRequest(omnisharp.Protocol.Rename, request); }).then(function (response) {
                if (!response) {
                    return;
                }
                var result = {
                    currentName: word.word,
                    edits: []
                };
                var seen = Object.create(null);
                response.Changes.forEach(function (change) {
                    var resource = monaco.URI.file(change.FileName).toString();
                    change.Changes.forEach(function (change) {
                        var edit = RenameSupport._convert(resource, change), key = JSON.stringify(edit);
                        if (seen[key] !== true) {
                            seen[key] = true;
                            result.edits.push(edit);
                        }
                    });
                });
                return result;
            });
        };
        RenameSupport._convert = function (resource, change) {
            return {
                resource: resource,
                newText: change.NewText,
                range: {
                    startLineNumber: change.StartLine,
                    startColumn: change.StartColumn,
                    endLineNumber: change.EndLine,
                    endColumn: change.EndColumn
                }
            };
        };
        return RenameSupport;
    })(AbstractSupport);
    return RenameSupport;
});
