/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
/// <reference path="../declares.d.ts" />
'use strict';
define(["require", "exports"], function (require, exports) {
    exports.language = {
        displayName: 'Batch',
        name: 'bat',
        mimeTypes: [],
        defaultToken: '',
        ignoreCase: true,
        lineComment: 'REM',
        autoClosingPairs: [['{', '}'], ['[', ']'], ['(', ')'], ['"', '"']],
        brackets: [
            { token: 'delimiter.bracket', open: '{', close: '}' },
            { token: 'delimiter.parenthesis', open: '(', close: ')' },
            { token: 'delimiter.square', open: '[', close: ']' }
        ],
        textAfterBrackets: true,
        enhancedBrackets: [
            {
                openTrigger: 'l',
                open: /setlocal/i,
                closeComplete: 'endlocal',
                matchCase: true,
                closeTrigger: 'l',
                close: /endlocal$/i,
                tokenType: 'keyword.tag-setlocal'
            }
        ],
        keywords: /call|defined|echo|errorlevel|exist|for|goto|if|pause|set|shift|start|title|not|pushd|popd/,
        // we include these common regular expressions
        symbols: /[=><!~?&|+\-*\/\^;\.,]+/,
        escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,
        // The main tokenizer for our languages
        tokenizer: {
            root: [
                [/^(\s*)(rem(?:\s.*|))$/, ['', 'comment']],
                [/(\@?)(@keywords)(?!\w)/, [{ token: 'keyword' }, { token: 'keyword.$2' }]],
                [/[ \t\r\n]+/, ''],
                [/setlocal(?!\w)/, { token: 'keyword.tag-setlocal', bracket: '@open' }],
                [/endlocal(?!\w)/, { token: 'keyword.tag-setlocal', bracket: '@close' }],
                [/[a-zA-Z_]\w*/, ''],
                [/:\w*/, 'metatag'],
                [/%[\w ]+%/, 'variable'],
                [/%%[\w]+(?!\w)/, 'variable'],
                [/[{}()\[\]]/, '@brackets'],
                [/@symbols/, 'delimiter'],
                [/\d*\.\d+([eE][\-+]?\d+)?/, 'number.float'],
                [/0[xX][0-9a-fA-F_]*[0-9a-fA-F]/, 'number.hex'],
                [/\d+/, 'number'],
                [/[;,.]/, 'delimiter'],
                [/"/, 'string', '@string."'],
                [/'/, 'string', '@string.\''],
            ],
            string: [
                [/[^\\"'%]+/, { cases: { '@eos': { token: 'string', next: '@popall' }, '@default': 'string' } }],
                [/@escapes/, 'string.escape'],
                [/\\./, 'string.escape.invalid'],
                [/%[\w ]+%/, 'variable'],
                [/%%[\w]+(?!\w)/, 'variable'],
                [/["']/, { cases: { '$#==$S2': { token: 'string', next: '@pop' }, '@default': 'string' } }],
                [/$/, 'string', '@popall']
            ],
        },
    };
});
