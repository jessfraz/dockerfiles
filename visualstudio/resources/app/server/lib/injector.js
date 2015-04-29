/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
'use strict';
define(["require", "exports", './assert', './types'], function (require, exports, assert, types) {
    var Container = (function () {
        function Container() {
            this.map = {};
            this.parent = null;
        }
        Container.prototype.setParent = function (parent) {
            this.parent = parent;
        };
        Container.prototype.registerService = function (target, service) {
            assert.ok(!types.isUndefinedOrNull(target));
            assert.ok(!types.isUndefinedOrNull(service));
            this.map[target.toLowerCase()] = service;
            return service;
        };
        // injects the denoted services to the target
        Container.prototype.injectTo = function (target) {
            var _this = this;
            assert.ok(!types.isUndefinedOrNull(target));
            // Support arrays
            if (types.isArray(target)) {
                target.forEach(function (element) {
                    _this.injectTo(element);
                });
                return;
            }
            for (var key in target) {
                if (key.indexOf(Container.inject) !== 0) {
                    continue;
                }
                var element = target[key];
                if (!types.isFunction(element)) {
                    continue;
                }
                key = key.substring(Container.len).toLowerCase();
                var service = this.findService(key, target);
                if (types.isUndefinedOrNull(service)) {
                    continue;
                }
                // call inject function
                element.apply(target, [service]);
            }
        };
        Container.prototype.createChild = function () {
            var childContainer = new Container();
            childContainer.setParent(this);
            return childContainer;
        };
        Container.prototype.findService = function (key, target) {
            var result = this.map[key];
            if ((types.isUndefinedOrNull(result) || target === result) && this.parent !== null) {
                result = this.parent.findService(key, target);
            }
            return result;
        };
        Container.prototype.dispose = function () {
            this.map = null;
            this.parent = null;
        };
        Container.inject = 'inject';
        Container.len = Container.inject.length;
        return Container;
    })();
    exports.Container = Container;
});
