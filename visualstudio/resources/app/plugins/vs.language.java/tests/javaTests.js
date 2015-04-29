/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
/// <reference path="../../declares.d.ts" />
'use strict';
define(["require", "exports", '../javaDef', 'monaco-testing'], function (require, exports, languageDef, T) {
    var tokenizationSupport = T.createTokenizationSupport(languageDef.language);
    var tokenize = T.createTokenizeFromSupport(tokenizationSupport);
    var assertTokens = T.assertTokens;
    var assertWords = T.assertWords;
    T.module('Syntax Highlighting - Java');
    function assertTokensOne(textToTokenize, tokenType) {
        var tokens = tokenize(textToTokenize).tokens;
        assertTokens(tokens, [{ startIndex: 0, type: tokenType }]);
    }
    ;
    T.test('Comments - single line', function () {
        var tokens = tokenize('//').tokens;
        T.equal(tokens.length, 1);
        tokens = tokenize('    // a comment').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: '' },
            { startIndex: 4, type: 'comment.java' }
        ]);
        tokens = tokenize('// a comment').tokens;
        assertTokens(tokens, [{ startIndex: 0, type: 'comment.java' }]);
        tokens = tokenize('//sticky comment').tokens;
        assertTokens(tokens, [{ startIndex: 0, type: 'comment.java' }]);
        tokens = tokenize('/almost a comment').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'delimiter.java' },
            { startIndex: 1, type: 'identifier.java' },
            { startIndex: 7, type: '' },
            { startIndex: 8, type: 'identifier.java' },
            { startIndex: 9, type: '' },
            { startIndex: 10, type: 'identifier.java' }
        ]);
        tokens = tokenize('1 / 2; /* comment').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'number.java' },
            { startIndex: 1, type: '' },
            { startIndex: 2, type: 'delimiter.java' },
            { startIndex: 3, type: '' },
            { startIndex: 4, type: 'number.java' },
            { startIndex: 5, type: 'delimiter.java' },
            { startIndex: 6, type: '' },
            { startIndex: 7, type: 'comment.java' }
        ]);
        tokens = tokenize('int x = 1; // my comment // is a nice one').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'keyword.int.java' },
            { startIndex: 3, type: '' },
            { startIndex: 4, type: 'identifier.java' },
            { startIndex: 5, type: '' },
            { startIndex: 6, type: 'delimiter.java' },
            { startIndex: 7, type: '' },
            { startIndex: 8, type: 'number.java' },
            { startIndex: 9, type: 'delimiter.java' },
            { startIndex: 10, type: '' },
            { startIndex: 11, type: 'comment.java' }
        ]);
    });
    T.test('Comments - range comment, single line', function () {
        var tokens = tokenize('/* a simple comment */').tokens;
        assertTokens(tokens, [{ startIndex: 0, type: 'comment.java' }]);
        tokens = tokenize('int x = /* a simple comment */ 1;').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'keyword.int.java' },
            { startIndex: 3, type: '' },
            { startIndex: 4, type: 'identifier.java' },
            { startIndex: 5, type: '' },
            { startIndex: 6, type: 'delimiter.java' },
            { startIndex: 7, type: '' },
            { startIndex: 8, type: 'comment.java' },
            { startIndex: 30, type: '' },
            { startIndex: 31, type: 'number.java' },
            { startIndex: 32, type: 'delimiter.java' }
        ]);
        tokens = tokenize('int x = /* comment */ 1; */').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'keyword.int.java' },
            { startIndex: 3, type: '' },
            { startIndex: 4, type: 'identifier.java' },
            { startIndex: 5, type: '' },
            { startIndex: 6, type: 'delimiter.java' },
            { startIndex: 7, type: '' },
            { startIndex: 8, type: 'comment.java' },
            { startIndex: 21, type: '' },
            { startIndex: 22, type: 'number.java' },
            { startIndex: 23, type: 'delimiter.java' },
            { startIndex: 24, type: '' }
        ]);
        tokens = tokenize('x = /**/;').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'identifier.java' },
            { startIndex: 1, type: '' },
            { startIndex: 2, type: 'delimiter.java' },
            { startIndex: 3, type: '' },
            { startIndex: 4, type: 'comment.java' },
            { startIndex: 8, type: 'delimiter.java' }
        ]);
        tokens = tokenize('x = /*/;').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'identifier.java' },
            { startIndex: 1, type: '' },
            { startIndex: 2, type: 'delimiter.java' },
            { startIndex: 3, type: '' },
            { startIndex: 4, type: 'comment.java' }
        ]);
    });
    T.test('Comments - range comment, multiple lines', function () {
        var lineTokens = tokenize('/* start of multiline comment');
        assertTokens(lineTokens.tokens, [{ startIndex: 0, type: 'comment.java' }]);
        lineTokens = tokenize('a comment between without a star', lineTokens.endState);
        assertTokens(lineTokens.tokens, [{ startIndex: 0, type: 'comment.java' }]);
        lineTokens = tokenize('end of multiline comment*/', lineTokens.endState);
        assertTokens(lineTokens.tokens, [{ startIndex: 0, type: 'comment.java' }]);
        lineTokens = tokenize('int x = /* start a comment');
        assertTokens(lineTokens.tokens, [
            { startIndex: 0, type: 'keyword.int.java' },
            { startIndex: 3, type: '' },
            { startIndex: 4, type: 'identifier.java' },
            { startIndex: 5, type: '' },
            { startIndex: 6, type: 'delimiter.java' },
            { startIndex: 7, type: '' },
            { startIndex: 8, type: 'comment.java' }
        ]);
        lineTokens = tokenize(' a ', lineTokens.endState);
        assertTokens(lineTokens.tokens, [
            { startIndex: 0, type: 'comment.java' }
        ]);
        lineTokens = tokenize('and end it */ 2;', lineTokens.endState);
        assertTokens(lineTokens.tokens, [
            { startIndex: 0, type: 'comment.java' },
            { startIndex: 13, type: '' },
            { startIndex: 14, type: 'number.java' },
            { startIndex: 15, type: 'delimiter.java' }
        ]);
    });
    T.test('Java Doc, multiple lines', function () {
        var lineTokens = tokenize('/** start of Java Doc');
        assertTokens(lineTokens.tokens, [{ startIndex: 0, type: 'comment.doc.java' }]);
        lineTokens = tokenize('a comment between without a star', lineTokens.endState);
        assertTokens(lineTokens.tokens, [{ startIndex: 0, type: 'comment.doc.java' }]);
        lineTokens = tokenize('end of multiline comment*/', lineTokens.endState);
        assertTokens(lineTokens.tokens, [{ startIndex: 0, type: 'comment.doc.java' }]);
    });
    T.test('Keywords', function () {
        var tokens = tokenize('package test; class Program { static void main(String[] args) {} } }').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'keyword.package.java' },
            { startIndex: 7, type: '' },
            { startIndex: 8, type: 'identifier.java' },
            { startIndex: 12, type: 'delimiter.java' },
            { startIndex: 13, type: '' },
            { startIndex: 14, type: 'keyword.class.java' },
            { startIndex: 19, type: '' },
            { startIndex: 20, type: 'identifier.java' },
            { startIndex: 27, type: '' },
            { startIndex: 28, type: 'delimiter.curly.java' },
            { startIndex: 29, type: '' },
            { startIndex: 30, type: 'keyword.static.java' },
            { startIndex: 36, type: '' },
            { startIndex: 37, type: 'keyword.void.java' },
            { startIndex: 41, type: '' },
            { startIndex: 42, type: 'identifier.java' },
            { startIndex: 46, type: 'delimiter.parenthesis.java' },
            { startIndex: 47, type: 'identifier.java' },
            { startIndex: 53, type: 'delimiter.square.java' },
            { startIndex: 54, type: 'delimiter.square.java' },
            { startIndex: 55, type: '' },
            { startIndex: 56, type: 'identifier.java' },
            { startIndex: 60, type: 'delimiter.parenthesis.java' },
            { startIndex: 61, type: '' },
            { startIndex: 62, type: 'delimiter.curly.java', bracket: 1 },
            { startIndex: 63, type: 'delimiter.curly.java', bracket: -1 },
            { startIndex: 64, type: '' },
            { startIndex: 65, type: 'delimiter.curly.java', bracket: -1 },
            { startIndex: 66, type: '' },
            { startIndex: 67, type: 'delimiter.curly.java', bracket: -1 }
        ]);
    });
    T.test('Numbers', function () {
        assertTokensOne('0', 'number.java');
        assertTokensOne('0.10', 'number.float.java');
        var tokens = tokenize('0x').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'number.java' },
            { startIndex: 1, type: 'identifier.java' }
        ]);
        assertTokensOne('0x123', 'number.hex.java');
        assertTokensOne('023L', 'number.octal.java');
        assertTokensOne('0123l', 'number.octal.java');
        assertTokensOne('0b1010_0101', 'number.binary.java');
        assertTokensOne('0B001', 'number.binary.java');
        assertTokensOne('10e3', 'number.float.java');
        assertTokensOne('10f', 'number.float.java');
        assertTokensOne('23.5', 'number.float.java');
        assertTokensOne('23.5e3', 'number.float.java');
        assertTokensOne('23.5e-3', 'number.float.java');
        assertTokensOne('23.5E3', 'number.float.java');
        assertTokensOne('23.5E-3', 'number.float.java');
        assertTokensOne('23.5F', 'number.float.java');
        assertTokensOne('23.5f', 'number.float.java');
        assertTokensOne('23.5D', 'number.float.java');
        assertTokensOne('23.5d', 'number.float.java');
        assertTokensOne('1.72E3D', 'number.float.java');
        assertTokensOne('1.72E3d', 'number.float.java');
        assertTokensOne('1.72E-3d', 'number.float.java');
        assertTokensOne('1.72e3D', 'number.float.java');
        assertTokensOne('1.72e3d', 'number.float.java');
        assertTokensOne('1.72e-3d', 'number.float.java');
        assertTokensOne('23L', 'number.java');
        assertTokensOne('23l', 'number.java');
        var tokens = tokenize('23.5L').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'number.float.java' },
            { startIndex: 4, type: 'identifier.java' }
        ]);
        var tokens = tokenize('0+0').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'number.java' },
            { startIndex: 1, type: 'delimiter.java' },
            { startIndex: 2, type: 'number.java' }
        ]);
        var tokens = tokenize('100+10').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'number.java' },
            { startIndex: 3, type: 'delimiter.java' },
            { startIndex: 4, type: 'number.java' }
        ]);
        var tokens = tokenize('0 + 0').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'number.java' },
            { startIndex: 1, type: '' },
            { startIndex: 2, type: 'delimiter.java' },
            { startIndex: 3, type: '' },
            { startIndex: 4, type: 'number.java' }
        ]);
    });
    T.test('single line Strings', function () {
        var tokens = tokenize('String s = \"I\'m a Java String\";').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'identifier.java' },
            { startIndex: 6, type: '' },
            { startIndex: 7, type: 'identifier.java' },
            { startIndex: 8, type: '' },
            { startIndex: 9, type: 'delimiter.java' },
            { startIndex: 10, type: '' },
            { startIndex: 11, type: 'string.java' },
            { startIndex: 30, type: 'delimiter.java' }
        ]);
        var tokens = tokenize('String s = \"concatenated\" + \" String\" ;').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'identifier.java' },
            { startIndex: 6, type: '' },
            { startIndex: 7, type: 'identifier.java' },
            { startIndex: 8, type: '' },
            { startIndex: 9, type: 'delimiter.java' },
            { startIndex: 10, type: '' },
            { startIndex: 11, type: 'string.java' },
            { startIndex: 25, type: '' },
            { startIndex: 26, type: 'delimiter.java' },
            { startIndex: 27, type: '' },
            { startIndex: 28, type: 'string.java' },
            { startIndex: 37, type: '' },
            { startIndex: 38, type: 'delimiter.java' }
        ]);
        var tokens = tokenize('\"quote in a string\"').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'string.java' }
        ]);
        tokens = tokenize('"escaping \\"quotes\\" is cool"').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'string.java' },
            { startIndex: 10, type: 'string.escape.java' },
            { startIndex: 12, type: 'string.java' },
            { startIndex: 18, type: 'string.escape.java' },
            { startIndex: 20, type: 'string.java' }
        ]);
        tokens = tokenize('\"\\\"').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'string.invalid.java' }
        ]);
    });
    T.test('Annotations', function () {
        var tokens = tokenize('@').tokens;
        assertTokens(tokens, [{ startIndex: 0, type: '' }]);
        var tokens = tokenize('@Override').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'annotation.java' }
        ]);
        var tokens = tokenize('@SuppressWarnings(value = \"aString\")').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'annotation.java' },
            { startIndex: 17, type: 'delimiter.parenthesis.java' },
            { startIndex: 18, type: 'identifier.java' },
            { startIndex: 23, type: '' },
            { startIndex: 24, type: 'delimiter.java' },
            { startIndex: 25, type: '' },
            { startIndex: 26, type: 'string.java' },
            { startIndex: 35, type: 'delimiter.parenthesis.java' }
        ]);
        var tokens = tokenize('@ AnnotationWithKeywordAfter private').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'annotation.java' },
            { startIndex: 28, type: '' },
            { startIndex: 29, type: 'keyword.private.java' }
        ]);
    });
    T.test('Word definition', function () {
        var wordDefinition = languageDef.language.wordDefinition;
        assertWords('a b cde'.match(wordDefinition), ['a', 'b', 'cde']);
        assertWords('public static void main(String[] args) {'.match(wordDefinition), ['public', 'static', 'void', 'main', 'String', 'args']);
        assertWords('g.drawOval(10,10, 330, 100); @SuppressWarnings("unchecked")'.match(wordDefinition), ['g', 'drawOval', '10', '10', '330', '100', '@SuppressWarnings', 'unchecked']);
        assertWords('Socket client_socket = listen_socket.accept();'.match(wordDefinition), ['Socket', 'client_socket', 'listen_socket', 'accept']);
    });
});
