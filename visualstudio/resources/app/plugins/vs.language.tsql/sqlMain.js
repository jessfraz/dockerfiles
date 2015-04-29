/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
/// <reference path="../declares.d.ts" />
'use strict';
define(["require", "exports", 'monaco', './sqlDef'], function (require, exports, monaco, sqlDef) {
    monaco.Modes.registerMonarchDefinition('sql', sqlDef.language);
});
