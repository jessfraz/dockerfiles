/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
'use strict';
define(["require", "exports", '../../platform'], function (require, exports, Platform) {
    var registryKey = 'com.microsoft.vs.platform.buildSystemRegistry';
    var contributions = {};
    Platform.Registry.add(registryKey, {
        registerContribution: function (contribution) {
            contributions[contribution.id] = contribution;
        },
        getContribution: function (id) {
            return contributions[id];
        },
        getContributions: function () {
            var result = [];
            Object.keys(contributions).forEach(function (key) {
                result.push(contributions[key]);
            });
            return result;
        }
    });
    exports.BuildSystemRegistry = Platform.Registry.as(registryKey);
});
