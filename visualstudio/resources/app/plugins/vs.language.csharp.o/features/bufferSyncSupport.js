/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
/// <reference path="../../declares.d.ts" />
'use strict';
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", '../omnisharp', './abstractSupport'], function (require, exports, omnisharp, AbstractSupport) {
    var BufferSyncSupport = (function (_super) {
        __extends(BufferSyncSupport, _super);
        function BufferSyncSupport(ctx, server) {
            _super.call(this, ctx, server);
            this._syncedModels = Object.create(null);
            this._modelService.getModels().forEach(this._onModelAdded, this);
            this._modelService.onModelAdded.add(this._onModelAdded, this);
            this._modelService.onModelRemoved.add(this._onModelRemoved, this);
        }
        BufferSyncSupport.prototype.dispose = function () {
            this._modelService.onModelAdded.remove(this._onModelAdded, this);
            this._modelService.onModelRemoved.remove(this._onModelRemoved, this);
        };
        BufferSyncSupport.prototype._onModelRemoved = function (model) {
            var key = model.getURL().toString();
            if (!this._syncedModels[key]) {
                return;
            }
            this._syncedModels[key].dispose();
            delete this._syncedModels[key];
        };
        BufferSyncSupport.prototype._onModelAdded = function (model) {
            var _this = this;
            if (model.getModeId() !== 'csharp' || this.isInMemory(model.getURL())) {
                return;
            }
            var key = model.getURL().toString();
            this._syncedModels[key] = new SyncedModel(model, this.filename(model.getURL()), function () { return _this.server(); });
        };
        return BufferSyncSupport;
    })(AbstractSupport);
    var SyncedModel = (function () {
        function SyncedModel(model, filename, server) {
            this._model = model;
            this._filename = filename;
            this._server = server;
            this._model.onContentChanged.add(this._onContentChanged, this);
        }
        SyncedModel.prototype.dispose = function () {
            this._model.onContentChanged.remove(this._onContentChanged, this);
        };
        SyncedModel.prototype._onContentChanged = function (events) {
            //		https://github.com/OmniSharp/omnisharp-roslyn/issues/112
            //		this._changeBuffer(events);
            this._updateBuffer();
        };
        SyncedModel.prototype._changeBuffer = function (events) {
            var _this = this;
            for (var i = 0, len = events.length; i < len; i++) {
                var event = events[i];
                var req = {
                    FileName: this._filename,
                    StartLine: event.range.startLineNumber,
                    StartColumn: event.range.startColumn,
                    EndLine: event.range.endLineNumber,
                    EndColumn: event.range.endColumn,
                    NewText: event.text
                };
                this._server().then(function (val) {
                    return val.makeRequest(omnisharp.Protocol.ChangeBuffer, req).then(null, function (err) {
                        return _this._updateBuffer();
                    });
                });
            }
        };
        SyncedModel.prototype._updateBuffer = function () {
            var _this = this;
            this._server().then(function (val) { return val.makeRequest(omnisharp.Protocol.UpdateBuffer, {
                Buffer: AbstractSupport.buffer(_this._model),
                Filename: _this._filename
            }); }).done(null, function (err) {
                console.error(err);
            });
        };
        return SyncedModel;
    })();
    return BufferSyncSupport;
});
