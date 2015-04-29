/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
/// <reference path="../../declares.d.ts" />
'use strict';
define(["require", "exports", 'monaco'], function (require, exports, monaco) {
    var FormattingSupport = (function () {
        function FormattingSupport(ctx, client) {
            this.autoFormatTriggerCharacters = [';', '}', '\n'];
            this.modelService = ctx.modelService;
            this.client = client;
            this.formatOptions = Object.create(null);
        }
        FormattingSupport.prototype.ensureFormatOptions = function (resource, options) {
            var _this = this;
            var key = resource.toString();
            var currentOptions = this.formatOptions[key];
            if (currentOptions && currentOptions.tabSize === options.tabSize && currentOptions.indentSize === options.tabSize && currentOptions.convertTabsToSpaces === options.insertSpaces) {
                return monaco.Promise.as(currentOptions);
            }
            else {
                var args = {
                    file: this.client.asAbsolutePath(resource),
                    formatOptions: this.getFormatOptions(options)
                };
                return this.client.execute('configure', args).then(function (response) {
                    _this.formatOptions[key] = args.formatOptions;
                    return args.formatOptions;
                });
            }
        };
        FormattingSupport.prototype.doFormat = function (resource, options, args) {
            var _this = this;
            var model = this.modelService.getModel(resource);
            var versionId = model.getVersionId();
            return this.ensureFormatOptions(resource, options).then(function () {
                return _this.client.execute('format', args).then(function (response) {
                    if (model.getVersionId() !== versionId) {
                        return [];
                    }
                    else {
                        return response.body.map(_this.codeEdit2SingleEditOperation);
                    }
                }, function (err) {
                    return [];
                });
            });
        };
        FormattingSupport.prototype.formatDocument = function (resource, options) {
            var model = this.modelService.getModel(resource);
            var lines = model.getLineCount();
            var args = {
                file: this.client.asAbsolutePath(resource),
                line: 1,
                offset: 1,
                endLine: lines,
                endOffset: model.getLineMaxColumn(lines),
                options: this.getFormatOptions(options)
            };
            return this.doFormat(resource, options, args);
        };
        FormattingSupport.prototype.formatRange = function (resource, range, options) {
            var args = {
                file: this.client.asAbsolutePath(resource),
                line: range.startLineNumber,
                offset: range.startColumn,
                endLine: range.endLineNumber,
                endOffset: range.endColumn,
                options: this.getFormatOptions(options)
            };
            return this.doFormat(resource, options, args);
        };
        FormattingSupport.prototype.formatAfterKeystroke = function (resource, position, ch, options) {
            var _this = this;
            var args = {
                file: this.client.asAbsolutePath(resource),
                line: position.lineNumber,
                offset: position.column,
                key: ch,
                options: this.getFormatOptions(options)
            };
            var model = this.modelService.getModel(resource);
            var versionId = model.getVersionId();
            return this.ensureFormatOptions(resource, options).then(function () {
                return _this.client.execute('formatonkey', args).then(function (response) {
                    if (model.getVersionId() !== versionId) {
                        return [];
                    }
                    else {
                        return response.body.map(_this.codeEdit2SingleEditOperation);
                    }
                }, function (err) {
                    return [];
                });
            });
        };
        FormattingSupport.prototype.codeEdit2SingleEditOperation = function (edit) {
            return {
                range: {
                    startLineNumber: edit.start.line,
                    startColumn: edit.start.offset,
                    endLineNumber: edit.end.line,
                    endColumn: edit.end.offset
                },
                text: edit.newText
            };
        };
        FormattingSupport.prototype.getFormatOptions = function (options) {
            return {
                tabSize: options.tabSize,
                indentSize: options.tabSize,
                convertTabsToSpaces: options.insertSpaces,
                // We can use \n here since the editor normalizes later on to its line endings.
                newLineCharacter: '\n'
            };
        };
        return FormattingSupport;
    })();
    return FormattingSupport;
});
