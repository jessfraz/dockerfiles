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
define(["require", "exports", 'vs/base/strings', '../omnisharp', '../documentation', './abstractSupport', 'monaco'], function (require, exports, strings, omnisharp, documentation, AbstractSupport, monaco) {
    var ExtraInfoSupport = (function (_super) {
        __extends(ExtraInfoSupport, _super);
        function ExtraInfoSupport() {
            _super.apply(this, arguments);
        }
        ExtraInfoSupport.prototype.computeInfo = function (resource, position) {
            var _this = this;
            if (this.isInMemory(resource)) {
                return monaco.Promise.as(null);
            }
            var request = {
                Filename: this.filename(resource),
                Line: position.lineNumber,
                Column: position.column,
                IncludeDocumentation: true
            };
            return this.server().then(function (value) { return value.makeRequest(omnisharp.Protocol.TypeLookup, request).then(function (value) {
                if (!value || strings.isFalsyOrWhitespace(value.Type)) {
                    return null;
                }
                var word = _this._modelService.getModel(resource).getWordAtPosition(position, false), range;
                if (word) {
                    range = { startLineNumber: position.lineNumber, startColumn: word.startColumn, endLineNumber: position.lineNumber, endColumn: word.endColumn };
                }
                else {
                    range = { startLineNumber: position.lineNumber, startColumn: position.column, endLineNumber: position.lineNumber, endColumn: position.column };
                }
                return {
                    value: '',
                    range: range,
                    className: 'typeInfo',
                    htmlContent: [
                        { className: 'type', text: value.Type },
                        { className: 'documentation', text: documentation.plain(value.Documentation) }
                    ]
                };
            }); });
        };
        return ExtraInfoSupport;
    })(AbstractSupport);
    return ExtraInfoSupport;
});
