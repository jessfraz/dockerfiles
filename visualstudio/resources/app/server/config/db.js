/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
/// <reference path="../declare/node.d.ts" />
'use strict';
define(["require", "exports", '../model/modelDb', '../lib/db/engines/inmemory', '../lib/db/engines/jsondb'], function (require, exports, modelDb, inmemory, jsondb) {
    function configure(server, next) {
        inmemory.open(function (err, engine) {
            if (err) {
                return next(err);
            }
            server.workspaces = new modelDb.Workspaces(engine);
            jsondb.open(server.options.storePath, function (err, result) {
                if (err) {
                    return next(err);
                }
                server.store = result;
                next();
            });
        });
    }
    exports.configure = configure;
});
