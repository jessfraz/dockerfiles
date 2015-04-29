/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
/// <reference path="../../declares.d.ts" />
'use strict';
define(["require", "exports", '../vbDef', 'monaco-testing'], function (require, exports, languageDef, T) {
    var tokenize = T.createTokenize(languageDef.language);
    var assertTokens = T.assertTokens;
    function assertTokensOne(textToTokenize, tokenType) {
        var tokens = tokenize(textToTokenize).tokens;
        assertTokens(tokens, [{ startIndex: 0, type: tokenType }]);
    }
    ;
    T.module('Syntax Highlighting - VB');
    T.test('Comments - single line', function () {
        var tokens = tokenize("'").tokens;
        T.equal(tokens.length, 1);
        assertTokens(tokens, [{ startIndex: 0, type: 'comment.vb' }]);
        tokens = tokenize("    ' a comment").tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: '' },
            { startIndex: 4, type: 'comment.vb' }
        ]);
        tokens = tokenize("' a comment").tokens;
        assertTokens(tokens, [{ startIndex: 0, type: 'comment.vb' }]);
        tokens = tokenize("'sticky comment").tokens;
        assertTokens(tokens, [{ startIndex: 0, type: 'comment.vb' }]);
        tokens = tokenize("1 ' 2; ' comment").tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'number.vb' },
            { startIndex: 1, type: '' },
            { startIndex: 2, type: 'comment.vb' }
        ]);
        tokens = tokenize("Dim x = 1; ' my comment '' is a nice one").tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'keyword.dim.vb' },
            { startIndex: 3, type: '' },
            { startIndex: 4, type: 'identifier.vb' },
            { startIndex: 5, type: '' },
            { startIndex: 6, type: 'delimiter.vb' },
            { startIndex: 7, type: '' },
            { startIndex: 8, type: 'number.vb' },
            { startIndex: 9, type: 'delimiter.vb' },
            { startIndex: 10, type: '' },
            { startIndex: 11, type: 'comment.vb' }
        ]);
        tokens = tokenize('REM this is a comment').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'comment.vb' }
        ]);
        tokens = tokenize('2 + 5 REM comment starts').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'number.vb' },
            { startIndex: 1, type: '' },
            { startIndex: 2, type: 'delimiter.vb' },
            { startIndex: 3, type: '' },
            { startIndex: 4, type: 'number.vb' },
            { startIndex: 5, type: '' },
            { startIndex: 6, type: 'comment.vb' }
        ]);
    });
    T.test('Numbers', function () {
        assertTokensOne('0', 'number.vb');
        assertTokensOne('0.0', 'number.float.vb');
        assertTokensOne('&h123', 'number.hex.vb');
        assertTokensOne('23.5', 'number.float.vb');
        assertTokensOne('23.5e3', 'number.float.vb');
        assertTokensOne('23.5E3', 'number.float.vb');
        assertTokensOne('23.5r', 'number.float.vb');
        assertTokensOne('23.5f', 'number.float.vb');
        assertTokensOne('1.72E3r', 'number.float.vb');
        assertTokensOne('1.72E3r', 'number.float.vb');
        assertTokensOne('1.72e3f', 'number.float.vb');
        assertTokensOne('1.72e3r', 'number.float.vb');
        assertTokensOne('23.5R', 'number.float.vb');
        assertTokensOne('23.5r', 'number.float.vb');
        assertTokensOne('1.72E3#', 'number.float.vb');
        assertTokensOne('1.72E3F', 'number.float.vb');
        assertTokensOne('1.72e3!', 'number.float.vb');
        assertTokensOne('1.72e3f', 'number.float.vb');
        assertTokensOne('1.72e-3', 'number.float.vb');
        var tokens = tokenize('0+0').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'number.vb' },
            { startIndex: 1, type: 'delimiter.vb' },
            { startIndex: 2, type: 'number.vb' }
        ]);
        tokens = tokenize('100+10').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'number.vb' },
            { startIndex: 3, type: 'delimiter.vb' },
            { startIndex: 4, type: 'number.vb' }
        ]);
        tokens = tokenize('0 + 0').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'number.vb' },
            { startIndex: 1, type: '' },
            { startIndex: 2, type: 'delimiter.vb' },
            { startIndex: 3, type: '' },
            { startIndex: 4, type: 'number.vb' }
        ]);
    });
    T.test('Keywords', function () {
        var tokens = tokenize('Imports Microsoft.VisualBasic').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'keyword.imports.vb' },
            { startIndex: 7, type: '' },
            { startIndex: 8, type: 'identifier.vb' },
            { startIndex: 17, type: 'delimiter.vb' },
            { startIndex: 18, type: 'identifier.vb' }
        ]);
        var tokens = tokenize('Private Sub Foo(ByVal sender As String)').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'keyword.private.vb' },
            { startIndex: 7, type: '' },
            { startIndex: 8, type: 'keyword.tag-sub.vb' },
            { startIndex: 11, type: '' },
            { startIndex: 12, type: 'identifier.vb' },
            { startIndex: 15, type: 'delimiter.parenthesis.vb' },
            { startIndex: 16, type: 'keyword.byval.vb' },
            { startIndex: 21, type: '' },
            { startIndex: 22, type: 'identifier.vb' },
            { startIndex: 28, type: '' },
            { startIndex: 29, type: 'keyword.as.vb' },
            { startIndex: 31, type: '' },
            { startIndex: 32, type: 'keyword.string.vb' },
            { startIndex: 38, type: 'delimiter.parenthesis.vb' }
        ]);
    });
    T.test('Strings', function () {
        var tokens = tokenize('String s = \"string\"').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'keyword.string.vb' },
            { startIndex: 6, type: '' },
            { startIndex: 7, type: 'identifier.vb' },
            { startIndex: 8, type: '' },
            { startIndex: 9, type: 'delimiter.vb' },
            { startIndex: 10, type: '' },
            { startIndex: 11, type: 'string.vb' }
        ]);
        tokens = tokenize('\"use strict\";').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'string.vb' },
            { startIndex: 12, type: 'delimiter.vb' }
        ]);
    });
    T.test('Tags', function () {
        var tokens = tokenize('Public Sub ToString()').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'keyword.public.vb' },
            { startIndex: 6, type: '' },
            { startIndex: 7, type: 'keyword.tag-sub.vb' },
            { startIndex: 10, type: '' },
            { startIndex: 11, type: 'identifier.vb' },
            { startIndex: 19, type: 'delimiter.parenthesis.vb' },
            { startIndex: 20, type: 'delimiter.parenthesis.vb' }
        ]);
        var tokens = tokenize('public sub ToString()').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'keyword.public.vb' },
            { startIndex: 6, type: '' },
            { startIndex: 7, type: 'keyword.tag-sub.vb' },
            { startIndex: 10, type: '' },
            { startIndex: 11, type: 'identifier.vb' },
            { startIndex: 19, type: 'delimiter.parenthesis.vb' },
            { startIndex: 20, type: 'delimiter.parenthesis.vb' }
        ]);
        tokens = tokenize('While Do Continue While End While').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'keyword.tag-while.vb' },
            { startIndex: 5, type: '' },
            { startIndex: 6, type: 'keyword.tag-do.vb' },
            { startIndex: 8, type: '' },
            { startIndex: 9, type: 'keyword.tag-continue.vb' },
            { startIndex: 17, type: '' },
            { startIndex: 18, type: 'keyword.tag-while.vb' },
            { startIndex: 23, type: '' },
            { startIndex: 24, type: 'keyword.tag-while.vb' }
        ]);
        tokens = tokenize('While while WHILE WHile whiLe').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'keyword.tag-while.vb' },
            { startIndex: 5, type: '' },
            { startIndex: 6, type: 'keyword.tag-while.vb' },
            { startIndex: 11, type: '' },
            { startIndex: 12, type: 'keyword.tag-while.vb' },
            { startIndex: 17, type: '' },
            { startIndex: 18, type: 'keyword.tag-while.vb' },
            { startIndex: 23, type: '' },
            { startIndex: 24, type: 'keyword.tag-while.vb' }
        ]);
        tokens = tokenize('If b(i) = col Then').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'keyword.tag-if.vb' },
            { startIndex: 2, type: '' },
            { startIndex: 3, type: 'identifier.vb' },
            { startIndex: 4, type: 'delimiter.parenthesis.vb' },
            { startIndex: 5, type: 'identifier.vb' },
            { startIndex: 6, type: 'delimiter.parenthesis.vb' },
            { startIndex: 7, type: '' },
            { startIndex: 8, type: 'delimiter.vb' },
            { startIndex: 9, type: '' },
            { startIndex: 10, type: 'identifier.vb' },
            { startIndex: 13, type: '' },
            { startIndex: 14, type: 'keyword.then.vb' }
        ]);
        tokens = tokenize('Do stuff While True Loop').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'keyword.tag-do.vb' },
            { startIndex: 2, type: '' },
            { startIndex: 3, type: 'identifier.vb' },
            { startIndex: 8, type: '' },
            { startIndex: 9, type: 'keyword.tag-while.vb' },
            { startIndex: 14, type: '' },
            { startIndex: 15, type: 'keyword.true.vb' },
            { startIndex: 19, type: '' },
            { startIndex: 20, type: 'keyword.tag-do.vb' }
        ]);
        tokens = tokenize('For i = 0 To 10 DoStuff Next').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'keyword.tag-for.vb' },
            { startIndex: 3, type: '' },
            { startIndex: 4, type: 'identifier.vb' },
            { startIndex: 5, type: '' },
            { startIndex: 6, type: 'delimiter.vb' },
            { startIndex: 7, type: '' },
            { startIndex: 8, type: 'number.vb' },
            { startIndex: 9, type: '' },
            { startIndex: 10, type: 'keyword.to.vb' },
            { startIndex: 12, type: '' },
            { startIndex: 13, type: 'number.vb' },
            { startIndex: 15, type: '' },
            { startIndex: 16, type: 'identifier.vb' },
            { startIndex: 23, type: '' },
            { startIndex: 24, type: 'keyword.tag-for.vb' }
        ]);
        tokens = tokenize('For stuff End For').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'keyword.tag-for.vb' },
            { startIndex: 3, type: '' },
            { startIndex: 4, type: 'identifier.vb' },
            { startIndex: 9, type: '' },
            { startIndex: 10, type: 'keyword.end.vb' },
            { startIndex: 13, type: '' },
            { startIndex: 14, type: 'keyword.tag-for.vb' }
        ]);
        tokens = tokenize('For stuff end for').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'keyword.tag-for.vb' },
            { startIndex: 3, type: '' },
            { startIndex: 4, type: 'identifier.vb' },
            { startIndex: 9, type: '' },
            { startIndex: 10, type: 'keyword.end.vb' },
            { startIndex: 13, type: '' },
            { startIndex: 14, type: 'keyword.tag-for.vb' }
        ]);
    });
});
