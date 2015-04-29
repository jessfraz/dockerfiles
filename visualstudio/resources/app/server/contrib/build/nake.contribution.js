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
define(["require", "exports", 'path', '../../lib/pfs', '../contributions', '../../lib/system', './build', './nake.impl'], function (require, exports, path, pfs, Contributions, System, Build, NakeImpl) {
    var NakeBuildSystemContribution = (function () {
        function NakeBuildSystemContribution() {
            this.id = 'com.microsoft.vs.build.nake';
            this.priority = 100;
            this.buildSystem = null;
        }
        NakeBuildSystemContribution.prototype.canHandle = function (request) {
            return pfs.exists(path.join(request.workspace.toAbsolutePath(), 'nakefile.js'));
        };
        NakeBuildSystemContribution.prototype.getBuildSystem = function (request) {
            if (this.buildSystem === null) {
                this.buildSystem = new NakeImpl.NakeBuildSystem();
            }
            return System.Promise.as(this.buildSystem);
        };
        return NakeBuildSystemContribution;
    })();
    var LegacyBuildSystemContribution = (function () {
        function LegacyBuildSystemContribution() {
            this.id = 'com.microsoft.vs.build.legacy';
            this.priority = 98;
            this._buildSystem = null;
        }
        LegacyBuildSystemContribution.prototype.canHandle = function (request) {
            var monacoBuildFile = path.join(request.workspace.toAbsolutePath(), 'monaco.build.json');
            var buildFile = path.join(request.workspace.toAbsolutePath(), 'build.json');
            return pfs.exists(monacoBuildFile).then(function (value) {
                if (value) {
                    return value;
                }
                return pfs.exists(buildFile);
            });
        };
        LegacyBuildSystemContribution.prototype.getBuildSystem = function (request) {
            if (this._buildSystem === null) {
                this._buildSystem = new NakeImpl.LegacyBuildSystem();
            }
            return System.Promise.as(this._buildSystem);
        };
        return LegacyBuildSystemContribution;
    })();
    var Contribution = (function (_super) {
        __extends(Contribution, _super);
        function Contribution() {
            _super.call(this, 'com.microsoft.vs.build.nake', ['com.microsoft.vs.build']);
        }
        Contribution.prototype.registerExtensions = function (server) {
            var buildRegistry = Build.BuildSystemRegistry;
            buildRegistry.registerContribution(new NakeBuildSystemContribution());
            buildRegistry.registerContribution(new LegacyBuildSystemContribution());
        };
        return Contribution;
    })(Contributions.AbstractContribution);
    Contributions.Registry.registerContribution(new Contribution());
});
