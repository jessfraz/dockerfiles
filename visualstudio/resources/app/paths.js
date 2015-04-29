/*!---------------------------------------------------------
* Copyright (C) Microsoft Corporation. All rights reserved.
*--------------------------------------------------------*/
/// <reference path="./declare/node.d.ts" />
/// <reference path="./declare/atom-browser.d.ts" />
'use strict';
var path = require('path');
var sepCode = path.sep.charCodeAt(0);
function isEqualOrParent(pathToCheck, candidate) {
    if (!pathToCheck || !candidate) {
        return false;
    }
    pathToCheck = path.normalize(pathToCheck).toLowerCase();
    candidate = path.normalize(candidate).toLowerCase();
    if (pathToCheck === candidate) {
        return true;
    }
    if (pathToCheck.indexOf(candidate) !== 0) {
        return false;
    }
    var idx = candidate.length;
    if (candidate.charCodeAt(idx - 1) === sepCode) {
        idx -= 1;
    }
    return pathToCheck.charCodeAt(idx) === path.sep.charCodeAt(0);
}
exports.isEqualOrParent = isEqualOrParent;
