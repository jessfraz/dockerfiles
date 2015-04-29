/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
/// <reference path="../../declare/node.d.ts" />
/// <reference path="../../declare/express.d.ts" />
'use strict';
define(["require", "exports"], function (require, exports) {
    /**
     * Change type indicating whether a file delta is a
     * CHANGED, CREATED or DELETED event.
     */
    (function (ChangeTypes) {
        ChangeTypes[ChangeTypes["CHANGED"] = 0] = "CHANGED";
        ChangeTypes[ChangeTypes["CREATED"] = 1] = "CREATED";
        ChangeTypes[ChangeTypes["DELETED"] = 2] = "DELETED";
    })(exports.ChangeTypes || (exports.ChangeTypes = {}));
    var ChangeTypes = exports.ChangeTypes;
});
