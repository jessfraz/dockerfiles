/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
'use strict';
define(["require", "exports", '../../../lib/system'], function (require, exports, winjs) {
    var handler = {
        getCredentials: function (req) {
            if (req.gitCommand === 'clone' && req.scope.protocol === 'https' && req.scope.host === 'monacotools.visualstudio.com' && req.scope.path.indexOf('DefaultCollection/Samples/_git/') === 0) {
                return winjs.Promise.as({
                    username: 'monacoaz2',
                    password: 'Zurich11'
                });
            }
            return winjs.Promise.wrapError('not available');
        },
        storeCredentials: function () { return winjs.Promise.wrapError('not implemented'); },
        eraseCredentials: function () { return winjs.Promise.wrapError('not implemented'); }
    };
    return handler;
});
