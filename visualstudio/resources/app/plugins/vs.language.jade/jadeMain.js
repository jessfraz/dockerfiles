/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
/// <reference path="../declares.d.ts" />
'use strict';
define(["require", "exports", './jadeDef', 'monaco'], function (require, exports, languageDef, monaco) {
    monaco.Modes.registerMonarchDefinition('jade', languageDef.language);
});
