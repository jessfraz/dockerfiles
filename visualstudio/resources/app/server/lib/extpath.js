/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
/// <reference path="../declare/node.d.ts" />
'use strict';
define(["require", "exports", 'path', './strings', './utils'], function (require, exports, path, strings, utils) {
    var OS_PATH_DIVIDER = utils.isWindows() ? '\\' : '/';
    var FOREIGN_PATH_DIVIDER = utils.isWindows() ? '/' : '\\';
    function normalize(pathVal) {
        pathVal = path.normalize(pathVal); // Normalize the path (removes ".." and converts "/" to "\" on windows)
        if (pathVal === OS_PATH_DIVIDER) {
            return pathVal;
        }
        pathVal = strings.rtrim(pathVal, OS_PATH_DIVIDER); // Remove any trailing path segment
        return pathVal;
    }
    exports.normalize = normalize;
    function doJoin(pathA, pathB) {
        pathA = strings.replaceAll(pathA, FOREIGN_PATH_DIVIDER, OS_PATH_DIVIDER);
        pathB = strings.replaceAll(pathB, FOREIGN_PATH_DIVIDER, OS_PATH_DIVIDER);
        var pathANormalized = strings.rtrim(pathA, OS_PATH_DIVIDER);
        var pathBNormalized = strings.ltrim(pathB, OS_PATH_DIVIDER);
        return pathANormalized + OS_PATH_DIVIDER + pathBNormalized;
    }
    function join() {
        var paths = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            paths[_i - 0] = arguments[_i];
        }
        if (paths.length === 0) {
            throw new Error();
        }
        var result = paths[0];
        for (var i = 1; i < paths.length; i++) {
            result = doJoin(result, paths[i]);
        }
        return result;
    }
    exports.join = join;
    function split(pathVal) {
        pathVal = strings.replaceAll(pathVal, FOREIGN_PATH_DIVIDER, OS_PATH_DIVIDER);
        return pathVal.split(OS_PATH_DIVIDER);
    }
    exports.split = split;
    function getName(pathVal) {
        pathVal = strings.replaceAll(pathVal, FOREIGN_PATH_DIVIDER, OS_PATH_DIVIDER);
        var lastIndexOfDivider = pathVal.lastIndexOf(OS_PATH_DIVIDER);
        // pathVal === /
        if (pathVal === OS_PATH_DIVIDER) {
            return '';
        }
        // pathVal doesn't contain /
        if (lastIndexOfDivider === -1) {
            return pathVal;
        }
        // pathVal ends with /
        if (strings.endsWith(pathVal, OS_PATH_DIVIDER)) {
            pathVal = strings.rtrim(pathVal, OS_PATH_DIVIDER);
            lastIndexOfDivider = pathVal.lastIndexOf(OS_PATH_DIVIDER);
        }
        if (pathVal.length > lastIndexOfDivider + 1) {
            return pathVal.substring(lastIndexOfDivider + 1);
        }
        return pathVal;
    }
    exports.getName = getName;
    function isUNCPath(path) {
        return path.indexOf('\\\\') === 0;
    }
    exports.isUNCPath = isUNCPath;
});
