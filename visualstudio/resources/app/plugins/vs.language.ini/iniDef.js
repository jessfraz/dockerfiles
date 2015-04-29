/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
/// <reference path="../declares.d.ts" />
'use strict';
define(["require", "exports"], function (require, exports) {
    exports.language = {
        displayName: 'Ini',
        name: 'ini',
        mimeTypes: [],
        defaultToken: '',
        lineComment: '#',
        blockCommentStart: '#',
        blockCommentEnd: ' ',
        // we include these common regular expressions
        escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,
        // The main tokenizer for our languages
        tokenizer: {
            root: [
                [/^\[[^\]]*\]/, 'metatag'],
                [/(^\w+)(\s*)(\=)/, ['key', '', 'delimiter']],
                { include: '@whitespace' },
                [/\d+/, 'number'],
                [/"([^"\\]|\\.)*$/, 'string.invalid'],
                [/'([^'\\]|\\.)*$/, 'string.invalid'],
                [/"/, 'string', '@string."'],
                [/'/, 'string', '@string.\''],
            ],
            whitespace: [
                [/[ \t\r\n]+/, ''],
                [/^\s*[#;].*$/, 'comment'],
            ],
            string: [
                [/[^\\"']+/, 'string'],
                [/@escapes/, 'string.escape'],
                [/\\./, 'string.escape.invalid'],
                [/["']/, { cases: { '$#==$S2': { token: 'string', next: '@pop' }, '@default': 'string' } }]
            ],
        },
    };
});
