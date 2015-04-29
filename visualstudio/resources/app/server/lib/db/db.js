/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
'use strict';
define(["require", "exports"], function (require, exports) {
    var DBError = (function () {
        function DBError(message, code) {
            this.message = message;
            this.code = code;
        }
        return DBError;
    })();
    exports.DBError = DBError;
    // Error codes for the engines to implement
    exports.ERROR_DOES_NOT_EXIST = 'Does not exist';
    exports.ERROR_ALREADY_EXISTS = 'Already exists';
});
