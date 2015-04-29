/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
/// <reference path="../../declare/node.d.ts" />
'use strict';
define(["require", "exports", 'path', '../edge'], function (require, exports, path, edge) {
    var _getProcessTree;
    function loadGetProcessTreeFn(wwwRoot) {
        if (_getProcessTree) {
            return _getProcessTree;
        }
        var assemblyFile = path.join(wwwRoot, 'lib\\process\\processUtils.dll');
        _getProcessTree = edge.func({
            assemblyFile: assemblyFile,
            typeName: 'ProcessUtils',
            methodName: 'GetChildProcesses'
        });
        return _getProcessTree;
    }
    function getProcessTree(wwwRoot, pid, callback) {
        try {
            loadGetProcessTreeFn(wwwRoot)(pid, callback);
        }
        catch (e) {
            callback(e);
        }
    }
    exports.getProcessTree = getProcessTree;
});
