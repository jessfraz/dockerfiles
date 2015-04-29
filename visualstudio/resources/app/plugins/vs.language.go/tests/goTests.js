/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
/// <reference path="../../declares.d.ts" />
'use strict';
define(["require", "exports", '../goDef', 'monaco-testing'], function (require, exports, goDef, T) {
    var tokenize = T.createTokenize(goDef.language);
    var assertTokens = T.assertTokens;
    T.module('Go Colorizer');
    T.test('Tests', function () {
        // Line 1
        var src = '/* Block comment. */';
        var tokens = tokenize(src).tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'comment.go', bracket: 0 }
        ]);
        // Line 2
        src = '// Inline comment.';
        tokens = tokenize(src).tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'comment.go', bracket: 0 }
        ]);
        // Line 3
        src = '';
        tokens = tokenize(src).tokens;
        assertTokens(tokens, [
        ]);
        // Line 4
        src = 'import {';
        tokens = tokenize(src).tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'keyword.import.go', bracket: 0 },
            { startIndex: 6, type: '', bracket: 0 },
            { startIndex: 7, type: 'delimiter.curly.go', bracket: 1 }
        ]);
        // Line 5
        src = '  "io"';
        tokens = tokenize(src).tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 2, type: 'string.go', bracket: 0 }
        ]);
        // Line 6
        src = '}';
        tokens = tokenize(src).tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'delimiter.curly.go', bracket: -1 }
        ]);
        // Line 7
        src = '';
        tokens = tokenize(src).tokens;
        assertTokens(tokens, [
        ]);
        // Line 8
        src = 'type name struct {';
        tokens = tokenize(src).tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'keyword.type.go', bracket: 0 },
            { startIndex: 4, type: '', bracket: 0 },
            { startIndex: 5, type: 'identifier.go', bracket: 0 },
            { startIndex: 9, type: '', bracket: 0 },
            { startIndex: 10, type: 'keyword.struct.go', bracket: 0 },
            { startIndex: 16, type: '', bracket: 0 },
            { startIndex: 17, type: 'delimiter.curly.go', bracket: 1 }
        ]);
        // Line 9
        src = '  firstname string';
        tokens = tokenize(src).tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 2, type: 'identifier.go', bracket: 0 },
            { startIndex: 11, type: '', bracket: 0 },
            { startIndex: 12, type: 'keyword.string.go', bracket: 0 }
        ]);
        // Line 10
        src = '  lastname string';
        tokens = tokenize(src).tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 2, type: 'identifier.go', bracket: 0 },
            { startIndex: 10, type: '', bracket: 0 },
            { startIndex: 11, type: 'keyword.string.go', bracket: 0 }
        ]);
        // Line 11
        src = '}';
        tokens = tokenize(src).tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'delimiter.curly.go', bracket: -1 }
        ]);
        // Line 12
        src = '';
        tokens = tokenize(src).tokens;
        assertTokens(tokens, [
        ]);
        // Line 13
        src = 'func testTypes() {';
        tokens = tokenize(src).tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'keyword.func.go', bracket: 0 },
            { startIndex: 4, type: '', bracket: 0 },
            { startIndex: 5, type: 'identifier.go', bracket: 0 },
            { startIndex: 14, type: 'delimiter.parenthesis.go', bracket: 1 },
            { startIndex: 15, type: 'delimiter.parenthesis.go', bracket: -1 },
            { startIndex: 16, type: '', bracket: 0 },
            { startIndex: 17, type: 'delimiter.curly.go', bracket: 1 }
        ]);
        // Line 14
        src = '  a int;';
        tokens = tokenize(src).tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 2, type: 'identifier.go', bracket: 0 },
            { startIndex: 3, type: '', bracket: 0 },
            { startIndex: 4, type: 'keyword.int.go', bracket: 0 },
            { startIndex: 7, type: 'delimiter.go', bracket: 0 }
        ]);
        // Line 15
        src = '  b uint;';
        tokens = tokenize(src).tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 2, type: 'identifier.go', bracket: 0 },
            { startIndex: 3, type: '', bracket: 0 },
            { startIndex: 4, type: 'keyword.uint.go', bracket: 0 },
            { startIndex: 8, type: 'delimiter.go', bracket: 0 }
        ]);
        // Line 16
        src = '  c uintptr;';
        tokens = tokenize(src).tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 2, type: 'identifier.go', bracket: 0 },
            { startIndex: 3, type: '', bracket: 0 },
            { startIndex: 4, type: 'keyword.uintptr.go', bracket: 0 },
            { startIndex: 11, type: 'delimiter.go', bracket: 0 }
        ]);
        // Line 17
        src = '  d string;';
        tokens = tokenize(src).tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 2, type: 'identifier.go', bracket: 0 },
            { startIndex: 3, type: '', bracket: 0 },
            { startIndex: 4, type: 'keyword.string.go', bracket: 0 },
            { startIndex: 10, type: 'delimiter.go', bracket: 0 }
        ]);
        // Line 18
        src = '  e byte;';
        tokens = tokenize(src).tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 2, type: 'identifier.go', bracket: 0 },
            { startIndex: 3, type: '', bracket: 0 },
            { startIndex: 4, type: 'keyword.byte.go', bracket: 0 },
            { startIndex: 8, type: 'delimiter.go', bracket: 0 }
        ]);
        // Line 19
        src = '  f rune;';
        tokens = tokenize(src).tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 2, type: 'identifier.go', bracket: 0 },
            { startIndex: 3, type: '', bracket: 0 },
            { startIndex: 4, type: 'keyword.rune.go', bracket: 0 },
            { startIndex: 8, type: 'delimiter.go', bracket: 0 }
        ]);
        // Line 20
        src = '  g uint8;';
        tokens = tokenize(src).tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 2, type: 'identifier.go', bracket: 0 },
            { startIndex: 3, type: '', bracket: 0 },
            { startIndex: 4, type: 'keyword.uint8.go', bracket: 0 },
            { startIndex: 9, type: 'delimiter.go', bracket: 0 }
        ]);
        // Line 21
        src = '  h uint16;';
        tokens = tokenize(src).tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 2, type: 'identifier.go', bracket: 0 },
            { startIndex: 3, type: '', bracket: 0 },
            { startIndex: 4, type: 'keyword.uint16.go', bracket: 0 },
            { startIndex: 10, type: 'delimiter.go', bracket: 0 }
        ]);
        // Line 22
        src = '  i uint32;';
        tokens = tokenize(src).tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 2, type: 'identifier.go', bracket: 0 },
            { startIndex: 3, type: '', bracket: 0 },
            { startIndex: 4, type: 'keyword.uint32.go', bracket: 0 },
            { startIndex: 10, type: 'delimiter.go', bracket: 0 }
        ]);
        // Line 23
        src = '  j uint64;';
        tokens = tokenize(src).tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 2, type: 'identifier.go', bracket: 0 },
            { startIndex: 3, type: '', bracket: 0 },
            { startIndex: 4, type: 'keyword.uint64.go', bracket: 0 },
            { startIndex: 10, type: 'delimiter.go', bracket: 0 }
        ]);
        // Line 24
        src = '  k int8;';
        tokens = tokenize(src).tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 2, type: 'identifier.go', bracket: 0 },
            { startIndex: 3, type: '', bracket: 0 },
            { startIndex: 4, type: 'keyword.int8.go', bracket: 0 },
            { startIndex: 8, type: 'delimiter.go', bracket: 0 }
        ]);
        // Line 25
        src = '  l int16;';
        tokens = tokenize(src).tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 2, type: 'identifier.go', bracket: 0 },
            { startIndex: 3, type: '', bracket: 0 },
            { startIndex: 4, type: 'keyword.int16.go', bracket: 0 },
            { startIndex: 9, type: 'delimiter.go', bracket: 0 }
        ]);
        // Line 26
        src = '  m int32;';
        tokens = tokenize(src).tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 2, type: 'identifier.go', bracket: 0 },
            { startIndex: 3, type: '', bracket: 0 },
            { startIndex: 4, type: 'keyword.int32.go', bracket: 0 },
            { startIndex: 9, type: 'delimiter.go', bracket: 0 }
        ]);
        // Line 27
        src = '  n int64;';
        tokens = tokenize(src).tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 2, type: 'identifier.go', bracket: 0 },
            { startIndex: 3, type: '', bracket: 0 },
            { startIndex: 4, type: 'keyword.int64.go', bracket: 0 },
            { startIndex: 9, type: 'delimiter.go', bracket: 0 }
        ]);
        // Line 28
        src = '  o float32;';
        tokens = tokenize(src).tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 2, type: 'identifier.go', bracket: 0 },
            { startIndex: 3, type: '', bracket: 0 },
            { startIndex: 4, type: 'keyword.float32.go', bracket: 0 },
            { startIndex: 11, type: 'delimiter.go', bracket: 0 }
        ]);
        // Line 29
        src = '  p float64;';
        tokens = tokenize(src).tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 2, type: 'identifier.go', bracket: 0 },
            { startIndex: 3, type: '', bracket: 0 },
            { startIndex: 4, type: 'keyword.float64.go', bracket: 0 },
            { startIndex: 11, type: 'delimiter.go', bracket: 0 }
        ]);
        // Line 30
        src = '  q complex64;';
        tokens = tokenize(src).tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 2, type: 'identifier.go', bracket: 0 },
            { startIndex: 3, type: '', bracket: 0 },
            { startIndex: 4, type: 'keyword.complex64.go', bracket: 0 },
            { startIndex: 13, type: 'delimiter.go', bracket: 0 }
        ]);
        // Line 31
        src = '  r complex128;';
        tokens = tokenize(src).tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 2, type: 'identifier.go', bracket: 0 },
            { startIndex: 3, type: '', bracket: 0 },
            { startIndex: 4, type: 'keyword.complex128.go', bracket: 0 },
            { startIndex: 14, type: 'delimiter.go', bracket: 0 }
        ]);
        // Line 32
        src = '}';
        tokens = tokenize(src).tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'delimiter.curly.go', bracket: -1 }
        ]);
        // Line 33
        src = '';
        tokens = tokenize(src).tokens;
        assertTokens(tokens, [
        ]);
        // Line 34
        src = 'func testOperators() {';
        tokens = tokenize(src).tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'keyword.func.go', bracket: 0 },
            { startIndex: 4, type: '', bracket: 0 },
            { startIndex: 5, type: 'identifier.go', bracket: 0 },
            { startIndex: 18, type: 'delimiter.parenthesis.go', bracket: 1 },
            { startIndex: 19, type: 'delimiter.parenthesis.go', bracket: -1 },
            { startIndex: 20, type: '', bracket: 0 },
            { startIndex: 21, type: 'delimiter.curly.go', bracket: 1 }
        ]);
        // Line 35
        src = '  ';
        tokens = tokenize(src).tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: '', bracket: 0 }
        ]);
        // Line 36
        src = '  var a;';
        tokens = tokenize(src).tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 2, type: 'keyword.var.go', bracket: 0 },
            { startIndex: 5, type: '', bracket: 0 },
            { startIndex: 6, type: 'identifier.go', bracket: 0 },
            { startIndex: 7, type: 'delimiter.go', bracket: 0 }
        ]);
        // Line 37
        src = '  var b;';
        tokens = tokenize(src).tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 2, type: 'keyword.var.go', bracket: 0 },
            { startIndex: 5, type: '', bracket: 0 },
            { startIndex: 6, type: 'identifier.go', bracket: 0 },
            { startIndex: 7, type: 'delimiter.go', bracket: 0 }
        ]);
        // Line 38
        src = '  ';
        tokens = tokenize(src).tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: '', bracket: 0 }
        ]);
        // Line 39
        src = '  a + b;';
        tokens = tokenize(src).tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 2, type: 'identifier.go', bracket: 0 },
            { startIndex: 3, type: '', bracket: 0 },
            { startIndex: 4, type: 'delimiter.go', bracket: 0 },
            { startIndex: 5, type: '', bracket: 0 },
            { startIndex: 6, type: 'identifier.go', bracket: 0 },
            { startIndex: 7, type: 'delimiter.go', bracket: 0 }
        ]);
        // Line 40
        src = '  a - b;';
        tokens = tokenize(src).tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 2, type: 'identifier.go', bracket: 0 },
            { startIndex: 3, type: '', bracket: 0 },
            { startIndex: 4, type: 'delimiter.go', bracket: 0 },
            { startIndex: 5, type: '', bracket: 0 },
            { startIndex: 6, type: 'identifier.go', bracket: 0 },
            { startIndex: 7, type: 'delimiter.go', bracket: 0 }
        ]);
        // Line 41
        src = '  a * b;';
        tokens = tokenize(src).tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 2, type: 'identifier.go', bracket: 0 },
            { startIndex: 3, type: '', bracket: 0 },
            { startIndex: 4, type: 'delimiter.go', bracket: 0 },
            { startIndex: 5, type: '', bracket: 0 },
            { startIndex: 6, type: 'identifier.go', bracket: 0 },
            { startIndex: 7, type: 'delimiter.go', bracket: 0 }
        ]);
        // Line 42
        src = '  a / b;';
        tokens = tokenize(src).tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 2, type: 'identifier.go', bracket: 0 },
            { startIndex: 3, type: '', bracket: 0 },
            { startIndex: 4, type: 'delimiter.go', bracket: 0 },
            { startIndex: 5, type: '', bracket: 0 },
            { startIndex: 6, type: 'identifier.go', bracket: 0 },
            { startIndex: 7, type: 'delimiter.go', bracket: 0 }
        ]);
        // Line 43
        src = '  a % b;';
        tokens = tokenize(src).tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 2, type: 'identifier.go', bracket: 0 },
            { startIndex: 3, type: '', bracket: 0 },
            { startIndex: 4, type: 'delimiter.go', bracket: 0 },
            { startIndex: 5, type: '', bracket: 0 },
            { startIndex: 6, type: 'identifier.go', bracket: 0 },
            { startIndex: 7, type: 'delimiter.go', bracket: 0 }
        ]);
        // Line 44
        src = '  a & b;';
        tokens = tokenize(src).tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 2, type: 'identifier.go', bracket: 0 },
            { startIndex: 3, type: '', bracket: 0 },
            { startIndex: 4, type: 'delimiter.go', bracket: 0 },
            { startIndex: 5, type: '', bracket: 0 },
            { startIndex: 6, type: 'identifier.go', bracket: 0 },
            { startIndex: 7, type: 'delimiter.go', bracket: 0 }
        ]);
        // Line 45
        src = '  a | b;';
        tokens = tokenize(src).tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 2, type: 'identifier.go', bracket: 0 },
            { startIndex: 3, type: '', bracket: 0 },
            { startIndex: 4, type: 'delimiter.go', bracket: 0 },
            { startIndex: 5, type: '', bracket: 0 },
            { startIndex: 6, type: 'identifier.go', bracket: 0 },
            { startIndex: 7, type: 'delimiter.go', bracket: 0 }
        ]);
        // Line 46
        src = '  a ^ b;';
        tokens = tokenize(src).tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 2, type: 'identifier.go', bracket: 0 },
            { startIndex: 3, type: '', bracket: 0 },
            { startIndex: 4, type: 'delimiter.go', bracket: 0 },
            { startIndex: 5, type: '', bracket: 0 },
            { startIndex: 6, type: 'identifier.go', bracket: 0 },
            { startIndex: 7, type: 'delimiter.go', bracket: 0 }
        ]);
        // Line 47
        src = '  a << b;';
        tokens = tokenize(src).tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 2, type: 'identifier.go', bracket: 0 },
            { startIndex: 3, type: '', bracket: 0 },
            { startIndex: 4, type: 'delimiter.go', bracket: 0 },
            { startIndex: 6, type: '', bracket: 0 },
            { startIndex: 7, type: 'identifier.go', bracket: 0 },
            { startIndex: 8, type: 'delimiter.go', bracket: 0 }
        ]);
        // Line 48
        src = '  a >> b;';
        tokens = tokenize(src).tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 2, type: 'identifier.go', bracket: 0 },
            { startIndex: 3, type: '', bracket: 0 },
            { startIndex: 4, type: 'delimiter.go', bracket: 0 },
            { startIndex: 6, type: '', bracket: 0 },
            { startIndex: 7, type: 'identifier.go', bracket: 0 },
            { startIndex: 8, type: 'delimiter.go', bracket: 0 }
        ]);
        // Line 49
        src = '  a &^ b;';
        tokens = tokenize(src).tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 2, type: 'identifier.go', bracket: 0 },
            { startIndex: 3, type: '', bracket: 0 },
            { startIndex: 4, type: 'delimiter.go', bracket: 0 },
            { startIndex: 6, type: '', bracket: 0 },
            { startIndex: 7, type: 'identifier.go', bracket: 0 },
            { startIndex: 8, type: 'delimiter.go', bracket: 0 }
        ]);
        // Line 50
        src = '  a += b;';
        tokens = tokenize(src).tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 2, type: 'identifier.go', bracket: 0 },
            { startIndex: 3, type: '', bracket: 0 },
            { startIndex: 4, type: 'delimiter.go', bracket: 0 },
            { startIndex: 6, type: '', bracket: 0 },
            { startIndex: 7, type: 'identifier.go', bracket: 0 },
            { startIndex: 8, type: 'delimiter.go', bracket: 0 }
        ]);
        // Line 51
        src = '  a -= b;';
        tokens = tokenize(src).tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 2, type: 'identifier.go', bracket: 0 },
            { startIndex: 3, type: '', bracket: 0 },
            { startIndex: 4, type: 'delimiter.go', bracket: 0 },
            { startIndex: 6, type: '', bracket: 0 },
            { startIndex: 7, type: 'identifier.go', bracket: 0 },
            { startIndex: 8, type: 'delimiter.go', bracket: 0 }
        ]);
        // Line 52
        src = '  a *= b;';
        tokens = tokenize(src).tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 2, type: 'identifier.go', bracket: 0 },
            { startIndex: 3, type: '', bracket: 0 },
            { startIndex: 4, type: 'delimiter.go', bracket: 0 },
            { startIndex: 6, type: '', bracket: 0 },
            { startIndex: 7, type: 'identifier.go', bracket: 0 },
            { startIndex: 8, type: 'delimiter.go', bracket: 0 }
        ]);
        // Line 53
        src = '  a /= b;';
        tokens = tokenize(src).tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 2, type: 'identifier.go', bracket: 0 },
            { startIndex: 3, type: '', bracket: 0 },
            { startIndex: 4, type: 'delimiter.go', bracket: 0 },
            { startIndex: 6, type: '', bracket: 0 },
            { startIndex: 7, type: 'identifier.go', bracket: 0 },
            { startIndex: 8, type: 'delimiter.go', bracket: 0 }
        ]);
        // Line 54
        src = '  a %= b;';
        tokens = tokenize(src).tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 2, type: 'identifier.go', bracket: 0 },
            { startIndex: 3, type: '', bracket: 0 },
            { startIndex: 4, type: 'delimiter.go', bracket: 0 },
            { startIndex: 6, type: '', bracket: 0 },
            { startIndex: 7, type: 'identifier.go', bracket: 0 },
            { startIndex: 8, type: 'delimiter.go', bracket: 0 }
        ]);
        // Line 55
        src = '  a &= b;';
        tokens = tokenize(src).tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 2, type: 'identifier.go', bracket: 0 },
            { startIndex: 3, type: '', bracket: 0 },
            { startIndex: 4, type: 'delimiter.go', bracket: 0 },
            { startIndex: 6, type: '', bracket: 0 },
            { startIndex: 7, type: 'identifier.go', bracket: 0 },
            { startIndex: 8, type: 'delimiter.go', bracket: 0 }
        ]);
        // Line 56
        src = '  a |= b;';
        tokens = tokenize(src).tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 2, type: 'identifier.go', bracket: 0 },
            { startIndex: 3, type: '', bracket: 0 },
            { startIndex: 4, type: 'delimiter.go', bracket: 0 },
            { startIndex: 6, type: '', bracket: 0 },
            { startIndex: 7, type: 'identifier.go', bracket: 0 },
            { startIndex: 8, type: 'delimiter.go', bracket: 0 }
        ]);
        // Line 57
        src = '  a ^= b;';
        tokens = tokenize(src).tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 2, type: 'identifier.go', bracket: 0 },
            { startIndex: 3, type: '', bracket: 0 },
            { startIndex: 4, type: 'delimiter.go', bracket: 0 },
            { startIndex: 6, type: '', bracket: 0 },
            { startIndex: 7, type: 'identifier.go', bracket: 0 },
            { startIndex: 8, type: 'delimiter.go', bracket: 0 }
        ]);
        // Line 58
        src = '  a <<= b;';
        tokens = tokenize(src).tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 2, type: 'identifier.go', bracket: 0 },
            { startIndex: 3, type: '', bracket: 0 },
            { startIndex: 4, type: 'delimiter.go', bracket: 0 },
            { startIndex: 7, type: '', bracket: 0 },
            { startIndex: 8, type: 'identifier.go', bracket: 0 },
            { startIndex: 9, type: 'delimiter.go', bracket: 0 }
        ]);
        // Line 59
        src = '  a >>= b;';
        tokens = tokenize(src).tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 2, type: 'identifier.go', bracket: 0 },
            { startIndex: 3, type: '', bracket: 0 },
            { startIndex: 4, type: 'delimiter.go', bracket: 0 },
            { startIndex: 7, type: '', bracket: 0 },
            { startIndex: 8, type: 'identifier.go', bracket: 0 },
            { startIndex: 9, type: 'delimiter.go', bracket: 0 }
        ]);
        // Line 60
        src = '  a &^= b;';
        tokens = tokenize(src).tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 2, type: 'identifier.go', bracket: 0 },
            { startIndex: 3, type: '', bracket: 0 },
            { startIndex: 4, type: 'delimiter.go', bracket: 0 },
            { startIndex: 7, type: '', bracket: 0 },
            { startIndex: 8, type: 'identifier.go', bracket: 0 },
            { startIndex: 9, type: 'delimiter.go', bracket: 0 }
        ]);
        // Line 61
        src = '  a && b;';
        tokens = tokenize(src).tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 2, type: 'identifier.go', bracket: 0 },
            { startIndex: 3, type: '', bracket: 0 },
            { startIndex: 4, type: 'delimiter.go', bracket: 0 },
            { startIndex: 6, type: '', bracket: 0 },
            { startIndex: 7, type: 'identifier.go', bracket: 0 },
            { startIndex: 8, type: 'delimiter.go', bracket: 0 }
        ]);
        // Line 62
        src = '  a || b;';
        tokens = tokenize(src).tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 2, type: 'identifier.go', bracket: 0 },
            { startIndex: 3, type: '', bracket: 0 },
            { startIndex: 4, type: 'delimiter.go', bracket: 0 },
            { startIndex: 6, type: '', bracket: 0 },
            { startIndex: 7, type: 'identifier.go', bracket: 0 },
            { startIndex: 8, type: 'delimiter.go', bracket: 0 }
        ]);
        // Line 63
        src = '  a <- b;';
        tokens = tokenize(src).tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 2, type: 'identifier.go', bracket: 0 },
            { startIndex: 3, type: '', bracket: 0 },
            { startIndex: 4, type: 'delimiter.go', bracket: 0 },
            { startIndex: 6, type: '', bracket: 0 },
            { startIndex: 7, type: 'identifier.go', bracket: 0 },
            { startIndex: 8, type: 'delimiter.go', bracket: 0 }
        ]);
        // Line 64
        src = '  a++;';
        tokens = tokenize(src).tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 2, type: 'identifier.go', bracket: 0 },
            { startIndex: 3, type: 'delimiter.go', bracket: 0 }
        ]);
        // Line 65
        src = '  b--;';
        tokens = tokenize(src).tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 2, type: 'identifier.go', bracket: 0 },
            { startIndex: 3, type: 'delimiter.go', bracket: 0 }
        ]);
        // Line 66
        src = '  a == b;';
        tokens = tokenize(src).tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 2, type: 'identifier.go', bracket: 0 },
            { startIndex: 3, type: '', bracket: 0 },
            { startIndex: 4, type: 'delimiter.go', bracket: 0 },
            { startIndex: 6, type: '', bracket: 0 },
            { startIndex: 7, type: 'identifier.go', bracket: 0 },
            { startIndex: 8, type: 'delimiter.go', bracket: 0 }
        ]);
        // Line 67
        src = '  a < b;';
        tokens = tokenize(src).tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 2, type: 'identifier.go', bracket: 0 },
            { startIndex: 3, type: '', bracket: 0 },
            { startIndex: 4, type: 'delimiter.angle.go', bracket: 1 },
            { startIndex: 5, type: '', bracket: 0 },
            { startIndex: 6, type: 'identifier.go', bracket: 0 },
            { startIndex: 7, type: 'delimiter.go', bracket: 0 }
        ]);
        // Line 68
        src = '  a > b;';
        tokens = tokenize(src).tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 2, type: 'identifier.go', bracket: 0 },
            { startIndex: 3, type: '', bracket: 0 },
            { startIndex: 4, type: 'delimiter.angle.go', bracket: -1 },
            { startIndex: 5, type: '', bracket: 0 },
            { startIndex: 6, type: 'identifier.go', bracket: 0 },
            { startIndex: 7, type: 'delimiter.go', bracket: 0 }
        ]);
        // Line 69
        src = '  a = b; ';
        tokens = tokenize(src).tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 2, type: 'identifier.go', bracket: 0 },
            { startIndex: 3, type: '', bracket: 0 },
            { startIndex: 4, type: 'delimiter.go', bracket: 0 },
            { startIndex: 5, type: '', bracket: 0 },
            { startIndex: 6, type: 'identifier.go', bracket: 0 },
            { startIndex: 7, type: 'delimiter.go', bracket: 0 },
            { startIndex: 8, type: '', bracket: 0 }
        ]);
        // Line 70
        src = '  !a;';
        tokens = tokenize(src).tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 2, type: 'delimiter.go', bracket: 0 },
            { startIndex: 3, type: 'identifier.go', bracket: 0 },
            { startIndex: 4, type: 'delimiter.go', bracket: 0 }
        ]);
        // Line 71
        src = '  a != b;';
        tokens = tokenize(src).tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 2, type: 'identifier.go', bracket: 0 },
            { startIndex: 3, type: '', bracket: 0 },
            { startIndex: 4, type: 'delimiter.go', bracket: 0 },
            { startIndex: 6, type: '', bracket: 0 },
            { startIndex: 7, type: 'identifier.go', bracket: 0 },
            { startIndex: 8, type: 'delimiter.go', bracket: 0 }
        ]);
        // Line 72
        src = '  a <= b;';
        tokens = tokenize(src).tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 2, type: 'identifier.go', bracket: 0 },
            { startIndex: 3, type: '', bracket: 0 },
            { startIndex: 4, type: 'delimiter.go', bracket: 0 },
            { startIndex: 6, type: '', bracket: 0 },
            { startIndex: 7, type: 'identifier.go', bracket: 0 },
            { startIndex: 8, type: 'delimiter.go', bracket: 0 }
        ]);
        // Line 73
        src = '  a >= b;';
        tokens = tokenize(src).tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 2, type: 'identifier.go', bracket: 0 },
            { startIndex: 3, type: '', bracket: 0 },
            { startIndex: 4, type: 'delimiter.go', bracket: 0 },
            { startIndex: 6, type: '', bracket: 0 },
            { startIndex: 7, type: 'identifier.go', bracket: 0 },
            { startIndex: 8, type: 'delimiter.go', bracket: 0 }
        ]);
        // Line 74
        src = '  a := b;';
        tokens = tokenize(src).tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 2, type: 'identifier.go', bracket: 0 },
            { startIndex: 3, type: '', bracket: 0 },
            { startIndex: 4, type: 'delimiter.go', bracket: 0 },
            { startIndex: 6, type: '', bracket: 0 },
            { startIndex: 7, type: 'identifier.go', bracket: 0 },
            { startIndex: 8, type: 'delimiter.go', bracket: 0 }
        ]);
        // Line 75
        src = '  a...;';
        tokens = tokenize(src).tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 2, type: 'identifier.go', bracket: 0 },
            { startIndex: 3, type: 'delimiter.go', bracket: 0 }
        ]);
        // Line 76
        src = '  (a)';
        tokens = tokenize(src).tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 2, type: 'delimiter.parenthesis.go', bracket: 1 },
            { startIndex: 3, type: 'identifier.go', bracket: 0 },
            { startIndex: 4, type: 'delimiter.parenthesis.go', bracket: -1 }
        ]);
        // Line 77
        src = '  [a]';
        tokens = tokenize(src).tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 2, type: 'delimiter.square.go', bracket: 1 },
            { startIndex: 3, type: 'identifier.go', bracket: 0 },
            { startIndex: 4, type: 'delimiter.square.go', bracket: -1 }
        ]);
        // Line 78
        src = '  a.b;';
        tokens = tokenize(src).tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 2, type: 'identifier.go', bracket: 0 },
            { startIndex: 3, type: 'delimiter.go', bracket: 0 },
            { startIndex: 4, type: 'identifier.go', bracket: 0 },
            { startIndex: 5, type: 'delimiter.go', bracket: 0 }
        ]);
        // Line 79
        src = '  a, b;';
        tokens = tokenize(src).tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 2, type: 'identifier.go', bracket: 0 },
            { startIndex: 3, type: 'delimiter.go', bracket: 0 },
            { startIndex: 4, type: '', bracket: 0 },
            { startIndex: 5, type: 'identifier.go', bracket: 0 },
            { startIndex: 6, type: 'delimiter.go', bracket: 0 }
        ]);
        // Line 80
        src = '  a : b; ';
        tokens = tokenize(src).tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 2, type: 'identifier.go', bracket: 0 },
            { startIndex: 3, type: '', bracket: 0 },
            { startIndex: 4, type: 'delimiter.go', bracket: 0 },
            { startIndex: 5, type: '', bracket: 0 },
            { startIndex: 6, type: 'identifier.go', bracket: 0 },
            { startIndex: 7, type: 'delimiter.go', bracket: 0 },
            { startIndex: 8, type: '', bracket: 0 }
        ]);
        // Line 81
        src = '}';
        tokens = tokenize(src).tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'delimiter.curly.go', bracket: -1 }
        ]);
        // Line 82
        src = '';
        tokens = tokenize(src).tokens;
        assertTokens(tokens, [
        ]);
        // Line 83
        src = 'func keywords() {';
        tokens = tokenize(src).tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'keyword.func.go', bracket: 0 },
            { startIndex: 4, type: '', bracket: 0 },
            { startIndex: 5, type: 'identifier.go', bracket: 0 },
            { startIndex: 13, type: 'delimiter.parenthesis.go', bracket: 1 },
            { startIndex: 14, type: 'delimiter.parenthesis.go', bracket: -1 },
            { startIndex: 15, type: '', bracket: 0 },
            { startIndex: 16, type: 'delimiter.curly.go', bracket: 1 }
        ]);
        // Line 84
        src = '  ';
        tokens = tokenize(src).tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: '', bracket: 0 }
        ]);
        // Line 85
        src = '  var a;';
        tokens = tokenize(src).tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 2, type: 'keyword.var.go', bracket: 0 },
            { startIndex: 5, type: '', bracket: 0 },
            { startIndex: 6, type: 'identifier.go', bracket: 0 },
            { startIndex: 7, type: 'delimiter.go', bracket: 0 }
        ]);
        // Line 86
        src = '  break;';
        tokens = tokenize(src).tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 2, type: 'keyword.break.go', bracket: 0 },
            { startIndex: 7, type: 'delimiter.go', bracket: 0 }
        ]);
        // Line 87
        src = '  switch(a) {';
        tokens = tokenize(src).tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 2, type: 'keyword.switch.go', bracket: 0 },
            { startIndex: 8, type: 'delimiter.parenthesis.go', bracket: 1 },
            { startIndex: 9, type: 'identifier.go', bracket: 0 },
            { startIndex: 10, type: 'delimiter.parenthesis.go', bracket: -1 },
            { startIndex: 11, type: '', bracket: 0 },
            { startIndex: 12, type: 'delimiter.curly.go', bracket: 1 }
        ]);
        // Line 88
        src = '    case 1:';
        tokens = tokenize(src).tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 4, type: 'keyword.case.go', bracket: 0 },
            { startIndex: 8, type: '', bracket: 0 },
            { startIndex: 9, type: 'number.go', bracket: 0 },
            { startIndex: 10, type: 'delimiter.go', bracket: 0 }
        ]);
        // Line 89
        src = '      fallthrough;';
        tokens = tokenize(src).tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 6, type: 'keyword.fallthrough.go', bracket: 0 },
            { startIndex: 17, type: 'delimiter.go', bracket: 0 }
        ]);
        // Line 90
        src = '    default:';
        tokens = tokenize(src).tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 4, type: 'keyword.default.go', bracket: 0 },
            { startIndex: 11, type: 'delimiter.go', bracket: 0 }
        ]);
        // Line 91
        src = '      break;';
        tokens = tokenize(src).tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 6, type: 'keyword.break.go', bracket: 0 },
            { startIndex: 11, type: 'delimiter.go', bracket: 0 }
        ]);
        // Line 92
        src = '  }';
        tokens = tokenize(src).tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 2, type: 'delimiter.curly.go', bracket: -1 }
        ]);
        // Line 93
        src = '  ';
        tokens = tokenize(src).tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: '', bracket: 0 }
        ]);
        // Line 94
        src = '  chan;';
        tokens = tokenize(src).tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 2, type: 'keyword.chan.go', bracket: 0 },
            { startIndex: 6, type: 'delimiter.go', bracket: 0 }
        ]);
        // Line 95
        src = '  const;';
        tokens = tokenize(src).tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 2, type: 'keyword.const.go', bracket: 0 },
            { startIndex: 7, type: 'delimiter.go', bracket: 0 }
        ]);
        // Line 96
        src = '  continue;';
        tokens = tokenize(src).tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 2, type: 'keyword.continue.go', bracket: 0 },
            { startIndex: 10, type: 'delimiter.go', bracket: 0 }
        ]);
        // Line 97
        src = '  defer;';
        tokens = tokenize(src).tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 2, type: 'keyword.defer.go', bracket: 0 },
            { startIndex: 7, type: 'delimiter.go', bracket: 0 }
        ]);
        // Line 98
        src = '  if (a)';
        tokens = tokenize(src).tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 2, type: 'keyword.if.go', bracket: 0 },
            { startIndex: 4, type: '', bracket: 0 },
            { startIndex: 5, type: 'delimiter.parenthesis.go', bracket: 1 },
            { startIndex: 6, type: 'identifier.go', bracket: 0 },
            { startIndex: 7, type: 'delimiter.parenthesis.go', bracket: -1 }
        ]);
        // Line 99
        src = '    return;';
        tokens = tokenize(src).tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 4, type: 'keyword.return.go', bracket: 0 },
            { startIndex: 10, type: 'delimiter.go', bracket: 0 }
        ]);
        // Line 100
        src = '  else';
        tokens = tokenize(src).tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 2, type: 'keyword.else.go', bracket: 0 }
        ]);
        // Line 101
        src = '    return;';
        tokens = tokenize(src).tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 4, type: 'keyword.return.go', bracket: 0 },
            { startIndex: 10, type: 'delimiter.go', bracket: 0 }
        ]);
        // Line 102
        src = '   for (i = 0; i < 10; i++);';
        tokens = tokenize(src).tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 3, type: 'keyword.for.go', bracket: 0 },
            { startIndex: 6, type: '', bracket: 0 },
            { startIndex: 7, type: 'delimiter.parenthesis.go', bracket: 1 },
            { startIndex: 8, type: 'identifier.go', bracket: 0 },
            { startIndex: 9, type: '', bracket: 0 },
            { startIndex: 10, type: 'delimiter.go', bracket: 0 },
            { startIndex: 11, type: '', bracket: 0 },
            { startIndex: 12, type: 'number.go', bracket: 0 },
            { startIndex: 13, type: 'delimiter.go', bracket: 0 },
            { startIndex: 14, type: '', bracket: 0 },
            { startIndex: 15, type: 'identifier.go', bracket: 0 },
            { startIndex: 16, type: '', bracket: 0 },
            { startIndex: 17, type: 'delimiter.angle.go', bracket: 1 },
            { startIndex: 18, type: '', bracket: 0 },
            { startIndex: 19, type: 'number.go', bracket: 0 },
            { startIndex: 21, type: 'delimiter.go', bracket: 0 },
            { startIndex: 22, type: '', bracket: 0 },
            { startIndex: 23, type: 'identifier.go', bracket: 0 },
            { startIndex: 24, type: 'delimiter.go', bracket: 0 },
            { startIndex: 26, type: 'delimiter.parenthesis.go', bracket: -1 },
            { startIndex: 27, type: 'delimiter.go', bracket: 0 }
        ]);
        // Line 103
        src = '   go;';
        tokens = tokenize(src).tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 3, type: 'keyword.go.go', bracket: 0 },
            { startIndex: 5, type: 'delimiter.go', bracket: 0 }
        ]);
        // Line 104
        src = '   goto;';
        tokens = tokenize(src).tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 3, type: 'keyword.goto.go', bracket: 0 },
            { startIndex: 7, type: 'delimiter.go', bracket: 0 }
        ]);
        // Line 105
        src = '   interface;';
        tokens = tokenize(src).tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 3, type: 'keyword.interface.go', bracket: 0 },
            { startIndex: 12, type: 'delimiter.go', bracket: 0 }
        ]);
        // Line 106
        src = '   map;';
        tokens = tokenize(src).tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 3, type: 'keyword.map.go', bracket: 0 },
            { startIndex: 6, type: 'delimiter.go', bracket: 0 }
        ]);
        // Line 107
        src = '   package;';
        tokens = tokenize(src).tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 3, type: 'keyword.package.go', bracket: 0 },
            { startIndex: 10, type: 'delimiter.go', bracket: 0 }
        ]);
        // Line 108
        src = '   range;';
        tokens = tokenize(src).tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 3, type: 'keyword.range.go', bracket: 0 },
            { startIndex: 8, type: 'delimiter.go', bracket: 0 }
        ]);
        // Line 109
        src = '   return;';
        tokens = tokenize(src).tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 3, type: 'keyword.return.go', bracket: 0 },
            { startIndex: 9, type: 'delimiter.go', bracket: 0 }
        ]);
        // Line 110
        src = '   select;';
        tokens = tokenize(src).tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 3, type: 'keyword.select.go', bracket: 0 },
            { startIndex: 9, type: 'delimiter.go', bracket: 0 }
        ]);
        // Line 111
        src = '   struct;';
        tokens = tokenize(src).tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 3, type: 'keyword.struct.go', bracket: 0 },
            { startIndex: 9, type: 'delimiter.go', bracket: 0 }
        ]);
        // Line 112
        src = '   type;';
        tokens = tokenize(src).tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 3, type: 'keyword.type.go', bracket: 0 },
            { startIndex: 7, type: 'delimiter.go', bracket: 0 }
        ]);
        // Line 113
        src = '   ';
        tokens = tokenize(src).tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: '', bracket: 0 }
        ]);
        // Line 114
        src = '   var x = true;';
        tokens = tokenize(src).tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 3, type: 'keyword.var.go', bracket: 0 },
            { startIndex: 6, type: '', bracket: 0 },
            { startIndex: 7, type: 'identifier.go', bracket: 0 },
            { startIndex: 8, type: '', bracket: 0 },
            { startIndex: 9, type: 'delimiter.go', bracket: 0 },
            { startIndex: 10, type: '', bracket: 0 },
            { startIndex: 11, type: 'keyword.true.go', bracket: 0 },
            { startIndex: 15, type: 'delimiter.go', bracket: 0 }
        ]);
        // Line 115
        src = '   var y = false;';
        tokens = tokenize(src).tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 3, type: 'keyword.var.go', bracket: 0 },
            { startIndex: 6, type: '', bracket: 0 },
            { startIndex: 7, type: 'identifier.go', bracket: 0 },
            { startIndex: 8, type: '', bracket: 0 },
            { startIndex: 9, type: 'delimiter.go', bracket: 0 },
            { startIndex: 10, type: '', bracket: 0 },
            { startIndex: 11, type: 'keyword.false.go', bracket: 0 },
            { startIndex: 16, type: 'delimiter.go', bracket: 0 }
        ]);
        // Line 116
        src = '   var z = nil;';
        tokens = tokenize(src).tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 3, type: 'keyword.var.go', bracket: 0 },
            { startIndex: 6, type: '', bracket: 0 },
            { startIndex: 7, type: 'identifier.go', bracket: 0 },
            { startIndex: 8, type: '', bracket: 0 },
            { startIndex: 9, type: 'delimiter.go', bracket: 0 },
            { startIndex: 10, type: '', bracket: 0 },
            { startIndex: 11, type: 'keyword.nil.go', bracket: 0 },
            { startIndex: 14, type: 'delimiter.go', bracket: 0 }
        ]);
        // Line 117
        src = '}';
        tokens = tokenize(src).tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'delimiter.curly.go', bracket: -1 }
        ]);
    });
});
