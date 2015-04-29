/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
/// <reference path="declare/node.d.ts" />
// Monaco Site Extension server for Azure Web Sites
'use strict';
define(["require", "exports", 'path', './run', './monaco', './lib/temp', './lib/utils', './lib/extfs', './lib/strings', './lib/project', './lib/performance', './version'], function (require, exports, path, run, server, temp, utils, extfs, strings, project, performance, versionInfo) {
    var startTime = new Date().getTime(); // Log startup time early on before other modules are loaded
    performance.startTime = startTime;
    var home = process.env.HOME;
    var monacodata = extfs.mkdirpSync(path.join(home, 'data', 'monaco'));
    var userHome = path.join(monacodata, 'home');
    // Zumo adds a "mobile$" to the web site name, so we take it off again
    var isZumoSiteExtension = process.env.MS_MobileServiceName !== undefined;
    var azureWebSiteName = process.env.WEBSITE_SITE_NAME;
    var isAzureWebSiteTryMode = (process.env['WEBSITE_TRY_MODE'] === '1');
    // Basic server options
    var options = {
        port: process.env.PORT || 9555,
        host: 'localhost',
        siteRoot: '/dev',
        enableCdn: true,
        monacodataTempPath: extfs.mkdirpSync(path.join(monacodata, 'temp')),
        home: userHome,
        npmHome: path.join(userHome, 'npm'),
        storePath: path.join(monacodata, 'store.db'),
        osTempPath: extfs.mkdirpSync(path.join(temp.getOSTempPathSync(), 'monacositeextension', 'temp')),
        gitPath: process.env['ProgramFiles(x86)'] + '\\Git\\bin\\git.exe',
        npmCliPath: process.env['ProgramFiles(x86)'] + '\\npm\\1.4.10\\node_modules\\npm\\bin\\npm-cli.js',
        msBuildPath: process.env['windir'] + '\\Microsoft.NET\\Framework\\v4.0.30319\\MSBuild.exe',
        nuGetPath: process.env['windir'] + '\\Microsoft.NET\\Framework\\v4.0.30319\\nuget.exe',
        powershellPath: process.env['windir'] + '\\System32\\WindowsPowerShell\\v1.0\\powershell.exe',
        logFile: path.join(home, 'LogFiles', 'Monaco', 'monaco.log'),
        telemetryEndPointAPI: isZumoSiteExtension ? 'https://monacodashboard.cloudapp.net/zumodev/telemetry/create' : 'https://monacodashboard.cloudapp.net/antaresdev/telemetry/create',
        telemetryWorkspaceId: azureWebSiteName,
        enableErrorTelemetry: true,
        reportEnvToTelemetry: true,
        enableMDSLogger: true,
        mdsLogFolder: path.join(process.env['temp'], 'siteExtLogs'),
        tfsBridgeServiceUrl: 'https://monacooauthnonprodch1su1.azurewebsites.net',
        overrideGitAskpass: true,
        isWindowsAzureWebSiteExtension: !isZumoSiteExtension,
        isZumoSiteExtension: isZumoSiteExtension,
        isAzureWebSiteTryMode: isAzureWebSiteTryMode,
        // these options get transported to the client
        // note: to not leak disabled flags to the outside world, flags that are set to false
        // are commented out!
        client: {
            version: versionInfo.version,
            shortVersion: versionInfo.shortVersion,
            enableDownloadWorkspace: true,
            enableUpload: true,
            enableSearch: true,
            enableBuild: false,
            enableGit: true,
            enableTestCoverage: false,
            enableTestViewlet: false,
            enableConsole: true,
            enableQuickStart: true,
            enableOutput: !isZumoSiteExtension,
            enableRunWorkspace: !isZumoSiteExtension,
            runFromAzure: !isZumoSiteExtension,
            enableTFSConnection: !isZumoSiteExtension,
            enableTelemetry: true,
            enableMonacoTelemetryPipeLine: true,
            appInsightsInstrumentationKey: '8cdcd0d9-1d18-479f-aac7-407ed788b1a1',
            enableAzurePortalNavigation: true,
            enableFeedback: true,
            enablePrivateTelemetry: false,
            enableGlobalCSSRuleChecker: false,
            enableNLSWarnings: false,
            enableEditorLanguageServiceIndicator: false,
            enableJavaScriptRewriting: true,
            enablePerformanceTools: false,
            hideDerivedResources: false,
            portalLink: 'http://channel9.msdn.com/Series/Visual-Studio-Online-Monaco',
            privacyLink: 'http://go.microsoft.com/fwlink/?LinkId=329837',
            legalLink: 'http://go.microsoft.com/fwlink/?LinkId=329836',
            supportLink: 'http://go.microsoft.com/fwlink/?LinkId=329835',
            videosLink: 'http://go.microsoft.com/fwlink/?LinkId=329871',
            tryAzureLink: 'https://trywebsites.azurewebsites.net',
            tryAzureSignUpLink: 'http://azure.microsoft.com/en-us/pricing/free-trial',
            tryAzureLifeTimeInMinutes: process.env['SITE_LIFE_TIME_IN_MINUTES'],
            tryAzureLastModifiedUTC: process.env['LAST_MODIFIED_TIME_UTC'],
            azureWebSiteName: azureWebSiteName,
            azureWebSiteComputeMode: process.env['WEBSITE_COMPUTE_MODE'],
            azureWebSiteMode: process.env['WEBSITE_SITE_MODE'],
            azureWebSiteScmType: process.env['ScmType'],
            azureWebSiteAppsettingScmType: process.env['APPSETTING_ScmType'],
            azureWebSiteProjectType: project.toString(server.ProjectType.Unknown),
            azureWebSiteForZumo: isZumoSiteExtension,
            azureWebSiteTryMode: isAzureWebSiteTryMode,
            azurePortalLink: strings.format('{0}{1}/dashboard', isZumoSiteExtension ? 'https://manage.windowsazure.com/#Workspaces/MobileServicesExtension/apps/' : 'https://manage.windowsazure.com/#Workspaces/WebsiteExtension/Website/', azureWebSiteName)
        }
    };
    // Mixin shared options
    utils.mixin(options, run.sharedOptions);
    // Custom cache control
    options.staticCacheControl = 'public';
    options.staticCachePragma = ''; // Disable pragma header
    options.staticCacheExpires = new Date(new Date().valueOf() + 1000 * 60 * 60 * 24 * 365); // Expires in 1 year
    // On WAWS/Zumo we use the wwwroot folder as workspace folder
    options.workspacesRoot = path.join(home, 'site');
    options.workspace = 'wwwroot';
    for (var key in options.client) {
        if (options.client.hasOwnProperty(key)) {
            var value = options.client[key];
            if (value === false) {
                delete options.client[key];
            }
        }
    }
    // Detect Project Type
    project.detectProjectType(options).then(function (type) {
        options.projectType = type;
        options.client.azureWebSiteProjectType = project.toString(type);
        // Startup
        run.startup(options, null, function (server) {
            server.logger.info('Detected project type: ' + options.client.azureWebSiteProjectType);
        });
    }, function (error) {
        options.projectType = server.ProjectType.Unknown;
        options.client.azureWebSiteProjectType = project.toString(options.projectType);
        // Startup
        run.startup(options, null, function (server) {
            server.logger.warn('Error while detecting project type: ' + error);
        });
    });
});
