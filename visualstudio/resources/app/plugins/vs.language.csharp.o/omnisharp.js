/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
'use strict';
define(["require", "exports"], function (require, exports) {
    var Events;
    (function (Events) {
        Events.ProjectAdded = 'ProjectAdded';
        Events.ProjectChanged = 'ProjectChanged';
        Events.PackageRestoreStarted = 'PackageRestoreStarted';
        Events.PackageRestoreFinished = 'PackageRestoreFinished';
        Events.Error = 'Error';
        Events.MsBuildProjectDiagnostics = 'MsBuildProjectDiagnostics';
    })(Events = exports.Events || (exports.Events = {}));
    var Protocol;
    (function (Protocol) {
        Protocol.GoToDefinition = '/gotoDefinition';
        Protocol.CodeCheck = '/codecheck';
        Protocol.AutoComplete = '/autocomplete';
        Protocol.CurrentFileMembersAsTree = '/currentfilemembersastree';
        Protocol.TypeLookup = '/typelookup';
        Protocol.AddToProject = '/addtoproject';
        Protocol.RemoveFromProject = '/removefromproject';
        Protocol.FindUsages = '/findusages';
        Protocol.FindSymbols = '/findsymbols';
        Protocol.CodeFormat = '/codeformat';
        Protocol.GetCodeActions = '/getcodeactions';
        Protocol.RunCodeAction = '/runcodeaction';
        Protocol.FormatAfterKeystroke = '/formatAfterKeystroke';
        Protocol.FormatRange = '/formatRange';
        Protocol.UpdateBuffer = '/updatebuffer';
        Protocol.ChangeBuffer = '/changebuffer';
        Protocol.Projects = '/projects';
        Protocol.Rename = '/rename';
        Protocol.FilesChanged = '/filesChanged';
        Protocol.SignatureHelp = '/signatureHelp';
    })(Protocol = exports.Protocol || (exports.Protocol = {}));
    function asProjectLabel(projectName) {
        var idx = projectName.indexOf('+');
        return projectName.substr(idx + 1);
    }
    exports.asProjectLabel = asProjectLabel;
    (function (ServerState) {
        ServerState[ServerState["Starting"] = 0] = "Starting";
        ServerState[ServerState["Started"] = 1] = "Started";
        ServerState[ServerState["Stopped"] = 2] = "Stopped";
    })(exports.ServerState || (exports.ServerState = {}));
    var ServerState = exports.ServerState;
});
