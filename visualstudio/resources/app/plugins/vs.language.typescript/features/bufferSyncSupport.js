/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
/// <reference path="../../declares.d.ts" />
'use strict';
define(["require", "exports", 'monaco', 'vs/base/async'], function (require, exports, monaco, async) {
    var SyncedBuffer = (function () {
        function SyncedBuffer(model, filepath, diagnosticRequestor, client) {
            this.model = model;
            this.filepath = filepath;
            this.diagnosticRequestor = diagnosticRequestor;
            this.client = client;
        }
        SyncedBuffer.prototype.open = function () {
            this.model.onContentChanged.add(this.onContentChanged, this);
            var args = {
                file: this.filepath
            };
            this.client.execute('open', args, false);
        };
        SyncedBuffer.prototype.close = function () {
            this.model.onContentChanged.remove(this.onContentChanged, this);
            var args = {
                file: this.filepath
            };
            this.client.execute('close', args, false);
        };
        SyncedBuffer.prototype.onContentChanged = function (events) {
            var filePath = this.client.asAbsolutePath(this.model.getURL());
            if (!filePath) {
                return;
            }
            for (var i = 0; i < events.length; i++) {
                var event = events[i];
                var range = event.range;
                var text = event.text;
                var args = {
                    file: filePath,
                    line: range.startLineNumber,
                    offset: range.startColumn,
                    endLine: range.endLineNumber,
                    endOffset: range.endColumn,
                    insertString: text
                };
                this.client.execute('change', args, false);
            }
            this.diagnosticRequestor.requestDiagnostic(filePath);
        };
        return SyncedBuffer;
    })();
    var BufferSyncSupport = (function () {
        function BufferSyncSupport(ctx, client, modeId) {
            this.client = client;
            this.modeId = modeId;
            this.modelService = ctx.modelService;
            this.markerService = ctx.markerService;
            this.syncedBuffers = Object.create(null);
            this.modelService.getModels().forEach(this.modelAdded, this);
            this.modelService.onModelAdded.add(this.modelAdded, this);
            this.modelService.onModelRemoved.add(this.modelRemoved, this);
            this.pendingDiagnostics = Object.create(null);
            this.syntaxDiagnostics = Object.create(null);
            this.diagnosticDelayer = new async.Delayer(100);
        }
        BufferSyncSupport.prototype.dispose = function () {
            this.modelService.onModelAdded.remove(this.modelAdded, this);
            this.modelService.onModelRemoved.remove(this.modelRemoved, this);
        };
        BufferSyncSupport.prototype.modelAdded = function (model) {
            if (model.getModeId() !== this.modeId) {
                return;
            }
            var resource = model.getURL();
            if (this.isInMemory(resource)) {
                return;
            }
            var filepath = this.client.asAbsolutePath(resource);
            if (!filepath) {
                return;
            }
            var syncedBuffer = new SyncedBuffer(model, filepath, this, this.client);
            this.syncedBuffers[filepath] = syncedBuffer;
            syncedBuffer.open();
            this.requestDiagnostic(filepath);
        };
        BufferSyncSupport.prototype.modelRemoved = function (model) {
            var filepath = this.client.asAbsolutePath(model.getURL());
            if (!filepath) {
                return;
            }
            var syncedBuffer = this.syncedBuffers[filepath];
            if (!syncedBuffer) {
                return;
            }
            delete this.syncedBuffers[filepath];
            syncedBuffer.close();
        };
        BufferSyncSupport.prototype.isInMemory = function (resource) {
            return monaco.URL.fromUri(resource).isInMemory();
        };
        BufferSyncSupport.prototype.requestDiagnostic = function (file) {
            var _this = this;
            this.pendingDiagnostics[file] = Date.now();
            this.diagnosticDelayer.trigger(function () {
                _this.sendPendingDiagnostics();
            });
        };
        BufferSyncSupport.prototype.sendPendingDiagnostics = function () {
            var _this = this;
            var files = Object.keys(this.pendingDiagnostics).map(function (key) {
                return {
                    file: key,
                    time: _this.pendingDiagnostics[key]
                };
            }).sort(function (a, b) {
                return a.time - b.time;
            }).map(function (value) {
                return value.file;
            });
            // Add all open TS buffers to the geterr request. They might be visible
            Object.keys(this.syncedBuffers).forEach(function (file) {
                if (!_this.pendingDiagnostics[file]) {
                    files.push(file);
                }
            });
            var args = {
                delay: 0,
                files: files
            };
            this.client.execute('geterr', args, false);
            this.pendingDiagnostics = Object.create(null);
        };
        /* internal */ BufferSyncSupport.prototype.syntaxDiagnosticsReceived = function (event) {
            var body = event.body;
            if (body.diagnostics) {
                var markers = this.createMarkerDatas(body.diagnostics);
                this.syntaxDiagnostics[body.file] = markers;
            }
        };
        /* internal */ BufferSyncSupport.prototype.semanticDiagnosticsReceived = function (event) {
            var body = event.body;
            if (body.diagnostics) {
                var markers = this.createMarkerDatas(body.diagnostics);
                var syntaxMarkers = this.syntaxDiagnostics[body.file];
                if (syntaxMarkers) {
                    delete this.syntaxDiagnostics[body.file];
                    markers = syntaxMarkers.concat(markers);
                }
                this.markerService.changeOne('typescript', this.client.asUrl(body.file), markers);
            }
        };
        BufferSyncSupport.prototype.createMarkerDatas = function (diagnostics) {
            var markers = [];
            for (var i = 0; i < diagnostics.length; i++) {
                var diagnostic = diagnostics[i];
                var marker = {
                    severity: monaco.Services.Severity.Error,
                    message: diagnostic.text,
                    startLineNumber: diagnostic.start.line,
                    startColumn: diagnostic.start.offset,
                    endLineNumber: diagnostic.end.line,
                    endColumn: diagnostic.end.offset
                };
                markers.push(marker);
            }
            return markers;
        };
        return BufferSyncSupport;
    })();
    return BufferSyncSupport;
});
