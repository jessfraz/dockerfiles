/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
'use strict';
define(["require", "exports", '../../lib/system', './fileSearch', './textSearch'], function (require, exports, winjs, fileSearch, textSearch) {
    var RawSearchService = (function () {
        function RawSearchService() {
        }
        RawSearchService.prototype.fileSearch = function (rootResources, filePatterns, excludeResources, includeResources) {
            if (excludeResources === void 0) { excludeResources = []; }
            if (includeResources === void 0) { includeResources = []; }
            filePatterns = filePatterns && filePatterns.length > 0 ? filePatterns : [{ pattern: '' /* All files */ }];
            var engine = new fileSearch.Engine(rootResources, filePatterns, excludeResources, includeResources);
            return this.doSearch(engine);
        };
        RawSearchService.prototype.textSearch = function (rootResources, filePatterns, excludeResources, includeResources, contentPattern, maxResults) {
            if (excludeResources === void 0) { excludeResources = []; }
            if (includeResources === void 0) { includeResources = []; }
            filePatterns = filePatterns && filePatterns.length > 0 ? filePatterns : [{ pattern: '' /* All files */ }];
            var engine = new textSearch.Engine(rootResources, new fileSearch.FileWalker(filePatterns, excludeResources, includeResources), contentPattern, maxResults);
            return this.doSearch(engine);
        };
        RawSearchService.prototype.doSearch = function (engine) {
            return new winjs.PPromise(function (c, e, p) {
                engine.search(function (match) {
                    if (match) {
                        p(match);
                    }
                }, function (progress) {
                    p(progress);
                }, function (error) {
                    if (error) {
                        e(error);
                    }
                    else {
                        c(null);
                    }
                });
            }, function () { return engine.cancel(); });
        };
        return RawSearchService;
    })();
    exports.RawSearchService = RawSearchService;
});
