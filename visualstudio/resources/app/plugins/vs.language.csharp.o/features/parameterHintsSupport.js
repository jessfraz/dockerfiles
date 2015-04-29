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
define(["require", "exports", '../omnisharp', '../documentation', './abstractSupport'], function (require, exports, omnisharp, documentation, AbstractSupport) {
    var ParameterHintsSupport = (function (_super) {
        __extends(ParameterHintsSupport, _super);
        function ParameterHintsSupport() {
            _super.apply(this, arguments);
        }
        Object.defineProperty(ParameterHintsSupport.prototype, "triggerCharacters", {
            get: function () {
                return ['(', ','];
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ParameterHintsSupport.prototype, "excludeTokens", {
            get: function () {
                return ['comment.cs', 'string.cs', 'number.cs'];
            },
            enumerable: true,
            configurable: true
        });
        ParameterHintsSupport.prototype.getParameterHints = function (resource, position) {
            var _this = this;
            return this.server().then(function (value) {
                var req = {
                    Filename: _this.filename(resource),
                    Line: position.lineNumber,
                    Column: position.column
                };
                return value.makeRequest(omnisharp.Protocol.SignatureHelp, req).then(function (res) {
                    var ret = {
                        currentSignature: res.ActiveSignature,
                        currentParameter: res.ActiveParameter,
                        signatures: []
                    };
                    res.Signatures.forEach(function (signature) {
                        var _signature = {
                            documentation: documentation.plain(signature.Documentation),
                            label: signature.Name + '(',
                            parameters: []
                        };
                        signature.Parameters.forEach(function (parameter, i, a) {
                            var _parameter = {
                                documentation: documentation.plain(parameter.Documentation),
                                label: parameter.Label,
                                signatureLabelOffset: _signature.label.length,
                                signatureLabelEnd: _signature.label.length + parameter.Label.length
                            };
                            _signature.parameters.push(_parameter);
                            _signature.label += _parameter.label;
                            if (i < a.length - 1) {
                                _signature.label += ', ';
                            }
                        });
                        _signature.label += ')';
                        ret.signatures.push(_signature);
                    });
                    return ret;
                });
            });
        };
        return ParameterHintsSupport;
    })(AbstractSupport);
    return ParameterHintsSupport;
});
