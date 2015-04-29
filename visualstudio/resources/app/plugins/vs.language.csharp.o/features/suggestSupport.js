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
define(["require", "exports", 'vs/nls', 'vs/base/collections', '../documentation', '../omnisharp', './abstractSupport', 'monaco', './snippets'], function (require, exports, nls, collections, documentation, omnisharp, AbstractSupport, monaco, CSharpSnippets) {
    var SuggestSupport = (function (_super) {
        __extends(SuggestSupport, _super);
        function SuggestSupport() {
            _super.apply(this, arguments);
            this.triggerCharacters = ['.', '<'];
            this.excludeTokens = ['comment.cs', 'string.cs', 'number.cs'];
        }
        SuggestSupport.prototype.suggest = function (resource, position) {
            if (this.isInMemory(resource)) {
                return monaco.Promise.as([]);
            }
            var word = this._modelService.getModel(resource).getWordAtPosition(position, false), request;
            request = {
                Filename: this.filename(resource),
                Line: position.lineNumber,
                Column: position.column,
                WordToComplete: word ? word.word.substring(0, position.column - word.startColumn) : '',
                WantDocumentationForEveryCompletionResult: true,
                WantKind: true
            };
            var isMemberCompletion = false;
            var requestColumn = position.column;
            if (word) {
                requestColumn = word.startColumn;
            }
            if (requestColumn > 0) {
                var prevChar = this._modelService.getModel(resource).getValueInRange({
                    startLineNumber: position.lineNumber,
                    startColumn: requestColumn - 1,
                    endLineNumber: position.lineNumber,
                    endColumn: requestColumn
                });
                isMemberCompletion = prevChar === '.';
            }
            return this.server().then(function (value) { return value.makeRequest(omnisharp.Protocol.AutoComplete, request).then(function (values) {
                var ret = {
                    currentWord: request.WordToComplete,
                    suggestions: []
                };
                if (!values) {
                    return [ret];
                }
                var completions = Object.create(null);
                // transform AutoCompleteResponse to ISuggestion and 
                // group by code snippet
                values.forEach(function (value) {
                    var suggestion = {
                        codeSnippet: value.CompletionText.replace(/\(|\)|<|>/g, ''),
                        label: value.CompletionText.replace(/\(|\)|<|>/g, ''),
                        typeLabel: value.DisplayText,
                        documentationLabel: documentation.plain(value.Description),
                        highlights: [],
                        type: kinds[value.Kind] || ''
                    };
                    collections.lookupOrInsert(completions, suggestion.codeSnippet, []).push(suggestion);
                });
                // per suggestion group, select on and indicate overloads
                collections.forEach(completions, function (entry, rm) {
                    var suggestion = entry.value[0], overloadCount = entry.value.length - 1;
                    if (overloadCount === 0) {
                        // remove non overloaded items
                        rm();
                    }
                    else {
                        // indicate that there is more
                        suggestion.typeLabel = nls.localize('overload_label', "{0} (+ {1} overload(s))", suggestion.typeLabel, overloadCount);
                    }
                    ret.suggestions.push(suggestion);
                });
                if (!isMemberCompletion) {
                    if (CSharpSnippets.snippets && CSharpSnippets.snippets.length > 0) {
                        ret.suggestions.push.apply(ret.suggestions, CSharpSnippets.snippets);
                    }
                }
                return [ret];
            }); });
        };
        return SuggestSupport;
    })(AbstractSupport);
    var kinds = Object.create(null);
    kinds['Variable'] = 'variable';
    kinds['Struct'] = 'interface';
    kinds['Interface'] = 'interface';
    kinds['Enum'] = 'enum';
    kinds['EnumMember'] = 'property';
    kinds['Property'] = 'property';
    kinds['Class'] = 'class';
    kinds['Field'] = 'property';
    kinds['EventField'] = 'property';
    kinds['Method'] = 'method';
    return SuggestSupport;
});
