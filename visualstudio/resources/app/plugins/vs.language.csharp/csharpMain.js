/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
/// <reference path="../declares.d.ts" />
'use strict';
define(["require", "exports", './csharpDef', 'monaco'], function (require, exports, csharpDef, monaco) {
    monaco.Modes.registerMonarchDefinition('csharp', csharpDef.language);
});
