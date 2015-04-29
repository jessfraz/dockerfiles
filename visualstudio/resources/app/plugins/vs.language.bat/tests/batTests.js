/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
/// <reference path="../../declares.d.ts" />
'use strict';
define(["require", "exports", '../batDef', 'monaco-testing'], function (require, exports, languageDef, T) {
    var tokenizationSupport = T.createTokenizationSupport(languageDef.language);
    var tokenize = T.createTokenizeFromSupport(tokenizationSupport);
    var assertTokens = T.assertTokens;
    function assertTokensOne(textToTokenize, tokenType) {
        var tokens = tokenize(textToTokenize).tokens;
        assertTokens(tokens, [{ startIndex: 0, type: tokenType }]);
    }
    ;
    T.module('Syntax Highlighting - Batch file');
    T.test('Keywords', function () {
        var tokens = tokenize('@echo off title Selfhost').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'keyword.bat' },
            { startIndex: 1, type: 'keyword.echo.bat' },
            { startIndex: 5, type: '' },
            { startIndex: 10, type: 'keyword.title.bat' },
            { startIndex: 15, type: '' }
        ]);
    });
    T.test('Comments - single line', function () {
        var tokens = tokenize('REM').tokens;
        T.equal(tokens.length, 1);
        assertTokens(tokens, [{ startIndex: 0, type: 'comment.bat' }]);
        tokens = tokenize('    REM a comment').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: '' },
            { startIndex: 4, type: 'comment.bat' }
        ]);
        tokens = tokenize('REM a comment').tokens;
        assertTokens(tokens, [{ startIndex: 0, type: 'comment.bat' }]);
        tokens = tokenize('REMnot a comment').tokens;
        assertTokens(tokens, [{ startIndex: 0, type: '' }]);
    });
    T.test('Numbers', function () {
        assertTokensOne('0', 'number.bat');
        assertTokensOne('0.0', 'number.float.bat');
        assertTokensOne('0x123', 'number.hex.bat');
        assertTokensOne('23.5', 'number.float.bat');
        assertTokensOne('23.5e3', 'number.float.bat');
        assertTokensOne('23.5E3', 'number.float.bat');
        assertTokensOne('1.72e-3', 'number.float.bat');
        var tokens = tokenize('0+0').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'number.bat' },
            { startIndex: 1, type: 'delimiter.bat' },
            { startIndex: 2, type: 'number.bat' }
        ]);
        tokens = tokenize('100+10').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'number.bat' },
            { startIndex: 3, type: 'delimiter.bat' },
            { startIndex: 4, type: 'number.bat' }
        ]);
        tokens = tokenize('0 + 0').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'number.bat' },
            { startIndex: 1, type: '' },
            { startIndex: 2, type: 'delimiter.bat' },
            { startIndex: 3, type: '' },
            { startIndex: 4, type: 'number.bat' }
        ]);
    });
    T.test('Strings', function () {
        var tokens = tokenize('set s = \"string\"').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'keyword.set.bat' },
            { startIndex: 3, type: '' },
            { startIndex: 6, type: 'delimiter.bat' },
            { startIndex: 7, type: '' },
            { startIndex: 8, type: 'string.bat' }
        ]);
        tokens = tokenize('\"use strict\";').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'string.bat' },
            { startIndex: 12, type: 'delimiter.bat' }
        ]);
    });
    T.test('Tags', function () {
        var tokens = tokenize('setlocal endlocal').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'keyword.tag-setlocal.bat' },
            { startIndex: 8, type: '' },
            { startIndex: 9, type: 'keyword.tag-setlocal.bat' }
        ]);
        tokens = tokenize('setlocal ENDLOCAL').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'keyword.tag-setlocal.bat' },
            { startIndex: 8, type: '' },
            { startIndex: 9, type: 'keyword.tag-setlocal.bat' }
        ]);
        tokens = tokenize('SETLOCAL endlocal').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'keyword.tag-setlocal.bat' },
            { startIndex: 8, type: '' },
            { startIndex: 9, type: 'keyword.tag-setlocal.bat' }
        ]);
        tokens = tokenize('setlocal setlocal endlocal').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'keyword.tag-setlocal.bat' },
            { startIndex: 8, type: '' },
            { startIndex: 9, type: 'keyword.tag-setlocal.bat' },
            { startIndex: 17, type: '' },
            { startIndex: 18, type: 'keyword.tag-setlocal.bat' }
        ]);
    });
    T.test('Monarch generated', function () {
        var previousState = tokenizationSupport.getInitialState();
        // Line 1
        var src = 'rem asdf';
        var tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: 'comment.bat' }
        ]);
        // Line 2
        src = '';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
        ]);
        // Line 3
        src = 'REM';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: 'comment.bat' }
        ]);
        // Line 4
        src = '';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
        ]);
        // Line 5
        src = 'REMOVED not a comment really';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '' },
            { startIndex: 8, type: 'keyword.not.bat' },
            { startIndex: 11, type: '' }
        ]);
        // Line 6
        src = '';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
        ]);
        // Line 7
        src = 'echo cool';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: 'keyword.echo.bat' },
            { startIndex: 4, type: '' }
        ]);
        // Line 8
        src = '@echo off';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: 'keyword.bat' },
            { startIndex: 1, type: 'keyword.echo.bat' },
            { startIndex: 5, type: '' }
        ]);
        // Line 9
        src = '';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
        ]);
        // Line 10
        src = 'setlocAL';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: 'keyword.tag-setlocal.bat' }
        ]);
        // Line 11
        src = '	asdf';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '' }
        ]);
        // Line 12
        src = '	asdf';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '' }
        ]);
        // Line 13
        src = 'endLocaL';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: 'keyword.tag-setlocal.bat' }
        ]);
        // Line 14
        src = '';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
        ]);
        // Line 15
        src = 'call';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: 'keyword.call.bat' }
        ]);
        // Line 16
        src = '';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
        ]);
        // Line 17
        src = ':MyLabel';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: 'metatag.bat' }
        ]);
        // Line 18
        src = 'some command';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '' }
        ]);
        // Line 19
        src = '';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
        ]);
        // Line 20
        src = '%sdfsdf% ';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: 'variable.bat' },
            { startIndex: 8, type: '' }
        ]);
        // Line 21
        src = '';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
        ]);
        // Line 22
        src = 'this is "a string %sdf% asdf"';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '' },
            { startIndex: 8, type: 'string.bat' },
            { startIndex: 18, type: 'variable.bat' },
            { startIndex: 23, type: 'string.bat' }
        ]);
        // Line 23
        src = '';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
        ]);
        // Line 24
        src = '';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
        ]);
        // Line 25
        src = 'FOR %%A IN (1 2 3) DO (';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: 'keyword.for.bat' },
            { startIndex: 3, type: '' },
            { startIndex: 4, type: 'variable.bat' },
            { startIndex: 7, type: '' },
            { startIndex: 11, type: 'delimiter.parenthesis.bat' },
            { startIndex: 12, type: 'number.bat' },
            { startIndex: 13, type: '' },
            { startIndex: 14, type: 'number.bat' },
            { startIndex: 15, type: '' },
            { startIndex: 16, type: 'number.bat' },
            { startIndex: 17, type: 'delimiter.parenthesis.bat' },
            { startIndex: 18, type: '' },
            { startIndex: 22, type: 'delimiter.parenthesis.bat' }
        ]);
        // Line 26
        src = '	SET VAR1=%VAR1%%%A';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '' },
            { startIndex: 1, type: 'keyword.set.bat' },
            { startIndex: 4, type: '' },
            { startIndex: 9, type: 'delimiter.bat' },
            { startIndex: 10, type: 'variable.bat' }
        ]);
        // Line 27
        src = '	SET VAR2=%VAR2%%%A';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '' },
            { startIndex: 1, type: 'keyword.set.bat' },
            { startIndex: 4, type: '' },
            { startIndex: 9, type: 'delimiter.bat' },
            { startIndex: 10, type: 'variable.bat' }
        ]);
        // Line 28
        src = '	use \'string %%a asdf asdf\'';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '' },
            { startIndex: 5, type: 'string.bat' },
            { startIndex: 13, type: 'variable.bat' },
            { startIndex: 16, type: 'string.bat' }
        ]);
        // Line 29
        src = '	non terminated "string %%aaa sdf';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '' },
            { startIndex: 16, type: 'string.bat' },
            { startIndex: 24, type: 'variable.bat' },
            { startIndex: 29, type: 'string.bat' }
        ]);
        // Line 30
        src = '	this shold NOT BE red';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '' },
            { startIndex: 12, type: 'keyword.not.bat' },
            { startIndex: 15, type: '' }
        ]);
        // Line 31
        src = ')';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: 'delimiter.parenthesis.bat' }
        ]);
    });
});
