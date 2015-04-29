/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
'use strict';
define(["require", "exports", 'path', 'fs', 'ini', '../monaco', './strings', './system'], function (require, exports, path, fs, ini, server, strings, system) {
    function detectProjectType(options) {
        return new system.Promise(function (complete, errorCallback) {
            if (!options.workspace || !options.workspacesRoot) {
                return complete(server.ProjectType.Unknown);
            }
            var deployFileName = '.deployment';
            var rootDir = path.join(options.workspacesRoot, options.workspace);
            var deploymentFilePath = path.join(rootDir, deployFileName);
            var config = null;
            fs.exists(deploymentFilePath, function (exists) {
                if (exists) {
                    fs.readFile(deploymentFilePath, options.defaultEncoding, function (error, result) {
                        if (error) {
                            return errorCallback(error);
                        }
                        config = ini.parse(result);
                        var project = process.env['APPSETTING_Project'];
                        if (config && config.config && config.config.project) {
                            project = config.config.project;
                        }
                        return continueWithProject(project);
                    });
                }
                else {
                    return continueWithProject(process.env['APPSETTING_Project']);
                }
                function continueWithProject(project) {
                    if (project) {
                        var projectLower = project.toLowerCase();
                        if (strings.endsWith(projectLower, '.csproj') || strings.endsWith(projectLower, '.vbproj')) {
                            return complete(server.ProjectType.ASP);
                        }
                        else {
                            rootDir = path.join(rootDir, project);
                        }
                    }
                    fs.readdir(rootDir, function (error, files) {
                        if (error) {
                            return errorCallback(error);
                        }
                        if (files.length === 1 && files[0] === 'hostingstart.html') {
                            return complete(server.ProjectType.NEW_SITE);
                        }
                        var potentiallyHTML = false;
                        var potentiallyASPOrJava = false;
                        for (var i = 0; i < files.length; i++) {
                            var file = files[i].toLowerCase();
                            if (strings.endsWith(file, '.csproj') || strings.endsWith(file, '.vbproj') || strings.endsWith(file, '.sln')) {
                                return complete(server.ProjectType.ASP);
                            }
                            if (strings.endsWith(file, '.cshtml') || strings.endsWith(file, '.vbhtml')) {
                                return complete(server.ProjectType.ASP);
                            }
                            if (strings.endsWith(file, '.asp') || strings.endsWith(file, '.aspx') || strings.endsWith(file, '.asmx') || strings.endsWith(file, '.ashx')) {
                                return complete(server.ProjectType.ASP);
                            }
                            if (strings.endsWith(file, '.php')) {
                                return complete(server.ProjectType.PHP);
                            }
                            if (strings.endsWith(file, '.py')) {
                                return complete(server.ProjectType.Python);
                            }
                            if (file === 'package.json' || file === 'app.js' || file === 'server.js' || file === 'index.js' || file === 'node_modules') {
                                return complete(server.ProjectType.Node);
                            }
                            if (file === 'bin') {
                                potentiallyASPOrJava = true;
                            }
                            if (strings.endsWith(file, '.html') || strings.endsWith(file, '.htm')) {
                                potentiallyHTML = true;
                            }
                        }
                        if (potentiallyASPOrJava) {
                            var binFolder = path.join(rootDir, 'bin');
                            return fs.stat(binFolder, function (error, binFolderStat) {
                                if (error) {
                                    return errorCallback(error);
                                }
                                if (!binFolderStat.isDirectory()) {
                                    if (potentiallyHTML) {
                                        return complete(server.ProjectType.HTML);
                                    }
                                    return complete(server.ProjectType.Unknown);
                                }
                                return fs.readdir(binFolder, function (error, binFiles) {
                                    if (error) {
                                        return errorCallback(error);
                                    }
                                    if (binFiles.some(function (binFile) { return binFile.indexOf('apache-tomcat') >= 0; }) && !binFiles.some(function (binFile) { return binFile.indexOf('.dll') >= 0; })) {
                                        return complete(server.ProjectType.Java);
                                    }
                                    return complete(server.ProjectType.ASP);
                                });
                            });
                        }
                        if (potentiallyHTML) {
                            return complete(server.ProjectType.HTML);
                        }
                        return complete(server.ProjectType.Unknown);
                    });
                }
            });
        });
    }
    exports.detectProjectType = detectProjectType;
    ;
    function toString(type) {
        switch (type) {
            case server.ProjectType.ASP:
                return 'ASP.NET';
            case server.ProjectType.HTML:
                return 'HTML';
            case server.ProjectType.Node:
                return 'Node';
            case server.ProjectType.PHP:
                return 'PHP';
            case server.ProjectType.Python:
                return 'Python';
            case server.ProjectType.NEW_SITE:
                return 'NEW_SITE';
            case server.ProjectType.Java:
                return 'Java';
        }
        return 'Unknown';
    }
    exports.toString = toString;
});
