/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
/// <reference path="../../declare/node.d.ts" />
'use strict';
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", 'path', '../../lib/pfs', '../contributions', '../../lib/system', './build', './msbuild.impl'], function (require, exports, path, pfs, Contributions, System, Build, MSBuildImpl) {
    var MSBuildBuildSystemContribution = (function () {
        function MSBuildBuildSystemContribution() {
            this.id = 'com.microsoft.vs.build.msbuild';
            this.priority = 99;
            this.buildSystem = null;
        }
        MSBuildBuildSystemContribution.prototype.canHandle = function (request) {
            var msBuildFile = path.join(request.workspace.toAbsolutePath(), 'msbuild.xml');
            var msBuildConf = path.join(request.workspace.toAbsolutePath(), 'msbuild.json');
            return pfs.exists(msBuildFile).then(function (value) {
                if (value) {
                    return value;
                }
                return pfs.exists(msBuildConf);
            });
        };
        MSBuildBuildSystemContribution.prototype.getBuildSystem = function (request) {
            if (this.buildSystem === null) {
                this.buildSystem = new MSBuildImpl.MSBuildBuildSystem();
            }
            return System.Promise.as(this.buildSystem);
        };
        return MSBuildBuildSystemContribution;
    })();
    var Contribution = (function (_super) {
        __extends(Contribution, _super);
        function Contribution() {
            _super.call(this, 'com.microsoft.vs.build.msbuild', ['com.microsoft.vs.build']);
        }
        Contribution.prototype.registerExtensions = function (server) {
            var buildRegistry = Build.BuildSystemRegistry;
            buildRegistry.registerContribution(new MSBuildBuildSystemContribution());
        };
        return Contribution;
    })(Contributions.AbstractContribution);
    Contributions.Registry.registerContribution(new Contribution());
});
