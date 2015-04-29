/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
/// <reference path="../../declares.d.ts" />
'use strict';
define(["require", "exports", '../xmlDef', 'monaco-testing'], function (require, exports, languageDef, T) {
    var tokenizationSupport = T.createTokenizationSupport(languageDef.language);
    var tokenize = T.createTokenizeFromSupport(tokenizationSupport);
    var assertTokens = T.assertTokens;
    T.module('Colorizing - XML');
    T.test('Start Tag', function () {
        var lineTokens = tokenize('<person>');
        assertTokens(lineTokens.tokens, [
            { startIndex: 0, type: 'delimiter.start.xml', bracket: 1 },
            { startIndex: 1, type: 'tag.tag-person.xml', bracket: 1 },
            { startIndex: 7, type: 'delimiter.start.xml', bracket: -1 }
        ]);
        var lineTokens = tokenize('<person/>');
        assertTokens(lineTokens.tokens, [
            { startIndex: 0, type: 'delimiter.start.xml', bracket: 1 },
            { startIndex: 1, type: 'tag.tag-person.xml', bracket: 1 },
            { startIndex: 7, type: 'tag.tag-person.xml', bracket: -1 },
            { startIndex: 8, type: 'delimiter.start.xml', bracket: -1 }
        ]);
    });
    T.test('Complete Start Tag with Whitespace', function () {
        var lineTokens = tokenize('<person >');
        assertTokens(lineTokens.tokens, [
            { startIndex: 0, type: 'delimiter.start.xml', bracket: 1 },
            { startIndex: 1, type: 'tag.tag-person.xml', bracket: 1 },
            { startIndex: 7, type: '' },
            { startIndex: 8, type: 'delimiter.start.xml', bracket: -1 }
        ]);
        var lineTokens = tokenize('<person />');
        assertTokens(lineTokens.tokens, [
            { startIndex: 0, type: 'delimiter.start.xml', bracket: 1 },
            { startIndex: 1, type: 'tag.tag-person.xml', bracket: 1 },
            { startIndex: 7, type: '' },
            { startIndex: 8, type: 'tag.tag-person.xml', bracket: -1 },
            { startIndex: 9, type: 'delimiter.start.xml', bracket: -1 }
        ]);
    });
    T.test('Incomplete Start Tag', function () {
        var lineTokens = tokenize('<');
        assertTokens(lineTokens.tokens, [
            { startIndex: 0, type: '' }
        ]);
        var lineTokens = tokenize('<person');
        assertTokens(lineTokens.tokens, [
            { startIndex: 0, type: 'delimiter.start.xml', bracket: 1 },
            { startIndex: 1, type: 'tag.tag-person.xml', bracket: 1 }
        ]);
        lineTokens = tokenize('<input');
        assertTokens(lineTokens.tokens, [
            { startIndex: 0, type: 'delimiter.start.xml', bracket: 1 },
            { startIndex: 1, type: 'tag.tag-input.xml', bracket: 1 }
        ]);
    });
    T.test('Invalid Open Start Tag', function () {
        var lineTokens = tokenize('< person');
        assertTokens(lineTokens.tokens, [
            { startIndex: 0, type: '' }
        ]);
        lineTokens = tokenize('< person>');
        assertTokens(lineTokens.tokens, [
            { startIndex: 0, type: '' }
        ]);
        lineTokens = tokenize('i <person;');
        assertTokens(lineTokens.tokens, [
            { startIndex: 0, type: '' },
            { startIndex: 2, type: 'delimiter.start.xml', bracket: 1 },
            { startIndex: 3, type: 'tag.tag-person.xml' },
            { startIndex: 9, type: '' }
        ]);
    });
    T.test('Tag with Attribute', function () {
        var lineTokens = tokenize('<tool name="">');
        assertTokens(lineTokens.tokens, [
            { startIndex: 0, type: 'delimiter.start.xml', bracket: 1 },
            { startIndex: 1, type: 'tag.tag-tool.xml', bracket: 1 },
            { startIndex: 5, type: '' },
            { startIndex: 6, type: 'attribute.name.xml' },
            { startIndex: 10, type: '' },
            { startIndex: 11, type: 'attribute.value.xml' },
            { startIndex: 13, type: 'delimiter.start.xml', bracket: -1 }
        ]);
        var lineTokens = tokenize('<tool name=\"Monaco\">');
        assertTokens(lineTokens.tokens, [
            { startIndex: 0, type: 'delimiter.start.xml', bracket: 1 },
            { startIndex: 1, type: 'tag.tag-tool.xml', bracket: 1 },
            { startIndex: 5, type: '' },
            { startIndex: 6, type: 'attribute.name.xml' },
            { startIndex: 10, type: '' },
            { startIndex: 11, type: 'attribute.value.xml' },
            { startIndex: 19, type: 'delimiter.start.xml', bracket: -1 }
        ]);
        var lineTokens = tokenize('<tool name=\'Monaco\'>');
        assertTokens(lineTokens.tokens, [
            { startIndex: 0, type: 'delimiter.start.xml', bracket: 1 },
            { startIndex: 1, type: 'tag.tag-tool.xml', bracket: 1 },
            { startIndex: 5, type: '' },
            { startIndex: 6, type: 'attribute.name.xml' },
            { startIndex: 10, type: '' },
            { startIndex: 11, type: 'attribute.value.xml' },
            { startIndex: 19, type: 'delimiter.start.xml', bracket: -1 }
        ]);
    });
    T.test('Tag with Attributes', function () {
        var lineTokens = tokenize('<tool name=\"Monaco\" version=\"1.0\">');
        assertTokens(lineTokens.tokens, [
            { startIndex: 0, type: 'delimiter.start.xml', bracket: 1 },
            { startIndex: 1, type: 'tag.tag-tool.xml', bracket: 1 },
            { startIndex: 5, type: '' },
            { startIndex: 6, type: 'attribute.name.xml' },
            { startIndex: 10, type: '' },
            { startIndex: 11, type: 'attribute.value.xml' },
            { startIndex: 19, type: '' },
            { startIndex: 20, type: 'attribute.name.xml' },
            { startIndex: 27, type: '' },
            { startIndex: 28, type: 'attribute.value.xml' },
            { startIndex: 33, type: 'delimiter.start.xml', bracket: -1 }
        ]);
    });
    T.test('Tag with Name-Only-Attribute', function () {
        var lineTokens = tokenize('<tool name>');
        assertTokens(lineTokens.tokens, [
            { startIndex: 0, type: 'delimiter.start.xml', bracket: 1 },
            { startIndex: 1, type: 'tag.tag-tool.xml', bracket: 1 },
            { startIndex: 5, type: '' },
            { startIndex: 6, type: 'attribute.name.xml' },
            { startIndex: 10, type: 'delimiter.start.xml', bracket: -1 }
        ]);
        var lineTokens = tokenize('<tool name version>');
        assertTokens(lineTokens.tokens, [
            { startIndex: 0, type: 'delimiter.start.xml', bracket: 1 },
            { startIndex: 1, type: 'tag.tag-tool.xml', bracket: 1 },
            { startIndex: 5, type: '' },
            { startIndex: 6, type: 'attribute.name.xml' },
            { startIndex: 10, type: '' },
            { startIndex: 11, type: 'attribute.name.xml' },
            { startIndex: 18, type: 'delimiter.start.xml', bracket: -1 }
        ]);
    });
    T.test('Tag with Attribute And Whitespace', function () {
        var lineTokens = tokenize('<tool name=  \"monaco\">');
        assertTokens(lineTokens.tokens, [
            { startIndex: 0, type: 'delimiter.start.xml', bracket: 1 },
            { startIndex: 1, type: 'tag.tag-tool.xml', bracket: 1 },
            { startIndex: 5, type: '' },
            { startIndex: 6, type: 'attribute.name.xml' },
            { startIndex: 10, type: '' },
            { startIndex: 13, type: 'attribute.value.xml' },
            { startIndex: 21, type: 'delimiter.start.xml', bracket: -1 }
        ]);
        lineTokens = tokenize('<tool name = \"monaco\">');
        assertTokens(lineTokens.tokens, [
            { startIndex: 0, type: 'delimiter.start.xml', bracket: 1 },
            { startIndex: 1, type: 'tag.tag-tool.xml', bracket: 1 },
            { startIndex: 5, type: '' },
            { startIndex: 6, type: 'attribute.name.xml' },
            { startIndex: 10, type: '' },
            { startIndex: 13, type: 'attribute.value.xml' },
            { startIndex: 21, type: 'delimiter.start.xml', bracket: -1 }
        ]);
    });
    T.test('Tag with Invalid Attribute Name', function () {
        var lineTokens = tokenize('<tool name!@#=\"bar\">');
        assertTokens(lineTokens.tokens, [
            { startIndex: 0, type: 'delimiter.start.xml', bracket: 1 },
            { startIndex: 1, type: 'tag.tag-tool.xml', bracket: 1 },
            { startIndex: 5, type: '' },
            { startIndex: 6, type: 'attribute.name.xml' },
            { startIndex: 10, type: '' },
            { startIndex: 15, type: 'attribute.name.xml' },
            { startIndex: 18, type: '' },
            { startIndex: 19, type: 'delimiter.start.xml', bracket: -1 }
        ]);
    });
    T.test('Tag with Invalid Attribute Value', function () {
        var lineTokens = tokenize('<tool name=\">');
        assertTokens(lineTokens.tokens, [
            { startIndex: 0, type: 'delimiter.start.xml', bracket: 1 },
            { startIndex: 1, type: 'tag.tag-tool.xml', bracket: 1 },
            { startIndex: 5, type: '' },
            { startIndex: 6, type: 'attribute.name.xml' },
            { startIndex: 10, type: '' },
            { startIndex: 11, type: 'attribute.value.xml' },
            { startIndex: 12, type: 'delimiter.start.xml', bracket: -1 }
        ]);
    });
    T.test('Complete End Tag', function () {
        var lineTokens = tokenize('</person>');
        assertTokens(lineTokens.tokens, [
            { startIndex: 0, type: 'delimiter.end.xml', bracket: 1 },
            { startIndex: 2, type: 'tag.tag-person.xml', bracket: -1 },
            { startIndex: 8, type: 'delimiter.end.xml', bracket: -1 }
        ]);
    });
    T.test('Complete End Tag with Whitespace', function () {
        var lineTokens = tokenize('</person  >');
        assertTokens(lineTokens.tokens, [
            { startIndex: 0, type: 'delimiter.end.xml', bracket: 1 },
            { startIndex: 2, type: 'tag.tag-person.xml', bracket: -1 },
            { startIndex: 8, type: '' },
            { startIndex: 10, type: 'delimiter.end.xml', bracket: -1 }
        ]);
    });
    T.test('Incomplete End Tag', function () {
        var lineTokens = tokenize('</person');
        assertTokens(lineTokens.tokens, [
            { startIndex: 0, type: '' }
        ]);
    });
    T.test('Comments', function () {
        var lineTokens = tokenize('<!-- -->');
        assertTokens(lineTokens.tokens, [
            { startIndex: 0, type: 'comment.xml', bracket: 1 },
            { startIndex: 4, type: 'comment.content.xml' },
            { startIndex: 5, type: 'comment.xml', bracket: -1 }
        ]);
        var lineTokens = tokenize('<!--a>monaco</a -->');
        assertTokens(lineTokens.tokens, [
            { startIndex: 0, type: 'comment.xml', bracket: 1 },
            { startIndex: 4, type: 'comment.content.xml' },
            { startIndex: 16, type: 'comment.xml', bracket: -1 }
        ]);
        var lineTokens = tokenize('<!--a>\nmonaco \ntools</a -->');
        assertTokens(lineTokens.tokens, [
            { startIndex: 0, type: 'comment.xml', bracket: 1 },
            { startIndex: 4, type: 'comment.content.xml' },
            { startIndex: 24, type: 'comment.xml', bracket: -1 }
        ]);
    });
    T.test('CDATA', function () {
        var lineTokens = tokenize('<tools><![CDATA[<person/>]]></tools>');
        assertTokens(lineTokens.tokens, [
            { startIndex: 0, type: 'delimiter.start.xml', bracket: 1 },
            { startIndex: 1, type: 'tag.tag-tools.xml' },
            { startIndex: 6, type: 'delimiter.start.xml', bracket: -1 },
            { startIndex: 7, type: 'delimiter.cdata.xml', bracket: 1 },
            { startIndex: 16, type: '' },
            { startIndex: 25, type: 'delimiter.cdata.xml', bracket: -1 },
            { startIndex: 28, type: 'delimiter.end.xml', bracket: 1 },
            { startIndex: 30, type: 'tag.tag-tools.xml', bracket: -1 },
            { startIndex: 35, type: 'delimiter.end.xml', bracket: -1 }
        ]);
        var lineTokens = tokenize('<tools>\n\t<![CDATA[\n\t\t<person/>\n\t]]>\n</tools>');
        assertTokens(lineTokens.tokens, [
            { startIndex: 0, type: 'delimiter.start.xml', bracket: 1 },
            { startIndex: 1, type: 'tag.tag-tools.xml' },
            { startIndex: 6, type: 'delimiter.start.xml', bracket: -1 },
            { startIndex: 7, type: '' },
            { startIndex: 9, type: 'delimiter.cdata.xml', bracket: 1 },
            { startIndex: 18, type: '' },
            { startIndex: 32, type: 'delimiter.cdata.xml', bracket: -1 },
            { startIndex: 35, type: '' },
            { startIndex: 36, type: 'delimiter.end.xml', bracket: 1 },
            { startIndex: 38, type: 'tag.tag-tools.xml', bracket: -1 },
            { startIndex: 43, type: 'delimiter.end.xml', bracket: -1 }
        ]);
    });
    T.test('Generated from sample', function () {
        var previousState = tokenizationSupport.getInitialState();
        // Line 1
        var src = '<?xml version="1.0"?>';
        var tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: 'delimiter.start.xml', bracket: 1 },
            { startIndex: 2, type: 'metatag.instruction.xml', bracket: 0 },
            { startIndex: 5, type: '', bracket: 0 },
            { startIndex: 6, type: 'attribute.name.xml', bracket: 0 },
            { startIndex: 13, type: '', bracket: 0 },
            { startIndex: 14, type: 'attribute.value.xml', bracket: 0 },
            { startIndex: 19, type: 'delimiter.start.xml', bracket: -1 }
        ]);
        // Line 2
        src = '<configuration xmlns:xdt="http://schemas.microsoft.com/XML-Document-Transform">';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: 'delimiter.start.xml', bracket: 1 },
            { startIndex: 1, type: 'tag.tag-configuration.xml', bracket: 1 },
            { startIndex: 14, type: '', bracket: 0 },
            { startIndex: 15, type: 'attribute.name.xml', bracket: 0 },
            { startIndex: 24, type: '', bracket: 0 },
            { startIndex: 25, type: 'attribute.value.xml', bracket: 0 },
            { startIndex: 78, type: 'delimiter.start.xml', bracket: -1 }
        ]);
        // Line 3
        src = '  <connectionStrings>';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 2, type: 'delimiter.start.xml', bracket: 1 },
            { startIndex: 3, type: 'tag.tag-connectionstrings.xml', bracket: 1 },
            { startIndex: 20, type: 'delimiter.start.xml', bracket: -1 }
        ]);
        // Line 4
        src = '    <add name="MyDB" ';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 4, type: 'delimiter.start.xml', bracket: 1 },
            { startIndex: 5, type: 'tag.tag-add.xml', bracket: 1 },
            { startIndex: 8, type: '', bracket: 0 },
            { startIndex: 9, type: 'attribute.name.xml', bracket: 0 },
            { startIndex: 13, type: '', bracket: 0 },
            { startIndex: 14, type: 'attribute.value.xml', bracket: 0 },
            { startIndex: 20, type: '', bracket: 0 }
        ]);
        // Line 5
        src = '      connectionString="value for the deployed Web.config file" ';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 6, type: 'attribute.name.xml', bracket: 0 },
            { startIndex: 22, type: '', bracket: 0 },
            { startIndex: 23, type: 'attribute.value.xml', bracket: 0 },
            { startIndex: 63, type: '', bracket: 0 }
        ]);
        // Line 6
        src = '      xdt:Transform="SetAttributes" xdt:Locator="Match(name)"/>';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 6, type: 'attribute.name.xml', bracket: 0 },
            { startIndex: 19, type: '', bracket: 0 },
            { startIndex: 20, type: 'attribute.value.xml', bracket: 0 },
            { startIndex: 35, type: '', bracket: 0 },
            { startIndex: 36, type: 'attribute.name.xml', bracket: 0 },
            { startIndex: 47, type: '', bracket: 0 },
            { startIndex: 48, type: 'attribute.value.xml', bracket: 0 },
            { startIndex: 61, type: 'tag.tag-add.xml', bracket: -1 },
            { startIndex: 62, type: 'delimiter.start.xml', bracket: -1 }
        ]);
        // Line 7
        src = '  </connectionStrings>';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 2, type: 'delimiter.end.xml', bracket: 1 },
            { startIndex: 4, type: 'tag.tag-connectionstrings.xml', bracket: -1 },
            { startIndex: 21, type: 'delimiter.end.xml', bracket: -1 }
        ]);
        // Line 8
        src = '  <system.web>';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 2, type: 'delimiter.start.xml', bracket: 1 },
            { startIndex: 3, type: 'tag.tag-system.web.xml', bracket: 1 },
            { startIndex: 13, type: 'delimiter.start.xml', bracket: -1 }
        ]);
        // Line 9
        src = '    <customErrors defaultRedirect="GenericError.htm"';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 4, type: 'delimiter.start.xml', bracket: 1 },
            { startIndex: 5, type: 'tag.tag-customerrors.xml', bracket: 1 },
            { startIndex: 17, type: '', bracket: 0 },
            { startIndex: 18, type: 'attribute.name.xml', bracket: 0 },
            { startIndex: 33, type: '', bracket: 0 },
            { startIndex: 34, type: 'attribute.value.xml', bracket: 0 }
        ]);
        // Line 10
        src = '      mode="RemoteOnly" xdt:Transform="Replace">';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 6, type: 'attribute.name.xml', bracket: 0 },
            { startIndex: 10, type: '', bracket: 0 },
            { startIndex: 11, type: 'attribute.value.xml', bracket: 0 },
            { startIndex: 23, type: '', bracket: 0 },
            { startIndex: 24, type: 'attribute.name.xml', bracket: 0 },
            { startIndex: 37, type: '', bracket: 0 },
            { startIndex: 38, type: 'attribute.value.xml', bracket: 0 },
            { startIndex: 47, type: 'delimiter.start.xml', bracket: -1 }
        ]);
        // Line 11
        src = '      <error statusCode="500" redirect="InternalError.htm"/>';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 6, type: 'delimiter.start.xml', bracket: 1 },
            { startIndex: 7, type: 'tag.tag-error.xml', bracket: 1 },
            { startIndex: 12, type: '', bracket: 0 },
            { startIndex: 13, type: 'attribute.name.xml', bracket: 0 },
            { startIndex: 23, type: '', bracket: 0 },
            { startIndex: 24, type: 'attribute.value.xml', bracket: 0 },
            { startIndex: 29, type: '', bracket: 0 },
            { startIndex: 30, type: 'attribute.name.xml', bracket: 0 },
            { startIndex: 38, type: '', bracket: 0 },
            { startIndex: 39, type: 'attribute.value.xml', bracket: 0 },
            { startIndex: 58, type: 'tag.tag-error.xml', bracket: -1 },
            { startIndex: 59, type: 'delimiter.start.xml', bracket: -1 }
        ]);
        // Line 12
        src = '    </customErrors>';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 4, type: 'delimiter.end.xml', bracket: 1 },
            { startIndex: 6, type: 'tag.tag-customerrors.xml', bracket: -1 },
            { startIndex: 18, type: 'delimiter.end.xml', bracket: -1 }
        ]);
        // Line 13
        src = '  </system.web>';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 2, type: 'delimiter.end.xml', bracket: 1 },
            { startIndex: 4, type: 'tag.tag-system.web.xml', bracket: -1 },
            { startIndex: 14, type: 'delimiter.end.xml', bracket: -1 }
        ]);
        // Line 14
        src = '	';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 }
        ]);
        // Line 15
        src = '	<!-- The stuff below was added for extra tokenizer testing -->';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 1, type: 'comment.xml', bracket: 1 },
            { startIndex: 5, type: 'comment.content.xml', bracket: 0 },
            { startIndex: 60, type: 'comment.xml', bracket: -1 }
        ]);
        // Line 16
        src = '	<!-- A multi-line comment <with> </with>';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 1, type: 'comment.xml', bracket: 1 },
            { startIndex: 5, type: 'comment.content.xml', bracket: 0 }
        ]);
        // Line 17
        src = '       <tags>';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: 'comment.content.xml', bracket: 0 }
        ]);
        // Line 18
        src = '				 -->';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: 'comment.content.xml', bracket: 0 },
            { startIndex: 5, type: 'comment.xml', bracket: -1 }
        ]);
        // Line 19
        src = '	<!DOCTYPE another meta tag>';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 1, type: 'delimiter.start.xml', bracket: 1 },
            { startIndex: 3, type: 'metatag.declaration.xml', bracket: 0 },
            { startIndex: 10, type: '', bracket: 0 },
            { startIndex: 11, type: 'attribute.name.xml', bracket: 0 },
            { startIndex: 18, type: '', bracket: 0 },
            { startIndex: 19, type: 'attribute.name.xml', bracket: 0 },
            { startIndex: 23, type: '', bracket: 0 },
            { startIndex: 24, type: 'attribute.name.xml', bracket: 0 },
            { startIndex: 27, type: 'delimiter.start.xml', bracket: -1 }
        ]);
        // Line 20
        src = '	<tools><![CDATA[Some text and tags <person/>]]></tools>';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 1, type: 'delimiter.start.xml', bracket: 1 },
            { startIndex: 2, type: 'tag.tag-tools.xml', bracket: 1 },
            { startIndex: 7, type: 'delimiter.start.xml', bracket: -1 },
            { startIndex: 8, type: 'delimiter.cdata.xml', bracket: 1 },
            { startIndex: 17, type: '', bracket: 0 },
            { startIndex: 45, type: 'delimiter.cdata.xml', bracket: -1 },
            { startIndex: 48, type: 'delimiter.end.xml', bracket: 1 },
            { startIndex: 50, type: 'tag.tag-tools.xml', bracket: -1 },
            { startIndex: 55, type: 'delimiter.end.xml', bracket: -1 }
        ]);
        // Line 21
        src = '	<aSelfClosingTag with="attribute" />';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 1, type: 'delimiter.start.xml', bracket: 1 },
            { startIndex: 2, type: 'tag.tag-aselfclosingtag.xml', bracket: 1 },
            { startIndex: 17, type: '', bracket: 0 },
            { startIndex: 18, type: 'attribute.name.xml', bracket: 0 },
            { startIndex: 22, type: '', bracket: 0 },
            { startIndex: 23, type: 'attribute.value.xml', bracket: 0 },
            { startIndex: 34, type: '', bracket: 0 },
            { startIndex: 35, type: 'tag.tag-aselfclosingtag.xml', bracket: -1 },
            { startIndex: 36, type: 'delimiter.start.xml', bracket: -1 }
        ]);
        // Line 22
        src = '	<aSelfClosingTag with="attribute"/>';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 1, type: 'delimiter.start.xml', bracket: 1 },
            { startIndex: 2, type: 'tag.tag-aselfclosingtag.xml', bracket: 1 },
            { startIndex: 17, type: '', bracket: 0 },
            { startIndex: 18, type: 'attribute.name.xml', bracket: 0 },
            { startIndex: 22, type: '', bracket: 0 },
            { startIndex: 23, type: 'attribute.value.xml', bracket: 0 },
            { startIndex: 34, type: 'tag.tag-aselfclosingtag.xml', bracket: -1 },
            { startIndex: 35, type: 'delimiter.start.xml', bracket: -1 }
        ]);
        // Line 23
        src = '	<namespace:aSelfClosingTag otherspace:with="attribute"/>';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 1, type: 'delimiter.start.xml', bracket: 1 },
            { startIndex: 2, type: 'tag.tag-namespace:aselfclosingtag.xml', bracket: 1 },
            { startIndex: 27, type: '', bracket: 0 },
            { startIndex: 28, type: 'attribute.name.xml', bracket: 0 },
            { startIndex: 43, type: '', bracket: 0 },
            { startIndex: 44, type: 'attribute.value.xml', bracket: 0 },
            { startIndex: 55, type: 'tag.tag-namespace:aselfclosingtag.xml', bracket: -1 },
            { startIndex: 56, type: 'delimiter.start.xml', bracket: -1 }
        ]);
        // Line 24
        src = '	<valid-name also_valid this.one=\'too is valid\'/>';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 1, type: 'delimiter.start.xml', bracket: 1 },
            { startIndex: 2, type: 'tag.tag-valid-name.xml', bracket: 1 },
            { startIndex: 12, type: '', bracket: 0 },
            { startIndex: 13, type: 'attribute.name.xml', bracket: 0 },
            { startIndex: 23, type: '', bracket: 0 },
            { startIndex: 24, type: 'attribute.name.xml', bracket: 0 },
            { startIndex: 32, type: '', bracket: 0 },
            { startIndex: 33, type: 'attribute.value.xml', bracket: 0 },
            { startIndex: 47, type: 'tag.tag-valid-name.xml', bracket: -1 },
            { startIndex: 48, type: 'delimiter.start.xml', bracket: -1 }
        ]);
        // Line 25
        src = '	<aSimpleSelfClosingTag />';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 1, type: 'delimiter.start.xml', bracket: 1 },
            { startIndex: 2, type: 'tag.tag-asimpleselfclosingtag.xml', bracket: 1 },
            { startIndex: 23, type: '', bracket: 0 },
            { startIndex: 24, type: 'tag.tag-asimpleselfclosingtag.xml', bracket: -1 },
            { startIndex: 25, type: 'delimiter.start.xml', bracket: -1 }
        ]);
        // Line 26
        src = '	<aSimpleSelfClosingTag/>';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 1, type: 'delimiter.start.xml', bracket: 1 },
            { startIndex: 2, type: 'tag.tag-asimpleselfclosingtag.xml', bracket: 1 },
            { startIndex: 23, type: 'tag.tag-asimpleselfclosingtag.xml', bracket: -1 },
            { startIndex: 24, type: 'delimiter.start.xml', bracket: -1 }
        ]);
        // Line 27
        src = '</configuration>';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: 'delimiter.end.xml', bracket: 1 },
            { startIndex: 2, type: 'tag.tag-configuration.xml', bracket: -1 },
            { startIndex: 15, type: 'delimiter.end.xml', bracket: -1 }
        ]);
    });
});
