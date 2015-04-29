/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
'use strict';
define(["require", "exports", '../../lib/service', './nativeRawGitService.impl'], function (require, exports, servicelib, impl) {
    servicelib.run(new impl.NativeRawGitService(process.argv[2], process.argv[3]));
});
