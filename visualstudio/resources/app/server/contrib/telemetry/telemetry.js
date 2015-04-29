/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
'use strict';
define(["require", "exports"], function (require, exports) {
    exports.id = 'com.microsoft.vs.telemetryService';
    (function (EventType) {
        EventType[EventType["Public"] = 0] = "Public";
        EventType[EventType["Restricted"] = 1] = "Restricted";
    })(exports.EventType || (exports.EventType = {}));
    var EventType = exports.EventType;
});
