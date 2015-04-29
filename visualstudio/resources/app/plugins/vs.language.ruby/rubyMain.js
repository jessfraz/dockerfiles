/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
/// <reference path="../declares.d.ts" />
'use strict';
define(["require", "exports", './rubyDef', 'monaco'], function (require, exports, rubyDef, monaco) {
    monaco.Modes.registerMonarchDefinition('ruby', rubyDef.language);
    monaco.Modes.loadInBackgroundWorker(require.toUrl('./rubyWorker.js')).then(function (workerPiece) {
    }, function (err) {
        console.error(err);
    });
});
