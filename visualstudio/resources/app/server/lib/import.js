/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
/// <reference path='../declare/node.d.ts' />
'use strict';
define(["require", "exports", 'fs', 'path', './extfs', './extpath', './flow', './compress'], function (require, exports, fs, path, extfs, extpath, flow, compress) {
    var sequence = flow.sequence;
    function populateWorkspaceWithSample(server, workspace, sampleId, callback) {
        var sampleSourceDir = path.join(server.options.wwwRoot, 'sample', sampleId);
        var workspaceTargetDir = workspace.toAbsolutePath();
        extfs.copy(sampleSourceDir, workspaceTargetDir, callback);
    }
    exports.populateWorkspaceWithSample = populateWorkspaceWithSample;
    function populateWorkspaceFromUpload(server, workspace, zipPath, zipName, callback) {
        var workspaceDir = workspace.toAbsolutePath();
        var targetZipPath = extpath.join(workspaceDir, zipName);
        sequence(callback, function copyFileToWorkspace() {
            extfs.mv(zipPath, targetZipPath, this);
        }, function unzipFileInWorkspace() {
            var options = {
                wwwRoot: server.options.wwwRoot
            };
            compress.uncompress(targetZipPath, workspaceDir, options, this);
        }, function deleteZipFile() {
            fs.unlink(targetZipPath, this);
        }, function done() {
            callback(null, workspace);
        });
    }
    exports.populateWorkspaceFromUpload = populateWorkspaceFromUpload;
    function populateWorkspaceWithRepository(server, workspace, repoURL, callback) {
        var workspaceDir = workspace.toAbsolutePath();
        server.tools.git.clone(workspaceDir, repoURL).done(function () { return callback(null); }, function (err) { return callback(err); });
    }
    exports.populateWorkspaceWithRepository = populateWorkspaceWithRepository;
});
