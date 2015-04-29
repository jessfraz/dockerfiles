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
    var CodeLensSupport = (function (_super) {
        __extends(CodeLensSupport, _super);
        function CodeLensSupport() {
            _super.apply(this, arguments);
        }
        CodeLensSupport.prototype.enableCodeLens = function () {
            return true;
        };
        CodeLensSupport.prototype.findCodeLensSymbols = function (resource) {
            var _this = this;
            if (this.isInMemory(resource)) {
                return monaco.Promise.as([]);
            }
            return this.server().then(function (value) {
                return value.makeRequest(omnisharp.Protocol.CurrentFileMembersAsTree, {
                    Filename: _this.filename(resource)
                }).then(function (tree) {
                    var ret = [];
                    tree.TopLevelTypeDefinitions.forEach(function (node) { return CodeLensSupport._toCodeLensSymbol(ret, node); });
                    return ret;
                });
            });
        };
        CodeLensSupport._toCodeLensSymbol = function (container, node) {
            if (node.Kind === 'MethodDeclaration' && CodeLensSupport.filteredSymbolNames[node.Location.Text]) {
                return;
            }
            var ret = {
                range: {
                    startLineNumber: node.Location.Line,
                    startColumn: node.Location.Column,
                    endLineNumber: node.Location.EndLine,
                    endColumn: node.Location.EndColumn
                }
            };
            if (node.ChildNodes) {
                node.ChildNodes.forEach(function (value) { return CodeLensSupport._toCodeLensSymbol(container, value); });
            }
            container.push(ret);
        };
        CodeLensSupport.prototype.findCodeLensReferences = function (resource, requests) {
            var _this = this;
            if (this.isInMemory(resource)) {
                return monaco.Promise.as(null);
            }
            return this.server().then(function (value) {
                var resultPromises = requests.map(function (request) {
                    return value.makeRequest(omnisharp.Protocol.FindUsages, {
                        Filename: _this.filename(resource),
                        Line: request.position.lineNumber,
                        Column: request.position.column,
                        OnlyThisFile: false,
                        ExcludeDefinition: true
                    }).then(function (res) {
                        return !res || arrays.isFalsyOrEmpty(res.QuickFixes) ? [] : res.QuickFixes.map(CodeLensSupport._asReference).filter(function (r) { return !monaco.Range.containsPosition(r.range, request.position); });
                    });
                });
                return monaco.Promise.join(resultPromises).then(function (allReferences) {
                    return {
                        references: allReferences
                    };
                });
            });
        };
        CodeLensSupport._asReference = function (quickFix) {
            return {
                resourceUrl: new monaco.URL(monaco.URI.file(quickFix.FileName)),
                range: {
                    startLineNumber: quickFix.Line,
                    startColumn: quickFix.Column,
                    endLineNumber: quickFix.EndLine,
                    endColumn: quickFix.EndColumn
                }
            };
        };
        CodeLensSupport.filteredSymbolNames = {
            'Equals': true,
            'Finalize': true,
            'GetHashCode': true,
            'ToString': true
        };
        return CodeLensSupport;
    })(AbstractSupport);
    return CodeLensSupport;
});
