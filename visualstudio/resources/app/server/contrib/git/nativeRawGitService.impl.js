/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
'use strict';
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", 'path', './git.lib', './rawGitService', '../../lib/temp', '../../lib/utils'], function (require, exports, path, gitlib, service, temp, util) {
    var emptyPath = (function () {
        if (util.isWindows()) {
            return path.join(__dirname, '..', '..', 'home', 'empty.cmd');
        }
        else {
            return path.join(__dirname, '..', '..', 'home', 'empty.sh');
        }
    })();
    var NativeRawGitService = (function (_super) {
        __extends(NativeRawGitService, _super);
        function NativeRawGitService(gitPath, basePath) {
            if (!gitPath) {
                _super.call(this, null);
                return;
            }
            var env = util.mixin({}, process.env);
            env['GIT_ASKPASS'] = emptyPath;
            var git = new gitlib.Git({
                gitPath: gitPath,
                tmpPath: temp.getOSTempPathSync(),
                env: env
            });
            _super.call(this, git.open(path.normalize(basePath)));
        }
        return NativeRawGitService;
    })(service.RawGitService);
    exports.NativeRawGitService = NativeRawGitService;
});
