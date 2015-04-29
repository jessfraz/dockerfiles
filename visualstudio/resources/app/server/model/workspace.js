/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
/// <reference path="../declare/node.d.ts" />
'use strict';
define(["require", "exports", 'assert', 'path', '../contrib/contributions', '../lib/utils', '../lib/uri', '../lib/extpath', '../lib/strings'], function (require, exports, assert, npath, contributions, utils, uri, extpath, strings) {
    var Workspace = (function () {
        function Workspace(mixin) {
            utils.mixin(this, mixin);
            this.path = npath.normalize(this.path);
        }
        /**
         * Convert this object into a form suitable for JSON serialization. Depending on the method being called,
         * additional info will be resolved.
         */
        Workspace.prototype.serialize = function (server) {
            var root = this.getQualifier();
            var serializedWorkspace = {
                resource: uri.file(this.path).toString(),
                // Spec Part
                uri: this.id,
                name: this.name,
                // Services
                events: server.options.siteRoot + '/api/events' + root,
                // Non Spec Part
                ctime: this.ctime,
                id: this.id,
                mtime: this.mtime
            };
            // Collect routes from contributions
            var contributionManager = contributions.ContributionManager;
            return contributionManager.getRestEndPoints(server, this).then(function (endPoints) {
                if (endPoints) {
                    Object.keys(endPoints).forEach(function (key) {
                        serializedWorkspace[key] = server.options.siteRoot + endPoints[key];
                    });
                }
                return serializedWorkspace;
            });
        };
        /**
         * Returns the absolute path from the workspace root to the provided relative path which must be
         * within the workspace location.
         */
        Workspace.prototype.toAbsolutePath = function (relativePath) {
            var absolutePath = this.path;
            var result = absolutePath;
            if (relativePath) {
                result = extpath.join(result, relativePath);
            }
            result = npath.normalize(result);
            // Security: Prevent escape of workspace directory
            assert.equal(result.indexOf(absolutePath), 0, 'File path must be inside the workspace');
            return result;
        };
        /**
         * Returns the workspace relative path from the workspace root and the given absolute path which must
         * be within the workspace location.
         */
        Workspace.prototype.toRelativePath = function (absolutePath) {
            var fromAbsolutePath = this.path;
            assert.equal(absolutePath.indexOf(fromAbsolutePath), 0, 'File path must be inside the workspace');
            return absolutePath.substring(fromAbsolutePath.length);
        };
        Workspace.prototype.getQualifier = function () {
            return strings.bind('/{0}/', this.id);
        };
        return Workspace;
    })();
    exports.Workspace = Workspace;
    // Export Routing Parameter for Model
    exports.param = 'monacoWorkspaceId';
    function toString() {
        return ':' + exports.param + '([a-zA-Z0-9\\-_\\.$]+)';
    }
    exports.toString = toString;
    // Convert a workspace name to a workspace id
    function toId(name) {
        return name.replace(/[^a-zA-Z0-9\-_\.]/g, '_');
    }
    exports.toId = toId;
});
