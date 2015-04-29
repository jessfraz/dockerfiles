/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
/// <reference path="../declares.d.ts" />
'use strict';
define(["require", "exports", './fsharpDef', 'monaco'], function (require, exports, languageDef, monaco) {
    monaco.Modes.registerMonarchDefinition('fsharp', languageDef.language);
});
