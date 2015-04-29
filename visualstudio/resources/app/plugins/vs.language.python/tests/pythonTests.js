/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
/// <reference path="../../declares.d.ts" />
'use strict';
define(["require", "exports", '../pythonDef', 'monaco-testing'], function (require, exports, pythonDef, T) {
    var tokenize = T.createTokenize(pythonDef.language);
    var assertTokens = T.assertTokens;
    T.module('Python Colorizer');
    T.test('Keywords', function () {
        var tokens = tokenize('def func():').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'keyword.python' },
            { startIndex: 3, type: 'white.python' },
            { startIndex: 4, type: 'identifier.python' },
            { startIndex: 8, type: 'delimiter.parenthesis.python' },
            { startIndex: 9, type: 'delimiter.parenthesis.python' },
            { startIndex: 10, type: 'delimiter.python' }
        ]);
        var tokens = tokenize('func(str Y3)').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'identifier.python' },
            { startIndex: 4, type: 'delimiter.parenthesis.python' },
            { startIndex: 5, type: 'keyword.python' },
            { startIndex: 8, type: 'white.python' },
            { startIndex: 9, type: 'identifier.python' },
            { startIndex: 11, type: 'delimiter.parenthesis.python' }
        ]);
        var tokens = tokenize('@Dec0_rator:').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'tag.python' },
            { startIndex: 11, type: 'delimiter.python' }
        ]);
    });
    T.test('Comments', function () {
        var tokens = tokenize(' # Comments! ## "jfkd" ').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'white.python' },
            { startIndex: 1, type: 'comment.python' }
        ]);
    });
    T.test('Strings', function () {
        var tokens = tokenize('\'s0\'').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'string.escape.python' },
            { startIndex: 1, type: 'string.python' },
            { startIndex: 3, type: 'string.escape.python' }
        ]);
        var tokens = tokenize('"\' " "').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'string.escape.python' },
            { startIndex: 1, type: 'string.python' },
            { startIndex: 3, type: 'string.escape.python' },
            { startIndex: 4, type: 'white.python' },
            { startIndex: 5, type: 'string.escape.python' }
        ]);
        var tokens = tokenize('\'\'\'Lots of string\'\'\'').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'string.python' }
        ]);
        var tokens = tokenize('"""Lots \'\'\'     \'\'\'"""').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'string.python' }
        ]);
        var tokens = tokenize('\'\'\'Lots \'\'\'0.3e-5').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'string.python' },
            { startIndex: 11, type: 'number.python' }
        ]);
    });
    T.test('Numbers', function () {
        var tokens = tokenize('0xAcBFd').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'number.hex.python' }
        ]);
        var tokens = tokenize('0x0cH').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'number.hex.python' },
            { startIndex: 4, type: 'identifier.python' }
        ]);
        var tokens = tokenize('456.7e-7j').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'number.python' },
        ]);
    });
});
