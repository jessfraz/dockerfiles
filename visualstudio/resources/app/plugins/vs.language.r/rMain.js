/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
/// <reference path="../declares.d.ts" />
'use strict';
define(["require", "exports", './rDef', 'monaco'], function (require, exports, rDef, monaco) {
    monaco.Modes.registerMonarchDefinition('r', rDef.language);
});
