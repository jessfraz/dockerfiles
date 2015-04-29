/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
/// <reference path="../../declare/node.d.ts" />
/// <reference path="../../declare/express.d.ts" />
'use strict';
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", '../../lib/events'], function (require, exports, eventEmitter) {
    var InterProcessCommunicationService = (function (_super) {
        __extends(InterProcessCommunicationService, _super);
        function InterProcessCommunicationService() {
            _super.call(this);
        }
        InterProcessCommunicationService.prototype.name = function () {
            return 'interProcessCommunicationService';
        };
        return InterProcessCommunicationService;
    })(eventEmitter.EventEmitter);
    exports.service = new InterProcessCommunicationService();
});
