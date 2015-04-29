/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
/// <reference path="../declares.d.ts" />
'use strict';
define(["require", "exports", './dockerfileDef', 'monaco'], function (require, exports, dockerfileDef, monaco) {
    monaco.Modes.registerMonarchDefinition('dockerfile', dockerfileDef.language);
});
