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
    var OutlineSupport = (function (_super) {
        __extends(OutlineSupport, _super);
        function OutlineSupport() {
            _super.apply(this, arguments);
        }
        OutlineSupport.prototype.getOutline = function (resource) {
            var _this = this;
            if (this.isInMemory(resource)) {
                return monaco.Promise.as([]);
            }
            return this.server().then(function (value) {
                return value.makeRequest(omnisharp.Protocol.CurrentFileMembersAsTree, {
                    Filename: _this.filename(resource)
                }).then(function (tree) {
                    var ret = [];
                    tree.TopLevelTypeDefinitions.map(function (node) { return OutlineSupport._toEntry(ret, node); });
                    return ret;
                });
            });
        };
        OutlineSupport._toEntry = function (container, node) {
            var ret = {
                type: kinds[node.Kind] || 'property',
                label: node.Location.Text,
                range: {
                    startLineNumber: node.Location.Line,
                    startColumn: node.Location.Column,
                    endLineNumber: node.Location.EndLine,
                    endColumn: node.Location.EndColumn
                }
            };
            if (node.ChildNodes) {
                ret.children = [];
                node.ChildNodes.forEach(function (value) { return OutlineSupport._toEntry(ret.children, value); });
            }
            container.push(ret);
        };
        return OutlineSupport;
    })(AbstractSupport);
    var kinds = Object.create(null);
    kinds['VariableDeclaration'] = 'variable';
    kinds['StructDeclaration'] = 'interface';
    kinds['InterfaceDeclaration'] = 'interface';
    kinds['EnumDeclaration'] = 'enum';
    kinds['EnumMemberDeclaration'] = 'property';
    kinds['PropertyDeclaration'] = 'property';
    kinds['ClassDeclaration'] = 'class';
    kinds['FieldDeclaration'] = 'property';
    kinds['EventFieldDeclaration'] = 'property';
    kinds['MethodDeclaration'] = 'method';
    return OutlineSupport;
});
