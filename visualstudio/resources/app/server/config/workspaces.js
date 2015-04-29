/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
/// <reference path="../declare/node.d.ts" />
'use strict';
define(["require", "exports", 'fs', '../lib/extpath', '../lib/extfs', '../lib/flow', '../model/workspace'], function (require, exports, fs, extpath, extfs, flow, workspace) {
    function configure(server, next) {
        // Validate workspace 
        if (!server.options.workspacesRoot) {
            return next(new Error('Missing workspacesRoot configuration parameter.'));
        }
        var fsStat;
        try {
            fsStat = fs.statSync(server.options.workspacesRoot);
        }
        catch (error) {
            throw new Error('Could not open workspaces root folder "' + server.options.workspacesRoot + '" for reading. Error: ' + error);
        }
        if (fsStat === null) {
            throw new Error('Workspaces root folder "' + server.options.workspacesRoot + '" does not exist.');
        }
        else if (!fsStat.isDirectory()) {
            throw new Error('Workspaces root folder "' + server.options.workspacesRoot + '" is not a directory.');
        }
        // Create workspace per folder in workspacesRoot
        extfs.readdir(server.options.workspacesRoot, function (file) {
            return file.isDirectory();
        }, function (error, folders) {
            if (error) {
                return next(error);
            }
            // For each folder in workspacesRoot
            flow.loop(folders, function (folder, callback) {
                flow.sequence(function onError(error) {
                    callback(error, null);
                }, function statWorkspace() {
                    fs.stat(extpath.join(server.options.workspacesRoot, folder.name), this);
                }, function createWorkspace(stat) {
                    var workspaceObj = {
                        ctime: stat.ctime.getTime(),
                        id: workspace.toId(folder.name),
                        name: folder.name,
                        mtime: stat.mtime.getTime(),
                        path: extpath.join(server.options.workspacesRoot, folder.name)
                    };
                    server.workspaces.createWorkspace(workspaceObj, callback);
                });
            }, function (error, result) {
                if (error) {
                    return next(error);
                }
                server.logger.info('Serving workspaces from "' + server.options.workspacesRoot + '"');
                return next();
            });
        });
    }
    exports.configure = configure;
});
