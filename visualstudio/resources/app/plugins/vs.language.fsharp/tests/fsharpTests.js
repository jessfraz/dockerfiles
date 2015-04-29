/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
/// <reference path="../../declares.d.ts" />
'use strict';
define(["require", "exports", '../fsharpDef', 'monaco-testing'], function (require, exports, languageDef, T) {
    var tokenizationSupport = T.createTokenizationSupport(languageDef.language);
    var tokenize = T.createTokenizeFromSupport(tokenizationSupport);
    var assertTokens = T.assertTokens;
    function assertTokensOne(textToTokenize, tokenType) {
        var tokens = tokenize(textToTokenize).tokens;
        assertTokens(tokens, [{ startIndex: 0, type: tokenType }]);
    }
    ;
    T.module('Syntax Highlighting - Fsharp');
    T.test('comments - single line', function () {
        var tokens = tokenize('// one line comment').tokens;
        assertTokens(tokens, [{ startIndex: 0, type: 'comment.fs' }], 'test 1');
        tokens = tokenize('//').tokens;
        T.equal(tokens.length, 1);
        assertTokens(tokens, [{ startIndex: 0, type: 'comment.fs' }], 'test 2');
        tokens = tokenize('    // a comment').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: '' },
            { startIndex: 4, type: 'comment.fs' }
        ], 'test 3');
        tokens = tokenize('// a comment').tokens;
        assertTokens(tokens, [{ startIndex: 0, type: 'comment.fs' }], 'test 4');
        tokens = tokenize('//sticky comment').tokens;
        assertTokens(tokens, [{ startIndex: 0, type: 'comment.fs' }], 'test 5');
        tokens = tokenize('/almost a comment').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'delimiter.fs' },
            { startIndex: 1, type: 'identifier.fs' },
            { startIndex: 7, type: '' },
            { startIndex: 8, type: 'identifier.fs' },
            { startIndex: 9, type: '' },
            { startIndex: 10, type: 'identifier.fs' }
        ], 'test 6');
        tokens = tokenize('(/*almost a comment').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'delimiter.parenthesis.fs' },
            { startIndex: 1, type: 'delimiter.fs' },
            { startIndex: 3, type: 'identifier.fs' },
            { startIndex: 9, type: '' },
            { startIndex: 10, type: 'identifier.fs' },
            { startIndex: 11, type: '' },
            { startIndex: 12, type: 'identifier.fs' }
        ], 'test 7');
        tokens = tokenize('1 / 2; (* comment').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'number.fs' },
            { startIndex: 1, type: '' },
            { startIndex: 2, type: 'delimiter.fs' },
            { startIndex: 3, type: '' },
            { startIndex: 4, type: 'number.fs' },
            { startIndex: 5, type: 'delimiter.fs' },
            { startIndex: 6, type: '' },
            { startIndex: 7, type: 'comment.fs' }
        ], 'test 8');
        tokens = tokenize('let x = 1; // my comment // is a nice one').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'keyword.let.fs' },
            { startIndex: 3, type: '' },
            { startIndex: 4, type: 'identifier.fs' },
            { startIndex: 5, type: '' },
            { startIndex: 6, type: 'delimiter.fs' },
            { startIndex: 7, type: '' },
            { startIndex: 8, type: 'number.fs' },
            { startIndex: 9, type: 'delimiter.fs' },
            { startIndex: 10, type: '' },
            { startIndex: 11, type: 'comment.fs' }
        ], 'test 9');
    });
    T.test('Keywords', function () {
        var tokens = tokenize('namespace Application1').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'keyword.namespace.fs' },
            { startIndex: 9, type: '' },
            { startIndex: 10, type: 'identifier.fs' }
        ], 'test 1');
        tokens = tokenize('type MyType').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'keyword.type.fs' },
            { startIndex: 4, type: '' },
            { startIndex: 5, type: 'identifier.fs' }
        ], 'test 2');
        tokens = tokenize('module App =').tokens;
        assertTokens(tokens, [{ startIndex: 0, type: 'keyword.module.fs' }, { startIndex: 6, type: '' }, { startIndex: 7, type: 'identifier.fs' }, { startIndex: 10, type: '' }, { startIndex: 11, type: 'delimiter.fs' }], 'test 3');
        tokens = tokenize('let AppName = "App1"').tokens;
        assertTokens(tokens, [{ startIndex: 0, type: 'keyword.let.fs' }, { startIndex: 3, type: '' }, { startIndex: 4, type: 'identifier.fs' }, { startIndex: 11, type: '' }, { startIndex: 12, type: 'delimiter.fs' }, { startIndex: 13, type: '' }, { startIndex: 14, type: 'string.fs' }], 'test 4');
    });
    T.test('Comments - range comment', function () {
        var tokens = tokenize('(* a simple comment *)').tokens;
        assertTokens(tokens, [{ startIndex: 0, type: 'comment.fs' }]);
        tokens = tokenize('let x = (* a simple comment *) 1').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'keyword.let.fs' },
            { startIndex: 3, type: '' },
            { startIndex: 4, type: 'identifier.fs' },
            { startIndex: 5, type: '' },
            { startIndex: 6, type: 'delimiter.fs' },
            { startIndex: 7, type: '' },
            { startIndex: 8, type: 'comment.fs' },
            { startIndex: 30, type: '' },
            { startIndex: 31, type: 'number.fs' }
        ], 'test 1');
        tokens = tokenize('x = (**)').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'identifier.fs' },
            { startIndex: 1, type: '' },
            { startIndex: 2, type: 'delimiter.fs' },
            { startIndex: 3, type: '' },
            { startIndex: 4, type: 'comment.fs' },
        ], 'test 2');
        tokens = tokenize('x = (*)').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'identifier.fs' },
            { startIndex: 1, type: '' },
            { startIndex: 2, type: 'delimiter.fs' },
            { startIndex: 3, type: '' },
            { startIndex: 4, type: 'comment.fs' }
        ], 'test 3');
    });
    T.test('Numbers', function () {
        assertTokensOne('0', 'number.fs');
        assertTokensOne('0x123', 'number.hex.fs');
        assertTokensOne('23.5', 'number.float.fs');
        assertTokensOne('23.5e3', 'number.float.fs');
        assertTokensOne('23.5E3', 'number.float.fs');
        assertTokensOne('23.5F', 'number.float.fs');
        assertTokensOne('23.5f', 'number.float.fs');
        assertTokensOne('1.72E3F', 'number.float.fs');
        assertTokensOne('1.72E3f', 'number.float.fs');
        assertTokensOne('1.72e3F', 'number.float.fs');
        assertTokensOne('1.72e3f', 'number.float.fs');
        assertTokensOne('23.5M', 'number.float.fs');
        assertTokensOne('23.5m', 'number.float.fs');
        assertTokensOne('1.72E3M', 'number.float.fs');
        assertTokensOne('1.72E3m', 'number.float.fs');
        assertTokensOne('1.72e3M', 'number.float.fs');
        assertTokensOne('1.72e3m', 'number.float.fs');
        var tokens = tokenize('0+0').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'number.fs' },
            { startIndex: 1, type: 'delimiter.fs' },
            { startIndex: 2, type: 'number.fs' }
        ]);
        tokens = tokenize('100+10').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'number.fs' },
            { startIndex: 3, type: 'delimiter.fs' },
            { startIndex: 4, type: 'number.fs' }
        ]);
        tokens = tokenize('0 + 0').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'number.fs' },
            { startIndex: 1, type: '' },
            { startIndex: 2, type: 'delimiter.fs' },
            { startIndex: 3, type: '' },
            { startIndex: 4, type: 'number.fs' }
        ]);
        assertTokensOne('0b00000101', 'number.bin.fs');
        assertTokensOne('86y', 'number.fs');
        assertTokensOne('0b00000101y', 'number.bin.fs');
        assertTokensOne('86s', 'number.fs');
        assertTokensOne('86us', 'number.fs');
        assertTokensOne('86', 'number.fs');
        assertTokensOne('86l', 'number.fs');
        assertTokensOne('86u', 'number.fs');
        assertTokensOne('86ul', 'number.fs');
        assertTokensOne('0x00002D3Fn', 'number.hex.fs');
        assertTokensOne('0x00002D3Fun', 'number.hex.fs');
        assertTokensOne('86L', 'number.fs');
        assertTokensOne('86UL', 'number.fs');
        assertTokensOne('9999999999999999999999999999I', 'number.fs');
        assertTokensOne('0x00002D3FLF', 'number.float.fs');
    });
});
