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
define(["require", "exports", 'vs/base/arrays', 'vs/base/strings', '../omnisharp', './abstractSupport', 'monaco'], function (require, exports, arrays, strings, omnisharp, AbstractSupport, monaco) {
    var FormattingSupport = (function (_super) {
        __extends(FormattingSupport, _super);
        function FormattingSupport() {
            _super.apply(this, arguments);
            this.autoFormatTriggerCharacters = [';', '}', '\n'];
        }
        FormattingSupport.prototype.formatDocument = function (resource, options) {
            if (this.isInMemory(resource)) {
                return monaco.Promise.as([]);
            }
            var model = this._modelService.getModel(resource), versionId = model.getVersionId(), request;
            request = {
                Filename: this.filename(resource),
                ExpandTab: options.insertSpaces
            };
            return this.server().then(function (value) { return value.makeRequest(omnisharp.Protocol.CodeFormat, request); }).then(function (res) {
                if (model.getVersionId() !== versionId) {
                    return null;
                }
                if (strings.isFalsyOrWhitespace(res.Buffer)) {
                    return null;
                }
                var edit = {
                    text: res.Buffer,
                    range: {
                        startLineNumber: 1,
                        startColumn: 1,
                        endLineNumber: model.getLineCount(),
                        endColumn: model.getLineMaxColumn(model.getLineCount())
                    }
                };
                return [edit];
            });
        };
        FormattingSupport.prototype.formatRange = function (resource, range, options) {
            if (this.isInMemory(resource)) {
                return monaco.Promise.as([]);
            }
            var model = this._modelService.getModel(resource), versionId = model.getVersionId(), request;
            request = {
                Filename: this.filename(resource),
                Line: range.startLineNumber,
                Column: range.startColumn,
                EndLine: range.endLineNumber,
                EndColumn: range.endColumn
            };
            return this.server().then(function (value) { return value.makeRequest(omnisharp.Protocol.FormatRange, request); }).then(function (res) {
                if (!res || arrays.isFalsyOrEmpty(res.Changes)) {
                    return null;
                }
                if (model.getVersionId() !== versionId) {
                    return null;
                }
                return res.Changes.map(FormattingSupport.asEditOptionation);
            });
        };
        FormattingSupport.prototype.formatAfterKeystroke = function (resource, position, ch, options) {
            if (this.isInMemory(resource)) {
                return monaco.Promise.as([]);
            }
            var model = this._modelService.getModel(resource), versionId = model.getVersionId(), request;
            request = {
                Filename: this.filename(resource),
                Line: position.lineNumber,
                Column: position.column,
                Character: ch
            };
            return this.server().then(function (value) { return value.makeRequest(omnisharp.Protocol.FormatAfterKeystroke, request); }).then(function (res) {
                if (!res || arrays.isFalsyOrEmpty(res.Changes)) {
                    return null;
                }
                if (model.getVersionId() !== versionId) {
                    return null;
                }
                return res.Changes.map(FormattingSupport.asEditOptionation);
            });
        };
        FormattingSupport.asEditOptionation = function (change) {
            return {
                text: change.NewText,
                range: {
                    startLineNumber: change.StartLine,
                    startColumn: change.StartColumn,
                    endLineNumber: change.EndLine,
                    endColumn: change.EndColumn
                }
            };
        };
        return FormattingSupport;
    })(AbstractSupport);
    return FormattingSupport;
});
