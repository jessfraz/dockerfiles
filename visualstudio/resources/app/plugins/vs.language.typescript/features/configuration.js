/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
/// <reference path="../../declares.d.ts" />
'use strict';
define(["require", "exports"], function (require, exports) {
    exports.defaultConfiguration = {
        useCodeSnippetsOnMethodSuggest: false
    };
    function load(myPluginId, configurationService) {
        return configurationService.loadConfiguration(myPluginId).then(function (config) {
            if (!config) {
                return exports.defaultConfiguration;
            }
            return config;
        });
    }
    exports.load = load;
});
