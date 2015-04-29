/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
/// <reference path="../declares.d.ts" />
'use strict';
define(["require", "exports", 'monaco'], function (require, exports, monaco) {
    var InplaceReplaceSupport = monaco.Modes.InplaceReplaceSupport;
    InplaceReplaceSupport.register('ruby', InplaceReplaceSupport.create({
        textReplace: function (value, up) {
            return InplaceReplaceSupport.valueSetReplace(['true', 'false'], value, up);
        }
    }));
    exports._TS_FORCE_EXTERNAL = true;
});
