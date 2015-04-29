/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
/// <reference path="../../declares.d.ts" />
'use strict';
define(["require", "exports", '../powershellDef', 'monaco-testing'], function (require, exports, languageDef, T) {
    var tokenizationSupport = T.createTokenizationSupport(languageDef.language);
    var tokenize = T.createTokenizeFromSupport(tokenizationSupport);
    var assertTokens = T.assertTokens;
    var assertWords = T.assertWords;
    function assertTokensOne(textToTokenize, tokenType) {
        var tokens = tokenize(textToTokenize).tokens;
        assertTokens(tokens, [{ startIndex: 0, type: tokenType }]);
    }
    ;
    T.module('Syntax Highlighting - PowerShell');
    T.test('Comments - single line', function () {
        var tokens = tokenize('#').tokens;
        T.equal(tokens.length, 1);
        tokens = tokenize('    # a comment').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: '' },
            { startIndex: 4, type: 'comment.ps1' }
        ]);
        tokens = tokenize('# a comment').tokens;
        assertTokens(tokens, [{ startIndex: 0, type: 'comment.ps1' }]);
        tokens = tokenize('#sticky comment').tokens;
        assertTokens(tokens, [{ startIndex: 0, type: 'comment.ps1' }]);
        tokens = tokenize('##still a comment').tokens;
        assertTokens(tokens, [{ startIndex: 0, type: 'comment.ps1' }]);
        tokens = tokenize('1 / 2 /# comment').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'number.ps1' },
            { startIndex: 1, type: '' },
            { startIndex: 2, type: 'delimiter.ps1' },
            { startIndex: 3, type: '' },
            { startIndex: 4, type: 'number.ps1' },
            { startIndex: 5, type: '' },
            { startIndex: 6, type: 'delimiter.ps1' },
            { startIndex: 7, type: 'comment.ps1' }
        ]);
        tokens = tokenize('$x = 1 # my comment # is a nice one').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'variable.ps1' },
            { startIndex: 2, type: '' },
            { startIndex: 3, type: 'delimiter.ps1' },
            { startIndex: 4, type: '' },
            { startIndex: 5, type: 'number.ps1' },
            { startIndex: 6, type: '' },
            { startIndex: 7, type: 'comment.ps1' }
        ], 'test message');
    });
    T.test('Comments - range comment, single line', function () {
        var tokens = tokenize('<# a simple comment #>').tokens;
        assertTokens(tokens, [{ startIndex: 0, type: 'comment.ps1' }]);
        tokens = tokenize('$x = <# a simple comment #> 1').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'variable.ps1' },
            { startIndex: 2, type: '' },
            { startIndex: 3, type: 'delimiter.ps1' },
            { startIndex: 4, type: '' },
            { startIndex: 5, type: 'comment.ps1' },
            { startIndex: 27, type: '' },
            { startIndex: 28, type: 'number.ps1' },
        ]);
        tokens = tokenize('$yy = <# comment #> 14').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'variable.ps1' },
            { startIndex: 3, type: '' },
            { startIndex: 4, type: 'delimiter.ps1' },
            { startIndex: 5, type: '' },
            { startIndex: 6, type: 'comment.ps1' },
            { startIndex: 19, type: '' },
            { startIndex: 20, type: 'number.ps1' }
        ]);
        tokens = tokenize('$x = <##>7').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'variable.ps1' },
            { startIndex: 2, type: '' },
            { startIndex: 3, type: 'delimiter.ps1' },
            { startIndex: 4, type: '' },
            { startIndex: 5, type: 'comment.ps1' },
            { startIndex: 9, type: 'number.ps1' }
        ]);
        tokens = tokenize('$x = <#<85').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'variable.ps1' },
            { startIndex: 2, type: '' },
            { startIndex: 3, type: 'delimiter.ps1' },
            { startIndex: 4, type: '' },
            { startIndex: 5, type: 'comment.ps1' }
        ]);
    });
    T.test('Comments - range comment, multiple lines', function () {
        var lineTokens = tokenize('<# start of multiline comment');
        assertTokens(lineTokens.tokens, [{ startIndex: 0, type: 'comment.ps1' }]);
        lineTokens = tokenize('a comment between', lineTokens.endState);
        assertTokens(lineTokens.tokens, [{ startIndex: 0, type: 'comment.ps1' }]);
        lineTokens = tokenize('end of multiline comment#>', lineTokens.endState);
        assertTokens(lineTokens.tokens, [{ startIndex: 0, type: 'comment.ps1' }]);
        lineTokens = tokenize('$x = <# start a comment');
        assertTokens(lineTokens.tokens, [
            { startIndex: 0, type: 'variable.ps1' },
            { startIndex: 2, type: '' },
            { startIndex: 3, type: 'delimiter.ps1' },
            { startIndex: 4, type: '' },
            { startIndex: 5, type: 'comment.ps1' }
        ]);
        lineTokens = tokenize(' a ', lineTokens.endState);
        assertTokens(lineTokens.tokens, [
            { startIndex: 0, type: 'comment.ps1' }
        ]);
        lineTokens = tokenize('and end it #> 2', lineTokens.endState);
        assertTokens(lineTokens.tokens, [
            { startIndex: 0, type: 'comment.ps1' },
            { startIndex: 13, type: '' },
            { startIndex: 14, type: 'number.ps1' }
        ]);
    });
    T.test('Keywords', function () {
        var tokens = tokenize('foreach($i in $b) {if (7) continue}').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'keyword.foreach.ps1' },
            { startIndex: 7, type: 'delimiter.parenthesis.ps1', bracket: 1 },
            { startIndex: 8, type: 'variable.ps1' },
            { startIndex: 10, type: '' },
            { startIndex: 11, type: 'keyword.in.ps1' },
            { startIndex: 13, type: '' },
            { startIndex: 14, type: 'variable.ps1' },
            { startIndex: 16, type: 'delimiter.parenthesis.ps1', bracket: -1 },
            { startIndex: 17, type: '' },
            { startIndex: 18, type: 'delimiter.curly.ps1', bracket: 1 },
            { startIndex: 19, type: 'keyword.if.ps1' },
            { startIndex: 21, type: '' },
            { startIndex: 22, type: 'delimiter.parenthesis.ps1', bracket: 1 },
            { startIndex: 23, type: 'number.ps1' },
            { startIndex: 24, type: 'delimiter.parenthesis.ps1', bracket: -1 },
            { startIndex: 25, type: '' },
            { startIndex: 26, type: 'keyword.continue.ps1' },
            { startIndex: 34, type: 'delimiter.curly.ps1', bracket: -1 }
        ]);
    });
    T.test('Numbers', function () {
        assertTokensOne('0', 'number.ps1');
        assertTokensOne('0.10', 'number.float.ps1');
        assertTokensOne('0X123', 'number.hex.ps1');
        assertTokensOne('0x123', 'number.hex.ps1');
        assertTokensOne('23.5e3', 'number.float.ps1');
        assertTokensOne('23.5e-3', 'number.float.ps1');
        assertTokensOne('23.5E3', 'number.float.ps1');
        assertTokensOne('23.5E-3', 'number.float.ps1');
        assertTokensOne('23.5', 'number.float.ps1');
        var tokens = tokenize('0+0').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'number.ps1' },
            { startIndex: 1, type: 'delimiter.ps1' },
            { startIndex: 2, type: 'number.ps1' }
        ]);
        var tokens = tokenize('100+10').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'number.ps1' },
            { startIndex: 3, type: 'delimiter.ps1' },
            { startIndex: 4, type: 'number.ps1' }
        ]);
        var tokens = tokenize('10 + 0').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'number.ps1' },
            { startIndex: 2, type: '' },
            { startIndex: 3, type: 'delimiter.ps1' },
            { startIndex: 4, type: '' },
            { startIndex: 5, type: 'number.ps1' }
        ]);
    });
    T.test('Strings', function () {
        var tokens = tokenize('$s = \"I am a String\"').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'variable.ps1' },
            { startIndex: 2, type: '' },
            { startIndex: 3, type: 'delimiter.ps1' },
            { startIndex: 4, type: '' },
            { startIndex: 5, type: 'string.ps1' }
        ]);
        var tokens = tokenize('\'I am also a ( String\'').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'string.ps1' }
        ]);
        var tokens = tokenize('$s = \"concatenated\" + \" String\"').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'variable.ps1' },
            { startIndex: 2, type: '' },
            { startIndex: 3, type: 'delimiter.ps1' },
            { startIndex: 4, type: '' },
            { startIndex: 5, type: 'string.ps1' },
            { startIndex: 19, type: '' },
            { startIndex: 20, type: 'delimiter.ps1' },
            { startIndex: 21, type: '' },
            { startIndex: 22, type: 'string.ps1' },
        ]);
        tokens = tokenize('"escaping `"quotes`" is cool"').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'string.ps1' },
            { startIndex: 10, type: 'string.escape.ps1' },
            { startIndex: 12, type: 'string.ps1' },
            { startIndex: 18, type: 'string.escape.ps1' },
            { startIndex: 20, type: 'string.ps1' }
        ]);
        tokens = tokenize('\'`\'end of the string').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'string.ps1' },
            { startIndex: 1, type: 'string.escape.ps1' },
            { startIndex: 3, type: 'string.ps1' }
        ]);
        tokens = tokenize('@"I am an expandable String"@').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'string.ps1' },
        ]);
        tokens = tokenize('@\'I am also an expandable String\'@').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'string.ps1' },
        ]);
        tokens = tokenize('$s = @\'I am also an expandable String\'@').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'variable.ps1' },
            { startIndex: 2, type: '' },
            { startIndex: 3, type: 'delimiter.ps1' },
            { startIndex: 4, type: '' },
            { startIndex: 5, type: 'string.ps1' },
        ]);
        // The string must be at least on two lines.
        tokens = tokenize('$s = @\'I am also an expandable String\'@+7').tokens;
        assertTokens(tokens, [
            { startIndex: 0, type: 'variable.ps1' },
            { startIndex: 2, type: '' },
            { startIndex: 3, type: 'delimiter.ps1' },
            { startIndex: 4, type: '' },
            { startIndex: 5, type: 'string.ps1' }
        ]);
        var lineTokens = tokenize('@\'I am a multiline string,');
        assertTokens(lineTokens.tokens, [
            { startIndex: 0, type: 'string.ps1' }
        ]);
        lineTokens = tokenize('and this is the middle line,', lineTokens.endState);
        assertTokens(lineTokens.tokens, [
            { startIndex: 0, type: 'string.ps1' }
        ]);
        lineTokens = tokenize('and this is NOT the end of the string\'@foreach $i', lineTokens.endState);
        assertTokens(lineTokens.tokens, [
            { startIndex: 0, type: 'string.ps1' }
        ]);
        lineTokens = tokenize('\'@', lineTokens.endState);
        assertTokens(lineTokens.tokens, [
            { startIndex: 0, type: 'string.ps1' },
        ]);
        lineTokens = tokenize('foreach $i', lineTokens.endState);
        assertTokens(lineTokens.tokens, [
            { startIndex: 0, type: 'keyword.foreach.ps1' },
            { startIndex: 7, type: '' },
            { startIndex: 8, type: 'variable.ps1' }
        ]);
    });
    T.test('Word definition', function () {
        var wordDefinition = languageDef.language.wordDefinition;
        assertWords('a b cde'.match(wordDefinition), ['a', 'b', 'cde']);
        assertWords('if ($parameterSet["class"] -eq "blank")'.match(wordDefinition), ['if', '$parameterSet', 'class', '-eq', 'blank']);
        assertWords('Connect-XenServer -url $parameterSet["url"] <#-opaqueref trala#>")'.match(wordDefinition), ['Connect-XenServer', '-url', '$parameterSet', 'url', '-opaqueref', 'trala']);
        assertWords('$exp = "Get-XenServer:{0} -properties @{{uuid=\'{1}\'}}" -f $parameterSet["class"], $parameterSet["objUuid"]'.match(wordDefinition), ['$exp', 'Get-XenServer', '0', '-properties', 'uuid', '1', '-f', '$parameterSet', 'class', '$parameterSet', 'objUuid']);
    });
    T.test('Generated from sample', function () {
        var previousState = tokenizationSupport.getInitialState();
        // Line 1
        var src = '$SelectedObjectNames=@();';
        var tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: 'variable.ps1', bracket: 0 },
            { startIndex: 20, type: 'delimiter.ps1', bracket: 0 },
            { startIndex: 21, type: '', bracket: 0 },
            { startIndex: 22, type: 'delimiter.parenthesis.ps1', bracket: 1 },
            { startIndex: 23, type: 'delimiter.parenthesis.ps1', bracket: -1 },
            { startIndex: 24, type: 'delimiter.ps1', bracket: 0 }
        ]);
        // Line 2
        src = '$XenCenterNodeSelected = 0;';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: 'variable.ps1', bracket: 0 },
            { startIndex: 22, type: '', bracket: 0 },
            { startIndex: 23, type: 'delimiter.ps1', bracket: 0 },
            { startIndex: 24, type: '', bracket: 0 },
            { startIndex: 25, type: 'number.ps1', bracket: 0 },
            { startIndex: 26, type: 'delimiter.ps1', bracket: 0 }
        ]);
        // Line 3
        src = '#the object info array contains hashmaps, each of which represent a parameter set and describe a target in the XenCenter resource list';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: 'comment.ps1', bracket: 0 }
        ]);
        // Line 4
        src = 'foreach($parameterSet in $ObjInfoArray)';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: 'keyword.foreach.ps1', bracket: 0 },
            { startIndex: 7, type: 'delimiter.parenthesis.ps1', bracket: 1 },
            { startIndex: 8, type: 'variable.ps1', bracket: 0 },
            { startIndex: 21, type: '', bracket: 0 },
            { startIndex: 22, type: 'keyword.in.ps1', bracket: 0 },
            { startIndex: 24, type: '', bracket: 0 },
            { startIndex: 25, type: 'variable.ps1', bracket: 0 },
            { startIndex: 38, type: 'delimiter.parenthesis.ps1', bracket: -1 }
        ]);
        // Line 5
        src = '{';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: 'delimiter.curly.ps1', bracket: 1 }
        ]);
        // Line 6
        src = '	if ($parameterSet["class"] -eq "blank")';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 1, type: 'keyword.if.ps1', bracket: 0 },
            { startIndex: 3, type: '', bracket: 0 },
            { startIndex: 4, type: 'delimiter.parenthesis.ps1', bracket: 1 },
            { startIndex: 5, type: 'variable.ps1', bracket: 0 },
            { startIndex: 18, type: 'delimiter.square.ps1', bracket: 1 },
            { startIndex: 19, type: 'string.ps1', bracket: 0 },
            { startIndex: 26, type: 'delimiter.square.ps1', bracket: -1 },
            { startIndex: 27, type: '', bracket: 0 },
            { startIndex: 28, type: 'delimiter.ps1', bracket: 0 },
            { startIndex: 29, type: '', bracket: 0 },
            { startIndex: 32, type: 'string.ps1', bracket: 0 },
            { startIndex: 39, type: 'delimiter.parenthesis.ps1', bracket: -1 }
        ]);
        // Line 7
        src = '	{';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 1, type: 'delimiter.curly.ps1', bracket: 1 }
        ]);
        // Line 8
        src = '		#When the XenCenter node is selected a parameter set is created for each of your connected servers with the class and objUuid keys marked as blank';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 2, type: 'comment.ps1', bracket: 0 }
        ]);
        // Line 9
        src = '		if ($XenCenterNodeSelected)';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 2, type: 'keyword.if.ps1', bracket: 0 },
            { startIndex: 4, type: '', bracket: 0 },
            { startIndex: 5, type: 'delimiter.parenthesis.ps1', bracket: 1 },
            { startIndex: 6, type: 'variable.ps1', bracket: 0 },
            { startIndex: 28, type: 'delimiter.parenthesis.ps1', bracket: -1 }
        ]);
        // Line 10
        src = '		{';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 2, type: 'delimiter.curly.ps1', bracket: 1 }
        ]);
        // Line 11
        src = '			continue';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 3, type: 'keyword.continue.ps1', bracket: 0 }
        ]);
        // Line 12
        src = '		}';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 2, type: 'delimiter.curly.ps1', bracket: -1 }
        ]);
        // Line 13
        src = '		$XenCenterNodeSelected = 1;';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 2, type: 'variable.ps1', bracket: 0 },
            { startIndex: 24, type: '', bracket: 0 },
            { startIndex: 25, type: 'delimiter.ps1', bracket: 0 },
            { startIndex: 26, type: '', bracket: 0 },
            { startIndex: 27, type: 'number.ps1', bracket: 0 },
            { startIndex: 28, type: 'delimiter.ps1', bracket: 0 }
        ]);
        // Line 14
        src = '		$SelectedObjectNames += "XenCenter"';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 2, type: 'variable.ps1', bracket: 0 },
            { startIndex: 22, type: '', bracket: 0 },
            { startIndex: 23, type: 'delimiter.ps1', bracket: 0 },
            { startIndex: 25, type: '', bracket: 0 },
            { startIndex: 26, type: 'string.ps1', bracket: 0 }
        ]);
        // Line 15
        src = '	}';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 1, type: 'delimiter.curly.ps1', bracket: -1 }
        ]);
        // Line 16
        src = '	elseif ($parameterSet["sessionRef"] -eq "null")';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 1, type: 'keyword.elseif.ps1', bracket: 0 },
            { startIndex: 7, type: '', bracket: 0 },
            { startIndex: 8, type: 'delimiter.parenthesis.ps1', bracket: 1 },
            { startIndex: 9, type: 'variable.ps1', bracket: 0 },
            { startIndex: 22, type: 'delimiter.square.ps1', bracket: 1 },
            { startIndex: 23, type: 'string.ps1', bracket: 0 },
            { startIndex: 35, type: 'delimiter.square.ps1', bracket: -1 },
            { startIndex: 36, type: '', bracket: 0 },
            { startIndex: 37, type: 'delimiter.ps1', bracket: 0 },
            { startIndex: 38, type: '', bracket: 0 },
            { startIndex: 41, type: 'string.ps1', bracket: 0 },
            { startIndex: 47, type: 'delimiter.parenthesis.ps1', bracket: -1 }
        ]);
        // Line 17
        src = '	{';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 1, type: 'delimiter.curly.ps1', bracket: 1 }
        ]);
        // Line 18
        src = '		#When a disconnected server is selected there is no session information, we get null for everything except class';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 2, type: 'comment.ps1', bracket: 0 }
        ]);
        // Line 19
        src = '	}';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 1, type: 'delimiter.curly.ps1', bracket: -1 }
        ]);
        // Line 20
        src = '		$SelectedObjectNames += "a disconnected server"';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 2, type: 'variable.ps1', bracket: 0 },
            { startIndex: 22, type: '', bracket: 0 },
            { startIndex: 23, type: 'delimiter.ps1', bracket: 0 },
            { startIndex: 25, type: '', bracket: 0 },
            { startIndex: 26, type: 'string.ps1', bracket: 0 }
        ]);
        // Line 21
        src = '	else';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 1, type: 'keyword.else.ps1', bracket: 0 }
        ]);
        // Line 22
        src = '	{';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 1, type: 'delimiter.curly.ps1', bracket: 1 }
        ]);
        // Line 23
        src = '		Connect-XenServer -url $parameterSet["url"] -opaqueref $parameterSet["sessionRef"]';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 20, type: 'delimiter.ps1', bracket: 0 },
            { startIndex: 21, type: '', bracket: 0 },
            { startIndex: 25, type: 'variable.ps1', bracket: 0 },
            { startIndex: 38, type: 'delimiter.square.ps1', bracket: 1 },
            { startIndex: 39, type: 'string.ps1', bracket: 0 },
            { startIndex: 44, type: 'delimiter.square.ps1', bracket: -1 },
            { startIndex: 45, type: '', bracket: 0 },
            { startIndex: 46, type: 'delimiter.ps1', bracket: 0 },
            { startIndex: 47, type: '', bracket: 0 },
            { startIndex: 57, type: 'variable.ps1', bracket: 0 },
            { startIndex: 70, type: 'delimiter.square.ps1', bracket: 1 },
            { startIndex: 71, type: 'string.ps1', bracket: 0 },
            { startIndex: 83, type: 'delimiter.square.ps1', bracket: -1 }
        ]);
        // Line 24
        src = '		#Use $class to determine which server objects to get';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 2, type: 'comment.ps1', bracket: 0 }
        ]);
        // Line 25
        src = '		#-properties allows us to filter the results to just include the selected object';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 2, type: 'comment.ps1', bracket: 0 }
        ]);
        // Line 26
        src = '		$exp = "Get-XenServer:{0} -properties @{{uuid=\'{1}\'}}" -f $parameterSet["class"], $parameterSet["objUuid"]';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 2, type: 'variable.ps1', bracket: 0 },
            { startIndex: 6, type: '', bracket: 0 },
            { startIndex: 7, type: 'delimiter.ps1', bracket: 0 },
            { startIndex: 8, type: '', bracket: 0 },
            { startIndex: 9, type: 'string.ps1', bracket: 0 },
            { startIndex: 56, type: '', bracket: 0 },
            { startIndex: 57, type: 'delimiter.ps1', bracket: 0 },
            { startIndex: 58, type: '', bracket: 0 },
            { startIndex: 60, type: 'variable.ps1', bracket: 0 },
            { startIndex: 73, type: 'delimiter.square.ps1', bracket: 1 },
            { startIndex: 74, type: 'string.ps1', bracket: 0 },
            { startIndex: 81, type: 'delimiter.square.ps1', bracket: -1 },
            { startIndex: 82, type: 'delimiter.ps1', bracket: 0 },
            { startIndex: 83, type: '', bracket: 0 },
            { startIndex: 84, type: 'variable.ps1', bracket: 0 },
            { startIndex: 97, type: 'delimiter.square.ps1', bracket: 1 },
            { startIndex: 98, type: 'string.ps1', bracket: 0 },
            { startIndex: 107, type: 'delimiter.square.ps1', bracket: -1 }
        ]);
        // Line 27
        src = '		$obj = Invoke-Expression $exp';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 2, type: 'variable.ps1', bracket: 0 },
            { startIndex: 6, type: '', bracket: 0 },
            { startIndex: 7, type: 'delimiter.ps1', bracket: 0 },
            { startIndex: 8, type: '', bracket: 0 },
            { startIndex: 27, type: 'variable.ps1', bracket: 0 }
        ]);
        // Line 28
        src = '		$SelectedObjectNames += $obj.name_label;';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 2, type: 'variable.ps1', bracket: 0 },
            { startIndex: 22, type: '', bracket: 0 },
            { startIndex: 23, type: 'delimiter.ps1', bracket: 0 },
            { startIndex: 25, type: '', bracket: 0 },
            { startIndex: 26, type: 'variable.ps1', bracket: 0 },
            { startIndex: 30, type: 'delimiter.ps1', bracket: 0 },
            { startIndex: 31, type: '', bracket: 0 },
            { startIndex: 41, type: 'delimiter.ps1', bracket: 0 }
        ]);
        // Line 29
        src = '	} ';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '', bracket: 0 },
            { startIndex: 1, type: 'delimiter.curly.ps1', bracket: -1 },
            { startIndex: 2, type: '', bracket: 0 }
        ]);
        // Line 30
        src = '}';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: 'delimiter.curly.ps1', bracket: -1 }
        ]);
        // Line 31
        src = '';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
        ]);
        // Line 32
        src = '$test = "in string var$test"';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: 'variable.ps1', bracket: 0 },
            { startIndex: 5, type: '', bracket: 0 },
            { startIndex: 6, type: 'delimiter.ps1', bracket: 0 },
            { startIndex: 7, type: '', bracket: 0 },
            { startIndex: 8, type: 'string.ps1', bracket: 0 },
            { startIndex: 22, type: 'variable.ps1', bracket: 0 },
            { startIndex: 27, type: 'string.ps1', bracket: 0 }
        ]);
        // Line 33
        src = '$another = \'not a $var\'';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: 'variable.ps1', bracket: 0 },
            { startIndex: 8, type: '', bracket: 0 },
            { startIndex: 9, type: 'delimiter.ps1', bracket: 0 },
            { startIndex: 10, type: '', bracket: 0 },
            { startIndex: 11, type: 'string.ps1', bracket: 0 }
        ]);
        // Line 34
        src = '$third = "a $var and not `$var string"';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: 'variable.ps1', bracket: 0 },
            { startIndex: 6, type: '', bracket: 0 },
            { startIndex: 7, type: 'delimiter.ps1', bracket: 0 },
            { startIndex: 8, type: '', bracket: 0 },
            { startIndex: 9, type: 'string.ps1', bracket: 0 },
            { startIndex: 12, type: 'variable.ps1', bracket: 0 },
            { startIndex: 16, type: 'string.ps1', bracket: 0 },
            { startIndex: 25, type: 'string.escape.ps1', bracket: 0 },
            { startIndex: 27, type: 'string.ps1', bracket: 0 }
        ]);
        // Line 35
        src = '';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
        ]);
        // Line 36
        src = ':aLabel';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: 'metatag.ps1', bracket: 0 }
        ]);
        // Line 37
        src = '';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
        ]);
        // Line 38
        src = '<#';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: 'comment.ps1', bracket: 0 }
        ]);
        // Line 39
        src = '.SYNOPSIS';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: 'comment.keyword.synopsis.ps1', bracket: 0 }
        ]);
        // Line 40
        src = '  some text';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: 'comment.ps1', bracket: 0 }
        ]);
        // Line 41
        src = '  ';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: 'comment.ps1', bracket: 0 }
        ]);
        // Line 42
        src = '.LINK';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: 'comment.keyword.link.ps1', bracket: 0 }
        ]);
        // Line 43
        src = '  some more text';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: 'comment.ps1', bracket: 0 }
        ]);
        // Line 44
        src = '#>';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: 'comment.ps1', bracket: 0 }
        ]);
        // Line 45
        src = '';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
        ]);
        // Line 46
        src = '';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
        ]);
        // Line 47
        src = '$hereString = @"';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: 'variable.ps1', bracket: 0 },
            { startIndex: 11, type: '', bracket: 0 },
            { startIndex: 12, type: 'delimiter.ps1', bracket: 0 },
            { startIndex: 13, type: '', bracket: 0 },
            { startIndex: 14, type: 'string.ps1', bracket: 0 }
        ]);
        // Line 48
        src = '  a string';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: 'string.ps1', bracket: 0 }
        ]);
        // Line 49
        src = '  still "@ a string $withVar';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: 'string.ps1', bracket: 0 },
            { startIndex: 20, type: 'variable.ps1', bracket: 0 }
        ]);
        // Line 50
        src = '  still a string `$noVar';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: 'string.ps1', bracket: 0 },
            { startIndex: 17, type: 'string.escape.ps1', bracket: 0 },
            { startIndex: 19, type: 'string.ps1', bracket: 0 }
        ]);
        // Line 51
        src = '';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
        ]);
        // Line 52
        src = '"@ still a string';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: 'string.ps1', bracket: 0 },
            { startIndex: 2, type: '', bracket: 0 }
        ]);
    });
});
