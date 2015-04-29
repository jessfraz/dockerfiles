/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
/// <reference path="../../declare/node.d.ts" />
'use strict';
define(["require", "exports", 'fs', 'path', './search', '../../lib/strings', '../../lib/uri', '../../lib/mime'], function (require, exports, fs, npath, search, strings, uri, mime) {
    function readlinesAsync(filename, perLineCallback, options, callback) {
        fs.open(filename, 'r', null, function (error, fd) {
            if (error) {
                return callback(error);
            }
            var buffer = new Buffer(options.bufferLength);
            var pos, i;
            var line = '';
            var lineNumber = 0;
            var lastBufferHadTraillingCR = false;
            function call(n) {
                line += buffer.toString('utf8', pos, i + n);
                perLineCallback(line, lineNumber);
                line = '';
                lineNumber++;
                pos = i + n;
            }
            function readFile(clb) {
                fs.read(fd, buffer, 0, buffer.length, null, function (error, bytesRead, buffer) {
                    if (error) {
                        return clb(error);
                    }
                    if (bytesRead === 0) {
                        return clb(null);
                    }
                    pos = 0;
                    i = 0;
                    if (pos === 0 && buffer.length > 3 && buffer[0] === 0xef && buffer[1] === 0xbb && buffer[2] === 0xbf) {
                        // remove UTF bom
                        pos = i = 3;
                    }
                    if (lastBufferHadTraillingCR) {
                        if (buffer[i] === 0x0a) {
                            call(1);
                            i++;
                        }
                        else {
                            call(0);
                        }
                        lastBufferHadTraillingCR = false;
                    }
                    for (; i < bytesRead; ++i) {
                        if (buffer[i] === 0x0a) {
                            call(1);
                        }
                        else if (buffer[i] === 0x0d) {
                            if (i + 1 === bytesRead) {
                                lastBufferHadTraillingCR = true;
                            }
                            else if (buffer[i + 1] === 0x0a) {
                                call(2);
                                i++;
                            }
                            else {
                                call(1);
                            }
                        }
                    }
                    line += buffer.toString('utf8', pos, bytesRead);
                    readFile(clb); // Continue reading
                });
            }
            readFile(function (error) {
                if (error) {
                    return callback(error);
                }
                if (line.length) {
                    perLineCallback(line, lineNumber);
                }
                fs.close(fd, function (error) {
                    callback(error);
                });
            });
        });
    }
    var Engine = (function () {
        function Engine(rootResources, walker, contentPattern, maxResults) {
            this.total = 0;
            this.worked = 0;
            this.rootResources = rootResources;
            this.walker = walker;
            this.contentPattern = strings.createRegExp(contentPattern.pattern, contentPattern.isRegExp, contentPattern.isCaseSensitive, contentPattern.isWordMatch);
            this.isCanceled = false;
            this.maxResults = maxResults;
            this.worked = 0;
            this.total = 0;
        }
        Engine.prototype.cancel = function () {
            this.isCanceled = true;
            this.walker.cancel();
        };
        Engine.prototype.search = function (onResult, onProgress, done) {
            var _this = this;
            var resultCounter = 0;
            var limitReached = false;
            var unwind = function (processed) {
                _this.worked += processed;
                // Emit progress()
                if (processed && !_this.isDone) {
                    onProgress({ total: _this.total, worked: _this.worked });
                }
                // Emit done()
                if (_this.worked === _this.total && _this.walkerIsDone && !_this.isDone) {
                    _this.isDone = true;
                    done(_this.walkerError);
                }
            };
            this.walker.walk(this.rootResources, function (result) {
                // Indicate progress to the outside
                _this.total++;
                onProgress({ total: _this.total, worked: _this.worked });
                // Check for matches
                var fileResource = uri.parse(result.resource);
                var absolutePath = npath.normalize(fileResource.path);
                // If the result is empty or we have reached the limit or we are canceled, ignore it
                if (limitReached || _this.isCanceled) {
                    return unwind(1);
                }
                // Need to detect mime type now to find out if the file is binary or not
                _this.isBinary(absolutePath, function (isBinary) {
                    // If the file does not have textual content, do not return it as a result
                    if (isBinary) {
                        return unwind(1);
                    }
                    // Process all lines of the file to search for pattern
                    var fileMatch = new search.FileMatch(fileResource);
                    var perLineCallback = function (line, lineNumber) {
                        var lineMatch = null;
                        var match = _this.contentPattern.exec(line);
                        while (match !== null && match[0].length > 0 && !limitReached && !_this.isCanceled) {
                            resultCounter++;
                            if (_this.maxResults && resultCounter >= _this.maxResults) {
                                limitReached = true;
                            }
                            if (lineMatch === null) {
                                lineMatch = new search.LineMatch(line, lineNumber);
                                fileMatch.addMatch(lineMatch);
                            }
                            lineMatch.addMatch(match.index, match[0].length);
                            match = _this.contentPattern.exec(line);
                        }
                    };
                    var doneCallback = function (error) {
                        // If the result is empty or we have reached the limit or we are canceled, ignore it
                        if (error || fileMatch.isEmpty() || _this.isCanceled) {
                            return unwind(1);
                        }
                        else {
                            onResult(fileMatch.serialize());
                            return unwind(1);
                        }
                    };
                    readlinesAsync(absolutePath, perLineCallback, { bufferLength: 8096 }, doneCallback);
                });
            }, function (error) {
                _this.walkerIsDone = true;
                _this.walkerError = error;
                unwind(0);
            });
        };
        Engine.prototype.isBinary = function (path, callback) {
            // Return early if we guess that the file is text or binary
            var mimes = mime.guessMimeTypes(path);
            if (mimes.indexOf(mime.MIME_TEXT) >= 0) {
                return callback(false);
            }
            if (mimes.indexOf(mime.MIME_BINARY) >= 0) {
                return callback(true);
            }
            // Otherwise do full blown detection
            return mime.detectMimesFromFile(path, function (error, result) {
                callback(!!error || result.mimes[result.mimes.length - 1] !== mime.MIME_TEXT);
            });
        };
        return Engine;
    })();
    exports.Engine = Engine;
});
