/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
/// <reference path="./declare/node.d.ts" />
'use strict';
define(["require", "exports", './lib/types', './lib/assert'], function (require, exports, types, assert) {
    var ids = {};
    exports.Registry = {
        /**
         * Adds the extension functions and properties defined by data to the platform. The
         * provided id must be unique.
         */
        add: function (id, extension) {
            assert.ok(types.isString(id));
            assert.ok(types.isObject(extension));
            assert.ok(typeof ids[id] === 'undefined', 'There is already an extension with this id');
            ids[id] = extension;
        },
        /**
         * Returns true iff there is an extension with the provided id.
         */
        knows: function (id) {
            assert.ok(types.isString(id));
            return !!ids[id];
        },
        /**
         * Returns the extension functions and properties defined by the specified key or null.
         */
        as: function (id) {
            assert.ok(types.isString(id));
            return ids[id] || null;
        }
    };
    var serviceRegistryKey = 'com.microsoft.vs.platform.serviceRegistry';
    var services = {};
    exports.Registry.add(serviceRegistryKey, {
        registerService: function (service) {
            services[service.name()] = service;
        },
        getService: function (id) {
            return services[id];
        },
        getInjectorService: function () {
            return services['injectorService'];
        },
        getServices: function () {
            var result = [];
            Object.keys(services).forEach(function (key) {
                result.push(services[key]);
            });
            return result;
        },
        getServicesMap: function () {
            var result = {};
            Object.keys(services).forEach(function (key) {
                result[key] = services[key];
            });
            return result;
        }
    });
    exports.ServiceRegistry = exports.Registry.as(serviceRegistryKey);
});
