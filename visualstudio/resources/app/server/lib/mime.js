/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
/// <reference path="../declare/node.d.ts" />
/// <reference path="../declare/express.d.ts" />
/**
 * Lots of binary file types exists where the type can be determined by matching the first few bytes against some "magic patterns".
 * E.g. PDF files always start with %PDF- and the rest of the file contains mostly text, but sometimes binary data (for fonts and images).
 * In order to detect these types correctly (and independently from the file's extension), the content base mime type detection must be performed
 * on any file, not only on text files.
 *
 * Here is the original mime type detection in pseudocode:
 *
 * var mimes = [];
 *
 * read file extension
 *
 * if (file extension matches) {
 * 	if (file extension is bogus) {
 * 		// ignore.
 * 		// this covers *.manifest files which can contain arbitrary content, so the extension is of no value.
 * 		// a consequence of this is that the content based mime type becomes the most specific type in the array
 * 	} else {
 * 		mimes.push(associated mime type)	  // first element: most specific
 * 	}
 * }
 *
 * read file contents
 *
 * if (content based match found) {	// this is independent from text or binary
 * 	mimes.push(associated mime type)
 * 	if (a second mime exists for the match) {   // should be rare; text/plain should never be included here
 * 		// e.g. for svg: ['image/svg+xml', 'application/xml']
 * 		mimes.push(second mime)
 * 	}
 * }
 *
 * if (content == text)
 * 	mimes.push('text/plain')   // last element: least specific
 * else
 * 	mimes.push('application/octet-stream')    // last element: least specific
 */
