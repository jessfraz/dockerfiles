/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
'use strict';
define(["require", "exports"], function (require, exports) {
    function disposeAll(arr) {
        for (var i = 0, len = arr.length; i < len; i++) {
            if (arr[i]) {
                arr[i].dispose();
            }
        }
        return [];
    }
    exports.disposeAll = disposeAll;
    function combinedDispose() {
        var disposables = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            disposables[_i - 0] = arguments[_i];
        }
        return {
            dispose: function () { return disposeAll(disposables); }
        };
    }
    exports.combinedDispose = combinedDispose;
    function cAll(functions) {
        while (functions.length > 0) {
            functions.pop()();
        }
        return functions;
    }
    exports.cAll = cAll;
});
