/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
'use strict';
define(["require", "exports", './strings'], function (require, exports, strings) {
    /**
     * Throws an error with the provided message if the provided value does not evaluate to a true Javascript value.
     */
    function ok(value, message) {
        if (!value || value === null) {
            throw new Error(message ? strings.format('Assertion failed ({0})', message) : 'Assertion Failed');
        }
    }
    exports.ok = ok;
    /**
     * Throws an error with the provided message if the both values are not identical.
     */
    function equals(valueA, valueB, message) {
        if (valueA !== valueB || !valueA || !valueB) {
            throw new Error(message ? strings.format('Assertion failed ({0})', message) : 'Assertion Failed');
        }
    }
    exports.equals = equals;
});
