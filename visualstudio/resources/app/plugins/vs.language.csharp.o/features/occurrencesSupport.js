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
define(["require", "exports", 'vs/base/arrays', '../omnisharp', './abstractSupport', 'monaco'], function (require, exports, arrays, omnisharp, AbstractSupport, monaco) {
    var OccurrencesSupport = (function (_super) {
        __extends(OccurrencesSupport, _super);
        function OccurrencesSupport() {
            _super.apply(this, arguments);
        }
        OccurrencesSupport.prototype.findOccurrences = function (resource, position, strict) {
            var _this = this;
            if (this.isInMemory(resource)) {
                return monaco.Promise.as([]);
            }
            return this.server().then(function (value) {
                return value.makeRequest(omnisharp.Protocol.FindUsages, {
                    Filename: _this.filename(resource),
                    Line: position.lineNumber,
                    Column: position.column,
                    OnlyThisFile: true,
                    ExcludeDefinition: false
                }).then(function (res) {
                    return !res || arrays.isFalsyOrEmpty(res.QuickFixes) ? [] : res.QuickFixes.map(OccurrencesSupport.asOccurrence);
                });
            });
        };
        OccurrencesSupport.asOccurrence = function (quickFix) {
            return {
                range: {
                    startLineNumber: quickFix.Line,
                    startColumn: quickFix.Column,
                    endLineNumber: quickFix.EndLine,
                    endColumn: quickFix.EndColumn
                }
            };
        };
        return OccurrencesSupport;
    })(AbstractSupport);
    return OccurrencesSupport;
});
