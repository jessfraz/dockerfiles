/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
'use strict';
define(["require", "exports", 'path', '../../lib/service', './rawSearchService'], function (require, exports, path, service, rawsearch) {
    function createService() {
        return service.createService(rawsearch.RawSearchService, path.join(__dirname, 'searchApp.js'), { timeout: 60 * 1000 }).service;
    }
    exports.createService = createService;
});
