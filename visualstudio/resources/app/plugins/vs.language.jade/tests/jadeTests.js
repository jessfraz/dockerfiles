/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
/// <reference path="../../declares.d.ts" />
'use strict';
define(["require", "exports", '../jadeDef', 'monaco-testing'], function (require, exports, languageDef, T) {
    var tokenizationSupport = T.createTokenizationSupport(languageDef.language);
    var tokenize = T.createTokenizeFromSupport(tokenizationSupport);
    var assertTokens = T.assertTokens;
    T.module('Syntax Highlighting [Jade]');
    T.test('Tags [Jade]', function () {
        var tokens = tokenize('p 5').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'tag.jade' },
            { startIndex: 1, type: '' },
        ]);
        tokens = tokenize('div#container.stuff').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'tag.jade' },
            { startIndex: 3, type: 'tag.id.jade' },
            { startIndex: 13, type: 'tag.class.jade' }
        ]);
        tokens = tokenize('div.container#stuff').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'tag.jade' },
            { startIndex: 3, type: 'tag.class.jade' },
            { startIndex: 13, type: 'tag.id.jade' }
        ]);
        tokens = tokenize('div.container#stuff .container').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'tag.jade' },
            { startIndex: 3, type: 'tag.class.jade' },
            { startIndex: 13, type: 'tag.id.jade' },
            { startIndex: 19, type: '' }
        ]);
        tokens = tokenize('#tag-id-1').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'tag.id.jade' }
        ]);
        tokens = tokenize('.tag-id-1').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'tag.class.jade' }
        ]);
    });
    T.test('Attributes - Single Line [Jade]', function () {
        var tokens = tokenize('input(type="checkbox")').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'tag.jade' },
            { startIndex: 5, type: 'delimiter.parenthesis.jade', bracket: 1 },
            { startIndex: 6, type: 'attribute.name.jade' },
            { startIndex: 10, type: 'delimiter.jade' },
            { startIndex: 11, type: 'attribute.value.jade' },
            { startIndex: 21, type: 'delimiter.parenthesis.jade', bracket: -1 }
        ]);
        tokens = tokenize('input (type="checkbox")').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'tag.jade' },
            { startIndex: 5, type: '' },
        ]);
        tokens = tokenize('input(type="checkbox",name="agreement",checked)').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'tag.jade' },
            { startIndex: 5, type: 'delimiter.parenthesis.jade', bracket: 1 },
            { startIndex: 6, type: 'attribute.name.jade' },
            { startIndex: 10, type: 'delimiter.jade' },
            { startIndex: 11, type: 'attribute.value.jade' },
            { startIndex: 21, type: 'attribute.delimiter.jade' },
            { startIndex: 22, type: 'attribute.name.jade' },
            { startIndex: 26, type: 'delimiter.jade' },
            { startIndex: 27, type: 'attribute.value.jade' },
            { startIndex: 38, type: 'attribute.delimiter.jade' },
            { startIndex: 39, type: 'attribute.name.jade' },
            { startIndex: 46, type: 'delimiter.parenthesis.jade', bracket: -1 }
        ]);
    });
    T.test('Attributes - MultiLine [Jade]', function () {
        var lineTokens = tokenize('input(type="checkbox"');
        assertTokens(lineTokens.tokens, [
            { startIndex: 0, type: 'tag.jade' },
            { startIndex: 5, type: 'delimiter.parenthesis.jade', bracket: 1 },
            { startIndex: 6, type: 'attribute.name.jade' },
            { startIndex: 10, type: 'delimiter.jade' },
            { startIndex: 11, type: 'attribute.value.jade' }
        ]);
        lineTokens = tokenize('name="agreement"', lineTokens.endState);
        assertTokens(lineTokens.tokens, [
            { startIndex: 0, type: 'attribute.name.jade' },
            { startIndex: 4, type: 'delimiter.jade' },
            { startIndex: 5, type: 'attribute.value.jade' }
        ]);
        lineTokens = tokenize('checked)', lineTokens.endState);
        assertTokens(lineTokens.tokens, [
            { startIndex: 0, type: 'attribute.name.jade' },
            { startIndex: 7, type: 'delimiter.parenthesis.jade' }
        ]);
        lineTokens = tokenize('body', lineTokens.endState);
        assertTokens(lineTokens.tokens, [{ startIndex: 0, type: 'tag.jade' }]);
        lineTokens = tokenize('input(type="checkbox"');
        assertTokens(lineTokens.tokens, [
            { startIndex: 0, type: 'tag.jade' },
            { startIndex: 5, type: 'delimiter.parenthesis.jade', bracket: 1 },
            { startIndex: 6, type: 'attribute.name.jade' },
            { startIndex: 10, type: 'delimiter.jade' },
            { startIndex: 11, type: 'attribute.value.jade' }
        ]);
        lineTokens = tokenize('disabled', lineTokens.endState);
        assertTokens(lineTokens.tokens, [{ startIndex: 0, type: 'attribute.name.jade' }]);
        lineTokens = tokenize('checked)', lineTokens.endState);
        assertTokens(lineTokens.tokens, [
            { startIndex: 0, type: 'attribute.name.jade' },
            { startIndex: 7, type: 'delimiter.parenthesis.jade' }
        ]);
        lineTokens = tokenize('body', lineTokens.endState);
        assertTokens(lineTokens.tokens, [{ startIndex: 0, type: 'tag.jade' }]);
    });
    T.test('Interpolation [Jade]', function () {
        var tokens = tokenize('p print #{count} lines').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'tag.jade' },
            { startIndex: 1, type: '' },
            { startIndex: 8, type: 'interpolation.delimiter.jade' },
            { startIndex: 10, type: 'interpolation.jade' },
            { startIndex: 15, type: 'interpolation.delimiter.jade' },
            { startIndex: 16, type: '' }
        ]);
        tokens = tokenize('p print "#{count}" lines').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'tag.jade' },
            { startIndex: 1, type: '' },
            { startIndex: 9, type: 'interpolation.delimiter.jade' },
            { startIndex: 11, type: 'interpolation.jade' },
            { startIndex: 16, type: 'interpolation.delimiter.jade' },
            { startIndex: 17, type: '' }
        ]);
    });
    T.test('Bracket Matching [Jade]', function () {
        var tokens = tokenize('{ key: 123 }').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'delimiter.curly.jade', bracket: 1 },
            { startIndex: 1, type: '' },
            { startIndex: 5, type: 'delimiter.jade' },
            { startIndex: 6, type: '' },
            { startIndex: 7, type: 'number.jade' },
            { startIndex: 10, type: '' },
            { startIndex: 11, type: 'delimiter.curly.jade', bracket: -1 }
        ]);
    });
    T.test('Comments - Single Line [Jade]', function () {
        var tokens = tokenize('// html#id1.class1').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'comment.jade' }
        ]);
        tokens = tokenize('body hello // not a comment 123').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'tag.jade' },
            { startIndex: 4, type: '' }
        ]);
    });
    T.test('Comments - MultiLine [Jade]', function () {
        var lineTokens = tokenize('//');
        assertTokens(lineTokens.tokens, [{ startIndex: 0, type: 'comment.jade' }]);
        lineTokens = tokenize('    should be a comment', lineTokens.endState);
        assertTokens(lineTokens.tokens, [
            { startIndex: 0, type: 'comment.jade' }
        ]);
        lineTokens = tokenize('    should still be a comment', lineTokens.endState);
        assertTokens(lineTokens.tokens, [
            { startIndex: 0, type: 'comment.jade' }
        ]);
        lineTokens = tokenize('div should not be a comment', lineTokens.endState);
        assertTokens(lineTokens.tokens, [
            { startIndex: 0, type: 'tag.jade' },
            { startIndex: 3, type: '' }
        ]);
    });
    T.test('Code [Jade]', function () {
        var tokens = tokenize('- var a = 1').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: '' },
            { startIndex: 2, type: 'keyword.var.jade' },
            { startIndex: 5, type: '' },
            { startIndex: 8, type: 'delimiter.jade' },
            { startIndex: 9, type: '' },
            { startIndex: 10, type: 'number.jade' }
        ]);
        tokens = tokenize('each item in items').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'keyword.each.jade' },
            { startIndex: 4, type: '' },
            { startIndex: 10, type: 'keyword.in.jade' },
            { startIndex: 12, type: '' }
        ]);
        tokens = tokenize('- var html = "<script></script>"').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: '' },
            { startIndex: 2, type: 'keyword.var.jade' },
            { startIndex: 5, type: '' },
            { startIndex: 11, type: 'delimiter.jade' },
            { startIndex: 12, type: '' },
            { startIndex: 13, type: 'string.jade' }
        ]);
    });
    T.test('Generated from sample', function () {
        var previousState = tokenizationSupport.getInitialState();
        // Line 1
        var src = 'doctype 5';
        var tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: 'keyword.doctype.jade', bracket: 0 },
            { startIndex: 7, type: '', bracket: 0 },
            { startIndex: 8, type: 'number.jade', bracket: 0 }
        ]);
        // Line 2
        src = 'html(lang="en")';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: 'tag.jade', bracket: 0 },
            { startIndex: 4, type: 'delimiter.parenthesis.jade', bracket: 1 },
            { startIndex: 5, type: 'attribute.name.jade', bracket: 0 },
            { startIndex: 9, type: 'delimiter.jade', bracket: 0 },
            { startIndex: 10, type: 'attribute.value.jade', bracket: 0 },
            { startIndex: 14, type: 'delimiter.parenthesis.jade', bracket: -1 }
        ]);
        // Line 3
        src = '    head';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 4, type: 'tag.jade', bracket: 0 }
        ]);
        // Line 4
        src = '        title= pageTitle';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 8, type: 'tag.jade', bracket: 0 },
            { startIndex: 13, type: '', bracket: 0 }
        ]);
        // Line 5
        src = '        script(type=\'text/javascript\')';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 8, type: 'tag.jade', bracket: 0 },
            { startIndex: 14, type: 'delimiter.parenthesis.jade', bracket: 1 },
            { startIndex: 15, type: 'attribute.name.jade', bracket: 0 },
            { startIndex: 19, type: 'delimiter.jade', bracket: 0 },
            { startIndex: 20, type: 'attribute.value.jade', bracket: 0 },
            { startIndex: 37, type: 'delimiter.parenthesis.jade', bracket: -1 }
        ]);
        // Line 6
        src = '            if (foo) {';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 12, type: 'keyword.if.jade', bracket: 0 },
            { startIndex: 14, type: '', bracket: 0 },
            { startIndex: 15, type: 'delimiter.parenthesis.jade', bracket: 1 },
            { startIndex: 16, type: '', bracket: 0 },
            { startIndex: 19, type: 'delimiter.parenthesis.jade', bracket: -1 },
            { startIndex: 20, type: '', bracket: 0 },
            { startIndex: 21, type: 'delimiter.curly.jade', bracket: 1 }
        ]);
        // Line 7
        src = '                bar()';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 19, type: 'delimiter.parenthesis.jade', bracket: 1 },
            { startIndex: 20, type: 'delimiter.parenthesis.jade', bracket: -1 }
        ]);
        // Line 8
        src = '            }';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 12, type: 'delimiter.curly.jade', bracket: -1 }
        ]);
        // Line 9
        src = '    body';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 4, type: 'tag.jade', bracket: 0 }
        ]);
        // Line 10
        src = '        // Disclaimer: You will need to turn insertSpaces to true in order for the';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: 'comment.jade', bracket: 0 }
        ]);
        // Line 11
        src = '         syntax highlighting to kick in properly (especially for comments)';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: 'comment.jade', bracket: 0 }
        ]);
        // Line 12
        src = '            Enjoy :)';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: 'comment.jade', bracket: 0 }
        ]);
        // Line 13
        src = '        h1 Jade - node template engine if in';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 8, type: 'tag.jade', bracket: 0 },
            { startIndex: 10, type: '', bracket: 0 }
        ]);
        // Line 14
        src = '        p.';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 8, type: 'tag.jade', bracket: 0 },
            { startIndex: 9, type: 'delimiter.jade', bracket: 0 }
        ]);
        // Line 15
        src = '          text ';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 }
        ]);
        // Line 16
        src = '            text';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 }
        ]);
        // Line 17
        src = '          #container';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 }
        ]);
        // Line 18
        src = '         #container';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 }
        ]);
        // Line 19
        src = '        #container';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 8, type: 'tag.id.jade', bracket: 0 }
        ]);
        // Line 20
        src = '          if youAreUsingJade';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 10, type: 'keyword.if.jade', bracket: 0 },
            { startIndex: 12, type: '', bracket: 0 }
        ]);
        // Line 21
        src = '            p You are amazing';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 12, type: 'tag.jade', bracket: 0 },
            { startIndex: 13, type: '', bracket: 0 }
        ]);
        // Line 22
        src = '          else';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 10, type: 'keyword.else.jade', bracket: 0 }
        ]);
        // Line 23
        src = '            p Get on it!';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 12, type: 'tag.jade', bracket: 0 },
            { startIndex: 13, type: '', bracket: 0 }
        ]);
        // Line 24
        src = '     p Text can be included in a number of different ways.';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 5, type: 'tag.jade', bracket: 0 },
            { startIndex: 6, type: '', bracket: 0 }
        ]);
    });
});
