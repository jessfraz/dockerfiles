/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
/// <reference path="../../../declare/node.d.ts" />
/// <reference path="../../../declare/graceful-fs.d.ts" />
'use strict';
define(["require", "exports", 'graceful-fs', '../../../lib/extfs', '../../../lib/system', '../../../lib/types', '../../../lib/pfs'], function (require, exports, gracefulFS, extfs, winjs, types, pfs) {
    // Force TS reference on gracefulFS
    if (typeof gracefulFS.readFileSync === 'function') {
    }
    var GlobRunner = (function () {
        function GlobRunner() {
        }
        GlobRunner.prototype.walk = function (absolutePath, includePattern, excludePattern, limit) {
            return new extfs.FSWalker(includePattern, excludePattern, limit + 1).walk(absolutePath).then(function (paths) {
                // Check for limit
                if (paths.length > limit) {
                    return winjs.TPromise.as({ limitHit: true });
                }
                // Resolve stats
                var statPromises = [];
                paths.forEach(function (path) {
                    statPromises.push(pfs.stat(path).then(function (stat) {
                        return {
                            path: path,
                            isDirectory: stat.isDirectory(),
                            mtime: stat.mtime.getTime(),
                            size: stat.size
                        };
                    }, function (error) { return winjs.Promise.as(null); }));
                });
                return winjs.TPromise.join(statPromises).then(function (matches) {
                    return { matches: types.coalesce(matches) };
                });
            });
        };
        return GlobRunner;
    })();
    exports.GlobRunner = GlobRunner;
});
