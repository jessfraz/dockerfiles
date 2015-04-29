/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
/// <reference path="../../declares.d.ts" />
'use strict';
define(["require", "exports", '../objective-cDef', 'monaco-testing'], function (require, exports, objectivecDef, T) {
    var tokenize = T.createTokenize(objectivecDef.language);
    var assertTokens = T.assertTokens;
    T.module('Objective-C Colorizer');
    var assertTokens2 = function (message, expected) {
        var actual = tokenize(message).tokens;
        T.equal(actual.length, expected.length, message);
        for (var i = 0; i < expected.length; i++) {
            for (var key in expected[i]) {
                T.deepEqual(actual[i][key], expected[i][key], message);
            }
        }
    };
    var assertTokens3 = function (message, type) {
        message = message + ' ';
        var actual = tokenize(message).tokens;
        T.equal(actual.length, 2, message);
        T.deepEqual(actual[0]['startIndex'], 0, message);
        T.deepEqual(actual[0]['type'], type, message);
        T.deepEqual(actual[1]['startIndex'], message.length - 1, message);
        T.deepEqual(actual[1]['type'], 'white.objective-c', message);
    };
    T.test('Keywords', function () {
        //                                   1         2         3         4         5         6         7         8         9       
        //                         01234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789
        var tokens = tokenize('-(id) initWithParams:(id<anObject>) aHandler withDeviceStateManager:(id<anotherObject>) deviceStateManager').tokens;
        //                              00             00 00       1111       11                     111112            2222                 2
        //		                   01 2345             67 89       0123       45                     678 90            1234                 5
        assertTokens(tokens, [
            { startIndex: 0, type: '' },
            { startIndex: 1, type: 'delimiter.parenthesis.objective-c' },
            { startIndex: 2, type: 'keyword.objective-c' },
            { startIndex: 4, type: 'delimiter.parenthesis.objective-c' },
            { startIndex: 5, type: 'white.objective-c' },
            { startIndex: 6, type: 'identifier.objective-c' },
            { startIndex: 20, type: 'delimiter.objective-c' },
            { startIndex: 21, type: 'delimiter.parenthesis.objective-c' },
            { startIndex: 22, type: 'keyword.objective-c' },
            { startIndex: 24, type: 'delimiter.angle.objective-c' },
            { startIndex: 25, type: 'identifier.objective-c' },
            { startIndex: 33, type: 'delimiter.angle.objective-c' },
            { startIndex: 34, type: 'delimiter.parenthesis.objective-c' },
            { startIndex: 35, type: 'white.objective-c' },
            { startIndex: 36, type: 'identifier.objective-c' },
            { startIndex: 44, type: 'white.objective-c' },
            { startIndex: 45, type: 'identifier.objective-c' },
            { startIndex: 67, type: 'delimiter.objective-c' },
            { startIndex: 68, type: 'delimiter.parenthesis.objective-c' },
            { startIndex: 69, type: 'keyword.objective-c' },
            { startIndex: 71, type: 'delimiter.angle.objective-c' },
            { startIndex: 72, type: 'identifier.objective-c' },
            { startIndex: 85, type: 'delimiter.angle.objective-c' },
            { startIndex: 86, type: 'delimiter.parenthesis.objective-c' },
            { startIndex: 87, type: 'white.objective-c' },
            { startIndex: 88, type: 'identifier.objective-c' },
        ]);
    });
    T.test('Comments - single line', function () {
        var tokens = [];
        tokens = tokenize('//').tokens;
        assertTokens(tokens, [{ startIndex: 0, type: 'comment.objective-c' }]);
        tokens = tokenize('    // a comment').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'white.objective-c' },
            { startIndex: 4, type: 'comment.objective-c' }
        ]);
        tokens = tokenize('// a comment').tokens;
        assertTokens(tokens, [{ startIndex: 0, type: 'comment.objective-c' }]);
        tokens = tokenize('//sticky comment').tokens;
        assertTokens(tokens, [{ startIndex: 0, type: 'comment.objective-c' }]);
        //                 012345678901234567
        tokens = tokenize('/almost a comment').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'operator.objective-c' },
            { startIndex: 1, type: 'identifier.objective-c' },
            { startIndex: 7, type: 'white.objective-c' },
            { startIndex: 8, type: 'identifier.objective-c' },
            { startIndex: 9, type: 'white.objective-c' },
            { startIndex: 10, type: 'identifier.objective-c' },
        ]);
        //             01234567890123456
        assertTokens2('1 / 2; /* comment', [
            { startIndex: 0, type: 'number.objective-c' },
            { startIndex: 1, type: 'white.objective-c' },
            { startIndex: 2, type: 'operator.objective-c' },
            { startIndex: 3, type: 'white.objective-c' },
            { startIndex: 4, type: 'number.objective-c' },
            { startIndex: 5, type: 'delimiter.objective-c' },
            { startIndex: 6, type: 'white.objective-c' },
            { startIndex: 7, type: 'comment.objective-c' },
        ]);
        //                 012345678901234560123456789012345601234567890123456
        tokens = tokenize('int x = 1; // my comment // is a nice one').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'keyword.objective-c' },
            { startIndex: 3, type: 'white.objective-c' },
            { startIndex: 4, type: 'identifier.objective-c' },
            { startIndex: 5, type: 'white.objective-c' },
            { startIndex: 6, type: 'operator.objective-c' },
            { startIndex: 7, type: 'white.objective-c' },
            { startIndex: 8, type: 'number.objective-c' },
            { startIndex: 9, type: 'delimiter.objective-c' },
            { startIndex: 10, type: 'white.objective-c' },
            { startIndex: 11, type: 'comment.objective-c' },
        ]);
    });
    T.test('Comments - range comment, single line', function () {
        var tokens = tokenize('/* a simple comment */').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'comment.objective-c' }
        ]);
        //                 012345678901234567890123456789012
        tokens = tokenize('int x = /* embedded comment */ 1;').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'keyword.objective-c' },
            { startIndex: 3, type: 'white.objective-c' },
            { startIndex: 4, type: 'identifier.objective-c' },
            { startIndex: 5, type: 'white.objective-c' },
            { startIndex: 6, type: 'operator.objective-c' },
            { startIndex: 7, type: 'white.objective-c' },
            { startIndex: 8, type: 'comment.objective-c' },
            { startIndex: 30, type: 'white.objective-c' },
            { startIndex: 31, type: 'number.objective-c' },
            { startIndex: 32, type: 'delimiter.objective-c' }
        ]);
        //                 012345678901234567890123456789012345678901234
        tokens = tokenize('int x = /* comment and syntax error*/ 1; */').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'keyword.objective-c' },
            { startIndex: 3, type: 'white.objective-c' },
            { startIndex: 4, type: 'identifier.objective-c' },
            { startIndex: 5, type: 'white.objective-c' },
            { startIndex: 6, type: 'operator.objective-c' },
            { startIndex: 7, type: 'white.objective-c' },
            { startIndex: 8, type: 'comment.objective-c' },
            { startIndex: 37, type: 'white.objective-c' },
            { startIndex: 38, type: 'number.objective-c' },
            { startIndex: 39, type: 'delimiter.objective-c' },
            { startIndex: 40, type: 'white.objective-c' },
            { startIndex: 41, type: 'operator.objective-c' },
        ]);
        //                 012345678	
        tokens = tokenize('x = /**/;').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'identifier.objective-c' },
            { startIndex: 1, type: 'white.objective-c' },
            { startIndex: 2, type: 'operator.objective-c' },
            { startIndex: 3, type: 'white.objective-c' },
            { startIndex: 4, type: 'comment.objective-c' },
            { startIndex: 8, type: 'delimiter.objective-c' },
        ]);
        tokens = tokenize('x = /*/;').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'identifier.objective-c' },
            { startIndex: 1, type: 'white.objective-c' },
            { startIndex: 2, type: 'operator.objective-c' },
            { startIndex: 3, type: 'white.objective-c' },
            { startIndex: 4, type: 'comment.objective-c' },
        ]);
    });
    T.test('Non-Alpha Keywords', function () {
        //                     012345678901234567890123456789012
        var tokens = tokenize('#import <GTLT.h>').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'keyword.objective-c' },
            { startIndex: 7, type: 'white.objective-c' },
            { startIndex: 8, type: 'delimiter.angle.objective-c' },
            { startIndex: 9, type: 'identifier.objective-c' },
            { startIndex: 13, type: '' },
            { startIndex: 14, type: 'identifier.objective-c' },
            { startIndex: 15, type: 'delimiter.angle.objective-c' },
        ]);
    });
    T.test('Numbers', function () {
        assertTokens3('0', 'number.objective-c');
        assertTokens3('0x', 'number.hex.objective-c');
        assertTokens3('0x123', 'number.hex.objective-c');
        assertTokens3('23.5', 'number.float.objective-c');
        assertTokens3('23.5e3', 'number.float.objective-c');
        assertTokens3('23.5E3', 'number.float.objective-c');
        assertTokens3('23.5F', 'number.float.objective-c');
        assertTokens3('23.5f', 'number.float.objective-c');
        assertTokens3('1.72E3F', 'number.float.objective-c');
        assertTokens3('1.72E3f', 'number.float.objective-c');
        assertTokens3('1.72e3F', 'number.float.objective-c');
        assertTokens3('1.72e3f', 'number.float.objective-c');
        // objective-c did not support suffixing 'd'
        /*assertTokens3('23.5D', 'number.objective-c');
        assertTokens3('23.5d', 'number.objective-c');
        assertTokens3('1.72E3D', 'number.objective-c');
        assertTokens3('1.72E3d', 'number.objective-c');
        assertTokens3('1.72e3D', 'number.objective-c');
        assertTokens3('1.72e3d', 'number.objective-c');*/
        assertTokens2('0+0', [
            { startIndex: 0, type: 'number.objective-c' },
            { startIndex: 1, type: 'operator.objective-c' },
            { startIndex: 2, type: 'number.objective-c' }
        ]);
        assertTokens2('100+10', [
            { startIndex: 0, type: 'number.objective-c' },
            { startIndex: 3, type: 'operator.objective-c' },
            { startIndex: 4, type: 'number.objective-c' }
        ]);
        assertTokens2('0 + 0', [
            { startIndex: 0, type: 'number.objective-c' },
            { startIndex: 1, type: 'white.objective-c' },
            { startIndex: 2, type: 'operator.objective-c' },
            { startIndex: 3, type: 'white.objective-c' },
            { startIndex: 4, type: 'number.objective-c' }
        ]);
    });
    T.test('Word definition', function () {
        var wordDefinition = T.getWordDefinition(objectivecDef.language);
        T.assertWords('a b cde'.match(wordDefinition), ['a', 'b', 'cde']);
        T.assertWords('(void) handleTap:(UIGestureRecognizer*)gestureRecognize {'.match(wordDefinition), ['void', 'handleTap', 'UIGestureRecognizer', 'gestureRecognize']);
        T.assertWords('UITapGestureRecognizer *tapGesture = [[UITapGestureRecognizer alloc] initWithTarget:self action:@selector(handleTap:)];'.match(wordDefinition), ['UITapGestureRecognizer', 'tapGesture', 'UITapGestureRecognizer', 'alloc', 'initWithTarget', 'self', 'action', 'selector', 'handleTap']);
    });
});
