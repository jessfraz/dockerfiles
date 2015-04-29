/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
/// <reference path="../declares.d.ts" />
'use strict';
define(["require", "exports", './vbDef', 'monaco'], function (require, exports, languageDef, monaco) {
    monaco.Modes.registerMonarchDefinition('vb', languageDef.language);
    monaco.Modes.loadInBackgroundWorker(require.toUrl('./vbWorker.js')).then(function (workerPiece) {
        // worker piece loaded OK
    }, function (err) {
        console.error(err);
    });
});
