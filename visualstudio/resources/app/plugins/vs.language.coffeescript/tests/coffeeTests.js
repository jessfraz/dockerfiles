/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
/// <reference path="../../declares.d.ts" />
'use strict';
define(["require", "exports", '../coffeeDef', 'monaco-testing'], function (require, exports, languageDef, T) {
    var tokenizationSupport = T.createTokenizationSupport(languageDef.language);
    var tokenize = T.createTokenizeFromSupport(tokenizationSupport);
    var assertTokens = T.assertTokens;
    var assertWords = T.assertWords;
    T.module('Syntax Highlighting - CoffeeScript');
    T.test('Comments', function () {
        var tokens = tokenize('#').tokens;
        T.equal(tokens.length, 1);
        assertTokens(tokens, [{ startIndex: 0, type: 'comment.coffee' }]);
        tokens = tokenize('    # a comment').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: '' },
            { startIndex: 4, type: 'comment.coffee' }
        ]);
        tokens = tokenize('# a comment').tokens;
        assertTokens(tokens, [{ startIndex: 0, type: 'comment.coffee' }]);
        tokens = tokenize('#sticky comment').tokens;
        assertTokens(tokens, [{ startIndex: 0, type: 'comment.coffee' }]);
        var tokens = tokenize('x = 1 # my comment # is a nice one').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: '' },
            { startIndex: 2, type: 'delimiter.coffee' },
            { startIndex: 3, type: '' },
            { startIndex: 4, type: 'number.coffee' },
            { startIndex: 5, type: '' },
            { startIndex: 6, type: 'comment.coffee' }
        ]);
        var tokens = tokenize('x = 1e #is a exponent number').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: '' },
            { startIndex: 2, type: 'delimiter.coffee' },
            { startIndex: 3, type: '' },
            { startIndex: 4, type: 'number.float.coffee' },
            { startIndex: 6, type: '' },
            { startIndex: 7, type: 'comment.coffee' }
        ]);
        var tokens = tokenize('x = 0x1F #is a hex number').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: '' },
            { startIndex: 2, type: 'delimiter.coffee' },
            { startIndex: 3, type: '' },
            { startIndex: 4, type: 'number.hex.coffee' },
            { startIndex: 8, type: '' },
            { startIndex: 9, type: 'comment.coffee' }
        ]);
    });
    T.test('Keywords', function () {
        var tokens = tokenize('new x = switch()').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'keyword.new.coffee' },
            { startIndex: 3, type: '' },
            { startIndex: 6, type: 'delimiter.coffee' },
            { startIndex: 7, type: '' },
            { startIndex: 8, type: 'keyword.switch.coffee' },
            { startIndex: 14, type: 'delimiter.parenthesis.coffee', bracket: 1 },
            { startIndex: 15, type: 'delimiter.parenthesis.coffee', bracket: -1 }
        ]);
        var tokens = tokenize('@test [do]').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'variable.predefined.coffee' },
            { startIndex: 5, type: '' },
            { startIndex: 6, type: 'delimiter.square.coffee' },
            { startIndex: 7, type: 'keyword.do.coffee' },
            { startIndex: 9, type: 'delimiter.square.coffee' }
        ]);
        var tokens = tokenize('this do').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'variable.predefined.coffee' },
            { startIndex: 4, type: '' },
            { startIndex: 5, type: 'keyword.do.coffee' }
        ]);
        tokens = tokenize('    new    ').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: '' },
            { startIndex: 4, type: 'keyword.new.coffee' },
            { startIndex: 7, type: '' }
        ]);
    });
    T.test('Comments - range comment, single line', function () {
        var tokens = tokenize('### a simple comment ###').tokens;
        assertTokens(tokens, [{ startIndex: 0, type: 'comment.coffee' }]);
        tokens = tokenize('new x = ### a simple comment ### 1').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'keyword.new.coffee' },
            { startIndex: 3, type: '' },
            { startIndex: 6, type: 'delimiter.coffee' },
            { startIndex: 7, type: '' },
            { startIndex: 8, type: 'comment.coffee' },
            { startIndex: 32, type: '' },
            { startIndex: 33, type: 'number.coffee' }
        ]);
        tokens = tokenize('new x = ### comment ### 1 ###').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'keyword.new.coffee' },
            { startIndex: 3, type: '' },
            { startIndex: 6, type: 'delimiter.coffee' },
            { startIndex: 7, type: '' },
            { startIndex: 8, type: 'comment.coffee' },
            { startIndex: 23, type: '' },
            { startIndex: 24, type: 'number.coffee' },
            { startIndex: 25, type: '' },
            { startIndex: 26, type: 'comment.coffee' }
        ]);
        tokens = tokenize('x = ######s').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: '' },
            { startIndex: 2, type: 'delimiter.coffee' },
            { startIndex: 3, type: '' },
            { startIndex: 4, type: 'comment.coffee' },
            { startIndex: 10, type: '' }
        ]);
        tokens = tokenize('x = ###/').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: '' },
            { startIndex: 2, type: 'delimiter.coffee' },
            { startIndex: 3, type: '' },
            { startIndex: 4, type: 'comment.coffee' }
        ]);
    });
    T.test('Comments - range comment, multi lines', function () {
        var lineTokens = tokenize('### a multiline comment');
        assertTokens(lineTokens.tokens, [{ startIndex: 0, type: 'comment.coffee' }]);
        lineTokens = tokenize('can actually span', lineTokens.endState);
        assertTokens(lineTokens.tokens, [{ startIndex: 0, type: 'comment.coffee' }]);
        lineTokens = tokenize('multiple lines ###', lineTokens.endState);
        assertTokens(lineTokens.tokens, [{ startIndex: 0, type: 'comment.coffee' }]);
        lineTokens = tokenize('new x = ### start a comment');
        assertTokens(lineTokens.tokens, [
            { startIndex: 0, type: 'keyword.new.coffee' },
            { startIndex: 3, type: '' },
            { startIndex: 6, type: 'delimiter.coffee' },
            { startIndex: 7, type: '' },
            { startIndex: 8, type: 'comment.coffee' }
        ]);
        lineTokens = tokenize(' a ', lineTokens.endState);
        assertTokens(lineTokens.tokens, [
            { startIndex: 0, type: 'comment.coffee' }
        ]);
        lineTokens = tokenize('and end it ### new a = 2;', lineTokens.endState);
        assertTokens(lineTokens.tokens, [
            { startIndex: 0, type: 'comment.coffee' },
            { startIndex: 14, type: '' },
            { startIndex: 15, type: 'keyword.new.coffee' },
            { startIndex: 18, type: '' },
            { startIndex: 21, type: 'delimiter.coffee' },
            { startIndex: 22, type: '' },
            { startIndex: 23, type: 'number.coffee' },
            { startIndex: 24, type: '' }
        ]);
    });
    T.test('Strings', function () {
        var tokens = tokenize('for a = \'a\';').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'keyword.for.coffee' },
            { startIndex: 3, type: '' },
            { startIndex: 6, type: 'delimiter.coffee' },
            { startIndex: 7, type: '' },
            { startIndex: 8, type: 'string.coffee' },
            { startIndex: 11, type: '' }
        ]);
        tokens = tokenize('\"use strict\";').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'string.coffee' },
            { startIndex: 12, type: '' }
        ]);
        tokens = tokenize('b = a + \" \'cool\'  \"').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: '' },
            { startIndex: 2, type: 'delimiter.coffee' },
            { startIndex: 3, type: '' },
            { startIndex: 6, type: 'delimiter.coffee' },
            { startIndex: 7, type: '' },
            { startIndex: 8, type: 'string.coffee' }
        ]);
        tokens = tokenize('"escaping \\"quotes\\" is cool"').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'string.coffee' },
            { startIndex: 10, type: 'string.escape.coffee' },
            { startIndex: 12, type: 'string.coffee' },
            { startIndex: 18, type: 'string.escape.coffee' },
            { startIndex: 20, type: 'string.coffee' }
        ]);
        tokens = tokenize('\'\'\'').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'string.coffee' }
        ]);
        tokens = tokenize('\'\\\'\'').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'string.coffee' },
            { startIndex: 1, type: 'string.escape.coffee' },
            { startIndex: 3, type: 'string.coffee' }
        ]);
        tokens = tokenize('\'be careful \\not to escape\'').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'string.coffee' },
            { startIndex: 12, type: 'string.escape.coffee' },
            { startIndex: 14, type: 'string.coffee' }
        ]);
    });
    T.test('Strings - multiline', function () {
        var lineTokens = tokenize('\'a multiline string');
        assertTokens(lineTokens.tokens, [{ startIndex: 0, type: 'string.coffee' }]);
        lineTokens = tokenize('second line', lineTokens.endState);
        assertTokens(lineTokens.tokens, [{ startIndex: 0, type: 'string.coffee' }]);
    });
    T.test('Strings - with nested code', function () {
        var tokens = tokenize('\"for a = \'a\'; #{ new } works\"').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'string.coffee' },
            { startIndex: 16, type: '' },
            { startIndex: 17, type: 'keyword.new.coffee' },
            { startIndex: 20, type: '' },
            { startIndex: 21, type: 'string.coffee' }
        ]);
        var tokens = tokenize('\"a comment with nested code #{ 2 / 3 } works\"').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'string.coffee' },
            { startIndex: 30, type: '' },
            { startIndex: 31, type: 'number.coffee' },
            { startIndex: 32, type: '' },
            { startIndex: 33, type: 'delimiter.coffee' },
            { startIndex: 34, type: '' },
            { startIndex: 35, type: 'number.coffee' },
            { startIndex: 36, type: '' },
            { startIndex: 37, type: 'string.coffee' }
        ]);
    });
    T.test('Numbers', function () {
        var tokens = tokenize('0').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'number.coffee' }
        ]);
        var tokens = tokenize(' 0').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: '' },
            { startIndex: 1, type: 'number.coffee' }
        ]);
        var tokens = tokenize(' 0 ').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: '' },
            { startIndex: 1, type: 'number.coffee' },
            { startIndex: 2, type: '' }
        ]);
        var tokens = tokenize('0 ').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'number.coffee' },
            { startIndex: 1, type: '' }
        ]);
        tokens = tokenize('0+0').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'number.coffee' },
            { startIndex: 1, type: 'delimiter.coffee' },
            { startIndex: 2, type: 'number.coffee' }
        ]);
        tokens = tokenize('100+10').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'number.coffee' },
            { startIndex: 3, type: 'delimiter.coffee' },
            { startIndex: 4, type: 'number.coffee' }
        ]);
        tokens = tokenize('0 + 0').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'number.coffee' },
            { startIndex: 1, type: '' },
            { startIndex: 2, type: 'delimiter.coffee' },
            { startIndex: 3, type: '' },
            { startIndex: 4, type: 'number.coffee' }
        ]);
        tokens = tokenize('0123').tokens;
        assertTokens(tokens, [{ startIndex: 0, type: 'number.octal.coffee' }]);
        tokens = tokenize('01239').tokens;
        assertTokens(tokens, [{ startIndex: 0, type: 'number.coffee' }]);
        tokens = tokenize('0x123').tokens;
        assertTokens(tokens, [{ startIndex: 0, type: 'number.hex.coffee' }]);
    });
    T.test('Bracket Matching', function () {
        var tokens = tokenize('[1,2,3]').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'delimiter.square.coffee', bracket: 1 },
            { startIndex: 1, type: 'number.coffee' },
            { startIndex: 2, type: 'delimiter.coffee' },
            { startIndex: 3, type: 'number.coffee' },
            { startIndex: 4, type: 'delimiter.coffee' },
            { startIndex: 5, type: 'number.coffee' },
            { startIndex: 6, type: 'delimiter.square.coffee', bracket: -1 }
        ]);
        tokens = tokenize('foo(123);').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: '' },
            { startIndex: 3, type: 'delimiter.parenthesis.coffee', bracket: 1 },
            { startIndex: 4, type: 'number.coffee' },
            { startIndex: 7, type: 'delimiter.parenthesis.coffee', bracket: -1 },
            { startIndex: 8, type: '' }
        ]);
        tokens = tokenize('(a:(b:[]))').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'delimiter.parenthesis.coffee', bracket: 1 },
            { startIndex: 1, type: '' },
            { startIndex: 2, type: 'delimiter.coffee' },
            { startIndex: 3, type: 'delimiter.parenthesis.coffee', bracket: 1 },
            { startIndex: 4, type: '' },
            { startIndex: 5, type: 'delimiter.coffee' },
            { startIndex: 6, type: 'delimiter.square.coffee', bracket: 1 },
            { startIndex: 7, type: 'delimiter.square.coffee', bracket: -1 },
            { startIndex: 8, type: 'delimiter.parenthesis.coffee', bracket: -1 },
            { startIndex: 9, type: 'delimiter.parenthesis.coffee', bracket: -1 }
        ]);
    });
    T.test('No Bracket Matching inside strings', function () {
        var tokens = tokenize('x = \'[{()}]\'').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: '' },
            { startIndex: 2, type: 'delimiter.coffee' },
            { startIndex: 3, type: '' },
            { startIndex: 4, type: 'string.coffee' }
        ]);
    });
    T.test('Regular Expressions', function () {
        var tokens = tokenize('#').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'comment.coffee' }
        ], 'should be a comment');
        tokens = tokenize('/ /').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'regexp.coffee' }
        ], 'should be a regexp');
        tokens = tokenize('/abc\\/asd/').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'regexp.coffee' }
        ], 'complex regexp');
        tokens = tokenize('new r = /sweet\"regular exp\" \\/ cool/;').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'keyword.new.coffee' },
            { startIndex: 3, type: '' },
            { startIndex: 6, type: 'delimiter.coffee' },
            { startIndex: 7, type: '' },
            { startIndex: 8, type: 'regexp.coffee' },
            { startIndex: 36, type: '' }
        ], 'regexp assignment');
        tokens = tokenize('5 / 3;').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'number.coffee' },
            { startIndex: 1, type: '' },
            { startIndex: 2, type: 'delimiter.coffee' },
            { startIndex: 3, type: '' },
            { startIndex: 4, type: 'number.coffee' },
            { startIndex: 5, type: '' }
        ], 'division');
    });
    T.test('Regex - range regex, multi lines', function () {
        var lineTokens = tokenize('/// a multiline regex');
        assertTokens(lineTokens.tokens, [{ startIndex: 0, type: 'regexp.coffee' }]);
        lineTokens = tokenize('can actually span', lineTokens.endState);
        assertTokens(lineTokens.tokens, [{ startIndex: 0, type: 'regexp.coffee' }]);
        lineTokens = tokenize('multiplelines with # comments', lineTokens.endState);
        assertTokens(lineTokens.tokens, [
            { startIndex: 0, type: 'regexp.coffee' },
            { startIndex: 19, type: 'comment.coffee' }
        ]);
        lineTokens = tokenize('multiple lines ///', lineTokens.endState);
        assertTokens(lineTokens.tokens, [{ startIndex: 0, type: 'regexp.coffee' }]);
    });
    T.test('Regex - multi lines followed by #comment', function () {
        var lineTokens = tokenize('///');
        assertTokens(lineTokens.tokens, [{ startIndex: 0, type: 'regexp.coffee' }]);
        lineTokens = tokenize('#comment', lineTokens.endState);
        assertTokens(lineTokens.tokens, [{ startIndex: 0, type: 'comment.coffee' }]);
    });
    T.test('Advanced regular expressions', function () {
        var tokens = tokenize('1 / 2; # comment').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'number.coffee' },
            { startIndex: 1, type: '' },
            { startIndex: 2, type: 'delimiter.coffee' },
            { startIndex: 3, type: '' },
            { startIndex: 4, type: 'number.coffee' },
            { startIndex: 5, type: '' },
            { startIndex: 7, type: 'comment.coffee' }
        ]);
        tokens = tokenize('1 / 2 / x / b;').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'number.coffee' },
            { startIndex: 1, type: '' },
            { startIndex: 2, type: 'delimiter.coffee' },
            { startIndex: 3, type: '' },
            { startIndex: 4, type: 'number.coffee' },
            { startIndex: 5, type: '' },
            { startIndex: 6, type: 'delimiter.coffee' },
            { startIndex: 7, type: '' },
            { startIndex: 10, type: 'delimiter.coffee' },
            { startIndex: 11, type: '' }
        ]);
        tokens = tokenize('a /ads/ b;').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: '' },
            { startIndex: 2, type: 'delimiter.coffee' },
            { startIndex: 3, type: '' },
            { startIndex: 6, type: 'delimiter.coffee' },
            { startIndex: 7, type: '' }
        ]);
        tokens = tokenize('x = /foo/.test(\'\')').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: '' },
            { startIndex: 2, type: 'delimiter.coffee' },
            { startIndex: 3, type: '' },
            { startIndex: 4, type: 'regexp.coffee' },
            { startIndex: 9, type: 'delimiter.coffee' },
            { startIndex: 10, type: '' },
            { startIndex: 14, type: 'delimiter.parenthesis.coffee' },
            { startIndex: 15, type: 'string.coffee' },
            { startIndex: 17, type: 'delimiter.parenthesis.coffee' }
        ]);
        tokens = tokenize('x = 1 + f(2 / 3, /foo/)').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: '' },
            { startIndex: 2, type: 'delimiter.coffee' },
            { startIndex: 3, type: '' },
            { startIndex: 4, type: 'number.coffee' },
            { startIndex: 5, type: '' },
            { startIndex: 6, type: 'delimiter.coffee' },
            { startIndex: 7, type: '' },
            { startIndex: 9, type: 'delimiter.parenthesis.coffee' },
            { startIndex: 10, type: 'number.coffee' },
            { startIndex: 11, type: '' },
            { startIndex: 12, type: 'delimiter.coffee' },
            { startIndex: 13, type: '' },
            { startIndex: 14, type: 'number.coffee' },
            { startIndex: 15, type: 'delimiter.coffee' },
            { startIndex: 16, type: '' },
            { startIndex: 17, type: 'regexp.coffee' },
            { startIndex: 22, type: 'delimiter.parenthesis.coffee' }
        ]);
        tokens = tokenize('1/(2/3)/2/3;').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'number.coffee' },
            { startIndex: 1, type: 'delimiter.coffee' },
            { startIndex: 2, type: 'delimiter.parenthesis.coffee' },
            { startIndex: 3, type: 'number.coffee' },
            { startIndex: 4, type: 'delimiter.coffee' },
            { startIndex: 5, type: 'number.coffee' },
            { startIndex: 6, type: 'delimiter.parenthesis.coffee' },
            { startIndex: 7, type: 'delimiter.coffee' },
            { startIndex: 8, type: 'number.coffee' },
            { startIndex: 9, type: 'delimiter.coffee' },
            { startIndex: 10, type: 'number.coffee' },
            { startIndex: 11, type: '' }
        ]);
    });
    T.test('Bracket Matching', function () {
        var tokens = tokenize('{ key: 123 }').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'delimiter.curly.coffee', bracket: 1 },
            { startIndex: 1, type: '' },
            { startIndex: 5, type: 'delimiter.coffee' },
            { startIndex: 6, type: '' },
            { startIndex: 7, type: 'number.coffee' },
            { startIndex: 10, type: '' },
            { startIndex: 11, type: 'delimiter.curly.coffee', bracket: -1 }
        ]);
        tokens = tokenize('[1,2,3]').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'delimiter.square.coffee', bracket: 1 },
            { startIndex: 1, type: 'number.coffee' },
            { startIndex: 2, type: 'delimiter.coffee' },
            { startIndex: 3, type: 'number.coffee' },
            { startIndex: 4, type: 'delimiter.coffee' },
            { startIndex: 5, type: 'number.coffee' },
            { startIndex: 6, type: 'delimiter.square.coffee', bracket: -1 }
        ]);
        tokens = tokenize('foo(123);').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: '' },
            { startIndex: 3, type: 'delimiter.parenthesis.coffee', bracket: 1 },
            { startIndex: 4, type: 'number.coffee' },
            { startIndex: 7, type: 'delimiter.parenthesis.coffee', bracket: -1 },
            { startIndex: 8, type: '' }
        ]);
        tokens = tokenize('{a:{b:[]}}').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'delimiter.curly.coffee', bracket: 1 },
            { startIndex: 1, type: '' },
            { startIndex: 2, type: 'delimiter.coffee' },
            { startIndex: 3, type: 'delimiter.curly.coffee', bracket: 1 },
            { startIndex: 4, type: '' },
            { startIndex: 5, type: 'delimiter.coffee' },
            { startIndex: 6, type: 'delimiter.square.coffee', bracket: 1 },
            { startIndex: 7, type: 'delimiter.square.coffee', bracket: -1 },
            { startIndex: 8, type: 'delimiter.curly.coffee', bracket: -1 },
            { startIndex: 9, type: 'delimiter.curly.coffee', bracket: -1 }
        ]);
    });
    T.test('No Bracket Matching inside strings', function () {
        var tokens = tokenize('x = \'[{()}]\'').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: '' },
            { startIndex: 2, type: 'delimiter.coffee' },
            { startIndex: 3, type: '' },
            { startIndex: 4, type: 'string.coffee' }
        ]);
    });
    T.test('Generated from sample', function () {
        var previousState = tokenizationSupport.getInitialState();
        // Line 1
        var src = '# Assignment:';
        var tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: 'comment.coffee', bracket: 0 }
        ]);
        // Line 2
        src = 'number   = 42';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 9, type: 'delimiter.coffee', bracket: 0 },
            { startIndex: 10, type: '', bracket: 0 },
            { startIndex: 11, type: 'number.coffee', bracket: 0 }
        ]);
        // Line 3
        src = 'opposite = true';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 9, type: 'delimiter.coffee', bracket: 0 },
            { startIndex: 10, type: '', bracket: 0 },
            { startIndex: 11, type: 'keyword.true.coffee', bracket: 0 }
        ]);
        // Line 4
        src = '';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
        ]);
        // Line 5
        src = '# Conditions:';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: 'comment.coffee', bracket: 0 }
        ]);
        // Line 6
        src = 'number = -42 if opposite';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 7, type: 'delimiter.coffee', bracket: 0 },
            { startIndex: 8, type: '', bracket: 0 },
            { startIndex: 9, type: 'delimiter.coffee', bracket: 0 },
            { startIndex: 10, type: 'number.coffee', bracket: 0 },
            { startIndex: 12, type: '', bracket: 0 },
            { startIndex: 13, type: 'keyword.if.coffee', bracket: 0 },
            { startIndex: 15, type: '', bracket: 0 }
        ]);
        // Line 7
        src = '';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
        ]);
        // Line 8
        src = '# Functions:';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: 'comment.coffee', bracket: 0 }
        ]);
        // Line 9
        src = 'square = (x) -> x * x';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 7, type: 'delimiter.coffee', bracket: 0 },
            { startIndex: 8, type: '', bracket: 0 },
            { startIndex: 9, type: 'delimiter.parenthesis.coffee', bracket: 1 },
            { startIndex: 10, type: '', bracket: 0 },
            { startIndex: 11, type: 'delimiter.parenthesis.coffee', bracket: -1 },
            { startIndex: 12, type: '', bracket: 0 },
            { startIndex: 13, type: 'delimiter.coffee', bracket: 0 },
            { startIndex: 15, type: '', bracket: 0 },
            { startIndex: 18, type: 'delimiter.coffee', bracket: 0 },
            { startIndex: 19, type: '', bracket: 0 }
        ]);
        // Line 10
        src = '';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
        ]);
        // Line 11
        src = '# Arrays:';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: 'comment.coffee', bracket: 0 }
        ]);
        // Line 12
        src = 'list = [1, 2, 3, 4, 5]';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 5, type: 'delimiter.coffee', bracket: 0 },
            { startIndex: 6, type: '', bracket: 0 },
            { startIndex: 7, type: 'delimiter.square.coffee', bracket: 1 },
            { startIndex: 8, type: 'number.coffee', bracket: 0 },
            { startIndex: 9, type: 'delimiter.coffee', bracket: 0 },
            { startIndex: 10, type: '', bracket: 0 },
            { startIndex: 11, type: 'number.coffee', bracket: 0 },
            { startIndex: 12, type: 'delimiter.coffee', bracket: 0 },
            { startIndex: 13, type: '', bracket: 0 },
            { startIndex: 14, type: 'number.coffee', bracket: 0 },
            { startIndex: 15, type: 'delimiter.coffee', bracket: 0 },
            { startIndex: 16, type: '', bracket: 0 },
            { startIndex: 17, type: 'number.coffee', bracket: 0 },
            { startIndex: 18, type: 'delimiter.coffee', bracket: 0 },
            { startIndex: 19, type: '', bracket: 0 },
            { startIndex: 20, type: 'number.coffee', bracket: 0 },
            { startIndex: 21, type: 'delimiter.square.coffee', bracket: -1 }
        ]);
        // Line 13
        src = '';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
        ]);
        // Line 14
        src = '# Objects:';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: 'comment.coffee', bracket: 0 }
        ]);
        // Line 15
        src = 'math =';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 5, type: 'delimiter.coffee', bracket: 0 }
        ]);
        // Line 16
        src = '  root:   Math.sqrt';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 6, type: 'delimiter.coffee', bracket: 0 },
            { startIndex: 7, type: '', bracket: 0 },
            { startIndex: 14, type: 'delimiter.coffee', bracket: 0 },
            { startIndex: 15, type: '', bracket: 0 }
        ]);
        // Line 17
        src = '  square: square';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 8, type: 'delimiter.coffee', bracket: 0 },
            { startIndex: 9, type: '', bracket: 0 }
        ]);
        // Line 18
        src = '  cube:   (x) -> x * square x';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 6, type: 'delimiter.coffee', bracket: 0 },
            { startIndex: 7, type: '', bracket: 0 },
            { startIndex: 10, type: 'delimiter.parenthesis.coffee', bracket: 1 },
            { startIndex: 11, type: '', bracket: 0 },
            { startIndex: 12, type: 'delimiter.parenthesis.coffee', bracket: -1 },
            { startIndex: 13, type: '', bracket: 0 },
            { startIndex: 14, type: 'delimiter.coffee', bracket: 0 },
            { startIndex: 16, type: '', bracket: 0 },
            { startIndex: 19, type: 'delimiter.coffee', bracket: 0 },
            { startIndex: 20, type: '', bracket: 0 }
        ]);
        // Line 19
        src = '';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
        ]);
        // Line 20
        src = '# Splats:';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: 'comment.coffee', bracket: 0 }
        ]);
        // Line 21
        src = 'race = (winner, runners...) ->';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 5, type: 'delimiter.coffee', bracket: 0 },
            { startIndex: 6, type: '', bracket: 0 },
            { startIndex: 7, type: 'delimiter.parenthesis.coffee', bracket: 1 },
            { startIndex: 8, type: '', bracket: 0 },
            { startIndex: 14, type: 'delimiter.coffee', bracket: 0 },
            { startIndex: 15, type: '', bracket: 0 },
            { startIndex: 23, type: 'delimiter.coffee', bracket: 0 },
            { startIndex: 26, type: 'delimiter.parenthesis.coffee', bracket: -1 },
            { startIndex: 27, type: '', bracket: 0 },
            { startIndex: 28, type: 'delimiter.coffee', bracket: 0 }
        ]);
        // Line 22
        src = '  print winner, runners';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 14, type: 'delimiter.coffee', bracket: 0 },
            { startIndex: 15, type: '', bracket: 0 }
        ]);
        // Line 23
        src = '';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
        ]);
        // Line 24
        src = '# Existence:';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: 'comment.coffee', bracket: 0 }
        ]);
        // Line 25
        src = 'alert "I knew it!" if elvis?';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 6, type: 'string.coffee', bracket: 0 },
            { startIndex: 18, type: '', bracket: 0 },
            { startIndex: 19, type: 'keyword.if.coffee', bracket: 0 },
            { startIndex: 21, type: '', bracket: 0 },
            { startIndex: 27, type: 'delimiter.coffee', bracket: 0 }
        ]);
        // Line 26
        src = '';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
        ]);
        // Line 27
        src = '# Array comprehensions:';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: 'comment.coffee', bracket: 0 }
        ]);
        // Line 28
        src = 'cubes = (math.cube num for num in list)';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 6, type: 'delimiter.coffee', bracket: 0 },
            { startIndex: 7, type: '', bracket: 0 },
            { startIndex: 8, type: 'delimiter.parenthesis.coffee', bracket: 1 },
            { startIndex: 9, type: '', bracket: 0 },
            { startIndex: 13, type: 'delimiter.coffee', bracket: 0 },
            { startIndex: 14, type: '', bracket: 0 },
            { startIndex: 23, type: 'keyword.for.coffee', bracket: 0 },
            { startIndex: 26, type: '', bracket: 0 },
            { startIndex: 31, type: 'keyword.in.coffee', bracket: 0 },
            { startIndex: 33, type: '', bracket: 0 },
            { startIndex: 38, type: 'delimiter.parenthesis.coffee', bracket: -1 }
        ]);
        // Line 29
        src = '';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
        ]);
        // Line 30
        src = 'fill = (container, liquid = "coffee") ->';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 5, type: 'delimiter.coffee', bracket: 0 },
            { startIndex: 6, type: '', bracket: 0 },
            { startIndex: 7, type: 'delimiter.parenthesis.coffee', bracket: 1 },
            { startIndex: 8, type: '', bracket: 0 },
            { startIndex: 17, type: 'delimiter.coffee', bracket: 0 },
            { startIndex: 18, type: '', bracket: 0 },
            { startIndex: 26, type: 'delimiter.coffee', bracket: 0 },
            { startIndex: 27, type: '', bracket: 0 },
            { startIndex: 28, type: 'string.coffee', bracket: 0 },
            { startIndex: 36, type: 'delimiter.parenthesis.coffee', bracket: -1 },
            { startIndex: 37, type: '', bracket: 0 },
            { startIndex: 38, type: 'delimiter.coffee', bracket: 0 }
        ]);
        // Line 31
        src = '  "Filling the #{container} with #{liquid}..."';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 2, type: 'string.coffee', bracket: 0 },
            { startIndex: 17, type: '', bracket: 0 },
            { startIndex: 26, type: 'string.coffee', bracket: 0 },
            { startIndex: 35, type: '', bracket: 0 },
            { startIndex: 41, type: 'string.coffee', bracket: 0 }
        ]);
        // Line 32
        src = '';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
        ]);
        // Line 33
        src = 'ong = ["do", "re", "mi", "fa", "so"]';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 4, type: 'delimiter.coffee', bracket: 0 },
            { startIndex: 5, type: '', bracket: 0 },
            { startIndex: 6, type: 'delimiter.square.coffee', bracket: 1 },
            { startIndex: 7, type: 'string.coffee', bracket: 0 },
            { startIndex: 11, type: 'delimiter.coffee', bracket: 0 },
            { startIndex: 12, type: '', bracket: 0 },
            { startIndex: 13, type: 'string.coffee', bracket: 0 },
            { startIndex: 17, type: 'delimiter.coffee', bracket: 0 },
            { startIndex: 18, type: '', bracket: 0 },
            { startIndex: 19, type: 'string.coffee', bracket: 0 },
            { startIndex: 23, type: 'delimiter.coffee', bracket: 0 },
            { startIndex: 24, type: '', bracket: 0 },
            { startIndex: 25, type: 'string.coffee', bracket: 0 },
            { startIndex: 29, type: 'delimiter.coffee', bracket: 0 },
            { startIndex: 30, type: '', bracket: 0 },
            { startIndex: 31, type: 'string.coffee', bracket: 0 },
            { startIndex: 35, type: 'delimiter.square.coffee', bracket: -1 }
        ]);
        // Line 34
        src = '';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
        ]);
        // Line 35
        src = 'singers = {Jagger: "Rock", Elvis: "Roll"}';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 8, type: 'delimiter.coffee', bracket: 0 },
            { startIndex: 9, type: '', bracket: 0 },
            { startIndex: 10, type: 'delimiter.curly.coffee', bracket: 1 },
            { startIndex: 11, type: '', bracket: 0 },
            { startIndex: 17, type: 'delimiter.coffee', bracket: 0 },
            { startIndex: 18, type: '', bracket: 0 },
            { startIndex: 19, type: 'string.coffee', bracket: 0 },
            { startIndex: 25, type: 'delimiter.coffee', bracket: 0 },
            { startIndex: 26, type: '', bracket: 0 },
            { startIndex: 32, type: 'delimiter.coffee', bracket: 0 },
            { startIndex: 33, type: '', bracket: 0 },
            { startIndex: 34, type: 'string.coffee', bracket: 0 },
            { startIndex: 40, type: 'delimiter.curly.coffee', bracket: -1 }
        ]);
        // Line 36
        src = '';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
        ]);
        // Line 37
        src = 'bitlist = [';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 8, type: 'delimiter.coffee', bracket: 0 },
            { startIndex: 9, type: '', bracket: 0 },
            { startIndex: 10, type: 'delimiter.square.coffee', bracket: 1 }
        ]);
        // Line 38
        src = '  1, 0, 1';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 2, type: 'number.coffee', bracket: 0 },
            { startIndex: 3, type: 'delimiter.coffee', bracket: 0 },
            { startIndex: 4, type: '', bracket: 0 },
            { startIndex: 5, type: 'number.coffee', bracket: 0 },
            { startIndex: 6, type: 'delimiter.coffee', bracket: 0 },
            { startIndex: 7, type: '', bracket: 0 },
            { startIndex: 8, type: 'number.coffee', bracket: 0 }
        ]);
        // Line 39
        src = '  0, 0, 1';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 2, type: 'number.coffee', bracket: 0 },
            { startIndex: 3, type: 'delimiter.coffee', bracket: 0 },
            { startIndex: 4, type: '', bracket: 0 },
            { startIndex: 5, type: 'number.coffee', bracket: 0 },
            { startIndex: 6, type: 'delimiter.coffee', bracket: 0 },
            { startIndex: 7, type: '', bracket: 0 },
            { startIndex: 8, type: 'number.coffee', bracket: 0 }
        ]);
        // Line 40
        src = '  1, 1, 0';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 2, type: 'number.coffee', bracket: 0 },
            { startIndex: 3, type: 'delimiter.coffee', bracket: 0 },
            { startIndex: 4, type: '', bracket: 0 },
            { startIndex: 5, type: 'number.coffee', bracket: 0 },
            { startIndex: 6, type: 'delimiter.coffee', bracket: 0 },
            { startIndex: 7, type: '', bracket: 0 },
            { startIndex: 8, type: 'number.coffee', bracket: 0 }
        ]);
        // Line 41
        src = ']';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: 'delimiter.square.coffee', bracket: -1 }
        ]);
        // Line 42
        src = '';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
        ]);
        // Line 43
        src = 'kids =';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 5, type: 'delimiter.coffee', bracket: 0 }
        ]);
        // Line 44
        src = '  brother:';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 9, type: 'delimiter.coffee', bracket: 0 }
        ]);
        // Line 45
        src = '    name: "Max"';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 8, type: 'delimiter.coffee', bracket: 0 },
            { startIndex: 9, type: '', bracket: 0 },
            { startIndex: 10, type: 'string.coffee', bracket: 0 }
        ]);
        // Line 46
        src = '    age:  11';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 7, type: 'delimiter.coffee', bracket: 0 },
            { startIndex: 8, type: '', bracket: 0 },
            { startIndex: 10, type: 'number.coffee', bracket: 0 }
        ]);
        // Line 47
        src = '  sister:';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 8, type: 'delimiter.coffee', bracket: 0 }
        ]);
        // Line 48
        src = '    name: "Ida"';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 8, type: 'delimiter.coffee', bracket: 0 },
            { startIndex: 9, type: '', bracket: 0 },
            { startIndex: 10, type: 'string.coffee', bracket: 0 }
        ]);
        // Line 49
        src = '    age:  9';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 7, type: 'delimiter.coffee', bracket: 0 },
            { startIndex: 8, type: '', bracket: 0 },
            { startIndex: 10, type: 'number.coffee', bracket: 0 }
        ]);
        // Line 50
        src = '';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
        ]);
        // Line 51
        src = '$(\'.account\').attr class: \'active\'';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 1, type: 'delimiter.parenthesis.coffee', bracket: 1 },
            { startIndex: 2, type: 'string.coffee', bracket: 0 },
            { startIndex: 12, type: 'delimiter.parenthesis.coffee', bracket: -1 },
            { startIndex: 13, type: 'delimiter.coffee', bracket: 0 },
            { startIndex: 14, type: '', bracket: 0 },
            { startIndex: 19, type: 'keyword.class.coffee', bracket: 0 },
            { startIndex: 24, type: 'delimiter.coffee', bracket: 0 },
            { startIndex: 25, type: '', bracket: 0 },
            { startIndex: 26, type: 'string.coffee', bracket: 0 }
        ]);
        // Line 52
        src = 'log object.class';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 10, type: 'delimiter.coffee', bracket: 0 },
            { startIndex: 11, type: 'keyword.class.coffee', bracket: 0 }
        ]);
        // Line 53
        src = '';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
        ]);
        // Line 54
        src = 'outer = 1';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 6, type: 'delimiter.coffee', bracket: 0 },
            { startIndex: 7, type: '', bracket: 0 },
            { startIndex: 8, type: 'number.coffee', bracket: 0 }
        ]);
        // Line 55
        src = 'changeNumbers = ->';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 14, type: 'delimiter.coffee', bracket: 0 },
            { startIndex: 15, type: '', bracket: 0 },
            { startIndex: 16, type: 'delimiter.coffee', bracket: 0 }
        ]);
        // Line 56
        src = 'inner = -1';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 6, type: 'delimiter.coffee', bracket: 0 },
            { startIndex: 7, type: '', bracket: 0 },
            { startIndex: 8, type: 'delimiter.coffee', bracket: 0 },
            { startIndex: 9, type: 'number.coffee', bracket: 0 }
        ]);
        // Line 57
        src = 'outer = 10';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 6, type: 'delimiter.coffee', bracket: 0 },
            { startIndex: 7, type: '', bracket: 0 },
            { startIndex: 8, type: 'number.coffee', bracket: 0 }
        ]);
        // Line 58
        src = 'inner = changeNumbers()';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 6, type: 'delimiter.coffee', bracket: 0 },
            { startIndex: 7, type: '', bracket: 0 },
            { startIndex: 21, type: 'delimiter.parenthesis.coffee', bracket: 1 },
            { startIndex: 22, type: 'delimiter.parenthesis.coffee', bracket: -1 }
        ]);
        // Line 59
        src = '';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
        ]);
        // Line 60
        src = 'mood = greatlyImproved if singing';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 5, type: 'delimiter.coffee', bracket: 0 },
            { startIndex: 6, type: '', bracket: 0 },
            { startIndex: 23, type: 'keyword.if.coffee', bracket: 0 },
            { startIndex: 25, type: '', bracket: 0 }
        ]);
        // Line 61
        src = '';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
        ]);
        // Line 62
        src = 'if happy and knowsIt';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: 'keyword.if.coffee', bracket: 0 },
            { startIndex: 2, type: '', bracket: 0 },
            { startIndex: 9, type: 'keyword.and.coffee', bracket: 0 },
            { startIndex: 12, type: '', bracket: 0 }
        ]);
        // Line 63
        src = '  clapsHands()';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 12, type: 'delimiter.parenthesis.coffee', bracket: 1 },
            { startIndex: 13, type: 'delimiter.parenthesis.coffee', bracket: -1 }
        ]);
        // Line 64
        src = '  chaChaCha()';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 11, type: 'delimiter.parenthesis.coffee', bracket: 1 },
            { startIndex: 12, type: 'delimiter.parenthesis.coffee', bracket: -1 }
        ]);
        // Line 65
        src = 'else';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: 'keyword.else.coffee', bracket: 0 }
        ]);
        // Line 66
        src = '  showIt()';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 8, type: 'delimiter.parenthesis.coffee', bracket: 1 },
            { startIndex: 9, type: 'delimiter.parenthesis.coffee', bracket: -1 }
        ]);
        // Line 67
        src = '';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
        ]);
        // Line 68
        src = 'date = if friday then sue else jill';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 5, type: 'delimiter.coffee', bracket: 0 },
            { startIndex: 6, type: '', bracket: 0 },
            { startIndex: 7, type: 'keyword.if.coffee', bracket: 0 },
            { startIndex: 9, type: '', bracket: 0 },
            { startIndex: 17, type: 'keyword.then.coffee', bracket: 0 },
            { startIndex: 21, type: '', bracket: 0 },
            { startIndex: 26, type: 'keyword.else.coffee', bracket: 0 },
            { startIndex: 30, type: '', bracket: 0 }
        ]);
        // Line 69
        src = '';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
        ]);
        // Line 70
        src = 'options or= defaults';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 8, type: 'keyword.or.coffee', bracket: 0 },
            { startIndex: 10, type: 'delimiter.coffee', bracket: 0 },
            { startIndex: 11, type: '', bracket: 0 }
        ]);
        // Line 71
        src = '';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
        ]);
        // Line 72
        src = '# Eat lunch.';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: 'comment.coffee', bracket: 0 }
        ]);
        // Line 73
        src = 'eat food for food in [\'toast\', \'cheese\', \'wine\']';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 9, type: 'keyword.for.coffee', bracket: 0 },
            { startIndex: 12, type: '', bracket: 0 },
            { startIndex: 18, type: 'keyword.in.coffee', bracket: 0 },
            { startIndex: 20, type: '', bracket: 0 },
            { startIndex: 21, type: 'delimiter.square.coffee', bracket: 1 },
            { startIndex: 22, type: 'string.coffee', bracket: 0 },
            { startIndex: 29, type: 'delimiter.coffee', bracket: 0 },
            { startIndex: 30, type: '', bracket: 0 },
            { startIndex: 31, type: 'string.coffee', bracket: 0 },
            { startIndex: 39, type: 'delimiter.coffee', bracket: 0 },
            { startIndex: 40, type: '', bracket: 0 },
            { startIndex: 41, type: 'string.coffee', bracket: 0 },
            { startIndex: 47, type: 'delimiter.square.coffee', bracket: -1 }
        ]);
        // Line 74
        src = '';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
        ]);
        // Line 75
        src = '# Fine five course dining.';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: 'comment.coffee', bracket: 0 }
        ]);
        // Line 76
        src = 'courses = [\'greens\', \'caviar\', \'truffles\', \'roast\', \'cake\']';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 8, type: 'delimiter.coffee', bracket: 0 },
            { startIndex: 9, type: '', bracket: 0 },
            { startIndex: 10, type: 'delimiter.square.coffee', bracket: 1 },
            { startIndex: 11, type: 'string.coffee', bracket: 0 },
            { startIndex: 19, type: 'delimiter.coffee', bracket: 0 },
            { startIndex: 20, type: '', bracket: 0 },
            { startIndex: 21, type: 'string.coffee', bracket: 0 },
            { startIndex: 29, type: 'delimiter.coffee', bracket: 0 },
            { startIndex: 30, type: '', bracket: 0 },
            { startIndex: 31, type: 'string.coffee', bracket: 0 },
            { startIndex: 41, type: 'delimiter.coffee', bracket: 0 },
            { startIndex: 42, type: '', bracket: 0 },
            { startIndex: 43, type: 'string.coffee', bracket: 0 },
            { startIndex: 50, type: 'delimiter.coffee', bracket: 0 },
            { startIndex: 51, type: '', bracket: 0 },
            { startIndex: 52, type: 'string.coffee', bracket: 0 },
            { startIndex: 58, type: 'delimiter.square.coffee', bracket: -1 }
        ]);
        // Line 77
        src = 'menu i + 1, dish for dish, i in courses';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 7, type: 'delimiter.coffee', bracket: 0 },
            { startIndex: 8, type: '', bracket: 0 },
            { startIndex: 9, type: 'number.coffee', bracket: 0 },
            { startIndex: 10, type: 'delimiter.coffee', bracket: 0 },
            { startIndex: 11, type: '', bracket: 0 },
            { startIndex: 17, type: 'keyword.for.coffee', bracket: 0 },
            { startIndex: 20, type: '', bracket: 0 },
            { startIndex: 25, type: 'delimiter.coffee', bracket: 0 },
            { startIndex: 26, type: '', bracket: 0 },
            { startIndex: 29, type: 'keyword.in.coffee', bracket: 0 },
            { startIndex: 31, type: '', bracket: 0 }
        ]);
        // Line 78
        src = '';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
        ]);
        // Line 79
        src = '# Health conscious meal.';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: 'comment.coffee', bracket: 0 }
        ]);
        // Line 80
        src = 'foods = [\'broccoli\', \'spinach\', \'chocolate\']';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 6, type: 'delimiter.coffee', bracket: 0 },
            { startIndex: 7, type: '', bracket: 0 },
            { startIndex: 8, type: 'delimiter.square.coffee', bracket: 1 },
            { startIndex: 9, type: 'string.coffee', bracket: 0 },
            { startIndex: 19, type: 'delimiter.coffee', bracket: 0 },
            { startIndex: 20, type: '', bracket: 0 },
            { startIndex: 21, type: 'string.coffee', bracket: 0 },
            { startIndex: 30, type: 'delimiter.coffee', bracket: 0 },
            { startIndex: 31, type: '', bracket: 0 },
            { startIndex: 32, type: 'string.coffee', bracket: 0 },
            { startIndex: 43, type: 'delimiter.square.coffee', bracket: -1 }
        ]);
        // Line 81
        src = 'eat food for food in foods when food isnt \'chocolate\'';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 9, type: 'keyword.for.coffee', bracket: 0 },
            { startIndex: 12, type: '', bracket: 0 },
            { startIndex: 18, type: 'keyword.in.coffee', bracket: 0 },
            { startIndex: 20, type: '', bracket: 0 },
            { startIndex: 27, type: 'keyword.when.coffee', bracket: 0 },
            { startIndex: 31, type: '', bracket: 0 },
            { startIndex: 37, type: 'keyword.isnt.coffee', bracket: 0 },
            { startIndex: 41, type: '', bracket: 0 },
            { startIndex: 42, type: 'string.coffee', bracket: 0 }
        ]);
        // Line 82
        src = '';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
        ]);
        // Line 83
        src = 'countdown = (num for num in [10..1])';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 10, type: 'delimiter.coffee', bracket: 0 },
            { startIndex: 11, type: '', bracket: 0 },
            { startIndex: 12, type: 'delimiter.parenthesis.coffee', bracket: 1 },
            { startIndex: 13, type: '', bracket: 0 },
            { startIndex: 17, type: 'keyword.for.coffee', bracket: 0 },
            { startIndex: 20, type: '', bracket: 0 },
            { startIndex: 25, type: 'keyword.in.coffee', bracket: 0 },
            { startIndex: 27, type: '', bracket: 0 },
            { startIndex: 28, type: 'delimiter.square.coffee', bracket: 1 },
            { startIndex: 29, type: 'number.coffee', bracket: 0 },
            { startIndex: 31, type: 'delimiter.coffee', bracket: 0 },
            { startIndex: 33, type: 'number.coffee', bracket: 0 },
            { startIndex: 34, type: 'delimiter.square.coffee', bracket: -1 },
            { startIndex: 35, type: 'delimiter.parenthesis.coffee', bracket: -1 }
        ]);
        // Line 84
        src = '';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
        ]);
        // Line 85
        src = 'yearsOld = max: 10, ida: 9, tim: 11';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 9, type: 'delimiter.coffee', bracket: 0 },
            { startIndex: 10, type: '', bracket: 0 },
            { startIndex: 14, type: 'delimiter.coffee', bracket: 0 },
            { startIndex: 15, type: '', bracket: 0 },
            { startIndex: 16, type: 'number.coffee', bracket: 0 },
            { startIndex: 18, type: 'delimiter.coffee', bracket: 0 },
            { startIndex: 19, type: '', bracket: 0 },
            { startIndex: 23, type: 'delimiter.coffee', bracket: 0 },
            { startIndex: 24, type: '', bracket: 0 },
            { startIndex: 25, type: 'number.coffee', bracket: 0 },
            { startIndex: 26, type: 'delimiter.coffee', bracket: 0 },
            { startIndex: 27, type: '', bracket: 0 },
            { startIndex: 31, type: 'delimiter.coffee', bracket: 0 },
            { startIndex: 32, type: '', bracket: 0 },
            { startIndex: 33, type: 'number.coffee', bracket: 0 }
        ]);
        // Line 86
        src = '';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
        ]);
        // Line 87
        src = 'ages = for child, age of yearsOld';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 5, type: 'delimiter.coffee', bracket: 0 },
            { startIndex: 6, type: '', bracket: 0 },
            { startIndex: 7, type: 'keyword.for.coffee', bracket: 0 },
            { startIndex: 10, type: '', bracket: 0 },
            { startIndex: 16, type: 'delimiter.coffee', bracket: 0 },
            { startIndex: 17, type: '', bracket: 0 },
            { startIndex: 22, type: 'keyword.of.coffee', bracket: 0 },
            { startIndex: 24, type: '', bracket: 0 }
        ]);
        // Line 88
        src = '  "#{child} is #{age}"';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 2, type: 'string.coffee', bracket: 0 },
            { startIndex: 5, type: '', bracket: 0 },
            { startIndex: 10, type: 'string.coffee', bracket: 0 },
            { startIndex: 17, type: '', bracket: 0 },
            { startIndex: 20, type: 'string.coffee', bracket: 0 }
        ]);
        // Line 89
        src = '';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
        ]);
        // Line 90
        src = '# Econ 101';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: 'comment.coffee', bracket: 0 }
        ]);
        // Line 91
        src = 'if this.studyingEconomics';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: 'keyword.if.coffee', bracket: 0 },
            { startIndex: 2, type: '', bracket: 0 },
            { startIndex: 3, type: 'variable.predefined.coffee', bracket: 0 },
            { startIndex: 7, type: 'delimiter.coffee', bracket: 0 },
            { startIndex: 8, type: '', bracket: 0 }
        ]);
        // Line 92
        src = '  buy()  while supply > demand';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 5, type: 'delimiter.parenthesis.coffee', bracket: 1 },
            { startIndex: 6, type: 'delimiter.parenthesis.coffee', bracket: -1 },
            { startIndex: 7, type: '', bracket: 0 },
            { startIndex: 9, type: 'keyword.while.coffee', bracket: 0 },
            { startIndex: 14, type: '', bracket: 0 },
            { startIndex: 22, type: 'delimiter.coffee', bracket: 0 },
            { startIndex: 23, type: '', bracket: 0 }
        ]);
        // Line 93
        src = '  sell() until supply > demand';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 6, type: 'delimiter.parenthesis.coffee', bracket: 1 },
            { startIndex: 7, type: 'delimiter.parenthesis.coffee', bracket: -1 },
            { startIndex: 8, type: '', bracket: 0 },
            { startIndex: 9, type: 'keyword.until.coffee', bracket: 0 },
            { startIndex: 14, type: '', bracket: 0 },
            { startIndex: 22, type: 'delimiter.coffee', bracket: 0 },
            { startIndex: 23, type: '', bracket: 0 }
        ]);
        // Line 94
        src = '';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
        ]);
        // Line 95
        src = '# Nursery Rhyme';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: 'comment.coffee', bracket: 0 }
        ]);
        // Line 96
        src = 'num = 6';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 4, type: 'delimiter.coffee', bracket: 0 },
            { startIndex: 5, type: '', bracket: 0 },
            { startIndex: 6, type: 'number.coffee', bracket: 0 }
        ]);
        // Line 97
        src = 'lyrics = while num -= 1';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 7, type: 'delimiter.coffee', bracket: 0 },
            { startIndex: 8, type: '', bracket: 0 },
            { startIndex: 9, type: 'keyword.while.coffee', bracket: 0 },
            { startIndex: 14, type: '', bracket: 0 },
            { startIndex: 19, type: 'delimiter.coffee', bracket: 0 },
            { startIndex: 21, type: '', bracket: 0 },
            { startIndex: 22, type: 'number.coffee', bracket: 0 }
        ]);
        // Line 98
        src = '  "#{num} little monkeys, jumping on the bed.';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 2, type: 'string.coffee', bracket: 0 },
            { startIndex: 5, type: '', bracket: 0 },
            { startIndex: 8, type: 'string.coffee', bracket: 0 }
        ]);
        // Line 99
        src = '    One fell out and bumped his head."';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: 'string.coffee', bracket: 0 }
        ]);
        // Line 100
        src = '	';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 }
        ]);
        // Line 101
        src = '# Everything is an Expression (at least, as much as possible)';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: 'comment.coffee', bracket: 0 }
        ]);
        // Line 102
        src = 'grade = (student) ->';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 6, type: 'delimiter.coffee', bracket: 0 },
            { startIndex: 7, type: '', bracket: 0 },
            { startIndex: 8, type: 'delimiter.parenthesis.coffee', bracket: 1 },
            { startIndex: 9, type: '', bracket: 0 },
            { startIndex: 16, type: 'delimiter.parenthesis.coffee', bracket: -1 },
            { startIndex: 17, type: '', bracket: 0 },
            { startIndex: 18, type: 'delimiter.coffee', bracket: 0 }
        ]);
        // Line 103
        src = '  if student.excellentWork';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 2, type: 'keyword.if.coffee', bracket: 0 },
            { startIndex: 4, type: '', bracket: 0 },
            { startIndex: 12, type: 'delimiter.coffee', bracket: 0 },
            { startIndex: 13, type: '', bracket: 0 }
        ]);
        // Line 104
        src = '    "A+"';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 4, type: 'string.coffee', bracket: 0 }
        ]);
        // Line 105
        src = '  else if student.okayStuff';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 2, type: 'keyword.else.coffee', bracket: 0 },
            { startIndex: 6, type: '', bracket: 0 },
            { startIndex: 7, type: 'keyword.if.coffee', bracket: 0 },
            { startIndex: 9, type: '', bracket: 0 },
            { startIndex: 17, type: 'delimiter.coffee', bracket: 0 },
            { startIndex: 18, type: '', bracket: 0 }
        ]);
        // Line 106
        src = '    if student.triedHard then "B" else "B-"';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 4, type: 'keyword.if.coffee', bracket: 0 },
            { startIndex: 6, type: '', bracket: 0 },
            { startIndex: 14, type: 'delimiter.coffee', bracket: 0 },
            { startIndex: 15, type: '', bracket: 0 },
            { startIndex: 25, type: 'keyword.then.coffee', bracket: 0 },
            { startIndex: 29, type: '', bracket: 0 },
            { startIndex: 30, type: 'string.coffee', bracket: 0 },
            { startIndex: 33, type: '', bracket: 0 },
            { startIndex: 34, type: 'keyword.else.coffee', bracket: 0 },
            { startIndex: 38, type: '', bracket: 0 },
            { startIndex: 39, type: 'string.coffee', bracket: 0 }
        ]);
        // Line 107
        src = '  else';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 2, type: 'keyword.else.coffee', bracket: 0 }
        ]);
        // Line 108
        src = '    "C"';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 4, type: 'string.coffee', bracket: 0 }
        ]);
        // Line 109
        src = '';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
        ]);
        // Line 110
        src = 'eldest = if 24 > 21 then "Liz" else "Ike"';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 7, type: 'delimiter.coffee', bracket: 0 },
            { startIndex: 8, type: '', bracket: 0 },
            { startIndex: 9, type: 'keyword.if.coffee', bracket: 0 },
            { startIndex: 11, type: '', bracket: 0 },
            { startIndex: 12, type: 'number.coffee', bracket: 0 },
            { startIndex: 14, type: '', bracket: 0 },
            { startIndex: 15, type: 'delimiter.coffee', bracket: 0 },
            { startIndex: 16, type: '', bracket: 0 },
            { startIndex: 17, type: 'number.coffee', bracket: 0 },
            { startIndex: 19, type: '', bracket: 0 },
            { startIndex: 20, type: 'keyword.then.coffee', bracket: 0 },
            { startIndex: 24, type: '', bracket: 0 },
            { startIndex: 25, type: 'string.coffee', bracket: 0 },
            { startIndex: 30, type: '', bracket: 0 },
            { startIndex: 31, type: 'keyword.else.coffee', bracket: 0 },
            { startIndex: 35, type: '', bracket: 0 },
            { startIndex: 36, type: 'string.coffee', bracket: 0 }
        ]);
        // Line 111
        src = '';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
        ]);
        // Line 112
        src = '#Classes, Inheritance and Super';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: 'comment.coffee', bracket: 0 }
        ]);
        // Line 113
        src = 'class Animal';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: 'keyword.class.coffee', bracket: 0 },
            { startIndex: 5, type: '', bracket: 0 }
        ]);
        // Line 114
        src = '  constructor: (@name) ->';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 13, type: 'delimiter.coffee', bracket: 0 },
            { startIndex: 14, type: '', bracket: 0 },
            { startIndex: 15, type: 'delimiter.parenthesis.coffee', bracket: 1 },
            { startIndex: 16, type: 'variable.predefined.coffee', bracket: 0 },
            { startIndex: 21, type: 'delimiter.parenthesis.coffee', bracket: -1 },
            { startIndex: 22, type: '', bracket: 0 },
            { startIndex: 23, type: 'delimiter.coffee', bracket: 0 }
        ]);
        // Line 115
        src = '';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
        ]);
        // Line 116
        src = '  move: (meters) ->';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 6, type: 'delimiter.coffee', bracket: 0 },
            { startIndex: 7, type: '', bracket: 0 },
            { startIndex: 8, type: 'delimiter.parenthesis.coffee', bracket: 1 },
            { startIndex: 9, type: '', bracket: 0 },
            { startIndex: 15, type: 'delimiter.parenthesis.coffee', bracket: -1 },
            { startIndex: 16, type: '', bracket: 0 },
            { startIndex: 17, type: 'delimiter.coffee', bracket: 0 }
        ]);
        // Line 117
        src = '    alert @name + " moved #{meters}m."';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 10, type: 'variable.predefined.coffee', bracket: 0 },
            { startIndex: 15, type: '', bracket: 0 },
            { startIndex: 16, type: 'delimiter.coffee', bracket: 0 },
            { startIndex: 17, type: '', bracket: 0 },
            { startIndex: 18, type: 'string.coffee', bracket: 0 },
            { startIndex: 28, type: '', bracket: 0 },
            { startIndex: 34, type: 'string.coffee', bracket: 0 }
        ]);
        // Line 118
        src = '';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
        ]);
        // Line 119
        src = 'class Snake extends Animal';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: 'keyword.class.coffee', bracket: 0 },
            { startIndex: 5, type: '', bracket: 0 },
            { startIndex: 12, type: 'keyword.extends.coffee', bracket: 0 },
            { startIndex: 19, type: '', bracket: 0 }
        ]);
        // Line 120
        src = '  move: ->';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 6, type: 'delimiter.coffee', bracket: 0 },
            { startIndex: 7, type: '', bracket: 0 },
            { startIndex: 8, type: 'delimiter.coffee', bracket: 0 }
        ]);
        // Line 121
        src = '    alert "Slithering..."';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 10, type: 'string.coffee', bracket: 0 }
        ]);
        // Line 122
        src = '    super 5';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 4, type: 'keyword.super.coffee', bracket: 0 },
            { startIndex: 9, type: '', bracket: 0 },
            { startIndex: 10, type: 'number.coffee', bracket: 0 }
        ]);
        // Line 123
        src = '';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
        ]);
        // Line 124
        src = 'class Horse extends Animal';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: 'keyword.class.coffee', bracket: 0 },
            { startIndex: 5, type: '', bracket: 0 },
            { startIndex: 12, type: 'keyword.extends.coffee', bracket: 0 },
            { startIndex: 19, type: '', bracket: 0 }
        ]);
        // Line 125
        src = '  move: ->';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 6, type: 'delimiter.coffee', bracket: 0 },
            { startIndex: 7, type: '', bracket: 0 },
            { startIndex: 8, type: 'delimiter.coffee', bracket: 0 }
        ]);
        // Line 126
        src = '    alert "Galloping..."';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 10, type: 'string.coffee', bracket: 0 }
        ]);
        // Line 127
        src = '    super 45';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 4, type: 'keyword.super.coffee', bracket: 0 },
            { startIndex: 9, type: '', bracket: 0 },
            { startIndex: 10, type: 'number.coffee', bracket: 0 }
        ]);
        // Line 128
        src = '';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
        ]);
        // Line 129
        src = 'sam = new Snake "Sammy the Python"';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 4, type: 'delimiter.coffee', bracket: 0 },
            { startIndex: 5, type: '', bracket: 0 },
            { startIndex: 6, type: 'keyword.new.coffee', bracket: 0 },
            { startIndex: 9, type: '', bracket: 0 },
            { startIndex: 16, type: 'string.coffee', bracket: 0 }
        ]);
        // Line 130
        src = 'tom = new Horse "Tommy the Palomino"';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 4, type: 'delimiter.coffee', bracket: 0 },
            { startIndex: 5, type: '', bracket: 0 },
            { startIndex: 6, type: 'keyword.new.coffee', bracket: 0 },
            { startIndex: 9, type: '', bracket: 0 },
            { startIndex: 16, type: 'string.coffee', bracket: 0 }
        ]);
        // Line 131
        src = '';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
        ]);
        // Line 132
        src = 'sam.move()';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 3, type: 'delimiter.coffee', bracket: 0 },
            { startIndex: 4, type: '', bracket: 0 },
            { startIndex: 8, type: 'delimiter.parenthesis.coffee', bracket: 1 },
            { startIndex: 9, type: 'delimiter.parenthesis.coffee', bracket: -1 }
        ]);
        // Line 133
        src = 'tom.move()';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 3, type: 'delimiter.coffee', bracket: 0 },
            { startIndex: 4, type: '', bracket: 0 },
            { startIndex: 8, type: 'delimiter.parenthesis.coffee', bracket: 1 },
            { startIndex: 9, type: 'delimiter.parenthesis.coffee', bracket: -1 }
        ]);
        // Line 134
        src = '';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
        ]);
        // Line 135
        src = '#Function binding';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: 'comment.coffee', bracket: 0 }
        ]);
        // Line 136
        src = 'Account = (customer, cart) ->';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 8, type: 'delimiter.coffee', bracket: 0 },
            { startIndex: 9, type: '', bracket: 0 },
            { startIndex: 10, type: 'delimiter.parenthesis.coffee', bracket: 1 },
            { startIndex: 11, type: '', bracket: 0 },
            { startIndex: 19, type: 'delimiter.coffee', bracket: 0 },
            { startIndex: 20, type: '', bracket: 0 },
            { startIndex: 25, type: 'delimiter.parenthesis.coffee', bracket: -1 },
            { startIndex: 26, type: '', bracket: 0 },
            { startIndex: 27, type: 'delimiter.coffee', bracket: 0 }
        ]);
        // Line 137
        src = '  @customer = customer';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 2, type: 'variable.predefined.coffee', bracket: 0 },
            { startIndex: 11, type: '', bracket: 0 },
            { startIndex: 12, type: 'delimiter.coffee', bracket: 0 },
            { startIndex: 13, type: '', bracket: 0 }
        ]);
        // Line 138
        src = '  @cart = cart';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 2, type: 'variable.predefined.coffee', bracket: 0 },
            { startIndex: 7, type: '', bracket: 0 },
            { startIndex: 8, type: 'delimiter.coffee', bracket: 0 },
            { startIndex: 9, type: '', bracket: 0 }
        ]);
        // Line 139
        src = '';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
        ]);
        // Line 140
        src = '  $(\'.shopping_cart\').bind \'click\', (event) =>';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 3, type: 'delimiter.parenthesis.coffee', bracket: 1 },
            { startIndex: 4, type: 'string.coffee', bracket: 0 },
            { startIndex: 20, type: 'delimiter.parenthesis.coffee', bracket: -1 },
            { startIndex: 21, type: 'delimiter.coffee', bracket: 0 },
            { startIndex: 22, type: '', bracket: 0 },
            { startIndex: 27, type: 'string.coffee', bracket: 0 },
            { startIndex: 34, type: 'delimiter.coffee', bracket: 0 },
            { startIndex: 35, type: '', bracket: 0 },
            { startIndex: 36, type: 'delimiter.parenthesis.coffee', bracket: 1 },
            { startIndex: 37, type: '', bracket: 0 },
            { startIndex: 42, type: 'delimiter.parenthesis.coffee', bracket: -1 },
            { startIndex: 43, type: '', bracket: 0 },
            { startIndex: 44, type: 'delimiter.coffee', bracket: 0 }
        ]);
        // Line 141
        src = '    @customer.purchase @cart';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 4, type: 'variable.predefined.coffee', bracket: 0 },
            { startIndex: 13, type: 'delimiter.coffee', bracket: 0 },
            { startIndex: 14, type: '', bracket: 0 },
            { startIndex: 23, type: 'variable.predefined.coffee', bracket: 0 }
        ]);
        // Line 142
        src = '';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
        ]);
        // Line 143
        src = '#Switch/When/Else	';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: 'comment.coffee', bracket: 0 }
        ]);
        // Line 144
        src = 'switch day';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: 'keyword.switch.coffee', bracket: 0 },
            { startIndex: 6, type: '', bracket: 0 }
        ]);
        // Line 145
        src = '  when "Mon" then go work';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 2, type: 'keyword.when.coffee', bracket: 0 },
            { startIndex: 6, type: '', bracket: 0 },
            { startIndex: 7, type: 'string.coffee', bracket: 0 },
            { startIndex: 12, type: '', bracket: 0 },
            { startIndex: 13, type: 'keyword.then.coffee', bracket: 0 },
            { startIndex: 17, type: '', bracket: 0 }
        ]);
        // Line 146
        src = '  when "Tue" then go relax';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 2, type: 'keyword.when.coffee', bracket: 0 },
            { startIndex: 6, type: '', bracket: 0 },
            { startIndex: 7, type: 'string.coffee', bracket: 0 },
            { startIndex: 12, type: '', bracket: 0 },
            { startIndex: 13, type: 'keyword.then.coffee', bracket: 0 },
            { startIndex: 17, type: '', bracket: 0 }
        ]);
        // Line 147
        src = '  when "Thu" then go iceFishing';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 2, type: 'keyword.when.coffee', bracket: 0 },
            { startIndex: 6, type: '', bracket: 0 },
            { startIndex: 7, type: 'string.coffee', bracket: 0 },
            { startIndex: 12, type: '', bracket: 0 },
            { startIndex: 13, type: 'keyword.then.coffee', bracket: 0 },
            { startIndex: 17, type: '', bracket: 0 }
        ]);
        // Line 148
        src = '  when "Fri", "Sat"';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 2, type: 'keyword.when.coffee', bracket: 0 },
            { startIndex: 6, type: '', bracket: 0 },
            { startIndex: 7, type: 'string.coffee', bracket: 0 },
            { startIndex: 12, type: 'delimiter.coffee', bracket: 0 },
            { startIndex: 13, type: '', bracket: 0 },
            { startIndex: 14, type: 'string.coffee', bracket: 0 }
        ]);
        // Line 149
        src = '    if day is bingoDay';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 4, type: 'keyword.if.coffee', bracket: 0 },
            { startIndex: 6, type: '', bracket: 0 },
            { startIndex: 11, type: 'keyword.is.coffee', bracket: 0 },
            { startIndex: 13, type: '', bracket: 0 }
        ]);
        // Line 150
        src = '      go bingo';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 }
        ]);
        // Line 151
        src = '      go dancing';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 }
        ]);
        // Line 152
        src = '  when "Sun" then go church';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 2, type: 'keyword.when.coffee', bracket: 0 },
            { startIndex: 6, type: '', bracket: 0 },
            { startIndex: 7, type: 'string.coffee', bracket: 0 },
            { startIndex: 12, type: '', bracket: 0 },
            { startIndex: 13, type: 'keyword.then.coffee', bracket: 0 },
            { startIndex: 17, type: '', bracket: 0 }
        ]);
        // Line 153
        src = '  else go work';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 2, type: 'keyword.else.coffee', bracket: 0 },
            { startIndex: 6, type: '', bracket: 0 }
        ]);
        // Line 154
        src = ' ';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 }
        ]);
        // Line 155
        src = '#Try/Catch/Finally';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: 'comment.coffee', bracket: 0 }
        ]);
        // Line 156
        src = 'try';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: 'keyword.try.coffee', bracket: 0 }
        ]);
        // Line 157
        src = '  allHellBreaksLoose()';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 20, type: 'delimiter.parenthesis.coffee', bracket: 1 },
            { startIndex: 21, type: 'delimiter.parenthesis.coffee', bracket: -1 }
        ]);
        // Line 158
        src = '  catsAndDogsLivingTogether()';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 27, type: 'delimiter.parenthesis.coffee', bracket: 1 },
            { startIndex: 28, type: 'delimiter.parenthesis.coffee', bracket: -1 }
        ]);
        // Line 159
        src = 'catch error';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: 'keyword.catch.coffee', bracket: 0 },
            { startIndex: 5, type: '', bracket: 0 }
        ]);
        // Line 160
        src = '  print error';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 }
        ]);
        // Line 161
        src = 'finally';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: 'keyword.finally.coffee', bracket: 0 }
        ]);
        // Line 162
        src = '  cleanUp()';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 9, type: 'delimiter.parenthesis.coffee', bracket: 1 },
            { startIndex: 10, type: 'delimiter.parenthesis.coffee', bracket: -1 }
        ]);
        // Line 163
        src = '';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
        ]);
        // Line 164
        src = '#String Interpolation and Block Comments';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: 'comment.coffee', bracket: 0 }
        ]);
        // Line 165
        src = 'author = "Wittgenstein"';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 7, type: 'delimiter.coffee', bracket: 0 },
            { startIndex: 8, type: '', bracket: 0 },
            { startIndex: 9, type: 'string.coffee', bracket: 0 }
        ]);
        // Line 166
        src = 'quote  = "A picture is a fact. -- #{ author }"';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 7, type: 'delimiter.coffee', bracket: 0 },
            { startIndex: 8, type: '', bracket: 0 },
            { startIndex: 9, type: 'string.coffee', bracket: 0 },
            { startIndex: 36, type: '', bracket: 0 },
            { startIndex: 44, type: 'string.coffee', bracket: 0 }
        ]);
        // Line 167
        src = '';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
        ]);
        // Line 168
        src = 'sentence = "#{ 22 / 7 } is a decent approximation of p"';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 9, type: 'delimiter.coffee', bracket: 0 },
            { startIndex: 10, type: '', bracket: 0 },
            { startIndex: 11, type: 'string.coffee', bracket: 0 },
            { startIndex: 14, type: '', bracket: 0 },
            { startIndex: 15, type: 'number.coffee', bracket: 0 },
            { startIndex: 17, type: '', bracket: 0 },
            { startIndex: 18, type: 'delimiter.coffee', bracket: 0 },
            { startIndex: 19, type: '', bracket: 0 },
            { startIndex: 20, type: 'number.coffee', bracket: 0 },
            { startIndex: 21, type: '', bracket: 0 },
            { startIndex: 22, type: 'string.coffee', bracket: 0 }
        ]);
        // Line 169
        src = '';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
        ]);
        // Line 170
        src = 'mobyDick = "Call me Ishmael. Some years ago --';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 9, type: 'delimiter.coffee', bracket: 0 },
            { startIndex: 10, type: '', bracket: 0 },
            { startIndex: 11, type: 'string.coffee', bracket: 0 }
        ]);
        // Line 171
        src = ' never mind how long precisely -- having little';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: 'string.coffee', bracket: 0 }
        ]);
        // Line 172
        src = ' or no money in my purse, and nothing particular';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: 'string.coffee', bracket: 0 }
        ]);
        // Line 173
        src = ' to interest me on shore, I thought I would sail';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: 'string.coffee', bracket: 0 }
        ]);
        // Line 174
        src = ' about a little and see the watery part of the';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: 'string.coffee', bracket: 0 }
        ]);
        // Line 175
        src = ' world..."';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: 'string.coffee', bracket: 0 }
        ]);
        // Line 176
        src = '';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
        ]);
        // Line 177
        src = '#Extended Regular Expressions';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: 'comment.coffee', bracket: 0 }
        ]);
        // Line 178
        src = 'OPERATOR = /// ^ (';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 9, type: 'delimiter.coffee', bracket: 0 },
            { startIndex: 10, type: '', bracket: 0 },
            { startIndex: 11, type: 'regexp.coffee', bracket: 0 }
        ]);
        // Line 179
        src = '  ?: [-=]>             # function';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: 'regexp.coffee', bracket: 0 },
            { startIndex: 23, type: 'comment.coffee', bracket: 0 }
        ]);
        // Line 180
        src = '   | [-+*/%<>&|^!?=]=  # compound assign / compare';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: 'regexp.coffee', bracket: 0 },
            { startIndex: 23, type: 'comment.coffee', bracket: 0 }
        ]);
        // Line 181
        src = '   | >>>=?             # zero-fill right shift';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: 'regexp.coffee', bracket: 0 },
            { startIndex: 23, type: 'comment.coffee', bracket: 0 }
        ]);
        // Line 182
        src = '   | ([-+:])\\1         # doubles';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: 'regexp.coffee', bracket: 0 },
            { startIndex: 23, type: 'comment.coffee', bracket: 0 }
        ]);
        // Line 183
        src = '   | ([&|<>])\\2=?      # logic / shift';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: 'regexp.coffee', bracket: 0 },
            { startIndex: 23, type: 'comment.coffee', bracket: 0 }
        ]);
        // Line 184
        src = '   | \\?\\.              # soak access';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: 'regexp.coffee', bracket: 0 },
            { startIndex: 23, type: 'comment.coffee', bracket: 0 }
        ]);
        // Line 185
        src = '   | \\.{2,3}           # range or splat';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: 'regexp.coffee', bracket: 0 },
            { startIndex: 23, type: 'comment.coffee', bracket: 0 }
        ]);
        // Line 186
        src = ') ///';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: 'regexp.coffee', bracket: 0 }
        ]);
        // Line 187
        src = '';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
        ]);
    });
});
