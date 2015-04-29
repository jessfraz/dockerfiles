/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
/// <reference path="../declares.d.ts" />
'use strict';
define(["require", "exports"], function (require, exports) {
    exports.language = {
        displayName: 'XML',
        name: 'xml',
        mimeTypes: [],
        defaultToken: '',
        nonWordTokens: ['delimiter.xml'],
        ignoreCase: true,
        editorOptions: { tabSize: 2, insertSpaces: true },
        blockCommentStart: '<!--',
        blockCommentEnd: '-->',
        // Useful regular expressions
        qualifiedName: /(?:[\w\.\-]+:)?[\w\.\-]+/,
        enhancedBrackets: [{
            tokenType: 'tag.tag-$1.xml',
            openTrigger: '>',
            open: /<(\w[\w\d]*)(\s+.*[^\/]>|\s*>)[^<]*$/i,
            closeComplete: '</$1>',
            closeTrigger: '>',
            close: /<\/(\w[\w\d]*)\s*>$/i
        }],
        tokenizer: {
            root: [
                [/[^<&]+/, ''],
                { include: '@whitespace' },
                [/(<)(@qualifiedName)/, [
                    { token: 'delimiter.start', bracket: '@open' },
                    { token: 'tag.tag-$2', bracket: '@open', next: '@tag.$2' }
                ]],
                [/(<\/)(@qualifiedName)(\s*)(>)/, [
                    { token: 'delimiter.end', bracket: '@open' },
                    { token: 'tag.tag-$2', bracket: '@close' },
                    '',
                    { token: 'delimiter.end', bracket: '@close' }
                ]],
                [/(<\?)(@qualifiedName)/, [
                    { token: 'delimiter.start', bracket: '@open' },
                    { token: 'metatag.instruction', next: '@tag' }
                ]],
                [/(<\!)(@qualifiedName)/, [
                    { token: 'delimiter.start', bracket: '@open' },
                    { token: 'metatag.declaration', next: '@tag' }
                ]],
                [/<\!\[CDATA\[/, { token: 'delimiter.cdata', bracket: '@open', next: '@cdata' }],
                [/&\w+;/, 'string.escape'],
            ],
            cdata: [
                [/[^\]]+/, ''],
                [/\]\]>/, { token: 'delimiter.cdata', bracket: '@close', next: '@pop' }],
                [/\]/, '']
            ],
            tag: [
                [/[ \t\r\n]+/, ''],
                [/(@qualifiedName)(\s*=\s*)("[^"]*"|'[^']*')/, ['attribute.name', '', 'attribute.value']],
                [/(@qualifiedName)(\s*=\s*)("[^">?\/]*|'[^'>?\/]*)(?=[\?\/]\>)/, ['attribute.name', '', 'attribute.value']],
                [/(@qualifiedName)(\s*=\s*)("[^">]*|'[^'>]*)/, ['attribute.name', '', 'attribute.value']],
                [/@qualifiedName/, 'attribute.name'],
                [/\?>/, { token: 'delimiter.start', bracket: '@close', next: '@pop' }],
                [/(\/)(>)/, [
                    { token: 'tag.tag-$S2', bracket: '@close' },
                    { token: 'delimiter.start', bracket: '@close', next: '@pop' }
                ]],
                [/>/, { token: 'delimiter.start', bracket: '@close', next: '@pop' }],
            ],
            whitespace: [
                [/[ \t\r\n]+/, ''],
                [/<!--/, { token: 'comment', bracket: '@open', next: '@comment' }]
            ],
            comment: [
                [/[^<\-]+/, 'comment.content'],
                [/-->/, { token: 'comment', bracket: '@close', next: '@pop' }],
                [/<!--/, 'comment.content.invalid'],
                [/[<\-]/, 'comment.content']
            ],
        },
    };
});
