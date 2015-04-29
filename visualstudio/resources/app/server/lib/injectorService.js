/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
'use strict';
define(["require", "exports", './injector', './assert', './types'], function (require, exports, Inject, Assert, Types) {
    var InjectorService = (function () {
        function InjectorService(diContainer) {
            this.diContainer = diContainer;
            this.diContainer.registerService(InjectorService._name, this);
            this.children = [];
        }
        InjectorService.prototype.name = function () {
            return InjectorService._name;
        };
        InjectorService.prototype.injectTo = function (target) {
            this.diContainer.injectTo(target);
            injectionDone(target);
        };
        InjectorService.prototype.createChild = function (services) {
            var childContainer = this.diContainer.createChild();
            childContainer.registerService(InjectorService._name, childContainer);
            registerServices(services, childContainer);
            injectToServices(services, childContainer);
            var child = new InjectorService(childContainer);
            this.children.push(child);
            return child;
        };
        InjectorService._name = 'injectorService';
        InjectorService._fnInjectionDone = 'injectionDone';
        return InjectorService;
    })();
    function create(services) {
        var container = new Inject.Container();
        var result = new InjectorService(container);
        registerServices(services, container);
        injectToServices(services, container);
        return result;
    }
    exports.create = create;
    function registerServices(services, targetContainer) {
        Assert.ok(!Object.keys(services).some(function (key) {
            return key === InjectorService._name;
        }), 'injectorService is NOT allowed to be added because it is implict');
        Object.keys(services).forEach(function (key) {
            var service = services[key];
            targetContainer.registerService(key, service);
        });
    }
    function injectToServices(services, targetContainer) {
        Object.keys(services).forEach(function (key) {
            // inject
            var service = services[key];
            targetContainer.injectTo(service);
            // done
            injectionDone(service);
        });
    }
    function injectionDone(target) {
        // Support arrays
        if (Types.isArray(target)) {
            target.forEach(function (element) {
                injectionDone(element);
            });
            return;
        }
        if (Types.isFunction(target[InjectorService._fnInjectionDone])) {
            target[InjectorService._fnInjectionDone].apply(target);
        }
    }
});
