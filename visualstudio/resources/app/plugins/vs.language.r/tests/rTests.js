/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
/// <reference path="../../declares.d.ts" />
'use strict';
define(["require", "exports", '../rDef', 'monaco-testing'], function (require, exports, rDef, T) {
    var tokenize = T.createTokenize(rDef.language);
    var assertTokens = T.assertTokens;
    T.module('R Colorizer');
    T.test('Keywords', function () {
        var tokens = tokenize('function(a) { a }').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'keyword.r' },
            { startIndex: 8, type: 'delimiter.parenthesis.r' },
            { startIndex: 9, type: 'identifier.r' },
            { startIndex: 10, type: 'delimiter.parenthesis.r' },
            { startIndex: 11, type: 'white.r' },
            { startIndex: 12, type: 'delimiter.curly.r' },
            { startIndex: 13, type: 'white.r' },
            { startIndex: 14, type: 'identifier.r' },
            { startIndex: 15, type: 'white.r' },
            { startIndex: 16, type: 'delimiter.curly.r' }
        ]);
        var tokens = tokenize('while(FALSE) { break }').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'keyword.r' },
            { startIndex: 5, type: 'delimiter.parenthesis.r' },
            { startIndex: 6, type: 'constant.r' },
            { startIndex: 11, type: 'delimiter.parenthesis.r' },
            { startIndex: 12, type: 'white.r' },
            { startIndex: 13, type: 'delimiter.curly.r' },
            { startIndex: 14, type: 'white.r' },
            { startIndex: 15, type: 'keyword.r' },
            { startIndex: 20, type: 'white.r' },
            { startIndex: 21, type: 'delimiter.curly.r' }
        ]);
        var tokens = tokenize('if (a) { b } else { d }').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'keyword.r' },
            { startIndex: 2, type: 'white.r' },
            { startIndex: 3, type: 'delimiter.parenthesis.r' },
            { startIndex: 4, type: 'identifier.r' },
            { startIndex: 5, type: 'delimiter.parenthesis.r' },
            { startIndex: 6, type: 'white.r' },
            { startIndex: 7, type: 'delimiter.curly.r' },
            { startIndex: 8, type: 'white.r' },
            { startIndex: 9, type: 'identifier.r' },
            { startIndex: 10, type: 'white.r' },
            { startIndex: 11, type: 'delimiter.curly.r' },
            { startIndex: 12, type: 'white.r' },
            { startIndex: 13, type: 'keyword.r' },
            { startIndex: 17, type: 'white.r' },
            { startIndex: 18, type: 'delimiter.curly.r' },
            { startIndex: 19, type: 'white.r' },
            { startIndex: 20, type: 'identifier.r' },
            { startIndex: 21, type: 'white.r' },
            { startIndex: 22, type: 'delimiter.curly.r' }
        ]);
    });
    T.test('Identifiers', function () {
        var tokens = tokenize('a').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'identifier.r' }
        ]);
    });
    T.test('Comments', function () {
        var tokens = tokenize(' # comment #').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'white.r' },
            { startIndex: 1, type: 'comment.r' }
        ]);
    });
    T.test('Roxygen comments', function () {
        var tokens = tokenize(' #\' @author: me ').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'white.r' },
            { startIndex: 1, type: 'comment.doc.r' },
            { startIndex: 4, type: 'tag.r' },
            { startIndex: 11, type: 'comment.doc.r' }
        ]);
    });
    T.test('Strings', function () {
        var tokens = tokenize('"a\\n"').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'string.escape.r' },
            { startIndex: 1, type: 'string.r' },
            { startIndex: 4, type: 'string.escape.r' }
        ]);
        // '\\s' is not a special character
        var tokens = tokenize('"a\\s"').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'string.escape.r' },
            { startIndex: 1, type: 'string.r' },
            { startIndex: 2, type: 'error-token.r' },
            { startIndex: 4, type: 'string.escape.r' }
        ]);
    });
    T.test('Numbers', function () {
        assertTokens(tokenize('0').tokens, [{ startIndex: 0, type: 'number.r' }]);
        assertTokens(tokenize('1').tokens, [{ startIndex: 0, type: 'number.r' }]);
        assertTokens(tokenize('-1').tokens, [{ startIndex: 0, type: 'number.r' }]);
        assertTokens(tokenize('1.1').tokens, [{ startIndex: 0, type: 'number.r' }]);
        assertTokens(tokenize('-1.1').tokens, [{ startIndex: 0, type: 'number.r' }]);
        assertTokens(tokenize('.1').tokens, [{ startIndex: 0, type: 'number.r' }]);
        assertTokens(tokenize('-.1').tokens, [{ startIndex: 0, type: 'number.r' }]);
        assertTokens(tokenize('1e10').tokens, [{ startIndex: 0, type: 'number.r' }]);
        assertTokens(tokenize('1e-10').tokens, [{ startIndex: 0, type: 'number.r' }]);
        assertTokens(tokenize('-1e10').tokens, [{ startIndex: 0, type: 'number.r' }]);
        assertTokens(tokenize('-1e-10').tokens, [{ startIndex: 0, type: 'number.r' }]);
        assertTokens(tokenize('1E10').tokens, [{ startIndex: 0, type: 'number.r' }]);
        assertTokens(tokenize('1E-10').tokens, [{ startIndex: 0, type: 'number.r' }]);
        assertTokens(tokenize('-1E10').tokens, [{ startIndex: 0, type: 'number.r' }]);
        assertTokens(tokenize('-1E-10').tokens, [{ startIndex: 0, type: 'number.r' }]);
    });
    T.test('Operators', function () {
        var assertBinaryOperator = function (line, operator) {
            var tokens = tokenize(line).tokens;
            assertTokens(tokens, [
                { startIndex: 0, type: 'identifier.r' },
                { startIndex: 1, type: 'white.r' },
                { startIndex: 2, type: 'operator.r' },
                { startIndex: 2 + operator.length, type: 'white.r' },
                { startIndex: 3 + operator.length, type: 'identifier.r' }
            ]);
        };
        assertBinaryOperator('a & b', '&');
        assertBinaryOperator('a - b', '-');
        assertBinaryOperator('a * b', '*');
        assertBinaryOperator('a + b', '+');
        assertBinaryOperator('a = b', '=');
        assertBinaryOperator('a | b', '|');
        assertBinaryOperator('a ! b', '!');
        assertBinaryOperator('a < b', '<');
        assertBinaryOperator('a > b', '>');
        assertBinaryOperator('a ^ b', '^');
        assertBinaryOperator('a ~ b', '~');
        assertBinaryOperator('a / b', '/');
        assertBinaryOperator('a : b', ':');
        assertBinaryOperator('a %in% b', '%in%');
        assertBinaryOperator('a %->% b', '%->%');
        assertBinaryOperator('a == b', '==');
        assertBinaryOperator('a != b', '!=');
        assertBinaryOperator('a %% b', '%%');
        assertBinaryOperator('a && b', '&&');
        assertBinaryOperator('a || b', '||');
        assertBinaryOperator('a <- b', '<-');
        assertBinaryOperator('a <<- b', '<<-');
        assertBinaryOperator('a -> b', '->');
        assertBinaryOperator('a ->> b', '->>');
        assertBinaryOperator('a $ b', '$');
        assertBinaryOperator('a << b', '<<');
        assertBinaryOperator('a >> b', '>>');
    });
});
