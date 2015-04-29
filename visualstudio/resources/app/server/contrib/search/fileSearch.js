/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
/// <reference path='../../declare/node.d.ts' />
'use strict';
define(["require", "exports", 'fs', 'path', '../../lib/flow', '../../lib/types', '../../lib/uri', '../../lib/strings'], function (require, exports, fs, npath, flow, types, uri, strings) {
    var CamelCaseExp = (function () {
        function CamelCaseExp(pattern) {
            this.pattern = pattern.toLowerCase();
        }
        CamelCaseExp.prototype.test = function (value) {
            if (value.length === 0) {
                return false;
            }
            var pattern = this.pattern.toLowerCase();
            var result;
            var i = 0;
            while (i < value.length && !(result = matches(pattern, value, 0, i))) {
                i = nextAnchor(value, i + 1);
            }
            return result;
        };
        return CamelCaseExp;
    })();
    exports.CamelCaseExp = CamelCaseExp;
    function isUpper(c) {
        var code = c.charCodeAt(0);
        return 65 <= code && code <= 90;
    }
    function isNumber(c) {
        var code = c.charCodeAt(0);
        return 48 <= code && code <= 57;
    }
    function nextAnchor(value, start) {
        var c;
        for (var i = start; i < value.length; i++) {
            c = value[i];
            if (isUpper(c) || isNumber(c)) {
                return i;
            }
        }
        return value.length;
    }
    function matches(pattern, value, patternIndex, valueIndex) {
        if (patternIndex === pattern.length) {
            return true;
        }
        if (valueIndex === value.length) {
            return false;
        }
        if (pattern[patternIndex] !== value[valueIndex].toLowerCase()) {
            return false;
        }
        var nextUpperIndex = valueIndex + 1;
        var result = matches(pattern, value, patternIndex + 1, valueIndex + 1);
        while (!result && (nextUpperIndex = nextAnchor(value, nextUpperIndex)) < value.length) {
            result = matches(pattern, value, patternIndex + 1, nextUpperIndex);
            nextUpperIndex++;
        }
        return result;
    }
    function isCamelCasePattern(pattern) {
        return (/^\w[\w.]*$/).test(pattern);
    }
    var FilePatterns = (function () {
        function FilePatterns(expressions) {
            this.expressions = [];
            for (var i = 0; i < expressions.length; i++) {
                var expression = expressions[i];
                var exp;
                // Match all
                if (!expression.pattern) {
                    exp = { test: function () { return true; } };
                }
                else if (expression.isRegExp) {
                    try {
                        exp = new RegExp(expression.pattern, 'i');
                    }
                    catch (e) {
                        if (e instanceof SyntaxError) {
                            exp = { test: function () { return true; } };
                        }
                        else {
                            throw e;
                        }
                    }
                }
                else if (isCamelCasePattern(expression.pattern)) {
                    exp = new CamelCaseExp(expression.pattern);
                }
                else {
                    if (expression.pattern.charCodeAt(0) === FilePatterns._dot) {
                        expression.pattern = '*' + expression.pattern; // convert a .<something> to a *.<something> query
                    }
                    // escape to regular expressions
                    expression.pattern = strings.anchorPattern(strings.convertSimple2RegExpPattern(expression.pattern), true, false);
                    exp = new RegExp(expression.pattern, 'i');
                }
                this.expressions.push(exp);
            }
        }
        FilePatterns.prototype.test = function (value) {
            for (var i = 0; i < this.expressions.length; i++) {
                var exp = this.expressions[i];
                if (exp.test(value)) {
                    return exp;
                }
            }
            return null;
        };
        FilePatterns._dot = '.'.charCodeAt(0);
        return FilePatterns;
    })();
    exports.FilePatterns = FilePatterns;
    var FileWalker = (function () {
        function FileWalker(patterns, excludeResources, includeResources) {
            this.patterns = new FilePatterns(patterns);
            this.excludeResources = {};
            this.includeResources = [];
            var i = 0;
            if (excludeResources) {
                for (i = 0; i < excludeResources.length; i++) {
                    this.excludeResources[excludeResources[i]] = true;
                }
            }
            if (includeResources) {
                for (var j = 0; j < includeResources.length; j++) {
                    this.includeResources.push(includeResources[j]);
                }
            }
            this.ignoreDerivedJS = true;
            if (patterns.some(function (p) { return strings.endsWith(p.pattern, '.js'); })) {
                this.ignoreDerivedJS = false;
            }
        }
        FileWalker.prototype.walk = function (rootResources, onResult, done) {
            var _this = this;
            // For each root
            flow.parallel(rootResources, function (rootResource, perEntryCallback) {
                var rootResourceTyped = uri.parse(rootResource);
                // Read folder
                fs.readdir(rootResourceTyped.path, function (error, files) {
                    if (_this.isCanceled) {
                        return perEntryCallback(null, null);
                    }
                    if (error) {
                        // Not a folder - deal with file result then
                        if (error.code === FileWalker.ENOTDIR) {
                            return _this.doWalk(uri.file(npath.dirname(rootResourceTyped.path)), [npath.basename(rootResourceTyped.path)], onResult, perEntryCallback);
                        }
                        if (FileWalker.ERRORS_TO_IGNORE.some(function (ignore) { return error.code === ignore; })) {
                            return perEntryCallback(null, null);
                        }
                        return perEntryCallback(error, null);
                    }
                    return _this.doWalk(rootResourceTyped, files, onResult, perEntryCallback);
                });
            }, function (err, result) {
                done(err ? err[0] : null);
            });
        };
        FileWalker.prototype.cancel = function () {
            this.isCanceled = true;
        };
        FileWalker.prototype.doWalk = function (location, files, onResult, done) {
            var _this = this;
            if (this.ignoreDerivedJS) {
                files = this.filterDerivedJSFiles(files);
            }
            // Execute tasks on each file in parallel to optimize throughput 
            flow.parallel(files, function (file, clb) {
                var currentResource = uri.file(npath.join(location.path, file));
                // Check canceled
                if (_this.isCanceled) {
                    return clb(null);
                }
                // Check exclude patterns
                if (_this.excludeResources.hasOwnProperty(currentResource.toString())) {
                    return clb(null);
                }
                // Check include patterns
                if (_this.includeResources.length > 0 && !_this.includeResources.some(function (resource) {
                    return currentResource.toString().indexOf(resource) === 0 || resource.indexOf(currentResource.toString() + '/') === 0; // continue if current folder is parent or equal to included
                })) {
                    return clb(null);
                }
                // Try to read dir
                fs.readdir(currentResource.path, function (error, children) {
                    // Handle directory
                    if (!error) {
                        return _this.doWalk(currentResource, children, onResult, clb);
                    }
                    // Handle file
                    if (error.code === FileWalker.ENOTDIR && !!_this.patterns.test(file) && !_this.isCanceled) {
                        onResult({
                            resource: currentResource.toString()
                        });
                    }
                    // Unwind
                    return clb(null);
                });
            }, function (error) {
                if (error) {
                    error = types.coalesce(error); // find any error by removing null values first
                }
                return done(error && error.length > 0 ? error[0] : null, null);
            });
        };
        FileWalker.prototype.filterDerivedJSFiles = function (files) {
            var derivedFiles = {};
            files.forEach(function (path) {
                var sourceExt = npath.extname(path);
                var target = FileWalker.IGNORE_DERIVED_JS[sourceExt];
                if (target) {
                    var derivedFile = path.slice(0, path.length - sourceExt.length) + target;
                    derivedFiles[derivedFile] = true;
                }
            });
            return files.filter(function (path) {
                return !derivedFiles[path];
            });
        };
        FileWalker.IGNORE_DERIVED_JS = {
            '.ts': '.js' // TODO FIXLATER This should be configurable on per workspace/project level
        };
        FileWalker.ERRORS_TO_IGNORE = ['EPERM', 'ENOENT', 'EBUSY'];
        FileWalker.ENOTDIR = 'ENOTDIR';
        return FileWalker;
    })();
    exports.FileWalker = FileWalker;
    var Engine = (function () {
        function Engine(rootResources, patterns, excludeResources, includeResources) {
            this.rootResources = rootResources;
            this.walker = new FileWalker(patterns, excludeResources, includeResources);
        }
        Engine.prototype.search = function (onResult, onProgress, done) {
            this.walker.walk(this.rootResources, onResult, done);
        };
        Engine.prototype.cancel = function () {
            this.walker.cancel();
        };
        return Engine;
    })();
    exports.Engine = Engine;
});
