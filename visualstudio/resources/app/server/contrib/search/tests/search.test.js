/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
/// <reference path="../../../declare/mocha.d.ts" />
/// <reference path="../../../declare/node.d.ts" />
'use strict';
define(["require", "exports", 'path', 'assert', '../../../lib/uri', '../ipcRawSearchService', '../fileSearch', '../textSearch'], function (require, exports, path, assert, uri, rawsearch, fileSearch, textSearch) {
    function count(promise, filter) {
        if (filter === void 0) { filter = function () { return true; }; }
        var count = 0;
        return promise.then(function () { return count; }, null, function (data) {
            if (!filter(data) || data.total) {
                return;
            }
            var lineMatches = data.lineMatches;
            if (lineMatches) {
                for (var i = 0; i < lineMatches.length; i++) {
                    var line = lineMatches[i];
                    var wordMatches = line.offsetAndLengths;
                    count += wordMatches.length;
                }
            }
            else {
                count++;
            }
        });
    }
    function wrap(done, promise) {
        promise.done(function () { return done(); }, done);
    }
    suite('Search');
    test('Search#File Async', function (done) {
        var pattern = {
            pattern: '*.ts'
        };
        var engine = new fileSearch.Engine([uri.file(path.join(__dirname, 'data')).toString()], [pattern], null, null);
        var count = 0;
        engine.search(function (result) {
            if (result) {
                count++;
            }
        }, function () {
        }, function (error) {
            assert.ok(!error);
            assert.ok(count === 4);
            done();
        });
    });
    test('Search#File Async (through process, some results)', function (done) {
        var service = rawsearch.createService();
        wrap(done, count(service.fileSearch([uri.file(path.join(__dirname, 'data')).toString()], [{ pattern: '*.*', modifiers: 'i' }], [], [])).then(function (total) {
            assert.equal(total, 6);
        }));
    });
    test('Search#File Async (through process, no results)', function (done) {
        var service = rawsearch.createService();
        wrap(done, count(service.fileSearch([uri.file(path.join(__dirname, 'data')).toString()], [{ pattern: '*.as', modifiers: 'i' }], [], [])).then(function (total) {
            assert.equal(total, 0);
        }));
    });
    test('Search#Text Async', function (done) {
        var filePattern = {
            pattern: '*.ts',
            modifiers: 'i'
        };
        var contentPattern = {
            pattern: 'GameOfLife',
            modifiers: 'i'
        };
        var count = 0;
        var engine = new textSearch.Engine([uri.file(path.join(__dirname, 'data')).toString()], new fileSearch.FileWalker([filePattern], null, null), contentPattern);
        engine.search(function (result) {
            if (result) {
                count++;
            }
        }, function () {
        }, function (error) {
            assert.ok(!error);
            assert.ok(count === 1);
            done();
        });
    });
    test('Search#Text Async (process, many results)', function (done) {
        var service = rawsearch.createService();
        wrap(done, count(service.textSearch([uri.file(path.join(__dirname, 'data')).toString()], [{
            pattern: '*.*',
            modifiers: 'i'
        }], [], [], {
            pattern: 'e',
            modifiers: 'i'
        })).then(function (total) {
            assert.equal(total, 706);
        }));
    });
    test('Search#Text Async (process, many results capped)', function (done) {
        var service = rawsearch.createService();
        wrap(done, count(service.textSearch([uri.file(path.join(__dirname, 'data')).toString()], [{
            pattern: '*.*',
            modifiers: 'i'
        }], [], [], {
            pattern: 'a',
            modifiers: 'i'
        }, 1024)).then(function (total) {
            assert.equal(total, 1024);
        }));
    });
    test('Search#Text Async (process, no results)', function (done) {
        var service = rawsearch.createService();
        wrap(done, count(service.textSearch([uri.file(path.join(__dirname, 'data')).toString()], [{
            pattern: '*.*',
            modifiers: 'i'
        }], [], [], {
            pattern: 'foobarfoo',
            modifiers: 'i'
        }), function (data) { return data.message && data.severity === 1; }).then(function (total) {
            assert.equal(total, 0);
        }));
    });
});
