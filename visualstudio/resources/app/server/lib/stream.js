/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
/// <reference path="../declare/node.d.ts" />
'use strict';
define(["require", "exports", 'fs', './system', './types'], function (require, exports, fs, winjs, types) {
    /**
     * Reads up to total bytes from the provided stream.
     */
    function readExactlyByStream(stream, totalBytes, callback) {
        var done = false;
        var buffer = new Buffer(totalBytes);
        var bytesRead = 0;
        stream.on('data', function (data) {
            var bytesToRead = Math.min(totalBytes - bytesRead, data.length);
            data.copy(buffer, bytesRead, 0, bytesToRead);
            bytesRead += bytesToRead;
            if (bytesRead === totalBytes) {
                stream.destroy(); // Will trigger the close event eventually
            }
        });
        stream.on('error', function (e) {
            if (!done) {
                done = true;
                callback(e, null, null);
            }
        });
        var onSuccess = function () {
            if (!done) {
                done = true;
                callback(null, buffer, bytesRead);
            }
        };
        stream.on('close', onSuccess);
    }
    exports.readExactlyByStream = readExactlyByStream;
    function consume(stream) {
        var buffer = '';
        var done = false;
        return new winjs.TPromise(function (c, e) {
            stream.on('data', function (data) {
                if (Buffer.isBuffer(data)) {
                    buffer += data.toString();
                }
                else if (types.isString(data)) {
                    buffer += data;
                }
            });
            stream.on('error', function (err) {
                if (!done) {
                    done = true;
                    e(err);
                }
            });
            var onSuccess = function () {
                if (!done) {
                    done = true;
                    c(buffer);
                }
            };
            stream.on('close', onSuccess);
            stream.on('end', onSuccess);
        });
    }
    exports.consume = consume;
    /**
     * Reads totalBytes from the provided file.
     */
    function readExactlyByFile(file, totalBytes, callback) {
        fs.open(file, 'r', null, function (err, fd) {
            if (err) {
                return callback(err, null, 0);
            }
            function end(err, resultBuffer, bytesRead) {
                fs.close(fd, function (closeError) {
                    if (closeError) {
                        return callback(closeError, null, bytesRead);
                    }
                    if (err && err.code === 'EISDIR') {
                        return callback(err, null, bytesRead); // we want to bubble this error up (file is actually a folder)
                    }
                    return callback(null, resultBuffer, bytesRead);
                });
            }
            var buffer = new Buffer(totalBytes);
            var bytesRead = 0;
            var zeroAttempts = 0;
            function loop() {
                fs.read(fd, buffer, bytesRead, totalBytes - bytesRead, null, function (err, moreBytesRead) {
                    if (err) {
                        return end(err, null, 0);
                    }
                    // Retry up to N times in case 0 bytes where read
                    if (moreBytesRead === 0) {
                        if (++zeroAttempts === 10) {
                            return end(null, buffer, bytesRead);
                        }
                        return loop();
                    }
                    bytesRead += moreBytesRead;
                    if (bytesRead === totalBytes) {
                        return end(null, buffer, bytesRead);
                    }
                    return loop();
                });
            }
            loop();
        });
    }
    exports.readExactlyByFile = readExactlyByFile;
});
