/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
/// <reference path="declare/node.d.ts" />
/// <reference path="declare/express.d.ts" />
'use strict';
define(["require", "exports"], function (require, exports) {
    /**
     * Provide global access to the options the server runs with.
     */
    exports.options;
    /**
     * Guessing the project type from the workspace
     */
    (function (ProjectType) {
        ProjectType[ProjectType["ASP"] = 0] = "ASP";
        ProjectType[ProjectType["PHP"] = 1] = "PHP";
        ProjectType[ProjectType["Python"] = 2] = "Python";
        ProjectType[ProjectType["Node"] = 3] = "Node";
        ProjectType[ProjectType["HTML"] = 4] = "HTML";
        ProjectType[ProjectType["Unknown"] = 5] = "Unknown";
        ProjectType[ProjectType["NEW_SITE"] = 6] = "NEW_SITE";
        ProjectType[ProjectType["Java"] = 7] = "Java";
    })(exports.ProjectType || (exports.ProjectType = {}));
    var ProjectType = exports.ProjectType;
});
