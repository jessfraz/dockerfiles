/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
'use strict';
define(["require", "exports", 'http', 'https', './system'], function (require, exports, http, https, winjs) {
    exports.crlf = '\r\n';
    function writeChunked(stream, header, data) {
        // write custom headers
        Object.keys(header).forEach(function (key) {
            var value = header[key];
            stream.write(key);
            stream.write(':');
            stream.write(String(value));
            stream.write(exports.crlf);
        });
        var dataAsString = data.toString();
        // write content length
        stream.write('X-Chunk-Length:');
        stream.write(String(dataAsString.length));
        stream.write(exports.crlf);
        // write content
        stream.write(exports.crlf);
        stream.write(dataAsString);
    }
    exports.writeChunked = writeChunked;
    function _request(requestFn, options, requestController) {
        var canceled = false;
        return new winjs.Promise(function (c, e, p) {
            var request = requestFn(options, function (res) {
                res.setEncoding('utf8');
                var data = '';
                res.on('data', function (chunk) { return data += chunk; });
                res.on('end', function () {
                    c({
                        statusCode: res.statusCode,
                        headers: res.headers,
                        content: data
                    });
                });
            });
            request.on('error', function (err) {
                e(err);
            });
            requestController(request.end.bind(request), request.write.bind(request));
        }, function () {
            canceled = true;
        });
    }
    function request(options, requestController) {
        return _request(http.request.bind(http), options, requestController || (function (end) {
            end();
        }));
    }
    exports.request = request;
    function secureRequest(options, requestController) {
        return _request(https.request.bind(https), options, requestController || (function (end) {
            end();
        }));
    }
    exports.secureRequest = secureRequest;
});
