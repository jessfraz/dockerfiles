/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
/// <reference path="../../declares.d.ts" />
'use strict';
define(["require", "exports", '../cppDef', 'monaco-testing'], function (require, exports, languageDef, T) {
    var tokenizationSupport = T.createTokenizationSupport(languageDef.language);
    var tokenize = T.createTokenizeFromSupport(tokenizationSupport);
    var assertTokens = T.assertTokens;
    var assertWords = T.assertWords;
    function assertTokensOne(textToTokenize, tokenType) {
        var tokens = tokenize(textToTokenize).tokens;
        assertTokens(tokens, [{ startIndex: 0, type: tokenType }]);
    }
    ;
    T.module('Syntax Highlighting - CPP');
    T.test('Keywords', function () {
        var tokens = tokenize('int _tmain(int argc, _TCHAR* argv[])').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'keyword.int.cpp' },
            { startIndex: 3, type: '' },
            { startIndex: 4, type: 'identifier.cpp' },
            { startIndex: 10, type: 'delimiter.parenthesis.cpp', bracket: 1 },
            { startIndex: 11, type: 'keyword.int.cpp' },
            { startIndex: 14, type: '' },
            { startIndex: 15, type: 'identifier.cpp' },
            { startIndex: 19, type: 'delimiter.cpp' },
            { startIndex: 20, type: '' },
            { startIndex: 21, type: 'identifier.cpp' },
            { startIndex: 27, type: 'delimiter.cpp' },
            { startIndex: 28, type: '' },
            { startIndex: 29, type: 'identifier.cpp' },
            { startIndex: 33, type: 'delimiter.square.cpp', bracket: 1 },
            { startIndex: 34, type: 'delimiter.square.cpp', bracket: -1 },
            { startIndex: 35, type: 'delimiter.parenthesis.cpp', bracket: -1 }
        ]);
    });
    T.test('Comments - single line', function () {
        var tokens = [];
        tokens = tokenize('//').tokens;
        T.equal(tokens.length, 1);
        assertTokens(tokens, [{ startIndex: 0, type: 'comment.cpp' }]);
        tokens = tokenize('    // a comment').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: '' },
            { startIndex: 4, type: 'comment.cpp' }
        ]);
        tokens = tokenize('// a comment').tokens;
        assertTokens(tokens, [{ startIndex: 0, type: 'comment.cpp' }]);
        tokens = tokenize('//sticky comment').tokens;
        assertTokens(tokens, [{ startIndex: 0, type: 'comment.cpp' }]);
        tokens = tokenize('/almost a comment').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'delimiter.cpp' },
            { startIndex: 1, type: 'identifier.cpp' },
            { startIndex: 7, type: '' },
            { startIndex: 8, type: 'identifier.cpp' },
            { startIndex: 9, type: '' },
            { startIndex: 10, type: 'identifier.cpp' }
        ]);
        tokens = tokenize('1 / 2; /* comment').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'number.cpp' },
            { startIndex: 1, type: '' },
            { startIndex: 2, type: 'delimiter.cpp' },
            { startIndex: 3, type: '' },
            { startIndex: 4, type: 'number.cpp' },
            { startIndex: 5, type: 'delimiter.cpp' },
            { startIndex: 6, type: '' },
            { startIndex: 7, type: 'comment.cpp' }
        ]);
        tokens = tokenize('int x = 1; // my comment // is a nice one').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'keyword.int.cpp' },
            { startIndex: 3, type: '' },
            { startIndex: 4, type: 'identifier.cpp' },
            { startIndex: 5, type: '' },
            { startIndex: 6, type: 'delimiter.cpp' },
            { startIndex: 7, type: '' },
            { startIndex: 8, type: 'number.cpp' },
            { startIndex: 9, type: 'delimiter.cpp' },
            { startIndex: 10, type: '' },
            { startIndex: 11, type: 'comment.cpp' }
        ]);
    });
    T.test('Comments - range comment, single line', function () {
        var tokens = tokenize('/* a simple comment */').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'comment.cpp' }
        ]);
        tokens = tokenize('int x = /* a simple comment */ 1;').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'keyword.int.cpp' },
            { startIndex: 3, type: '' },
            { startIndex: 4, type: 'identifier.cpp' },
            { startIndex: 5, type: '' },
            { startIndex: 6, type: 'delimiter.cpp' },
            { startIndex: 7, type: '' },
            { startIndex: 8, type: 'comment.cpp' },
            { startIndex: 30, type: '' },
            { startIndex: 31, type: 'number.cpp' },
            { startIndex: 32, type: 'delimiter.cpp' }
        ]);
        tokens = tokenize('int x = /* comment */ 1; */').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'keyword.int.cpp' },
            { startIndex: 3, type: '' },
            { startIndex: 4, type: 'identifier.cpp' },
            { startIndex: 5, type: '' },
            { startIndex: 6, type: 'delimiter.cpp' },
            { startIndex: 7, type: '' },
            { startIndex: 8, type: 'comment.cpp' },
            { startIndex: 21, type: '' },
            { startIndex: 22, type: 'number.cpp' },
            { startIndex: 23, type: 'delimiter.cpp' },
            { startIndex: 24, type: '' }
        ]);
        tokens = tokenize('x = /**/;').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'identifier.cpp' },
            { startIndex: 1, type: '' },
            { startIndex: 2, type: 'delimiter.cpp' },
            { startIndex: 3, type: '' },
            { startIndex: 4, type: 'comment.cpp' },
            { startIndex: 8, type: 'delimiter.cpp' }
        ]);
        tokens = tokenize('x = /*/;').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'identifier.cpp' },
            { startIndex: 1, type: '' },
            { startIndex: 2, type: 'delimiter.cpp' },
            { startIndex: 3, type: '' },
            { startIndex: 4, type: 'comment.cpp' }
        ]);
    });
    T.test('Numbers', function () {
        assertTokensOne('0', 'number.cpp');
        assertTokensOne('12l', 'number.cpp');
        assertTokensOne('34U', 'number.cpp');
        assertTokensOne('55LL', 'number.cpp');
        assertTokensOne('34ul', 'number.cpp');
        assertTokensOne('55llU', 'number.cpp');
        assertTokensOne('5\'5llU', 'number.cpp');
        assertTokensOne('100\'000\'000', 'number.cpp');
        assertTokensOne('0x100\'aafllU', 'number.hex.cpp');
        assertTokensOne('0342\'325', 'number.octal.cpp');
        assertTokensOne('0x123', 'number.hex.cpp');
        assertTokensOne('23.5', 'number.float.cpp');
        assertTokensOne('23.5e3', 'number.float.cpp');
        assertTokensOne('23.5E3', 'number.float.cpp');
        assertTokensOne('23.5F', 'number.float.cpp');
        assertTokensOne('23.5f', 'number.float.cpp');
        assertTokensOne('1.72E3F', 'number.float.cpp');
        assertTokensOne('1.72E3f', 'number.float.cpp');
        assertTokensOne('1.72e3F', 'number.float.cpp');
        assertTokensOne('1.72e3f', 'number.float.cpp');
        assertTokensOne('23.5L', 'number.float.cpp');
        assertTokensOne('23.5l', 'number.float.cpp');
        assertTokensOne('1.72E3L', 'number.float.cpp');
        assertTokensOne('1.72E3l', 'number.float.cpp');
        assertTokensOne('1.72e3L', 'number.float.cpp');
        assertTokensOne('1.72e3l', 'number.float.cpp');
        var tokens = tokenize('0+0').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'number.cpp' },
            { startIndex: 1, type: 'delimiter.cpp' },
            { startIndex: 2, type: 'number.cpp' }
        ]);
        tokens = tokenize('100+10').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'number.cpp' },
            { startIndex: 3, type: 'delimiter.cpp' },
            { startIndex: 4, type: 'number.cpp' }
        ]);
        tokens = tokenize('0 + 0').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'number.cpp' },
            { startIndex: 1, type: '' },
            { startIndex: 2, type: 'delimiter.cpp' },
            { startIndex: 3, type: '' },
            { startIndex: 4, type: 'number.cpp' }
        ]);
    });
    T.test('Monarch Generated', function () {
        var previousState = tokenizationSupport.getInitialState();
        // Line 1
        var src = '#include<iostream>';
        var tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: 'keyword.cpp' },
            { startIndex: 8, type: 'delimiter.angle.cpp' },
            { startIndex: 9, type: 'identifier.cpp' },
            { startIndex: 17, type: 'delimiter.angle.cpp' }
        ]);
        // Line 2
        src = '#include "/path/to/my/file.h"';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: 'keyword.cpp' },
            { startIndex: 8, type: '' },
            { startIndex: 9, type: 'string.cpp' }
        ]);
        // Line 3
        src = '';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
        ]);
        // Line 4
        src = '#ifdef VAR';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: 'keyword.cpp' },
            { startIndex: 6, type: '' },
            { startIndex: 7, type: 'identifier.cpp' }
        ]);
        // Line 5
        src = '#define SUM(A,B) (A) + (B)';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: 'keyword.cpp' },
            { startIndex: 7, type: '' },
            { startIndex: 8, type: 'identifier.cpp' },
            { startIndex: 11, type: 'delimiter.parenthesis.cpp' },
            { startIndex: 12, type: 'identifier.cpp' },
            { startIndex: 13, type: 'delimiter.cpp' },
            { startIndex: 14, type: 'identifier.cpp' },
            { startIndex: 15, type: 'delimiter.parenthesis.cpp' },
            { startIndex: 16, type: '' },
            { startIndex: 17, type: 'delimiter.parenthesis.cpp' },
            { startIndex: 18, type: 'identifier.cpp' },
            { startIndex: 19, type: 'delimiter.parenthesis.cpp' },
            { startIndex: 20, type: '' },
            { startIndex: 21, type: 'delimiter.cpp' },
            { startIndex: 22, type: '' },
            { startIndex: 23, type: 'delimiter.parenthesis.cpp' },
            { startIndex: 24, type: 'identifier.cpp' },
            { startIndex: 25, type: 'delimiter.parenthesis.cpp' }
        ]);
        // Line 6
        src = '';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
        ]);
        // Line 7
        src = 'int main(int argc, char** argv)';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: 'keyword.int.cpp' },
            { startIndex: 3, type: '' },
            { startIndex: 4, type: 'identifier.cpp' },
            { startIndex: 8, type: 'delimiter.parenthesis.cpp' },
            { startIndex: 9, type: 'keyword.int.cpp' },
            { startIndex: 12, type: '' },
            { startIndex: 13, type: 'identifier.cpp' },
            { startIndex: 17, type: 'delimiter.cpp' },
            { startIndex: 18, type: '' },
            { startIndex: 19, type: 'keyword.char.cpp' },
            { startIndex: 23, type: '' },
            { startIndex: 26, type: 'identifier.cpp' },
            { startIndex: 30, type: 'delimiter.parenthesis.cpp' }
        ]);
        // Line 8
        src = '{';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: 'delimiter.curly.cpp' }
        ]);
        // Line 9
        src = '	return 0;';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '' },
            { startIndex: 1, type: 'keyword.return.cpp' },
            { startIndex: 7, type: '' },
            { startIndex: 8, type: 'number.cpp' },
            { startIndex: 9, type: 'delimiter.cpp' }
        ]);
        // Line 10
        src = '}';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: 'delimiter.curly.cpp' }
        ]);
        // Line 11
        src = '';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
        ]);
        // Line 12
        src = 'namespace TestSpace';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: 'keyword.namespace.cpp' },
            { startIndex: 9, type: '' },
            { startIndex: 10, type: 'identifier.cpp' }
        ]);
        // Line 13
        src = '{';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: 'delimiter.curly.cpp' }
        ]);
        // Line 14
        src = '	using Asdf.CDE;';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '' },
            { startIndex: 1, type: 'keyword.using.cpp' },
            { startIndex: 6, type: '' },
            { startIndex: 7, type: 'identifier.cpp' },
            { startIndex: 11, type: 'delimiter.cpp' },
            { startIndex: 12, type: 'identifier.cpp' },
            { startIndex: 15, type: 'delimiter.cpp' }
        ]);
        // Line 15
        src = '	template <typename T>';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '' },
            { startIndex: 1, type: 'keyword.template.cpp' },
            { startIndex: 9, type: '' },
            { startIndex: 10, type: 'delimiter.angle.cpp' },
            { startIndex: 11, type: 'keyword.typename.cpp' },
            { startIndex: 19, type: '' },
            { startIndex: 20, type: 'identifier.cpp' },
            { startIndex: 21, type: 'delimiter.angle.cpp' }
        ]);
        // Line 16
        src = '	class CoolClass : protected BaseClass';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '' },
            { startIndex: 1, type: 'keyword.class.cpp' },
            { startIndex: 6, type: '' },
            { startIndex: 7, type: 'identifier.cpp' },
            { startIndex: 16, type: '' },
            { startIndex: 17, type: 'delimiter.cpp' },
            { startIndex: 18, type: '' },
            { startIndex: 19, type: 'keyword.protected.cpp' },
            { startIndex: 28, type: '' },
            { startIndex: 29, type: 'identifier.cpp' }
        ]);
        // Line 17
        src = '	{';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '' },
            { startIndex: 1, type: 'delimiter.curly.cpp' }
        ]);
        // Line 18
        src = '		private:';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '' },
            { startIndex: 2, type: 'keyword.private.cpp' },
            { startIndex: 9, type: 'delimiter.cpp' }
        ]);
        // Line 19
        src = '		';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '' }
        ]);
        // Line 20
        src = '		static T field;';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '' },
            { startIndex: 2, type: 'keyword.static.cpp' },
            { startIndex: 8, type: '' },
            { startIndex: 9, type: 'identifier.cpp' },
            { startIndex: 10, type: '' },
            { startIndex: 11, type: 'identifier.cpp' },
            { startIndex: 16, type: 'delimiter.cpp' }
        ]);
        // Line 21
        src = '		';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '' }
        ]);
        // Line 22
        src = '		public:';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '' },
            { startIndex: 2, type: 'keyword.public.cpp' },
            { startIndex: 8, type: 'delimiter.cpp' }
        ]);
        // Line 23
        src = '		';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '' }
        ]);
        // Line 24
        src = '		[[deprecated]]';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '' },
            { startIndex: 2, type: 'annotation.cpp' }
        ]);
        // Line 25
        src = '		foo method() const override';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '' },
            { startIndex: 2, type: 'identifier.cpp' },
            { startIndex: 5, type: '' },
            { startIndex: 6, type: 'identifier.cpp' },
            { startIndex: 12, type: 'delimiter.parenthesis.cpp' },
            { startIndex: 13, type: 'delimiter.parenthesis.cpp' },
            { startIndex: 14, type: '' },
            { startIndex: 15, type: 'keyword.const.cpp' },
            { startIndex: 20, type: '' },
            { startIndex: 21, type: 'keyword.override.cpp' }
        ]);
        // Line 26
        src = '		{';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '' },
            { startIndex: 2, type: 'delimiter.curly.cpp' }
        ]);
        // Line 27
        src = '			auto s = new Bar();';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '' },
            { startIndex: 3, type: 'keyword.auto.cpp' },
            { startIndex: 7, type: '' },
            { startIndex: 8, type: 'identifier.cpp' },
            { startIndex: 9, type: '' },
            { startIndex: 10, type: 'delimiter.cpp' },
            { startIndex: 11, type: '' },
            { startIndex: 12, type: 'keyword.new.cpp' },
            { startIndex: 15, type: '' },
            { startIndex: 16, type: 'identifier.cpp' },
            { startIndex: 19, type: 'delimiter.parenthesis.cpp' },
            { startIndex: 20, type: 'delimiter.parenthesis.cpp' },
            { startIndex: 21, type: 'delimiter.cpp' }
        ]);
        // Line 28
        src = '			';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '' }
        ]);
        // Line 29
        src = '			if (s.field) {';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '' },
            { startIndex: 3, type: 'keyword.if.cpp' },
            { startIndex: 5, type: '' },
            { startIndex: 6, type: 'delimiter.parenthesis.cpp' },
            { startIndex: 7, type: 'identifier.cpp' },
            { startIndex: 8, type: 'delimiter.cpp' },
            { startIndex: 9, type: 'identifier.cpp' },
            { startIndex: 14, type: 'delimiter.parenthesis.cpp' },
            { startIndex: 15, type: '' },
            { startIndex: 16, type: 'delimiter.curly.cpp' }
        ]);
        // Line 30
        src = '				for(const auto & b : s.field) {';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '' },
            { startIndex: 4, type: 'keyword.for.cpp' },
            { startIndex: 7, type: 'delimiter.parenthesis.cpp' },
            { startIndex: 8, type: 'keyword.const.cpp' },
            { startIndex: 13, type: '' },
            { startIndex: 14, type: 'keyword.auto.cpp' },
            { startIndex: 18, type: '' },
            { startIndex: 19, type: 'delimiter.cpp' },
            { startIndex: 20, type: '' },
            { startIndex: 21, type: 'identifier.cpp' },
            { startIndex: 22, type: '' },
            { startIndex: 23, type: 'delimiter.cpp' },
            { startIndex: 24, type: '' },
            { startIndex: 25, type: 'identifier.cpp' },
            { startIndex: 26, type: 'delimiter.cpp' },
            { startIndex: 27, type: 'identifier.cpp' },
            { startIndex: 32, type: 'delimiter.parenthesis.cpp' },
            { startIndex: 33, type: '' },
            { startIndex: 34, type: 'delimiter.curly.cpp' }
        ]);
        // Line 31
        src = '					break;';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '' },
            { startIndex: 5, type: 'keyword.break.cpp' },
            { startIndex: 10, type: 'delimiter.cpp' }
        ]);
        // Line 32
        src = '				}';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '' },
            { startIndex: 4, type: 'delimiter.curly.cpp' }
        ]);
        // Line 33
        src = '			}';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '' },
            { startIndex: 3, type: 'delimiter.curly.cpp' }
        ]);
        // Line 34
        src = '		}';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '' },
            { startIndex: 2, type: 'delimiter.curly.cpp' }
        ]);
        // Line 35
        src = '		';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '' }
        ]);
        // Line 36
        src = '		std::string s = "hello wordld\\n";';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '' },
            { startIndex: 2, type: 'identifier.cpp' },
            { startIndex: 5, type: '' },
            { startIndex: 7, type: 'identifier.cpp' },
            { startIndex: 13, type: '' },
            { startIndex: 14, type: 'identifier.cpp' },
            { startIndex: 15, type: '' },
            { startIndex: 16, type: 'delimiter.cpp' },
            { startIndex: 17, type: '' },
            { startIndex: 18, type: 'string.cpp' },
            { startIndex: 31, type: 'string.escape.cpp' },
            { startIndex: 33, type: 'string.cpp' },
            { startIndex: 34, type: 'delimiter.cpp' }
        ]);
        // Line 37
        src = '		';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '' }
        ]);
        // Line 38
        src = '		int number = 123\'123\'123Ull;';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '' },
            { startIndex: 2, type: 'keyword.int.cpp' },
            { startIndex: 5, type: '' },
            { startIndex: 6, type: 'identifier.cpp' },
            { startIndex: 12, type: '' },
            { startIndex: 13, type: 'delimiter.cpp' },
            { startIndex: 14, type: '' },
            { startIndex: 15, type: 'number.cpp' },
            { startIndex: 29, type: 'delimiter.cpp' }
        ]);
        // Line 39
        src = '	}';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '' },
            { startIndex: 1, type: 'delimiter.curly.cpp' }
        ]);
        // Line 40
        src = '}';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: 'delimiter.curly.cpp' }
        ]);
        // Line 41
        src = '';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
        ]);
        // Line 42
        src = '#endif';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: 'keyword.cpp' }
        ]);
    });
});
