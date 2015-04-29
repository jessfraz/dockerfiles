/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
/// <reference path="../declares.d.ts" />
'use strict';
define(["require", "exports", 'vs/languages/lib/htmlLib', 'monaco'], function (require, exports, htmlLib, monaco) {
    function activate(_ctx) {
        monaco.Modes.FormattingSupport.register('xml', new FormattingSupport(_ctx.modelService));
        return null;
    }
    exports.activate = activate;
    var FormattingSupport = (function () {
        function FormattingSupport(modelService) {
            this.modelService = null;
            this.modelService = modelService;
        }
        FormattingSupport.prototype.formatDocument = function (resource, options) {
            return this.format(resource, null, options);
        };
        FormattingSupport.prototype.formatRange = function (resource, range, options) {
            return this.format(resource, range, options);
        };
        FormattingSupport.prototype.format = function (resource, range, options) {
            var model = this.modelService.getModel(resource);
            var value = range ? model.getValueInRange(range) : model.getValue();
            var result = htmlLib.style_html(value, {
                'indent_size': options.insertSpaces ? options.tabSize : 1,
                'indent_char': options.insertSpaces ? ' ' : '\t',
                'max_char': 256
            });
            return monaco.Promise.as([{
                range: range,
                text: result
            }]);
        };
        return FormattingSupport;
    })();
});
