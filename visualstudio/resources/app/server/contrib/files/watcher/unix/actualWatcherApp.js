/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
'use strict';
define(["require", "exports", '../../../../lib/service', './chokidarWatcherService'], function (require, exports, service, ChokidarWatcherService) {
    service.run(new ChokidarWatcherService());
});
