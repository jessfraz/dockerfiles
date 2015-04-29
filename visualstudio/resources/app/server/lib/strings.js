/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
/// <reference path="../declare/node.d.ts" />
'use strict';
define(["require", "exports", 'string_decoder'], function (require, exports, sd) {
    function startsWith(haystack, needle) {
        return haystack.substring(0, needle.length) === needle;
    }
    exports.startsWith = startsWith;
    function endsWith(haystack, needle) {
        if (needle.length > haystack.length) {
            return false;
        }
        return haystack.substring(haystack.length - needle.length) === needle;
    }
    exports.endsWith = endsWith;
    function ltrim(haystack, needle) {
        if (haystack.length === 0 || needle.length === 0) {
            return haystack;
        }
        var str = haystack;
        while (startsWith(str, needle)) {
            str = str.substring(needle.length);
        }
        return str;
    }
    exports.ltrim = ltrim;
    function rtrim(haystack, needle) {
        if (haystack.length === 0 || needle.length === 0) {
            return haystack;
        }
        var str = haystack;
        while (endsWith(str, needle)) {
            str = str.substring(0, str.length - needle.length);
        }
        return str;
    }
    exports.rtrim = rtrim;
    function trim(haystack, needle) {
        if (needle === void 0) { needle = ' '; }
        var trimmed = ltrim(haystack, needle);
        return rtrim(trimmed, needle);
    }
    exports.trim = trim;
    function escapeSpecialCharacters(value) {
        var result = [];
        for (var i = 0; i < value.length; i++) {
            var ch = value.charAt(i);
            switch (ch) {
                case '\'':
                    result.push('\\\'');
                    break;
                case '"':
                    result.push('\\"');
                    break;
                case '\\':
                    result.push('\\\\');
                    break;
                case '\n':
                    result.push('\\n');
                    break;
                case '\r':
                    result.push('\\r');
                    break;
                case '\t':
                    result.push('\\t');
                    break;
                case '\b':
                    result.push('\\b');
                    break;
                case '\f':
                    result.push('\\f');
                    break;
                default:
                    result.push(ch);
            }
        }
        return result.join('');
    }
    exports.escapeSpecialCharacters = escapeSpecialCharacters;
    /**
     * The empty string.
     */
    exports.empty = '';
    function createRegExp(searchString, isRegex, matchCase, wholeWord) {
        if (searchString === '') {
            throw new Error('Cannot create regex from empty string');
        }
        if (!isRegex) {
            searchString = searchString.replace(/[\-\\\{\}\*\+\?\|\^\$\.\,\[\]\(\)\#\s]/g, '\\$&');
        }
        if (wholeWord) {
            if (!/\B/.test(searchString.charAt(0))) {
                searchString = '\\b' + searchString;
            }
            if (!/\B/.test(searchString.charAt(searchString.length - 1))) {
                searchString = searchString + '\\b';
            }
        }
        var modifiers = 'g';
        if (!matchCase) {
            modifiers += 'i';
        }
        return new RegExp(searchString, modifiers);
    }
    exports.createRegExp = createRegExp;
    function anchorPattern(value, start, end) {
        if (start) {
            value = '^' + value;
        }
        if (end) {
            value = value + '$';
        }
        return value;
    }
    exports.anchorPattern = anchorPattern;
    function convertSimple2RegExpPattern(pattern) {
        return pattern.replace(/[\-\\\{\}\+\?\|\^\$\.\,\[\]\(\)\#\s]/g, '\\$&').replace(/[\*]/g, '.*');
    }
    exports.convertSimple2RegExpPattern = convertSimple2RegExpPattern;
    function isCamelCasePattern(pattern) {
        return (/^\w[\w.]*$/).test(pattern);
    }
    exports.isCamelCasePattern = isCamelCasePattern;
    function isFalsyOrWhitespace(s) {
        return !s || !s.trim();
    }
    exports.isFalsyOrWhitespace = isFalsyOrWhitespace;
    /**
     * Helper to produce a string with a variable number of arguments. Insert variable segments
     * into the string using the {n} notation where N is the index of the argument following the string.
     */
    function format(value) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        if (args.length === 0) {
            return value;
        }
        var str = value;
        var len = args.length;
        for (var i = 0; i < len; i++) {
            str = replaceAll(str, '{' + i + '}', args[i]);
        }
        return str;
    }
    exports.format = format;
    exports.bind = format;
    /**
     * Searches for all occurances of needle in haystack and replaces them with replacement.
     */
    function replaceAll(haystack, needle, replacement) {
        return haystack.replace(new RegExp(escapeRegExpCharacters(needle.toString()), 'g'), replacement);
    }
    exports.replaceAll = replaceAll;
    /**
     * Escapes regular expression characters in a given string
     */
    function escapeRegExpCharacters(value) {
        return value.replace(/[\-\\\{\}\*\+\?\|\^\$\.\,\[\]\(\)\#\s]/g, '\\$&');
    }
    exports.escapeRegExpCharacters = escapeRegExpCharacters;
    // Escape codes
    // http://en.wikipedia.org/wiki/ANSI_escape_code
    var EL = /\x1B\x5B[12]?K/g; // Erase in line
    var LF = /\xA/g; // line feed
    var COLOR_START = /\x1b\[\d+m/g; // Color
    var COLOR_END = /\x1b\[0?m/g; // Color
    function removeAnsiEscapeCodes(str) {
        if (str) {
            str = str.replace(EL, '');
            str = str.replace(LF, '\n');
            str = str.replace(COLOR_START, '');
            str = str.replace(COLOR_END, '');
        }
        return str;
    }
    exports.removeAnsiEscapeCodes = removeAnsiEscapeCodes;
    function pad(n, l, rep) {
        if (rep === void 0) { rep = '0'; }
        var r = '' + n;
        while (r.length < l) {
            r = rep + r;
        }
        return r;
    }
    exports.pad = pad;
    function formatDate(date) {
        if (date === void 0) { date = new Date(); }
        return format('{0}-{1}-{2} {3}:{4}:{5}', pad(date.getMonth() + 1, 2), pad(date.getDate(), 2), pad(date.getFullYear(), 4), pad(date.getHours(), 2), pad(date.getMinutes(), 2), pad(date.getSeconds(), 2));
    }
    exports.formatDate = formatDate;
    function formatUTCDate(date) {
        if (date === void 0) { date = new Date(); }
        return format('UTC {0}-{1}-{2} {3}:{4}:{5}', pad(date.getUTCMonth() + 1, 2), pad(date.getUTCDate(), 2), pad(date.getUTCFullYear(), 4), pad(date.getUTCHours(), 2), pad(date.getUTCMinutes(), 2), pad(date.getUTCSeconds(), 2));
    }
    exports.formatUTCDate = formatUTCDate;
    function capitalize(str) {
        return str.replace(/^[a-z]/, function (c) {
            return c.toUpperCase();
        });
    }
    exports.capitalize = capitalize;
    /**
     * Returns a function that can be used to check if subsequent strings start
     * with on of the provided strings.
     * @param prefixes An array of valid prefixes
     */
    function prefixMatcher(prefixes) {
        var root = { ch: 0, children: [] };
        for (var i = 0, len = prefixes.length; i < len; i++) {
            var parent = root, prefix = prefixes[i];
            for (var j = 0, prefixLen = prefix.length; j < prefixLen; j++) {
                parent = addChild(parent, prefix.charCodeAt(j));
            }
        }
        return function (candidate) {
            var node = root;
            for (var i = 0, len = candidate.length; !!node.children && i < len; i++) {
                node = findChild(node, candidate.charCodeAt(i));
                if (!node) {
                    return false;
                }
            }
            return !!node.children;
        };
    }
    exports.prefixMatcher = prefixMatcher;
    function findChild(n, ch) {
        if (!n.children) {
            return null;
        }
        for (var i = 0, len = n.children.length; i < len; i++) {
            if (n.children[i].ch === ch) {
                return n.children[i];
            }
        }
        return null;
    }
    function addChild(parent, ch) {
        if (!parent.children) {
            parent.children = [{ ch: ch, children: null }];
            return parent.children[0];
        }
        else {
            var len = parent.children.length;
            for (var i = 0; i < len; i++) {
                if (parent.children[i].ch === ch) {
                    return parent.children[i];
                }
            }
            parent.children.push({ ch: ch, children: null });
            return parent.children[len];
        }
    }
    /**
     * Convinient way to iterate over output line by line. This helper accomodates for the fact that
     * a buffer might not end with new lines all the way.
     *
     * To use:
     * - call the write method
     * - forEach() over the result to get the lines
     */
    var LineDecoder = (function () {
        function LineDecoder(encoding) {
            if (encoding === void 0) { encoding = 'utf8'; }
            this.stringDecoder = new sd.StringDecoder(encoding);
            this.remaining = null;
        }
        LineDecoder.prototype.write = function (buffer) {
            var result = [];
            var value = this.remaining ? this.remaining + this.stringDecoder.write(buffer) : this.stringDecoder.write(buffer);
            if (value.length < 1) {
                return result;
            }
            var start = 0;
            var ch;
            while (start < value.length && ((ch = value.charCodeAt(start)) === 13 || ch === 10)) {
                start++;
            }
            var idx = start;
            while (idx < value.length) {
                ch = value.charCodeAt(idx);
                if (ch === 13 || ch === 10) {
                    result.push(value.substring(start, idx));
                    idx++;
                    while (idx < value.length && ((ch = value.charCodeAt(idx)) === 13 || ch === 10)) {
                        idx++;
                    }
                    start = idx;
                }
                else {
                    idx++;
                }
            }
            this.remaining = start < value.length ? value.substr(start) : null;
            return result;
        };
        LineDecoder.prototype.end = function () {
            return this.remaining;
        };
        return LineDecoder;
    })();
    exports.LineDecoder = LineDecoder;
});
