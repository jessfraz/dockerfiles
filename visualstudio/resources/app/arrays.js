/*!---------------------------------------------------------
* Copyright (C) Microsoft Corporation. All rights reserved.
*--------------------------------------------------------*/
'use strict';
function distinct(array, keyFn) {
    if (!keyFn) {
        return array.filter(function (element, position) {
            return array.indexOf(element) === position;
        });
    }
    var seen = {};
    return array.filter(function (elem) {
        var key = keyFn(elem);
        if (seen[key]) {
            return false;
        }
        seen[key] = true;
        return true;
    });
}
exports.distinct = distinct;
function coalesce(array) {
    var result = [];
    for (var i = 0; i < array.length; i++) {
        var element = array[i];
        if (element) {
            result.push(element);
        }
    }
    return result;
}
exports.coalesce = coalesce;
