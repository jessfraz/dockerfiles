/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
/// <reference path="../../declares.d.ts" />
'use strict';
define(["require", "exports", 'monaco', '../protocol.const'], function (require, exports, monaco, PConst) {
    var outlineTypeTable = Object.create(null);
    outlineTypeTable[PConst.Kind.module] = 'module';
    outlineTypeTable[PConst.Kind.class] = 'class';
    outlineTypeTable[PConst.Kind.enum] = 'enum';
    outlineTypeTable[PConst.Kind.interface] = 'interface';
    outlineTypeTable[PConst.Kind.memberFunction] = 'method';
    outlineTypeTable[PConst.Kind.memberVariable] = 'property';
    outlineTypeTable[PConst.Kind.memberGetAccessor] = 'property';
    outlineTypeTable[PConst.Kind.memberSetAccessor] = 'property';
    outlineTypeTable[PConst.Kind.variable] = 'variable';
    outlineTypeTable[PConst.Kind.const] = 'variable';
    outlineTypeTable[PConst.Kind.localVariable] = 'variable';
    outlineTypeTable[PConst.Kind.variable] = 'variable';
    outlineTypeTable[PConst.Kind.function] = 'function';
    outlineTypeTable[PConst.Kind.localFunction] = 'function';
    function textSpan2Range(value) {
        return {
            startLineNumber: value.start.line,
            startColumn: value.start.offset,
            endLineNumber: value.end.line,
            endColumn: value.end.offset
        };
    }
    var OutlineSupport = (function () {
        function OutlineSupport(ctx, client) {
            this.client = client;
        }
        OutlineSupport.prototype.getOutline = function (resource) {
            var args = {
                file: this.client.asAbsolutePath(resource)
            };
            if (!args.file) {
                return monaco.Promise.as([]);
            }
            function compare(a, b) {
                if (a.range.startLineNumber < b.range.startLineNumber) {
                    return -1;
                }
                else if (a.range.startLineNumber > b.range.startLineNumber) {
                    return 1;
                }
                else if (a.range.startColumn < b.range.startColumn) {
                    return -1;
                }
                else if (a.range.startColumn > b.range.startColumn) {
                    return 1;
                }
                else {
                    return 0;
                }
            }
            function convert(item) {
                var result = {
                    label: item.text,
                    type: outlineTypeTable[item.kind] || 'variable',
                    range: textSpan2Range(item.spans[0])
                };
                if (item.childItems && item.childItems.length > 0) {
                    result.children = item.childItems.map(function (child) { return convert(child); }).sort(compare);
                }
                return result;
            }
            return this.client.execute('navbar', args).then(function (response) {
                var items = response.body;
                return items ? items.map(function (item) { return convert(item); }).sort(compare) : [];
            }, function (err) {
                return [];
            });
        };
        return OutlineSupport;
    })();
    return OutlineSupport;
});
