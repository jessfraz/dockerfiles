/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
/// <reference path="../../declare/node.d.ts" />
'use strict';
define(["require", "exports", 'assert'], function (require, exports, assert) {
    var FileMatch = (function () {
        function FileMatch(resource) {
            this.resource = resource.toString();
            this.lineMatches = [];
        }
        FileMatch.prototype.addMatch = function (lineMatch) {
            assert.ok(lineMatch, 'Missing parameter (lineMatch = ' + lineMatch + ')');
            this.lineMatches.push(lineMatch);
        };
        FileMatch.prototype.isEmpty = function () {
            return this.lineMatches.length === 0;
        };
        FileMatch.prototype.serialize = function () {
            var lineMatches = [];
            for (var i = 0; i < this.lineMatches.length; i++) {
                lineMatches.push(this.lineMatches[i].serialize());
            }
            return {
                resource: this.resource,
                lineMatches: lineMatches
            };
        };
        return FileMatch;
    })();
    exports.FileMatch = FileMatch;
    var LineMatch = (function () {
        function LineMatch(preview, lineNumber) {
            assert.ok(preview, 'Missing parameter (content = ' + preview + ')');
            assert.ok(!isNaN(Number(lineNumber)) && lineNumber >= 0, 'LineNumber must be positive');
            this.preview = preview.replace(/(\r|\n)*$/, '');
            this.lineNumber = lineNumber;
            this.offsetAndLengths = [];
        }
        LineMatch.prototype.getText = function () {
            return this.preview;
        };
        LineMatch.prototype.getLineNumber = function () {
            return this.lineNumber;
        };
        LineMatch.prototype.addMatch = function (offset, length) {
            assert.ok(!isNaN(Number(offset)) && offset >= 0, 'Offset must be positive');
            assert.ok(!isNaN(Number(length)) && length >= 0, 'Length must be positive');
            this.offsetAndLengths.push([offset, length]);
        };
        LineMatch.prototype.serialize = function () {
            var result = {
                preview: this.preview,
                lineNumber: this.lineNumber,
                offsetAndLengths: this.offsetAndLengths
            };
            return result;
        };
        return LineMatch;
    })();
    exports.LineMatch = LineMatch;
});
