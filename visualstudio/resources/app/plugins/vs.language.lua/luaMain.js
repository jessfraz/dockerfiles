/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
/// <reference path="../declares.d.ts" />
'use strict';
define(["require", "exports", './luaDef', 'monaco'], function (require, exports, languageDef, monaco) {
    monaco.Modes.registerMonarchDefinition('lua', languageDef.language);
});
