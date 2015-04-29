/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
/// <reference path="../declares.d.ts" />
'use strict';
define(["require", "exports", './pythonDef', 'monaco'], function (require, exports, pythonDef, monaco) {
    monaco.Modes.registerMonarchDefinition('python', pythonDef.language);
    monaco.Modes.loadInBackgroundWorker(require.toUrl('./pythonWorker.js')).then(function (workerPiece) {
        // worker piece loaded OK
        //	workerPiece.do2(3).then(function (r) {
        //		console.log('result: ', r);
        //	});
    }, function (err) {
        console.error(err);
    });
});
