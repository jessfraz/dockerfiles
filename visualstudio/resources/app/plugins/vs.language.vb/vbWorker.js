/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
/// <reference path="../declares.d.ts" />
'use strict';
define(["require", "exports", 'monaco'], function (require, exports, monaco) {
    var InplaceReplaceSupport = monaco.Modes.InplaceReplaceSupport;
    var modifiersArr = ['Private', 'Public', 'Friend', 'ReadOnly', 'Partial', 'Protected', 'WriteOnly'];
    var valueSets = ['True', 'False'];
    InplaceReplaceSupport.register('vb', InplaceReplaceSupport.create({
        textReplace: function (value, up) {
            return InplaceReplaceSupport.valueSetsReplace([modifiersArr, valueSets], value, up);
        }
    }));
    exports._TS_FORCE_EXTERNAL = true;
});
