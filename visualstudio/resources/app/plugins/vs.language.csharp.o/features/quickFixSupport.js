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
    var QuickFixSupport = (function (_super) {
        __extends(QuickFixSupport, _super);
        function QuickFixSupport() {
            _super.apply(this, arguments);
        }
        QuickFixSupport.prototype.runQuickFixAction = function (resource, range, id) {
            if (this.isInMemory(resource)) {
                return monaco.Promise.as(null);
            }
            var req = {
                Filename: this.filename(resource),
                Line: range.startLineNumber,
                Column: range.startColumn,
                SelectionStartColumn: range.startColumn,
                SelectionStartLine: range.startLineNumber,
                SelectionEndColumn: range.endColumn,
                SelectionEndLine: range.endLineNumber,
                WantsTextChanges: true,
                CodeAction: id
            };
            return this.server().then(function (value) {
                return value.makeRequest(omnisharp.Protocol.RunCodeAction, req).then(function (response) {
                    var editOperations = response.Changes.map(QuickFixSupport._asSingleEditOperation);
                    return { editOperations: editOperations };
                }, function (error) {
                    return monaco.Promise.wrapError('Problem invoking \'RunCodeAction\' on OmniSharp server: ' + error);
                });
            });
        };
        QuickFixSupport._asSingleEditOperation = function (change) {
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
        QuickFixSupport.prototype.getQuickFixes = function (resource, range) {
            var _this = this;
            if (this.isInMemory(resource)) {
                return monaco.Promise.as(null);
            }
            return this.server().then(function (value) {
                return value.makeRequest(omnisharp.Protocol.GetCodeActions, {
                    Filename: _this.filename(resource),
                    Line: range.startLineNumber,
                    Column: range.startColumn,
                    SelectionStartColumn: range.startColumn,
                    SelectionStartLine: range.startLineNumber,
                    SelectionEndColumn: range.endColumn,
                    SelectionEndLine: range.endLineNumber
                }).then(function (response) {
                    return response.CodeActions.map(function (ca, index, arr) {
                        return { label: ca, id: String(index), score: index };
                    });
                }, function (error) {
                    return monaco.Promise.wrapError('Problem invoking \'GetCodeActions\' on OmniSharp server: ' + error);
                });
            });
        };
        return QuickFixSupport;
    })(AbstractSupport);
    return QuickFixSupport;
});
