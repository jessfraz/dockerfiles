/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
'use strict';
define(["require", "exports", './git.config', './rawGitService', '../../lib/service', './nativeRawGitService.impl'], function (require, exports, config, service, servicelib, impl) {
    function createNativeRawGitService(basePath) {
        return config.findGit().then(function (gitPath) {
            var connection = servicelib.createService(service.RawGitService, __dirname + '/gitApp.js', {
                timeout: 1000 * 60,
                args: [gitPath, basePath]
            });
            return connection.service;
        }, function () { return new impl.NativeRawGitService(null, null); });
    }
    exports.createNativeRawGitService = createNativeRawGitService;
});
