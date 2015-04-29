/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
/// <reference path="../declares.d.ts" />
'use strict';
define(["require", "exports", './objective-cDef', 'monaco'], function (require, exports, objectiveCDef, monaco) {
    monaco.Modes.registerMonarchDefinition('objective-c', objectiveCDef.language);
});
