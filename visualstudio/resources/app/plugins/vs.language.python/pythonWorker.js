/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
/// <reference path="../declares.d.ts" />
'use strict';
define(["require", "exports", 'monaco'], function (require, exports, monaco) {
    var InplaceReplaceSupport = monaco.Modes.InplaceReplaceSupport;
    InplaceReplaceSupport.register('python', InplaceReplaceSupport.create({
        textReplace: function (value, up) {
            return InplaceReplaceSupport.valueSetReplace(['True', 'False'], value, up);
        }
    }));
    //export var do2 = (x: number): monaco.Promise<number> => {
    //	return monaco.Promise.as(x + 5);
    //};
    exports._TS_FORCE_EXTERNAL = true;
});
