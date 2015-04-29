/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
'use strict';
define(["require", "exports"], function (require, exports) {
    function httpError(statusCode, message) {
        var error = Error.apply(null, Array.prototype.slice.call(arguments, 1));
        error.statusCode = statusCode;
        return error;
    }
    exports.httpError = httpError;
    function asHttpError(statusCode, error, message) {
        var result = Error.apply(null, Array.prototype.slice.call(arguments, 2));
        result.message = message || error.message;
        result.stack = error.stack;
        result.statusCode = statusCode;
        result.data = error;
        return result;
    }
    exports.asHttpError = asHttpError;
    /**
     * Returns an error that signals cancelation.
     */
    function canceled() {
        return new Error('Canceled');
    }
    exports.canceled = canceled;
    /**
     * Checks if the given error is a promise in canceled state
     */
    function isPromiseCanceledError(error) {
        return error instanceof Error && error.name === 'Canceled' && error.message === 'Canceled';
    }
    exports.isPromiseCanceledError = isPromiseCanceledError;
});
