/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
/// <reference path="declare/node.d.ts" />
/*	Monaco Workbench Server

    Usage: node app.js [OPTIONS]
    Options:
    -h, --host				Specify the host name of the server to use
    -p, --port				Specify the port number of the server to use
    -w, --workpaces [PATH]	Enables selfhosting on the specified folder that contains workspaces
    -m, --monaco			Special flag for monaco development team to enable selfhosting mode (do not use)
*/
'use strict';
define(["require", "exports", 'fs', 'path', './run', './lib/cli', './lib/utils', './lib/temp', './lib/extfs', './lib/performance', './version'], function (require, exports, fs, path, run, cli, utils, temp, extfs, performance, versionInfo) {
    var startTime = new Date().getTime(); // Log startup time early on before other modules are loaded
    performance.startTime = startTime;
    // Parse command line arguments
    var args = cli.parseArgs(process.argv, [
        'h',
        'host',
        'p',
        'port',
        'w',
        'workspace'
    ]);
    var isSelfhost = !!(args.options.m || args.options.monaco);
    var port = process.env.PORT || args.options.p || args.options.port || 9888;
    var host = args.options.h || args.options.host || 'localhost';
    if (utils.isWindows()) {
        process.env.HOME = process.env.HOMEDRIVE + process.env.HOMEPATH;
    }
    var monacodata;
    if (port === 9777 || port === 9888) {
        monacodata = fs.realpathSync(extfs.mkdirpSync(path.join(temp.getOSTempPathSync(), '_monacodata_' + port)));
    }
    else {
        monacodata = fs.realpathSync(extfs.mkdirpSync(path.join(temp.getOSTempPathSync(), '_monacodata_dyn', 'port_' + port)));
    }
    var userHome = (isSelfhost && process.env.HOME) ? process.env.HOME : path.join(monacodata, 'home');
    // Basic server options
    var options = {
        osTempPath: path.join(monacodata, 'temp'),
        port: port,
        host: host,
        siteRoot: '',
        monacodataTempPath: extfs.mkdirpSync(path.join(monacodata, 'temp')),
        logFile: path.join(monacodata, 'temp', 'monaco.log'),
        logsFolder: path.join(monacodata, 'temp', 'logs'),
        enableConsoleLogger: true,
        msBuildPath: 'msbuild',
        nuGetPath: 'nuget',
        powershellPath: 'powershell',
        jsonRequestLimit: '15mb',
        home: userHome,
        npmHome: path.join(userHome, 'npm'),
        storePath: path.join(monacodata, 'store.db'),
        phantomCliPath: path.join(run.wwwRoot, '..', 'tools', 'testing', 'phantom', 'phantomjs.exe'),
        verbosePerformanceLogging: true,
        telemetryEndPointAPI: 'https://monacodashboard.cloudapp.net/telemetry/create',
        reportEnvToTelemetry: false,
        overrideGitAskpass: !isSelfhost,
        disableFileWatching: process.platform !== 'win32',
        // these options get transported to the client
        client: {
            version: versionInfo.version,
            shortVersion: versionInfo.shortVersion,
            enableDownloadWorkspace: true,
            enableUpload: true,
            enableSearch: true,
            enableBuild: true,
            enableGit: true,
            enableConsole: true,
            enableOutput: true,
            enableQuickStart: true,
            enableRunWorkspace: true,
            enableJavaScriptRewriting: true,
            runFromAzure: false,
            enableTestViewlet: isSelfhost,
            enableTestCoverage: isSelfhost,
            enableTelemetry: isSelfhost,
            enablePrivateTelemetry: isSelfhost,
            enableMonacoTelemetryPipeLine: true,
            appInsightsInstrumentationKey: 'dd7630ba-a159-46c5-b281-6eb463745601',
            enableFeedback: false,
            enableGlobalCSSRuleChecker: false,
            enableNLSWarnings: isSelfhost,
            enableEditorLanguageServiceIndicator: true,
            enablePerformanceTools: true,
            enableTFSConnection: false,
            portalLink: 'http://monacotools',
            hideDerivedResources: true,
            videosLink: 'http://go.microsoft.com/fwlink/?LinkId=329871'
        }
    };
    // Mixin shared options
    utils.mixin(options, run.sharedOptions);
    // Check for slim option
    if (args.options.slim) {
        options.requestVerificationCookie = null;
        options.enableCORS = true;
        options.disableFileWatching = true;
    }
    // Specified is a directory to serve workspaces from, just use it
    if (args.options.w || args.options.workspaces) {
        options.workspacesRoot = fs.realpathSync(args.options.w || args.options.workspaces);
    }
    else {
        options.workspacesRoot = path.resolve(path.join(monacodata, 'workspaces'));
        extfs.mkdirpSync(options.workspacesRoot);
    }
    // Startup
    run.startup(options);
});
