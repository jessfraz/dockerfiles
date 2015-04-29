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
    var GotoDeclSupport = (function (_super) {
        __extends(GotoDeclSupport, _super);
        function GotoDeclSupport() {
            _super.apply(this, arguments);
        }
        GotoDeclSupport.prototype.findDeclaration = function (resource, position) {
            if (this.isInMemory(resource)) {
                return monaco.Promise.as(null);
            }
            var request = {
                Filename: this.filename(resource),
                Line: position.lineNumber,
                Column: position.column
            };
            return this.server().then(function (value) { return value.makeRequest(omnisharp.Protocol.GoToDefinition, request).then(function (value) {
                if (!value || !value.FileName) {
                    return;
                }
                return {
                    range: { startLineNumber: value.Line, startColumn: value.Column, endLineNumber: value.Line, endColumn: value.Column },
                    resourceUrl: new monaco.URL(monaco.URI.file(value.FileName))
                };
            }); });
        };
        return GotoDeclSupport;
    })(AbstractSupport);
    return GotoDeclSupport;
});
