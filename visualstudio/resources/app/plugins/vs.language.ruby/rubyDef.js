/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
/// <reference path="../declares.d.ts" />
'use strict';
define(["require", "exports"], function (require, exports) {
    /*
    Ruby language definition
    
    Quite a complex language due to elaborate escape sequences
    and quoting of literate strings/regular expressions, and
    an 'end' keyword that does not always apply to modifiers like until and while,
    and a 'do' keyword that sometimes starts a block, but sometimes is part of
    another statement (like 'while').
    
    (1) end blocks:
    'end' may end declarations like if or until, but sometimes 'if' or 'until'
    are modifiers where there is no 'end'. Also, 'do' sometimes starts a block
    that is ended by 'end', but sometimes it is part of a 'while', 'for', or 'until'
    To do proper brace matching we do some elaborate state manipulation.
    some examples:
    
      until bla do
        work until tired
        list.each do
          something if test
        end
      end
    
    or
    
    if test
     something (if test then x end)
     bar if bla
    end
    
    or, how about using class as a property..
    
    class Test
      def endpoint
        self.class.endpoint || routes
      end
    end
         
    (2) quoting:
    there are many kinds of strings and escape sequences. But also, one can
    start many string-like things as '%qx' where q specifies the kind of string
    (like a command, escape expanded, regular expression, symbol etc.), and x is
    some character and only another 'x' ends the sequence. Except for brackets
    where the closing bracket ends the sequence.. and except for a nested bracket
    inside the string like entity. Also, such strings can contain interpolated
    ruby expressions again (and span multiple lines). Moreover, expanded
    regular expression can also contain comments.
    */
    exports.language = {
        displayName: '',
        name: 'ruby',
        mimeTypes: [],
        fileExtensions: [],
        lineComment: '#',
        blockCommentStart: '=begin',
        blockCommentEnd: '=end',
        keywords: [
            '__LINE__',
            '__ENCODING__',
            '__FILE__',
            'BEGIN',
            'END',
            'alias',
            'and',
            'begin',
            'break',
            'case',
            'class',
            'def',
            'defined?',
            'do',
            'else',
            'elsif',
            'end',
            'ensure',
            'for',
            'false',
            'if',
            'in',
            'module',
            'next',
            'nil',
            'not',
            'or',
            'redo',
            'rescue',
            'retry',
            'return',
            'self',
            'super',
            'then',
            'true',
            'undef',
            'unless',
            'until',
            'when',
            'while',
            'yield',
        ],
        keywordops: [
            '::',
            '..',
            '...',
            '?',
            ':',
            '=>'
        ],
        builtins: [
            'require',
            'public',
            'private',
            'include',
            'extend',
            'attr_reader',
            'protected',
            'private_class_method',
            'protected_class_method',
            'new'
        ],
        // these are closed by 'end' (if, while and until are handled separately)
        declarations: [
            'module',
            'class',
            'def',
            'case',
            'do',
            'begin',
            'for',
            'if',
            'while',
            'until',
            'unless'
        ],
        linedecls: [
            'def',
            'case',
            'do',
            'begin',
            'for',
            'if',
            'while',
            'until',
            'unless'
        ],
        operators: [
            '^',
            '&',
            '|',
            '<=>',
            '==',
            '===',
            '!~',
            '=~',
            '>',
            '>=',
            '<',
            '<=',
            '<<',
            '>>',
            '+',
            '-',
            '*',
            '/',
            '%',
            '**',
            '~',
            '+@',
            '-@',
            '[]',
            '[]=',
            '`',
            '+=',
            '-=',
            '*=',
            '**=',
            '/=',
            '^=',
            '%=',
            '<<=',
            '>>=',
            '&=',
            '&&=',
            '||=',
            '|='
        ],
        brackets: [
            { open: '(', close: ')', token: 'delimiter.parenthesis' },
            { open: '{', close: '}', token: 'delimiter.curly' },
            { open: '[', close: ']', token: 'delimiter.square' }
        ],
        // trigger outdenting on 'end'
        outdentTriggers: 'd',
        // we include these common regular expressions
        symbols: /[=><!~?:&|+\-*\/\^%\.]+/,
        // escape sequences
        escape: /(?:[abefnrstv\\"'\n\r]|[0-7]{1,3}|x[0-9A-Fa-f]{1,2}|u[0-9A-Fa-f]{4})/,
        escapes: /\\(?:C\-(@escape|.)|c(@escape|.)|@escape)/,
        decpart: /\d(_?\d)*/,
        decimal: /0|@decpart/,
        delim: /[^a-zA-Z0-9\s\n\r]/,
        heredelim: /(?:\w+|'[^']*'|"[^"]*"|`[^`]*`)/,
        regexpctl: /[(){}\[\]\$\^|\-*+?\.]/,
        regexpesc: /\\(?:[AzZbBdDfnrstvwWn0\\\/]|@regexpctl|c[A-Z]|x[0-9a-fA-F]{2}|u[0-9a-fA-F]{4})?/,
        // The main tokenizer for our languages
        tokenizer: {
            // Main entry. 
            // root.<decl> where decl is the current opening declaration (like 'class')
            root: [
                [/^(\s*)([a-z_]\w*[!?=]?)/, ['white', { cases: { 'for|until|while': { token: 'keyword.$2', bracket: '@open', next: '@dodecl.$2' }, '@declarations': { token: 'keyword.$2', bracket: '@open', next: '@root.$2' }, 'end': { token: 'keyword.$S2', bracket: '@close', next: '@pop' }, '@keywords': 'keyword', '@builtins': 'predefined', '@default': 'identifier' } }]],
                [/[a-z_]\w*[!?=]?/, { cases: { 'if|unless|while|until': { token: 'keyword.$0x', bracket: '@open', next: '@modifier.$0x' }, 'for': { token: 'keyword.$2', bracket: '@open', next: '@dodecl.$2' }, '@linedecls': { token: 'keyword.$0', bracket: '@open', next: '@root.$0' }, 'end': { token: 'keyword.$S2', bracket: '@close', next: '@pop' }, '@keywords': 'keyword', '@builtins': 'predefined', '@default': 'identifier' } }],
                [/[A-Z][\w]*[!?=]?/, 'constructor.identifier'],
                [/\$[\w]*/, 'global.constant'],
                [/@[\w]*/, 'namespace.instance.identifier'],
                [/@@[\w]*/, 'namespace.class.identifier'],
                { include: '@whitespace' },
                [/"/, { token: 'string.d.delim', bracket: '@open', next: '@dstring.d."' }],
                [/'/, { token: 'string.sq.delim', bracket: '@open', next: '@sstring.sq' }],
                [/%([rsqxwW]|Q?)/, { token: '@rematch', next: 'pstring' }],
                [/\-?<<(@heredelim).*/, { token: 'string.heredoc.delimiter', bracket: '@open', next: '@heredoc.$1' }],
                [/`/, { token: 'string.x.delim', bracket: '@open', next: '@dstring.x.`' }],
                [/:(\w|[$@])\w*[!?=]?/, 'string.s'],
                [/:"/, { token: 'string.s.delim', bracket: '@open', next: '@dstring.s."' }],
                [/:'/, { token: 'string.s.delim', bracket: '@open', next: '@sstring.s' }],
                ['/', { token: 'regexp.delim', bracket: '@open', next: '@regexp' }],
                [/[{}()\[\]]/, '@brackets'],
                [/@symbols/, { cases: { '@keywordops': 'keyword', '@operators': 'operator', '@default': '' } }],
                [/[;,]/, 'delimiter'],
                [/0[xX][0-9a-fA-F](_?[0-9a-fA-F])*/, 'number.hex'],
                [/0[_oO][0-7](_?[0-7])*/, 'number.octal'],
                [/0[bB][01](_?[01])*/, 'number.binary'],
                [/0[dD]@decpart/, 'number'],
                [/@decimal((\.@decpart)?([eE][\-+]?@decpart)?)/, { cases: { '$1': 'number.float', '@default': 'number' } }],
            ],
            // used to not treat a 'do' as a block opener if it occurs on the same 
            // line as a 'do' statement: 'while|until|for'
            // dodecl.<decl> where decl is the declarations started, like 'while'
            dodecl: [
                [/^/, { token: '', switchTo: '@root.$S2' }],
                [/[a-z_]\w*[!?=]?/, { cases: { 'end': { token: 'keyword.$S2', bracket: '@close', next: '@pop' }, 'do': { token: 'keyword', switchTo: '@root.$S2' }, '@linedecls': { token: '@rematch', switchTo: '@root.$S2' }, '@keywords': 'keyword', '@builtins': 'predefined', '@default': 'identifier' } }],
                { include: '@root' }
            ],
            // used to prevent potential modifiers ('if|until|while|unless') to match 
            // with 'end' keywords.
            // modifier.<decl>x where decl is the declaration starter, like 'if'
            modifier: [
                [/^/, '', '@pop'],
                [/[a-z_]\w*[!?=]?/, { cases: { 'end': { token: 'keyword.$S2', bracket: '@close', next: '@pop' }, 'then|else|elsif|do': { token: 'keyword', switchTo: '@root.$S2' }, '@linedecls': { token: '@rematch', switchTo: '@root.$S2' }, '@keywords': 'keyword', '@builtins': 'predefined', '@default': 'identifier' } }],
                { include: '@root' }
            ],
            // single quote strings (also used for symbols)
            // sstring.<kind>  where kind is 'sq' (single quote) or 's' (symbol)
            sstring: [
                [/[^\\']+/, 'string.$S2'],
                [/\\\\|\\'|\\$/, 'string.$S2.escape'],
                [/\\./, 'string.$S2.invalid'],
                [/'/, { token: 'string.$S2.delim', bracket: '@close', next: '@pop' }]
            ],
            // double quoted "string". 
            // dstring.<kind>.<delim> where kind is 'd' (double quoted), 'x' (command), or 's' (symbol)
            // and delim is the ending delimiter (" or `)
            dstring: [
                [/[^\\`"#]+/, 'string.$S2'],
                [/#/, 'string.$S2.escape', '@interpolated'],
                [/\\$/, 'string.$S2.escape'],
                [/@escapes/, 'string.$S2.escape'],
                [/\\./, 'string.$S2.escape.invalid'],
                [/[`"]/, { cases: { '$#==$S3': { token: 'string.$S2.delim', bracket: '@close', next: '@pop' }, '@default': 'string.$S2' } }]
            ],
            // literal documents
            // heredoc.<close> where close is the closing delimiter
            heredoc: [
                [/^(\s*)(@heredelim)$/, { cases: { '$2==$S2': ['string.heredoc', { token: 'string.heredoc.delimiter', bracket: '@close', next: '@pop' }], '@default': ['string.heredoc', 'string.heredoc'] } }],
                [/.*/, 'string.heredoc'],
            ],
            // interpolated sequence
            interpolated: [
                [/\$\w*/, 'global.constant', '@pop'],
                [/@\w*/, 'namespace.class.identifier', '@pop'],
                [/@@\w*/, 'namespace.instance.identifier', '@pop'],
                [/[{]/, { token: 'string.escape.curly', bracket: '@open', switchTo: '@interpolated_compound' }],
                ['', '', '@pop'],
            ],
            // any code 
            interpolated_compound: [
                [/[}]/, { token: 'string.escape.curly', bracket: '@close', next: '@pop' }],
                { include: '@root' },
            ],
            // %r quoted regexp
            // pregexp.<open>.<close> where open/close are the open/close delimiter
            pregexp: [
                { include: '@whitespace' },
                [/[^\(\{\[\\]/, { cases: { '$#==$S3': { token: 'regexp.delim', bracket: '@close', next: '@pop' }, '$#==$S2': { token: 'regexp.delim', bracket: '@open', next: '@push' }, '~[)}\\]]': '@brackets.regexp.escape.control', '~@regexpctl': 'regexp.escape.control', '@default': 'regexp' } }],
                { include: '@regexcontrol' },
            ],
            // We match regular expression quite precisely 
            regexp: [
                { include: '@regexcontrol' },
                [/[^\\\/]/, 'regexp'],
                ['/[ixmp]*', { token: 'regexp.delim', bracket: '@close' }, '@pop'],
            ],
            regexcontrol: [
                [/(\{)(\d+(?:,\d*)?)(\})/, ['@brackets.regexp.escape.control', 'regexp.escape.control', '@brackets.regexp.escape.control']],
                [/(\[)(\^?)/, ['@brackets.regexp.escape.control', { token: 'regexp.escape.control', next: '@regexrange' }]],
                [/(\()(\?[:=!])/, ['@brackets.regexp.escape.control', 'regexp.escape.control']],
                [/\(\?#/, { token: 'regexp.escape.control', bracket: '@open', next: '@regexpcomment' }],
                [/[()]/, '@brackets.regexp.escape.control'],
                [/@regexpctl/, 'regexp.escape.control'],
                [/\\$/, 'regexp.escape'],
                [/@regexpesc/, 'regexp.escape'],
                [/\\\./, 'regexp.invalid'],
                [/#/, 'regexp.escape', '@interpolated'],
            ],
            regexrange: [
                [/-/, 'regexp.escape.control'],
                [/\^/, 'regexp.invalid'],
                [/\\$/, 'regexp.escape'],
                [/@regexpesc/, 'regexp.escape'],
                [/[^\]]/, 'regexp'],
                [/\]/, '@brackets.regexp.escape.control', '@pop'],
            ],
            regexpcomment: [
                [/[^)]+/, 'comment'],
                [/\)/, { token: 'regexp.escape.control', bracket: '@close', next: '@pop' }]
            ],
            // % quoted strings
            // A bit repetitive since we need to often special case the kind of ending delimiter
            pstring: [
                [/%([qws])\(/, { token: 'string.$1.delim', bracket: '@open', switchTo: '@qstring.$1.(.)' }],
                [/%([qws])\[/, { token: 'string.$1.delim', bracket: '@open', switchTo: '@qstring.$1.[.]' }],
                [/%([qws])\{/, { token: 'string.$1.delim', bracket: '@open', switchTo: '@qstring.$1.{.}' }],
                [/%([qws])</, { token: 'string.$1.delim', bracket: '@open', switchTo: '@qstring.$1.<.>' }],
                [/%([qws])(@delim)/, { token: 'string.$1.delim', bracket: '@open', switchTo: '@qstring.$1.$2.$2' }],
                [/%r\(/, { token: 'regexp.delim', bracket: '@open', switchTo: '@pregexp.(.)' }],
                [/%r\[/, { token: 'regexp.delim', bracket: '@open', switchTo: '@pregexp.[.]' }],
                [/%r\{/, { token: 'regexp.delim', bracket: '@open', switchTo: '@pregexp.{.}' }],
                [/%r</, { token: 'regexp.delim', bracket: '@open', switchTo: '@pregexp.<.>' }],
                [/%r(@delim)/, { token: 'regexp.delim', bracket: '@open', switchTo: '@pregexp.$1.$1' }],
                [/%(x|W|Q?)\(/, { token: 'string.$1.delim', bracket: '@open', switchTo: '@qqstring.$1.(.)' }],
                [/%(x|W|Q?)\[/, { token: 'string.$1.delim', bracket: '@open', switchTo: '@qqstring.$1.[.]' }],
                [/%(x|W|Q?)\{/, { token: 'string.$1.delim', bracket: '@open', switchTo: '@qqstring.$1.{.}' }],
                [/%(x|W|Q?)</, { token: 'string.$1.delim', bracket: '@open', switchTo: '@qqstring.$1.<.>' }],
                [/%(x|W|Q?)(@delim)/, { token: 'string.$1.delim', bracket: '@open', switchTo: '@qqstring.$1.$2.$2' }],
                [/%([rqwsxW]|Q?)./, { token: 'invalid', next: '@pop' }],
                [/./, { token: 'invalid', next: '@pop' }],
            ],
            // non-expanded quoted string.
            // qstring.<kind>.<open>.<close>
            //  kind = q|w|s  (single quote, array, symbol)
            //  open = open delimiter
            //  close = close delimiter
            qstring: [
                [/\\$/, 'string.$S2.escape'],
                [/\\./, 'string.$S2.escape'],
                [/./, { cases: { '$#==$S4': { token: 'string.$S2.delim', bracket: '@close', next: '@pop' }, '$#==$S3': { token: 'string.$S2.delim', bracket: '@open', next: '@push' }, '@default': 'string.$S2' } }],
            ],
            // expanded quoted string.
            // qqstring.<kind>.<open>.<close>
            //  kind = Q|W|x  (double quote, array, command)
            //  open = open delimiter
            //  close = close delimiter
            qqstring: [
                [/#/, 'string.$S2.escape', '@interpolated'],
                { include: '@qstring' }
            ],
            // whitespace & comments
            whitespace: [
                [/[ \t\r\n]+/, 'white'],
                [/^\s*=begin\b/, 'comment', '@comment'],
                [/#.*$/, 'comment'],
            ],
            comment: [
                [/[^=]+/, 'comment'],
                [/^\s*=begin\b/, 'comment.invalid'],
                [/^\s*=end\b.*/, 'comment', '@pop'],
                [/[=]/, 'comment']
            ],
        }
    };
});
