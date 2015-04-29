/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
/// <reference path="../../declares.d.ts" />
'use strict';
define(["require", "exports", '../rubyDef', 'monaco-testing'], function (require, exports, rubyDef, T) {
    var tokenize = T.createTokenize(rubyDef.language);
    var assertTokens = T.assertTokens;
    T.module('Ruby Colorizer');
    T.test('Keywords', function () {
        var tokens = tokenize('class Klass def init() end').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'keyword.class.ruby' },
            { startIndex: 5, type: 'white.ruby' },
            { startIndex: 6, type: 'constructor.identifier.ruby' },
            { startIndex: 11, type: 'white.ruby' },
            { startIndex: 12, type: 'keyword.def.ruby' },
            { startIndex: 15, type: 'white.ruby' },
            { startIndex: 16, type: 'identifier.ruby' },
            { startIndex: 20, type: 'delimiter.parenthesis.ruby' },
            { startIndex: 21, type: 'delimiter.parenthesis.ruby' },
            { startIndex: 22, type: 'white.ruby' },
            { startIndex: 23, type: 'keyword.def.ruby' }
        ]);
    });
    T.test('Single digit', function () {
        var tokens = tokenize('x == 1 ').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'identifier.ruby' },
            { startIndex: 1, type: 'white.ruby' },
            { startIndex: 2, type: 'operator.ruby' },
            { startIndex: 4, type: 'white.ruby' },
            { startIndex: 5, type: 'number.ruby' },
            { startIndex: 6, type: 'white.ruby' }
        ]);
    });
});
