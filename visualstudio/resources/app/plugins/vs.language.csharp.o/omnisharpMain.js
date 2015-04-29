/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
/// <reference path="../declares.d.ts" />
'use strict';
define(["require", "exports", 'monaco', './features/declarationSupport', './features/codeLensSupport', './features/occurrencesSupport', './features/outlineSupport', './features/quickFixSupport', './features/referenceSupport', './features/extraInfoSupport', './features/renameSupport', './features/formattingSupport', './features/suggestSupport', './features/bufferSyncSupport', './features/navigateTypesSupport', './features/diagnosticsSupport', './features/parameterHintsSupport', './omnisharp/omnisharpServer.native', './omnisharp'], function (require, exports, monaco, DeclarationSupport, CodeLensSupport, OccurrencesSupport, OutlineSupport, QuickFixSupport, ReferenceSupport, ExtraInfoSupport, RenameSupport, FormattingSupport, SuggestSupport, BufferSyncSupport, NavigateTypesSupport, DiagnosticsSupport, ParameterHintsSupport, omnisharpServer, omnisharp) {
    var myModeId = 'csharp';
    function activate(_ctx) {
        var server = new omnisharpServer.StdioOmnisharpServer();
        // TODO@plugins -> should instantiationService be public API?
        // We must copy the `ctx` for now because it becomes invalid as soon as this method call finishes
        var ctx = {
            modelService: _ctx.modelService,
            markerService: _ctx.markerService,
            configurationService: _ctx.configurationService
        };
        var quickFixesEnabled = false;
        var configurationService = _ctx.configurationService;
        if (configurationService) {
            configurationService.loadConfiguration(myModeId).then(function (config) {
                quickFixesEnabled = config && config['codeActions'];
                if (quickFixesEnabled && server.getState() === omnisharp.ServerState.Started) {
                    monaco.Modes.QuickFixSupport.register('csharp', new QuickFixSupport(ctx, server));
                }
            });
        }
        var diagnosticsAdvisor = new DiagnosticsSupport.Advisor(server);
        var listener;
        function onOmnisharpServerEvent(kind, state) {
            if (kind !== 'stateChanged' || state !== omnisharp.ServerState.Started) {
                return;
            }
            monaco.Modes.DeclarationSupport.register('csharp', new DeclarationSupport(ctx, server));
            monaco.Modes.CodeLensSupport.register('csharp', new CodeLensSupport(ctx, server));
            monaco.Modes.OccurrencesSupport.register('csharp', new OccurrencesSupport(ctx, server));
            monaco.Modes.OutlineSupport.register('csharp', new OutlineSupport(ctx, server));
            monaco.Modes.ReferenceSupport.register('csharp', new ReferenceSupport(ctx, server));
            monaco.Modes.ExtraInfoSupport.register('csharp', new ExtraInfoSupport(ctx, server));
            monaco.Modes.RenameSupport.register('csharp', new RenameSupport(ctx, server));
            monaco.Modes.FormattingSupport.register('csharp', new FormattingSupport(ctx, server));
            monaco.Modes.SuggestSupport.register('csharp', new SuggestSupport(ctx, server));
            monaco.Modes.NavigateTypesSupport.register('csharp', new NavigateTypesSupport(ctx, server));
            monaco.Modes.ParameterHintsSupport.register('csharp', new ParameterHintsSupport(ctx, server));
            new BufferSyncSupport(ctx, server);
            new DiagnosticsSupport.Support(ctx, server, diagnosticsAdvisor);
            if (quickFixesEnabled) {
                monaco.Modes.QuickFixSupport.register('csharp', new QuickFixSupport(ctx, server));
            }
            listener.dispose();
        }
        listener = server.addListener({ onOmnisharpServerEvent: onOmnisharpServerEvent });
        return monaco.Promise.as({
            start: function (solutionPath) { return server.start(solutionPath); },
            stop: function () { return server.stop(); },
            makeRequest: function (path, data) { return server.makeRequest(path, data); },
            addListener: function (listener) {
                var ret = server.addListener(listener);
                return {
                    dispose: function () { return ret.dispose(); }
                };
            }
        });
    }
    exports.activate = activate;
});
