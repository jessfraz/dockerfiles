/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
'use strict';
define(["require", "exports", '../../../lib/service', './globService'], function (require, exports, service, glob) {
    service.run(new glob.GlobRunner());
});
