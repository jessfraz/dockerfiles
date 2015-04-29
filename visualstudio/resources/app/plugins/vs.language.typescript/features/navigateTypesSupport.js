/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
/// <reference path="../../declares.d.ts" />
'use strict';
define(["require", "exports", 'monaco'], function (require, exports, monaco) {
    var NavigateTypeSupport = (function () {
        function NavigateTypeSupport(ctx, client, modeId) {
            this.modelService = ctx.modelService;
            this.client = client;
            this.modeId = modeId;
        }
        NavigateTypeSupport.prototype.getNavigateToItems = function (search, resource) {
            var _this = this;
            if (resource === null) {
                return monaco.Promise.as([]);
            }
            var model = this.modelService.getModel(resource);
            if (!model || model.getModeId() !== this.modeId) {
                return monaco.Promise.as([]);
            }
            var args = {
                file: this.client.asAbsolutePath(resource),
                searchValue: search
            };
            if (!args.file) {
                return monaco.Promise.as([]);
            }
            return this.client.execute('navto', args).then(function (response) {
                var data = response.body;
                if (data) {
                    return data.map(function (item) {
                        return {
                            containerName: item.containerName,
                            name: item.name,
                            parameters: (item.kind === 'method' || item.kind === 'function') ? '()' : '',
                            type: item.kind,
                            range: {
                                startLineNumber: item.start.line,
                                startColumn: item.start.offset,
                                endLineNumber: item.end.line,
                                endColumn: item.end.offset
                            },
                            resourceUri: _this.client.asUrl(item.file)
                        };
                    });
                }
                else {
                    return [];
                }
            }, function (err) {
                return [];
            });
        };
        return NavigateTypeSupport;
    })();
    return NavigateTypeSupport;
});
