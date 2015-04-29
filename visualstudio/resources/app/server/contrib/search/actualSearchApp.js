/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
'use strict';
define(["require", "exports", 'graceful-fs', './rawSearchService', '../../lib/service'], function (require, exports, gracefulFS, raw, service) {
    // Force TS reference on gracefulFS
    if (typeof gracefulFS.readFileSync === 'function') {
    }
    service.run(new raw.RawSearchService());
});
