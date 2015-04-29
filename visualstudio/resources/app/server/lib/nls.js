/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
'use strict';
define(["require", "exports", '../availableLanguages'], function (require, exports, availableLanguages) {
    function optimizeLanguageDescription(languages) {
        var result = {};
        Object.keys(languages).forEach(function (key) {
            var value = languages[key];
            var newValue = {};
            value.forEach(function (element) {
                newValue[element.toLowerCase()] = true;
            });
            result[key] = newValue;
        });
        return result;
    }
    var configuredLanguages = optimizeLanguageDescription(availableLanguages.languages);
    exports.DEFAULT_TAG = 'i-default';
    // See rfc 2616 & 4647 for details of this implementation
    function computeClientLanguages(acceptLanguage, optionalAvailableLanguages) {
        var availableLanguages;
        if (typeof optionalAvailableLanguages === 'undefined') {
            availableLanguages = configuredLanguages;
        }
        else {
            availableLanguages = optimizeLanguageDescription(optionalAvailableLanguages);
        }
        var acceptTags = [];
        if (acceptLanguage) {
            var languages = acceptLanguage.split(',');
            for (var i = 0; i < languages.length; i++) {
                var l = languages[i].trim();
                var idx = l.indexOf(';');
                var tag = null;
                var q = 1;
                if (idx === -1) {
                    tag = l;
                }
                else {
                    tag = l.substring(0, idx);
                    var rest = l.substring(idx + 1);
                    var matches = /(\s*q\s*=)([\.0-9]+)/.exec(rest);
                    if (matches.length === 3) {
                        q = parseFloat(matches[2]);
                    }
                }
                if (q > 0) {
                    acceptTags.push({
                        tag: tag,
                        q: q
                    });
                }
            }
        }
        var result = {};
        Object.keys(availableLanguages).forEach(function (key) {
            result[key] = findBestLanguageTag(availableLanguages[key], acceptTags);
        });
        return result;
    }
    exports.computeClientLanguages = computeClientLanguages;
    function findBestLanguageTag(options, acceptTags) {
        if (acceptTags.length === 0 || (acceptTags.length === 1 && acceptTags[0].tag === '*')) {
            return exports.DEFAULT_TAG;
        }
        else {
            var matches = [];
            acceptTags.forEach(function (tagInfo) {
                var tag = tagInfo.tag;
                var reductions = 0;
                while (tag !== null) {
                    if (options[tag]) {
                        break;
                    }
                    var idx = tag.lastIndexOf('-');
                    if (idx === -1) {
                        tag = null;
                    }
                    else {
                        tag = tag.substring(0, idx);
                        if (tag.length >= 2 && tag.substring(tag.length - 2) === '-x') {
                            tag = tag.substring(0, tag.length - 2);
                        }
                        reductions++;
                    }
                }
                if (tag !== null) {
                    matches.push({
                        reductions: reductions,
                        match: tag,
                        tagInfo: tagInfo
                    });
                }
            });
            if (matches.length === 0) {
                return exports.DEFAULT_TAG;
            }
            matches.sort(function (op1, op2) {
                var result = op1.reductions - op2.reductions;
                if (result !== 0) {
                    return result;
                }
                return op2.tagInfo.q - op1.tagInfo.q;
            });
            return matches[0].match;
        }
    }
});
