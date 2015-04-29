/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
/// <reference path="../../declares.d.ts" />
'use strict';
define(["require", "exports", 'vs/languages/lib/javascriptSnippets', 'vs/languages/typescript/features/typescriptSnippets', 'monaco', './previewer', '../protocol.const', './configuration'], function (require, exports, JavaScriptSnippets, TypeScriptSnippets, monaco, Previewer, PConst, Configuration) {
    var SuggestSupport = (function () {
        function SuggestSupport(ctx, client) {
            this.triggerCharacters = ['.'];
            this.excludeTokens = ['string', 'comment', 'numeric'];
            this.sortBy = [{ type: 'reference', partSeparator: '/' }];
            this.modelService = ctx.modelService;
            this.client = client;
            this.config = Configuration.defaultConfiguration;
        }
        SuggestSupport.prototype.setConfiguration = function (config) {
            this.config = config;
        };
        SuggestSupport.prototype.suggest = function (resource, position) {
            var _this = this;
            var filepath = this.client.asAbsolutePath(resource);
            var model = this.modelService.getModel(resource);
            var args = {
                file: filepath,
                line: position.lineNumber,
                offset: position.column
            };
            if (!args.file) {
                return monaco.Promise.as([]);
            }
            // Need to capture the word at position before we send the request.
            // The model can move forward while the request is evaluated.
            var wordAtPosition = model.getWordAtPosition(position, false);
            var versionId = model.getVersionId();
            return this.client.execute('completions', args).then(function (msg) {
                if (versionId !== model.getVersionId()) {
                    return [];
                }
                // This info has to come from the tsserver. See https://github.com/Microsoft/TypeScript/issues/2831
                var isMemberCompletion = false;
                var requestColumn = position.column;
                if (wordAtPosition) {
                    requestColumn = wordAtPosition.startColumn;
                }
                if (requestColumn > 0) {
                    var value = model.getValueInRange({
                        startLineNumber: position.lineNumber,
                        startColumn: requestColumn - 1,
                        endLineNumber: position.lineNumber,
                        endColumn: requestColumn
                    });
                    isMemberCompletion = value === '.';
                }
                var suggests = [];
                var body = msg.body;
                for (var i = 0; i < body.length; i++) {
                    var element = body[i];
                    suggests.push({
                        label: element.name,
                        codeSnippet: element.name,
                        type: _this.monacoTypeFromEntryKind(element.kind)
                    });
                }
                if (suggests.length === 0 || !isMemberCompletion) {
                    if (JavaScriptSnippets.snippets && JavaScriptSnippets.snippets.length > 0) {
                        suggests.push.apply(suggests, JavaScriptSnippets.snippets);
                    }
                    if (TypeScriptSnippets.snippets && TypeScriptSnippets.snippets.length > 0) {
                        suggests.push.apply(suggests, TypeScriptSnippets.snippets);
                    }
                }
                var currentWord = '';
                if (wordAtPosition && wordAtPosition.startColumn < position.column) {
                    currentWord = wordAtPosition.word.substr(0, position.column - wordAtPosition.startColumn);
                }
                return [
                    {
                        currentWord: currentWord,
                        suggestions: suggests
                    }
                ];
            }, function (err) {
                return [];
            });
        };
        SuggestSupport.prototype.getSuggestionDetails = function (resource, position, suggestion) {
            var _this = this;
            if (suggestion.type === 'snippet') {
                return monaco.Promise.as(suggestion);
            }
            var args = {
                file: this.client.asAbsolutePath(resource),
                line: position.lineNumber,
                offset: position.column,
                entryNames: [
                    suggestion.label
                ]
            };
            return this.client.execute('completionEntryDetails', args).then(function (response) {
                var details = response.body;
                if (details && details.length > 0) {
                    var detail = details[0];
                    suggestion.documentationLabel = Previewer.plain(detail.documentation);
                    suggestion.typeLabel = Previewer.plain(detail.displayParts);
                }
                if (_this.config.useCodeSnippetsOnMethodSuggest && _this.monacoTypeFromEntryKind(detail.kind) === 'function') {
                    var codeSnippet = detail.name, suggestionArgumentNames;
                    suggestionArgumentNames = detail.displayParts.filter(function (part) { return part.kind === 'parameterName'; }).map(function (part) { return ("{{" + part.text + "}}"); });
                    if (suggestionArgumentNames.length > 0) {
                        codeSnippet += '(' + suggestionArgumentNames.join(', ') + '){{}}';
                    }
                    else {
                        codeSnippet += '()';
                    }
                    suggestion.codeSnippet = codeSnippet;
                }
                return suggestion;
            }, function (err) {
                return suggestion;
            });
        };
        SuggestSupport.prototype.monacoTypeFromEntryKind = function (kind) {
            switch (kind) {
                case PConst.Kind.primitiveType:
                case PConst.Kind.keyword:
                    return 'keyword';
                case PConst.Kind.variable:
                case PConst.Kind.localVariable:
                case PConst.Kind.memberVariable:
                case PConst.Kind.memberGetAccessor:
                case PConst.Kind.memberSetAccessor:
                    return 'field';
                case PConst.Kind.function:
                case PConst.Kind.memberFunction:
                case PConst.Kind.constructSignature:
                case PConst.Kind.callSignature:
                    return 'function';
            }
            return kind;
        };
        return SuggestSupport;
    })();
    return SuggestSupport;
});
