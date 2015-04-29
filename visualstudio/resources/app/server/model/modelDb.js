/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
/// <reference path='../declare/node.d.ts' />
'use strict';
define(["require", "exports", './workspace'], function (require, exports, workspace) {
    var Workspaces = (function () {
        function Workspaces(engine) {
            this.engine = engine;
        }
        Workspaces.prototype.toString = function () {
            return this.engine.toString();
        };
        Workspaces.prototype.close = function () {
            // no-op
        };
        Workspaces.prototype.createWorkspace = function (attributes, callback) {
            var id = attributes.id;
            if (!id) {
                return callback(new Error('A workspace needs an identifier or name.'), null);
            }
            return this.engine.create('workspace', Workspaces.PRIMARY_WS_KEY, id, attributes, modelFactory(workspace.Workspace, callback));
        };
        Workspaces.prototype.getWorkspaces = function (callback) {
            this.engine.query('workspace', { key1: Workspaces.PRIMARY_WS_KEY }, modelFactory(workspace.Workspace, callback));
        };
        Workspaces.prototype.getWorkspace = function (id, callback) {
            this.engine.query('workspace', { key1: Workspaces.PRIMARY_WS_KEY, key2: id }, modelFactory(workspace.Workspace, callback));
        };
        Workspaces.prototype.removeWorkspace = function (id, callback) {
            this.engine.del('workspace', Workspaces.PRIMARY_WS_KEY, id, callback);
        };
        Workspaces.PRIMARY_WS_KEY = 'ws';
        return Workspaces;
    })();
    exports.Workspaces = Workspaces;
    function modelFactory(ctor, callback) {
        return function (err, result) {
            if (err) {
                return callback(err, null);
            }
            if (!result) {
                return callback(null, null);
            }
            if (Array.isArray(result)) {
                var results = [];
                result.forEach(function (element) {
                    results.push(new ctor(element));
                });
                return callback(null, results);
            }
            return callback(null, new ctor(result));
        };
    }
});