'use strict';
define(["require", "exports", 'fs', 'path', './strings', './stream', './encoding'], function (require, exports, fs, npath, strings, stream, encoding) {
    // Some well known mimes
    exports.MIME_TEXT = 'text/plain';
    exports.MIME_BINARY = 'application/octet-stream';
    exports.MIME_UNKNOWN = 'application/unknown';
    // Extra mime types based on filename
    var fileNameToTextMime = {
        'jakefile': 'text/javascript',
        'makefile': 'text/x-makefile',
    };
    // Extra mime types based on content patterns (strings on left hand side are case-insensitive)  
    var contentToMime = {
        '<!doctype html': ['text/html', 'application/xml'],
        '#!/usr/bin/env node': ['text/javascript'],
        '%pdf-': ['application/pdf']
    };
    // List of known text mimes
    var knownTextMimes = {
        '.html': 'text/html',
        '.htm': 'text/html',
        '.shtml': 'text/html',
        '.mdoc': 'text/html',
        '.jsp': 'text/html',
        '.jshtm': 'text/x-jshtm',
        '.js': 'text/javascript',
        '.json': 'application/json',
        '.css': 'text/css',
        '.less': 'text/x-less',
        '.txt': 'text/plain',
        '.gitignore': 'text/plain',
        '.dtd': 'application/xml-dtd',
        '.php': 'application/x-php',
        '.ctp': 'application/x-php',
        '.md': 'text/x-web-markdown',
        '.markdown': 'text/x-web-markdown',
        '.mdown': 'text/x-web-markdown',
        '.mkdn': 'text/x-web-markdown',
        '.mkd': 'text/x-web-markdown',
        '.mdwn': 'text/x-web-markdown',
        '.mdtxt': 'text/x-web-markdown',
        '.mdtext': 'text/x-web-markdown',
        '.dot': 'text/x-dot',
        '.cshtml': 'text/x-cshtml',
        '.handlebars': 'text/x-handlebars-template',
        '.hbs': 'text/x-handlebars-template',
        '.scss': 'text/x-scss'
    };
    // List of known binary mimes
    var knownBinaryMimes = {
        '.bmp': 'image/bmp',
        '.gif': 'image/gif',
        '.jpg': 'image/jpg',
        '.jpeg': 'image/jpg',
        '.jpe': 'image/jpg',
        '.png': 'image/png',
        '.tiff': 'image/tiff',
        '.tif': 'image/tiff',
        '.ico': 'image/x-icon',
        '.tga': 'image/x-tga',
        '.psd': 'image/vnd.adobe.photoshop',
        '.mid': 'audio/midi',
        '.midi': 'audio/midi',
        '.mp4a': 'audio/mp4',
        '.mpga': 'audio/mpeg',
        '.mp2': 'audio/mpeg',
        '.mp2a': 'audio/mpeg',
        '.mp3': 'audio/mpeg',
        '.m2a': 'audio/mpeg',
        '.m3a': 'audio/mpeg',
        '.oga': 'audio/ogg',
        '.ogg': 'audio/ogg',
        '.spx': 'audio/ogg',
        '.aac': 'audio/x-aac',
        '.wav': 'audio/x-wav',
        '.wma': 'audio/x-ms-wma',
        '.mp4': 'video/mp4',
        '.mp4v': 'video/mp4',
        '.mpg4': 'video/mp4',
        '.mpeg': 'video/mpeg',
        '.mpg': 'video/mpeg',
        '.mpe': 'video/mpeg',
        '.m1v': 'video/mpeg',
        '.m2v': 'video/mpeg',
        '.ogv': 'video/ogg',
        '.qt': 'video/quicktime',
        '.mov': 'video/quicktime',
        '.webm': 'video/webm',
        '.mkv': 'video/x-matroska',
        '.mk3d': 'video/x-matroska',
        '.mks': 'video/x-matroska',
        '.wmv': 'video/x-ms-wmv',
        '.flv': 'video/x-flv',
        '.avi': 'video/x-msvideo',
        '.exe': 'application/x-msdownload-exe',
        '.dll': 'application/x-msdownload',
        '.com': 'application/x-msdownload',
        '.msi': 'application/x-msdownload',
        '.pdf': 'application/pdf',
        '.doc': 'application/msword',
        '.dot': 'application/msword',
        '.ppt': 'application/vnd.ms-powerpoint',
        '.pps': 'application/vnd.ms-powerpoint',
        '.pot': 'application/vnd.ms-powerpoint',
        '.xls': 'application/vnd.ms-excel',
        '.xlm': 'application/vnd.ms-excel',
        '.xla': 'application/vnd.ms-excel',
        '.xlc': 'application/vnd.ms-excel',
        '.xlt': 'application/vnd.ms-excel',
        '.xlw': 'application/vnd.ms-excel',
        '.zip': 'application/zip',
        '.rar': 'application/x-rar-compressed',
        '.iso': 'application/x-iso9660-image',
        '.dmg': 'application/x-apple-diskimage',
        '.bin': 'application/octet-stream',
        '.tar': 'application/x-tar',
        '.gz': 'application/x-gzip',
        '.7z': 'application/x-7z-compressed',
        '.cab': 'application/vnd.ms-cab-compressed',
        '.ttf': 'application/x-font-ttf',
        '.jar': 'application/java-archive',
        '.ai': 'application/postscript',
        '.swf': 'application/x-shockwave-flash',
        '.aif': 'audio/x-aiff',
        '.odt': 'application/vnd.oasis.opendocument.text',
        '.so': 'application/octet-stream',
        '.obj': 'application/octet-stream',
        '.class': 'application/java-vm',
        '.jnilib': 'application/octet-stream',
        '.woff': 'application/x-font-woff',
        '.suo': 'application/octet-stream',
        '.deb': 'application/x-debian-package',
        '.sit': 'application/x-stuffit',
        '.sitx': 'application/x-stuffitx',
        '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        '.dotx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.template',
        '.rtf': 'application/rtf',
        '.war': 'application/octet-stream',
        '.pdb': 'application/vnd.palm',
        '.xap': 'application/x-silverlight-app',
        '.lnk': 'application/octet-stream',
        '.mdb': 'application/x-msaccess',
        '.nupkg': 'application/octet-stream',
        '.cspkg': 'application/octet-stream',
        '.cer': 'application/pkix-cert',
        '.node': 'application/octet-stream',
        '.sl': 'application/octet-stream',
        '.snk': 'application/octet-stream',
        '.chm': 'application/vnd.ms-htmlhelp',
        '.reg': 'application/octet-stream',
        '.xcf': 'application/octet-stream',
        '.eot': 'application/vnd.ms-fontobject',
        '.bson': 'application/octet-stream',
        '.cache': 'application/octet-stream',
        '.pyc': 'application/octet-stream',
        '.movie': 'video/x-sgi-movie',
        '.pyo': 'application/octet-stream',
        '.out': 'application/output'
    };
    function doDetectMimesFromStream(instream, callback) {
        stream.readExactlyByStream(instream, 512, function (err, buffer, bytesRead) {
            handleReadResult(err, buffer, bytesRead, callback);
        });
    }
    function doDetectMimesFromFile(absolutePath, callback) {
        stream.readExactlyByFile(absolutePath, 512, function (err, buffer, bytesRead) {
            handleReadResult(err, buffer, bytesRead, callback);
        });
    }
    function handleReadResult(err, buffer, bytesRead, callback) {
        if (err) {
            return callback(err, null);
        }
        return callback(null, doDetectMimesFromBuffer(buffer, bytesRead));
    }
    function doDetectMimesFromBuffer(buffer, bytesRead) {
        var enc = encoding.detectBOMFromBuffer(buffer, bytesRead);
        var mimes = doDetectMimesFromContent(enc, buffer, bytesRead);
        var isText = true;
        // Detect 0 bytes to see if file is binary (ignore for UTF 16 though)
        if (enc !== encoding.UTF16be && enc !== encoding.UTF16le) {
            for (var i = 0; i < bytesRead; i++) {
                if (buffer.readInt8(i) === 0) {
                    isText = false;
                    break;
                }
            }
        }
        mimes.push(isText ? exports.MIME_TEXT : exports.MIME_BINARY);
        return {
            mimes: mimes,
            encoding: enc
        };
    }
    function doDetectMimesFromContent(enc, buffer, bytesRead) {
        if (bytesRead === 0 || !buffer) {
            return [];
        }
        // check for utf8 BOM
        var startpos = 0;
        if (enc !== null) {
            if (enc === encoding.UTF8) {
                startpos = 3; // prepare for skipping BOM
            }
            else {
                return []; // we dont auto detect from other encodings yet
            }
        }
        // detect common magic strings that identify content types (e.g. XML declaration)
        var preamble = buffer.toString(encoding.UTF8, startpos, bytesRead).toLowerCase();
        for (var key in contentToMime) {
            if (contentToMime.hasOwnProperty(key) && strings.startsWith(preamble, key.toLowerCase())) {
                return contentToMime[key].slice(0);
            }
        }
        return [];
    }
    function filterAndSortMimes(detectedMimes, guessedMimes) {
        var mimes = detectedMimes;
        // Add extension based mime as first element as this is the desire of whoever created the file.
        // Never care about application/octet-stream or application/unknown as guessed mime, as this is the fallback of the guess which is never accurate
        var guessedMime = guessedMimes[0];
        if (guessedMime !== exports.MIME_BINARY && guessedMime !== exports.MIME_UNKNOWN) {
            mimes.unshift(guessedMime);
        }
        // Remove duplicate elements from array and sort unspecific mime to the end
        var uniqueSortedMimes = mimes.filter(function (element, position) {
            return element && mimes.indexOf(element) === position;
        }).sort(function (mimeA, mimeB) {
            if (mimeA === exports.MIME_BINARY) {
                return 1;
            }
            if (mimeB === exports.MIME_BINARY) {
                return -1;
            }
            if (mimeA === exports.MIME_TEXT) {
                return 1;
            }
            if (mimeB === exports.MIME_TEXT) {
                return -1;
            }
            return 0;
        });
        return uniqueSortedMimes;
    }
    /**
     * Opens the given stream to detect its mime type. Returns an array of mime types sorted from most specific to unspecific.
     * @param instream the readable stream to detect the mime types from.
     * @param nameHint an additional hint that can be used to detect a mime from a file extension.
     */
    function detectMimesFromStream(instream, nameHint, callback) {
        doDetectMimesFromStream(instream, function (error, result) {
            handleMimeResult(nameHint, error, result, callback);
        });
    }
    exports.detectMimesFromStream = detectMimesFromStream;
    /**
     * Opens the given file to detect its mime type. Returns an array of mime types sorted from most specific to unspecific.
     * @param absolutePath the pabsolute ath of the file.
     */
    function detectMimesFromFile(absolutePath, callback) {
        doDetectMimesFromFile(absolutePath, function (error, result) {
            handleMimeResult(absolutePath, error, result, callback);
        });
    }
    exports.detectMimesFromFile = detectMimesFromFile;
    function handleMimeResult(nameHint, error, result, callback) {
        if (error) {
            return callback(error, null);
        }
        var filterAndSortedMimes = filterAndSortMimes(result.mimes, guessMimeTypes(nameHint));
        result.mimes = filterAndSortedMimes;
        callback(null, result);
    }
    /**
     * Opens the given file to detect its mime type. Returns an array of mime types sorted from most specific to unspecific.
     * @param absolutePath the pabsolute ath of the file.
     */
    function detectMimesFromFileSync(absolutePath) {
        var mimes = [];
        try {
            var fd = fs.openSync(absolutePath, 'r', null);
            var buffer = new Buffer(512);
            var bytesRead = fs.readSync(fd, buffer, 0, buffer.length, null);
            fs.closeSync(fd);
            mimes = doDetectMimesFromBuffer(buffer, bytesRead).mimes;
        }
        catch (err) {
            mimes.push(exports.MIME_BINARY); // In any error case opening the file, treat it as binary
        }
        return filterAndSortMimes(mimes, guessMimeTypes(absolutePath));
    }
    exports.detectMimesFromFileSync = detectMimesFromFileSync;
    /**
     * Guess mime types from a file name. Return application/unkonwn if the mime is not part of our known list
     * of text or binary mimes.
     */
    function guessMimeTypes(path) {
        path = path.toLowerCase();
        var filename = npath.basename(path);
        var extension = npath.extname(path);
        // Check for name match
        if (fileNameToTextMime[filename]) {
            var result = [fileNameToTextMime[filename]];
            result.push(exports.MIME_TEXT);
            return result;
        }
        // Check for text extension
        if (knownTextMimes[extension]) {
            var result = [knownTextMimes[extension]];
            if (knownTextMimes[extension] !== exports.MIME_TEXT) {
                result.push(exports.MIME_TEXT);
            }
            return result;
        }
        // Check for binary extension
        if (knownBinaryMimes[extension]) {
            var result = [knownBinaryMimes[extension]];
            if (knownBinaryMimes[extension] !== exports.MIME_BINARY) {
                result.push(exports.MIME_BINARY);
            }
            return result;
        }
        return [exports.MIME_UNKNOWN];
    }
    exports.guessMimeTypes = guessMimeTypes;
});
