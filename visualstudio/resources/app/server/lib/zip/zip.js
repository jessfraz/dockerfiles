/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
/// <reference path="../../declare/node.d.ts" />
'use strict';
define(["require", "exports", 'path', '../edge'], function (require, exports, path, edge) {
    var fnCache = {}; // never lookup the function through edge more than once
    function loadFunction(wwwRoot, fnName) {
        if (fnCache[fnName]) {
            return fnCache[fnName];
        }
        var assemblyFile = path.join(wwwRoot, 'lib\\zip\\zip.dll');
        var fn = edge.func({
            assemblyFile: assemblyFile,
            typeName: 'zip.Lib',
            methodName: fnName
        });
        fnCache[fnName] = fn;
        return fn;
    }
    /**
     * Creates an archive from the provided folder and stores it under the path specified. The wwwRoot parameter
     * should be set to help this library find its resources. The result callback only contains any possible error
     * that happend during the operation.
     */
    function createFromDirectory(folder, archive, wwwRoot, callback) {
        var fn = loadFunction(wwwRoot, 'CreateFromDirectory');
        fn({
            folder: folder,
            archive: archive
        }, function (error, errorMessage) {
            callback(error || errorMessage ? new Error(errorMessage) : null);
        });
    }
    exports.createFromDirectory = createFromDirectory;
    /**
     * Extracts an archive from the provided archive and stores it under the path specified. The wwwRoot parameter
     * should be set to help this library find its resources. The result callback only contains any possible error
     * that happend during the operation.
     */
    function extractToDirectory(folder, archive, wwwRoot, callback) {
        var fn = loadFunction(wwwRoot, 'ExtractToDirectory');
        fn({
            folder: folder,
            archive: archive
        }, function (error, errorMessage) {
            callback(error || errorMessage ? new Error(errorMessage) : null);
        });
    }
    exports.extractToDirectory = extractToDirectory;
    function extractToDirectorySync(folder, archive, wwwRoot) {
        var fn = loadFunction(wwwRoot, 'ExtractToDirectorySync');
        return fn({
            folder: folder,
            archive: archive
        }, true);
    }
    exports.extractToDirectorySync = extractToDirectorySync;
});
