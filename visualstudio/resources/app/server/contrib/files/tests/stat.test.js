/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
/// <reference path="../../../declare/mocha.d.ts" />
/// <reference path="../../../declare/node.d.ts" />
'use strict';
define(["require", "exports", 'fs', 'path', 'assert', '../stat', '../../../model/workspace', '../../../lib/uri'], function (require, exports, fs, path, assert, stat, workspace, uri) {
    suite('Model stat');
    function getTestWorkspace() {
        var data = {
            id: 'foo',
            path: path.join(__dirname, '..'),
            name: 'BarFoo'
        };
        return new workspace.Workspace(data);
    }
    function create(fsStat, workspace, workspaceRelativePath) {
        return new stat.Stat(uri.file(path.join(workspace.toAbsolutePath(), workspaceRelativePath)), workspace.toAbsolutePath(), workspaceRelativePath, fsStat.isDirectory(), fsStat.mtime.getTime(), fsStat.size);
    }
    test('stat#create', function () {
        var testWorkspace = getTestWorkspace();
        var fsstat = fs.statSync(path.join(__dirname, 'stat.test.ts'));
        var statObj = create(fsstat, testWorkspace, '/stat.test.ts');
        assert.ok(!statObj.isDirectory);
        assert.equal(statObj.name, 'stat.test.ts');
        fsstat = fs.statSync(path.join(__dirname, '..'));
        statObj = create(fsstat, testWorkspace, '/tests');
        assert.ok(statObj.isDirectory);
    });
    test('stat#serializeFile', function (done) {
        var testWorkspace = getTestWorkspace();
        var fsstat = fs.statSync(path.join(__dirname, 'stat.test.ts'));
        var statObj = create(fsstat, testWorkspace, '/tests/stat.test.ts');
        statObj.serialize(null, function (error, serialized) {
            assert.equal(error, null);
            assert.ok(serialized);
            assert.deepEqual(path.basename(serialized.path), 'stat.test.ts');
            done();
        });
    });
    test('stat#serializeDirectory', function (done) {
        var testsElements = ['data', 'stat.test.ts', 'stat.test.js', 'filewatcher.test.ts', 'filewatcher.test.js'];
        var testWorkspace = getTestWorkspace();
        var fsstat = fs.statSync(path.join(__dirname, '..'));
        var statObj = create(fsstat, testWorkspace, '/tests');
        assert.ok(statObj.isDirectory);
        statObj.serialize(null, function (error, serialized) {
            assert.equal(error, null);
            assert.ok(serialized);
            assert.ok(serialized.children);
            assert.ok(serialized.hasChildren);
            assert.ok(serialized.isDirectory);
            assert.equal(serialized.children.length, testsElements.length);
            assert.ok(serialized.children.every(function (entry) {
                return testsElements.some(function (name) {
                    return path.basename(entry.path) === name;
                });
            }));
            serialized.children.forEach(function (value) {
                assert.ok(path.basename(value.path));
                if (path.basename(value.path) === 'data') {
                    assert.ok(value.isDirectory);
                    assert.ok(value.hasChildren);
                }
                else if (path.basename(value.path) === 'stat.test.ts') {
                    assert.ok(!value.isDirectory);
                    assert.ok(value.hasChildren === false);
                }
                else if (path.basename(value.path) === 'stat.test.js') {
                    assert.ok(!value.isDirectory);
                    assert.ok(value.hasChildren === false);
                }
                else {
                    assert.ok(!'Unexpected value ' + path.basename(value.path));
                }
            });
            done();
        });
    });
    test('stat#serializeDirectory - with resolveTo set to single directory', function (done) {
        var assertCount = 0;
        var expectedAsserts = 11;
        var testWorkspace = getTestWorkspace();
        var fsstat = fs.statSync(path.join(__dirname, '..'));
        var statObj = create(fsstat, testWorkspace, '/tests');
        assert.ok(statObj.isDirectory);
        assertCount++;
        statObj.serialize({ resolveTo: ['/tests/data/examples'] }, function (error, serialized) {
            assert.equal(error, null);
            assertCount++;
            assert.ok(serialized);
            assertCount++;
            assert.ok(serialized.children);
            assertCount++;
            assert.ok(serialized.hasChildren);
            assertCount++;
            assert.ok(serialized.isDirectory);
            assertCount++;
            var children = serialized.children;
            assert.ok(children.length === 5);
            assertCount++;
            for (var i = 0; i < children.length; i++) {
                var child = children[i];
                if (path.basename(child.path) === 'data') {
                    assert.ok(child.hasChildren);
                    assertCount++;
                    assert.ok(child.children.length === 4);
                    assertCount++;
                    for (var j = 0; j < child.children.length; j++) {
                        var childchild = child.children[j];
                        if (path.basename(childchild.path) === 'examples') {
                            assert.equal(childchild.children.length, 4);
                            assertCount++;
                        }
                        else if (path.basename(childchild.path) === 'other') {
                            assert.ok(!childchild.children);
                            assertCount++;
                        }
                    }
                }
            }
            assert.ok(assertCount === expectedAsserts, "Did not run all assertions?");
            done();
        });
    });
    test('stat#serializeDirectory - with resolveTo set to multiple directory', function (done) {
        var assertCount = 0;
        var expectedAsserts = 12;
        var testWorkspace = getTestWorkspace();
        var fsstat = fs.statSync(path.join(__dirname, '..'));
        var statObj = create(fsstat, testWorkspace, '/tests');
        assert.ok(statObj.isDirectory);
        assertCount++;
        statObj.serialize({ resolveTo: ['/tests/data/other/deep', '/tests/data/examples'] }, function (error, serialized) {
            assert.equal(error, null);
            assertCount++;
            assert.ok(serialized);
            assertCount++;
            assert.ok(serialized.children);
            assertCount++;
            assert.ok(serialized.hasChildren);
            assertCount++;
            assert.ok(serialized.isDirectory);
            assertCount++;
            var children = serialized.children;
            assert.ok(children.length === 5);
            assertCount++;
            for (var i = 0; i < children.length; i++) {
                var child = children[i];
                if (path.basename(child.path) === 'data') {
                    assert.ok(child.hasChildren);
                    assertCount++;
                    assert.ok(child.children.length === 4);
                    assertCount++;
                    for (var j = 0; j < child.children.length; j++) {
                        var childchild = child.children[j];
                        if (path.basename(childchild.path) === 'examples') {
                            assert.equal(childchild.children.length, 4);
                            assertCount++;
                        }
                        else if (path.basename(childchild.path) === 'other') {
                            assert.ok(childchild.children.length === 1);
                            assertCount++;
                            assert.ok(childchild.children[0].children.length === 4);
                            assertCount++;
                        }
                    }
                }
            }
            assert.ok(assertCount === expectedAsserts, "Did not run all assertions?");
            done();
        });
    });
    test('stat#serializeDirectory - with resolveSingleChildFolders', function (done) {
        var assertCount = 0;
        var expectedAsserts = 4;
        var testWorkspace = getTestWorkspace();
        var fsstat = fs.statSync(path.join(__dirname, '..'));
        var statObj = create(fsstat, testWorkspace, '/tests/data/other');
        assert.ok(statObj.isDirectory);
        assertCount++;
        statObj.serialize({ resolveSingleChildDescendants: true }, function (error, serialized) {
            assert.equal(error, null);
            assertCount++;
            assert.ok(serialized.children.length === 1);
            assertCount++;
            assert.ok(serialized.children[0].children.length === 4);
            assertCount++;
            assert.ok(assertCount === expectedAsserts, "Did not run all assertions?");
            done();
        });
    });
});
