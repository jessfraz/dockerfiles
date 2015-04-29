/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
/// <reference path="../declare/node.d.ts" />
/// <reference path="../declare/express.d.ts" />
/// <reference path="../declare/send.d.ts" />
'use strict';
define(["require", "exports", './errors', './performance', 'send'], function (require, exports, errors, performance, sendmodule) {
    /**
     * Sends the provided file identified by the given path to the client.
     */
    function send(req, res, path, next, root, maxAge) {
        performance.mark('extnet.send#Start', req);
        var sendStream = sendmodule(req, encodeURIComponent(path)); // Connect expects the path to be as it would come from a URL
        sendStream.hidden(true); // Allow to retrieve hidden files
        sendStream.index(null); // Disable index support
        if (root) {
            sendStream.root(root);
        }
        if (maxAge) {
            sendStream.maxage(maxAge);
        }
        sendStream.on('error', function () {
            next(errors.httpError(404, 'Not found'));
        });
        sendStream.on('end', function () {
            performance.mark('extnet.send#End', req);
        });
        sendStream.pipe(res);
    }
    exports.send = send;
});
