/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
/// <reference path='../declare/node.d.ts' />
'use strict';
define(["require", "exports", './stream'], function (require, exports, stream) {
    exports.UTF8 = 'utf8';
    exports.UTF16be = 'utf16be';
    exports.UTF16le = 'utf16le';
    function detectBOMFromBuffer(buffer, bytesRead) {
        if (!buffer || bytesRead < 2) {
            return null;
        }
        var b0 = buffer.readUInt8(0);
        var b1 = buffer.readUInt8(1);
        // UTF-16 BE
        if (b0 === 0xFE && b1 === 0xFF) {
            return exports.UTF16be;
        }
        // UTF-16 LE
        if (b0 === 0xFF && b1 === 0xFE) {
            return exports.UTF16le;
        }
        if (bytesRead < 3) {
            return null;
        }
        var b2 = buffer.readUInt8(2);
        // UTF-8
        if (b0 === 0xEF && b1 === 0xBB && b2 === 0xBF) {
            return exports.UTF8;
        }
        return null;
    }
    exports.detectBOMFromBuffer = detectBOMFromBuffer;
    ;
    /**
     * Detects the Byte Order Mark in a given file.
     * If no BOM is detected, `encoding` will be null.
     */
    function detectBOM(file, callback) {
        stream.readExactlyByFile(file, 3, function (err, buffer, bytesRead) {
            if (err) {
                return callback(err, null);
            }
            return callback(null, detectBOMFromBuffer(buffer, bytesRead));
        });
    }
    exports.detectBOM = detectBOM;
    function getBOMBuffer(encoding) {
        switch (encoding) {
            case exports.UTF8:
                return new Buffer([0xEF, 0xBB, 0xBF]);
            case exports.UTF16be:
                return new Buffer([0xFE, 0xFF]);
            case exports.UTF16le:
                return new Buffer([0xFF, 0xFE]);
            default:
                return null;
        }
    }
    exports.getBOMBuffer = getBOMBuffer;
});
