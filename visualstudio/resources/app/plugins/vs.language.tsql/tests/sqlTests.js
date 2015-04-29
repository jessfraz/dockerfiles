/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
/// <reference path="../../declares.d.ts" />
'use strict';
define(["require", "exports", '../sqlDef', 'monaco-testing'], function (require, exports, sqlDef, T) {
    var tokenize = T.createTokenize(sqlDef.language);
    var assertTokens = T.assertTokens;
    T.module('SQL Colorizer');
    T.test('Comments', function () {
        var tokens = tokenize('-- a comment').tokens;
        assertTokens(tokens, [{ startIndex: 0, type: 'comment.sql' }]);
        tokens = tokenize('---sticky -- comment').tokens;
        assertTokens(tokens, [{ startIndex: 0, type: 'comment.sql' }]);
        tokens = tokenize('-almost a comment').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'operator.sql' },
            { startIndex: 1, type: 'identifier.sql' },
            { startIndex: 7, type: 'white.sql' },
            { startIndex: 8, type: 'identifier.sql' },
            { startIndex: 9, type: 'white.sql' },
            { startIndex: 10, type: 'identifier.sql' }
        ]);
        tokens = tokenize('/* a full line comment */').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'comment.quote.sql', bracket: 1 },
            { startIndex: 2, type: 'comment.sql', bracket: 0 },
            { startIndex: 23, type: 'comment.quote.sql', bracket: -1 }
        ]);
        tokens = tokenize('/* /// *** /// */').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'comment.quote.sql' },
            { startIndex: 2, type: 'comment.sql' },
            { startIndex: 15, type: 'comment.quote.sql' }
        ]);
        tokens = tokenize('declare @x int = /* a simple comment */ 1;').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'keyword.sql' },
            { startIndex: 7, type: 'white.sql' },
            { startIndex: 8, type: 'identifier.sql' },
            { startIndex: 10, type: 'white.sql' },
            { startIndex: 11, type: 'keyword.sql' },
            { startIndex: 14, type: 'white.sql' },
            { startIndex: 15, type: 'operator.sql' },
            { startIndex: 16, type: 'white.sql' },
            { startIndex: 17, type: 'comment.quote.sql' },
            { startIndex: 19, type: 'comment.sql' },
            { startIndex: 37, type: 'comment.quote.sql' },
            { startIndex: 39, type: 'white.sql' },
            { startIndex: 40, type: 'number.sql' },
            { startIndex: 41, type: 'delimiter.sql' }
        ]);
        tokens = tokenize('@x=/* a /* nested comment */ 1*/;').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'identifier.sql' },
            { startIndex: 2, type: 'operator.sql' },
            { startIndex: 3, type: 'comment.quote.sql', bracket: 1 },
            { startIndex: 5, type: 'comment.sql', bracket: 0 },
            { startIndex: 8, type: 'comment.quote.sql', bracket: 1 },
            { startIndex: 10, type: 'comment.sql', bracket: 0 },
            { startIndex: 26, type: 'comment.quote.sql', bracket: -1 },
            { startIndex: 28, type: 'comment.sql', bracket: 0 },
            { startIndex: 30, type: 'comment.quote.sql', bracket: -1 },
            { startIndex: 32, type: 'delimiter.sql' }
        ]);
        tokens = tokenize('@x=/* another comment */ 1*/;').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'identifier.sql' },
            { startIndex: 2, type: 'operator.sql' },
            { startIndex: 3, type: 'comment.quote.sql' },
            { startIndex: 5, type: 'comment.sql' },
            { startIndex: 22, type: 'comment.quote.sql' },
            { startIndex: 24, type: 'white.sql' },
            { startIndex: 25, type: 'number.sql' },
            { startIndex: 26, type: 'operator.sql' },
            { startIndex: 28, type: 'delimiter.sql' }
        ]);
        tokens = tokenize('@x=/*/;').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'identifier.sql' },
            { startIndex: 2, type: 'operator.sql' },
            { startIndex: 3, type: 'comment.quote.sql' },
            { startIndex: 5, type: 'comment.sql' }
        ]);
    });
    T.test('Numbers', function () {
        var tokens = tokenize('123').tokens;
        assertTokens(tokens, [{ startIndex: 0, type: 'number.sql' }]);
        tokens = tokenize('-123').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'operator.sql' },
            { startIndex: 1, type: 'number.sql' }
        ]);
        tokens = tokenize('0xaBc123').tokens;
        assertTokens(tokens, [{ startIndex: 0, type: 'number.sql' }]);
        tokens = tokenize('0XaBc123').tokens;
        assertTokens(tokens, [{ startIndex: 0, type: 'number.sql' }]);
        tokens = tokenize('0x').tokens;
        assertTokens(tokens, [{ startIndex: 0, type: 'number.sql' }]);
        tokens = tokenize('0x0').tokens;
        assertTokens(tokens, [{ startIndex: 0, type: 'number.sql' }]);
        tokens = tokenize('0xAB_CD').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'number.sql' },
            { startIndex: 4, type: 'identifier.sql' }
        ]);
        tokens = tokenize('$').tokens;
        assertTokens(tokens, [{ startIndex: 0, type: 'number.sql' }]);
        tokens = tokenize('$-123').tokens;
        assertTokens(tokens, [{ startIndex: 0, type: 'number.sql' }]);
        tokens = tokenize('$-+-123').tokens;
        assertTokens(tokens, [{ startIndex: 0, type: 'number.sql' }]);
        tokens = tokenize('$123.5678').tokens;
        assertTokens(tokens, [{ startIndex: 0, type: 'number.sql' }]);
        tokens = tokenize('$0.99').tokens;
        assertTokens(tokens, [{ startIndex: 0, type: 'number.sql' }]);
        tokens = tokenize('$.99').tokens;
        assertTokens(tokens, [{ startIndex: 0, type: 'number.sql' }]);
        tokens = tokenize('$99.').tokens;
        assertTokens(tokens, [{ startIndex: 0, type: 'number.sql' }]);
        tokens = tokenize('$0.').tokens;
        assertTokens(tokens, [{ startIndex: 0, type: 'number.sql' }]);
        tokens = tokenize('$.0').tokens;
        assertTokens(tokens, [{ startIndex: 0, type: 'number.sql' }]);
        tokens = tokenize('.').tokens;
        assertTokens(tokens, [{ startIndex: 0, type: 'delimiter.sql' }]);
        tokens = tokenize('123').tokens;
        assertTokens(tokens, [{ startIndex: 0, type: 'number.sql' }]);
        tokens = tokenize('123.5678').tokens;
        assertTokens(tokens, [{ startIndex: 0, type: 'number.sql' }]);
        tokens = tokenize('0.99').tokens;
        assertTokens(tokens, [{ startIndex: 0, type: 'number.sql' }]);
        tokens = tokenize('.99').tokens;
        assertTokens(tokens, [{ startIndex: 0, type: 'number.sql' }]);
        tokens = tokenize('99.').tokens;
        assertTokens(tokens, [{ startIndex: 0, type: 'number.sql' }]);
        tokens = tokenize('0.').tokens;
        assertTokens(tokens, [{ startIndex: 0, type: 'number.sql' }]);
        tokens = tokenize('.0').tokens;
        assertTokens(tokens, [{ startIndex: 0, type: 'number.sql' }]);
        tokens = tokenize('1E-2').tokens;
        assertTokens(tokens, [{ startIndex: 0, type: 'number.sql' }]);
        tokens = tokenize('1E+2').tokens;
        assertTokens(tokens, [{ startIndex: 0, type: 'number.sql' }]);
        tokens = tokenize('1E2').tokens;
        assertTokens(tokens, [{ startIndex: 0, type: 'number.sql' }]);
        tokens = tokenize('0.1E2').tokens;
        assertTokens(tokens, [{ startIndex: 0, type: 'number.sql' }]);
        tokens = tokenize('1.E2').tokens;
        assertTokens(tokens, [{ startIndex: 0, type: 'number.sql' }]);
        tokens = tokenize('.1E2').tokens;
        assertTokens(tokens, [{ startIndex: 0, type: 'number.sql' }]);
    });
    T.test('Identifiers', function () {
        var tokens = tokenize('_abc$01').tokens;
        assertTokens(tokens, [{ startIndex: 0, type: 'identifier.sql' }]);
        tokens = tokenize('#abc$01').tokens;
        assertTokens(tokens, [{ startIndex: 0, type: 'identifier.sql' }]);
        tokens = tokenize('##abc$01').tokens;
        assertTokens(tokens, [{ startIndex: 0, type: 'identifier.sql' }]);
        tokens = tokenize('@abc$01').tokens;
        assertTokens(tokens, [{ startIndex: 0, type: 'identifier.sql' }]);
        tokens = tokenize('@@abc$01').tokens;
        assertTokens(tokens, [{ startIndex: 0, type: 'identifier.sql' }]);
        tokens = tokenize('$abc').tokens;
        assertTokens(tokens, [{ startIndex: 0, type: 'identifier.sql' }]);
        tokens = tokenize('$action').tokens;
        assertTokens(tokens, [{ startIndex: 0, type: 'predefined.sql' }]);
        tokens = tokenize('$nonexistent').tokens;
        assertTokens(tokens, [{ startIndex: 0, type: 'identifier.sql' }]);
        tokens = tokenize('@@DBTS').tokens;
        assertTokens(tokens, [{ startIndex: 0, type: 'predefined.sql' }]);
        tokens = tokenize('@@nonexistent').tokens;
        assertTokens(tokens, [{ startIndex: 0, type: 'identifier.sql' }]);
        tokens = tokenize('declare [abc 321];').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'keyword.sql' },
            { startIndex: 7, type: 'white.sql' },
            { startIndex: 8, type: 'identifier.quote.sql', bracket: 1 },
            { startIndex: 9, type: 'identifier.sql', bracket: 0 },
            { startIndex: 16, type: 'identifier.quote.sql', bracket: -1 },
            { startIndex: 17, type: 'delimiter.sql' }
        ]);
        tokens = tokenize('[abc[[ 321 ]] xyz]').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'identifier.quote.sql' },
            { startIndex: 1, type: 'identifier.sql' },
            { startIndex: 17, type: 'identifier.quote.sql' }
        ]);
        tokens = tokenize('[abc').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'identifier.quote.sql' },
            { startIndex: 1, type: 'identifier.sql' }
        ]);
        tokens = tokenize('declare "abc 321";').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'keyword.sql' },
            { startIndex: 7, type: 'white.sql' },
            { startIndex: 8, type: 'identifier.quote.sql', bracket: 1 },
            { startIndex: 9, type: 'identifier.sql', bracket: 0 },
            { startIndex: 16, type: 'identifier.quote.sql', bracket: -1 },
            { startIndex: 17, type: 'delimiter.sql' }
        ]);
        tokens = tokenize('"abc"" 321 "" xyz"').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'identifier.quote.sql' },
            { startIndex: 1, type: 'identifier.sql' },
            { startIndex: 17, type: 'identifier.quote.sql' }
        ]);
        tokens = tokenize('"abc').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'identifier.quote.sql' },
            { startIndex: 1, type: 'identifier.sql' }
        ]);
        tokens = tokenize('int').tokens;
        assertTokens(tokens, [{ startIndex: 0, type: 'keyword.sql' }]);
        tokens = tokenize('[int]').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'identifier.quote.sql' },
            { startIndex: 1, type: 'identifier.sql' },
            { startIndex: 4, type: 'identifier.quote.sql' }
        ]);
    });
    T.test('Strings', function () {
        var tokens = tokenize('declare @x=\'a string\';').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'keyword.sql' },
            { startIndex: 7, type: 'white.sql' },
            { startIndex: 8, type: 'identifier.sql' },
            { startIndex: 10, type: 'operator.sql' },
            { startIndex: 11, type: 'string.quote.sql', bracket: 1 },
            { startIndex: 12, type: 'string.sql', bracket: 0 },
            { startIndex: 20, type: 'string.quote.sql', bracket: -1 },
            { startIndex: 21, type: 'delimiter.sql' }
        ]);
        tokens = tokenize('\'a \'\' string with quotes\'').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'string.quote.sql' },
            { startIndex: 1, type: 'string.sql' },
            { startIndex: 24, type: 'string.quote.sql' }
        ]);
        tokens = tokenize('\'a " string with quotes\'').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'string.quote.sql' },
            { startIndex: 1, type: 'string.sql' },
            { startIndex: 23, type: 'string.quote.sql' }
        ]);
        tokens = tokenize('\'a -- string with comment\'').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'string.quote.sql' },
            { startIndex: 1, type: 'string.sql' },
            { startIndex: 25, type: 'string.quote.sql' }
        ]);
        tokens = tokenize('N\'a unicode string\'').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'string.quote.sql', bracket: 1 },
            { startIndex: 2, type: 'string.sql', bracket: 0 },
            { startIndex: 18, type: 'string.quote.sql', bracket: -1 }
        ]);
        tokens = tokenize('\'a endless string').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'string.quote.sql' },
            { startIndex: 1, type: 'string.sql' }
        ]);
    });
    T.test('Operators', function () {
        var tokens = tokenize('SET @x=@x+1').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'keyword.sql' },
            { startIndex: 3, type: 'white.sql' },
            { startIndex: 4, type: 'identifier.sql' },
            { startIndex: 6, type: 'operator.sql' },
            { startIndex: 7, type: 'identifier.sql' },
            { startIndex: 9, type: 'operator.sql' },
            { startIndex: 10, type: 'number.sql' }
        ]);
        tokens = tokenize('@x^=@x').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'identifier.sql' },
            { startIndex: 2, type: 'operator.sql' },
            { startIndex: 4, type: 'identifier.sql' }
        ]);
        tokens = tokenize('WHERE x IS NOT NULL').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'keyword.sql' },
            { startIndex: 5, type: 'white.sql' },
            { startIndex: 6, type: 'identifier.sql' },
            { startIndex: 7, type: 'white.sql' },
            { startIndex: 8, type: 'operator.sql' },
            { startIndex: 10, type: 'white.sql' },
            { startIndex: 11, type: 'operator.sql' },
            { startIndex: 14, type: 'white.sql' },
            { startIndex: 15, type: 'operator.sql' }
        ]);
        tokens = tokenize('SELECT * FROM dbo.MyTable WHERE MyColumn IN (1,2)').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'keyword.sql' },
            { startIndex: 6, type: 'white.sql' },
            { startIndex: 7, type: 'operator.sql' },
            { startIndex: 8, type: 'white.sql' },
            { startIndex: 9, type: 'keyword.sql' },
            { startIndex: 13, type: 'white.sql' },
            { startIndex: 14, type: 'identifier.sql' },
            { startIndex: 17, type: 'delimiter.sql' },
            { startIndex: 18, type: 'identifier.sql' },
            { startIndex: 25, type: 'white.sql' },
            { startIndex: 26, type: 'keyword.sql' },
            { startIndex: 31, type: 'white.sql' },
            { startIndex: 32, type: 'identifier.sql' },
            { startIndex: 40, type: 'white.sql' },
            { startIndex: 41, type: 'operator.sql' },
            { startIndex: 43, type: 'white.sql' },
            { startIndex: 44, type: 'delimiter.parenthesis.sql' },
            { startIndex: 45, type: 'number.sql' },
            { startIndex: 46, type: 'delimiter.sql' },
            { startIndex: 47, type: 'number.sql' },
            { startIndex: 48, type: 'delimiter.parenthesis.sql' }
        ]);
    });
    T.test('Scopes', function () {
        var tokens = tokenize('WHILE() BEGIN END').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'keyword.sql', bracket: 0 },
            { startIndex: 5, type: 'delimiter.parenthesis.sql', bracket: 1 },
            { startIndex: 6, type: 'delimiter.parenthesis.sql', bracket: -1 },
            { startIndex: 7, type: 'white.sql', bracket: 0 },
            { startIndex: 8, type: 'keyword.block.sql', bracket: 1 },
            { startIndex: 13, type: 'white.sql', bracket: 0 },
            { startIndex: 14, type: 'keyword.block.sql', bracket: -1 }
        ]);
        tokens = tokenize('BEGIN TRAN BEGIN TRY SELECT $ COMMIT END TRY BEGIN CATCH ROLLBACK END CATCH').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'keyword.sql', bracket: 0 },
            { startIndex: 10, type: 'white.sql', bracket: 0 },
            { startIndex: 11, type: 'keyword.try.sql', bracket: 1 },
            { startIndex: 20, type: 'white.sql', bracket: 0 },
            { startIndex: 21, type: 'keyword.sql', bracket: 0 },
            { startIndex: 27, type: 'white.sql', bracket: 0 },
            { startIndex: 28, type: 'number.sql', bracket: 0 },
            { startIndex: 29, type: 'white.sql', bracket: 0 },
            { startIndex: 30, type: 'keyword.sql', bracket: 0 },
            { startIndex: 36, type: 'white.sql', bracket: 0 },
            { startIndex: 37, type: 'keyword.try.sql', bracket: -1 },
            { startIndex: 44, type: 'white.sql', bracket: 0 },
            { startIndex: 45, type: 'keyword.catch.sql', bracket: 1 },
            { startIndex: 56, type: 'white.sql', bracket: 0 },
            { startIndex: 57, type: 'keyword.sql', bracket: 0 },
            { startIndex: 65, type: 'white.sql', bracket: 0 },
            { startIndex: 66, type: 'keyword.catch.sql', bracket: -1 }
        ]);
        tokens = tokenize('SELECT CASE $ WHEN 3 THEN 4 ELSE 5 END').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'keyword.sql', bracket: 0 },
            { startIndex: 6, type: 'white.sql', bracket: 0 },
            { startIndex: 7, type: 'keyword.block.sql', bracket: 1 },
            { startIndex: 11, type: 'white.sql', bracket: 0 },
            { startIndex: 12, type: 'number.sql', bracket: 0 },
            { startIndex: 13, type: 'white.sql', bracket: 0 },
            { startIndex: 14, type: 'keyword.choice.sql', bracket: 1 },
            { startIndex: 18, type: 'white.sql', bracket: 0 },
            { startIndex: 19, type: 'number.sql', bracket: 0 },
            { startIndex: 20, type: 'white.sql', bracket: 0 },
            { startIndex: 21, type: 'keyword.choice.sql', bracket: -1 },
            { startIndex: 25, type: 'white.sql', bracket: 0 },
            { startIndex: 26, type: 'number.sql', bracket: 0 },
            { startIndex: 27, type: 'white.sql', bracket: 0 },
            { startIndex: 28, type: 'keyword.sql', bracket: 0 },
            { startIndex: 32, type: 'white.sql', bracket: 0 },
            { startIndex: 33, type: 'number.sql', bracket: 0 },
            { startIndex: 34, type: 'white.sql', bracket: 0 },
            { startIndex: 35, type: 'keyword.block.sql', bracket: -1 }
        ]);
    });
});
