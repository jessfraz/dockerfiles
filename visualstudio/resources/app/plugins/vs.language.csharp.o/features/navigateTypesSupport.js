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
    function getType(symbolInfo) {
        switch (symbolInfo.Kind) {
            case 'Method': return 'method';
            case 'Field':
            case 'Property':
                return 'property';
        }
        return 'class';
    }
    function getName(symbolInfo) {
        var name = symbolInfo.Text;
        for (var i = 0; i < name.length; i++) {
            var ch = name.charAt(i);
            if (ch === '<' || ch === '(') {
                return name.substr(0, i);
            }
        }
        return name;
    }
    var NavigateTypesSupport = (function (_super) {
        __extends(NavigateTypesSupport, _super);
        function NavigateTypesSupport() {
            _super.apply(this, arguments);
        }
        NavigateTypesSupport.prototype.getNavigateToItems = function (search) {
            return this.server().then(function (value) {
                return value.makeRequest(omnisharp.Protocol.FindSymbols, {
                    Filter: search,
                    Filename: ''
                }).then(function (res) {
                    return !res || arrays.isFalsyOrEmpty(res.QuickFixes) ? [] : res.QuickFixes.map(NavigateTypesSupport.asTypeBearing);
                }, function (error) {
                    return monaco.Promise.wrapError('Problem invoking \'FindSymbols\' on OmniSharp server: ' + error);
                });
            });
        };
        NavigateTypesSupport.asTypeBearing = function (symbolInfo) {
            var uri = monaco.URI.file(symbolInfo.FileName);
            var name = getName(symbolInfo);
            return {
                containerName: '',
                name: name,
                parameters: symbolInfo.Text.substr(name.length),
                type: getType(symbolInfo),
                resourceUri: uri,
                range: {
                    startLineNumber: symbolInfo.Line,
                    startColumn: symbolInfo.Column,
                    endLineNumber: symbolInfo.EndLine,
                    endColumn: symbolInfo.EndColumn
                }
            };
        };
        return NavigateTypesSupport;
    })(AbstractSupport);
    return NavigateTypesSupport;
});
