/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
/// <reference path="../../declares.d.ts" />
'use strict';
define(["require", "exports"], function (require, exports) {
    function html(parts, className) {
        if (className === void 0) { className = ''; }
        if (!parts) {
            return {};
        }
        var htmlParts = parts.map(function (part) {
            return {
                tagName: 'span',
                text: part.text,
                className: part.kind
            };
        });
        return {
            tagName: 'div',
            className: 'ts-symbol ' + className,
            children: htmlParts
        };
    }
    exports.html = html;
    function plain(parts) {
        if (!parts) {
            return '';
        }
        return parts.map(function (part) { return part.text; }).join('');
    }
    exports.plain = plain;
});
