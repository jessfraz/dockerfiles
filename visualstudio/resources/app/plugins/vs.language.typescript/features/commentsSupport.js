/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
/// <reference path="../../declares.d.ts" />
'use strict';
define(["require", "exports"], function (require, exports) {
    var CommentsSupport = (function () {
        function CommentsSupport() {
            this.commentsConfiguration = {
                lineCommentTokens: ['//'],
                blockCommentStartToken: '/*',
                blockCommentEndToken: '*/'
            };
        }
        return CommentsSupport;
    })();
    return CommentsSupport;
});
