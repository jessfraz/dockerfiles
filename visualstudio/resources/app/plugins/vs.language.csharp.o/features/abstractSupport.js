/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
/// <reference path="../../declares.d.ts" />
'use strict';
define(["require", "exports", 'monaco'], function (require, exports, monaco) {
    var AbstractSupport = (function () {
        function AbstractSupport(ctx, server) {
            this._modelService = ctx.modelService;
            this._server = server;
        }
        AbstractSupport.prototype.server = function () {
            return monaco.Promise.as(this._server);
        };
        AbstractSupport.prototype.filename = function (resource) {
            return monaco.Paths.toAbsoluteFilePath(monaco.URL.fromUri(resource));
        };
        //	public resource(filename: string): monaco.URL {
        //		return this._filepaths.asUrl(filename);
        //	}
        AbstractSupport.prototype.buffer = function (resource) {
            return AbstractSupport.buffer(this._modelService.getModel(resource));
        };
        AbstractSupport.prototype.isInMemory = function (resource) {
            return monaco.URL.fromUri(resource).isInMemory();
        };
        AbstractSupport.buffer = function (model) {
            return model.getValue(monaco.Models.EndOfLinePreference.LF, false);
        };
        return AbstractSupport;
    })();
    return AbstractSupport;
});
