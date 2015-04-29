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
define(["require", "exports", 'vs/nls', 'vs/base/collections', 'vs/base/time/schedulers', 'vs/base/lifecycle', '../omnisharp', './abstractSupport', 'monaco'], function (require, exports, nls, collections, schedulers, lifecycle, omnisharp, AbstractSupport, monaco) {
    var Advisor = (function () {
        function Advisor(server) {
            this._packageRestoreCounter = 0;
            this._projectSourceFileCounts = Object.create(null);
            server.addListener(this);
        }
        Advisor.prototype.onOmnisharpServerEvent = function (kind, args) {
            switch (kind) {
                case omnisharp.Events.PackageRestoreStarted:
                    this._packageRestoreCounter += 1;
                    break;
                case omnisharp.Events.PackageRestoreFinished:
                    this._packageRestoreCounter -= 1;
                    break;
                case omnisharp.Events.ProjectChanged:
                    var info = args;
                    if (info.AspNet5Project && info.AspNet5Project.SourceFiles) {
                        this._projectSourceFileCounts[info.AspNet5Project.Path] = info.AspNet5Project.SourceFiles.length;
                    }
                    if (info.MsBuildProject && info.MsBuildProject.SourceFiles) {
                        this._projectSourceFileCounts[info.MsBuildProject.Path] = info.MsBuildProject.SourceFiles.length;
                    }
                    break;
                case 'stateChanged':
                    this._state = args;
                    break;
            }
        };
        Advisor.prototype.shouldValidateOpenFiles = function () {
            return this._isServerStarted() && !this._isRestoringPackages();
        };
        Advisor.prototype.shouldValidateClosedFiles = function () {
            return this._isServerStarted() && !this._isRestoringPackages() && !this._isHugeProject();
        };
        Advisor.prototype._isServerStarted = function () {
            return this._state === omnisharp.ServerState.Started;
        };
        Advisor.prototype._isRestoringPackages = function () {
            return this._packageRestoreCounter > 0;
        };
        Advisor.prototype._isHugeProject = function () {
            var sourceFileCount = 0;
            for (var key in this._projectSourceFileCounts) {
                sourceFileCount += this._projectSourceFileCounts[key];
                if (sourceFileCount > 1000) {
                    return true;
                }
            }
            return false;
        };
        return Advisor;
    })();
    exports.Advisor = Advisor;
    var Support = (function (_super) {
        __extends(Support, _super);
        function Support(ctx, server, validationAdvisor) {
            var _this = this;
            _super.call(this, ctx, server);
            this._callOnDispose = [];
            this._modelListeners = collections.createStringDictionary();
            this._queueForChangedFiles = collections.createStringDictionary();
            this._validationAdvisor = validationAdvisor;
            this._markerService = ctx.markerService;
            this._openDocumentsDiagnostics = new schedulers.RunOnceScheduler(this._sendValidationRequestsForChangedFiles.bind(this), 1000);
            this._closedDocumentsDiagnostics = new schedulers.RunOnceScheduler(this._validateClosedSourceFiles.bind(this), 3000);
            this._modelService.getModels().forEach(function (model) { return _this._onModelAdded(model); });
            this._modelService.onModelAdded.add(this._onModelAdded, this, this._callOnDispose);
            this._modelService.onModelRemoved.add(this._onModelRemoved, this, this._callOnDispose);
            this.server().then(function (value) { return _this._callOnDispose.push(value.addListener(_this)); });
        }
        Support.prototype.dispose = function () {
            lifecycle.disposeAll(this._callOnDispose);
        };
        Support.prototype._isInterestingModel = function (model) {
            return model.getModeId() === 'csharp' && !this.isInMemory(model.getURL());
        };
        Support.prototype._onModelAdded = function (model) {
            if (!this._isInterestingModel(model)) {
                return;
            }
            var resource = model.getURL().toString(), validator = this._validateModel.bind(this, resource);
            model.onContentChanged.add(validator);
            this._modelListeners[resource] = function () { return model.onContentChanged.remove(validator); };
            validator();
        };
        Support.prototype._onModelRemoved = function (model) {
            var key = model.getURL().toString();
            if (!this._modelListeners[key]) {
                return;
            }
            this._modelListeners[key]();
            delete this._modelListeners[key];
        };
        Support.prototype.onOmnisharpServerEvent = function (kind, args) {
            if (kind === omnisharp.Events.ProjectChanged || kind === omnisharp.Events.PackageRestoreFinished) {
                this._openDocumentsDiagnostics.schedule();
                this._closedDocumentsDiagnostics.schedule();
            }
        };
        Support.prototype._validateModel = function (resource) {
            this._queueForChangedFiles[resource] = true;
            this._openDocumentsDiagnostics.schedule();
        };
        Support.prototype._sendValidationRequestsForChangedFiles = function () {
            var _this = this;
            if (!this._validationAdvisor.shouldValidateOpenFiles()) {
                return;
            }
            // first all changed files, then all other open files
            var queue = Object.keys(this._queueForChangedFiles);
            this._modelService.getModels().forEach(function (model) {
                if (_this._queueForChangedFiles[model.getURL().toString()]) {
                    return;
                }
                if (!_this._isInterestingModel(model)) {
                    return;
                }
                queue.push(model.getURL().toString());
            });
            this._queueForChangedFiles = Object.create(null);
            // validate changed files and if nothing changed
            // in the meantime also validate the closed files
            var promises = queue.map(this._sendOneValidationRequest, this);
            monaco.Promise.join(promises).then(function (_) { return _this._closedDocumentsDiagnostics.schedule(); }).done(undefined, function (err) { return console.error(err); });
        };
        Support.prototype._sendOneValidationRequest = function (external) {
            var _this = this;
            var resource = new monaco.URL(external);
            return this.server().then(function (value) { return value.makeRequest(omnisharp.Protocol.CodeCheck, {
                Filename: _this.filename(resource)
            }); }).then(function (res) {
                var data = res.QuickFixes.map(Support.asMarkerData);
                _this._markerService.changeOne('omnisharp/open', resource, data);
            });
        };
        Support.prototype._validateClosedSourceFiles = function () {
            var _this = this;
            if (!this._validationAdvisor.shouldValidateClosedFiles()) {
                return;
            }
            this.server().then(function (value) { return value.makeRequest(omnisharp.Protocol.CodeCheck, {}); }).then(function (res) {
                var data = [];
                for (var i = 0; i < res.QuickFixes.length && data.length <= 1000; i++) {
                    var quickFix = res.QuickFixes[i], resource = monaco.URI.file(quickFix.FileName);
                    if (_this._modelService.getModel(monaco.URL.fromUri(resource))) {
                        continue;
                    }
                    data.push({
                        resource: resource,
                        marker: Support.asMarkerData(quickFix)
                    });
                }
                _this._markerService.changeAll('omnisharp/closed', data);
            }).done(undefined, function (err) { return console.error(err); });
        };
        Support.asMarkerData = function (quickFix) {
            return {
                message: nls.localize('csharp.diagnostics', "{0} [{1}]", quickFix.Text, quickFix.Projects.map(function (n) { return omnisharp.asProjectLabel(n); }).join(', ')),
                severity: Support.severity(quickFix),
                startLineNumber: quickFix.Line,
                startColumn: quickFix.Column,
                endLineNumber: quickFix.EndLine,
                endColumn: quickFix.EndColumn
            };
        };
        Support.severity = function (quickFix) {
            return quickFix.LogLevel === 'Hidden' ? monaco.Services.Severity.Warning : monaco.Services.Severity.fromValue(quickFix.LogLevel);
        };
        return Support;
    })(AbstractSupport);
    exports.Support = Support;
});
