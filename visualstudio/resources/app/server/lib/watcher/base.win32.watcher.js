/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
/// <reference path="../../declare/node.d.ts" />
/// <reference path="../../declare/express.d.ts" />
'use strict';
define(["require", "exports", './watcher'], function (require, exports, watcher) {
    var FileDelta = (function () {
        function FileDelta(parent, name, changeType) {
            this._parent = parent;
            this._name = name;
            this._changeType = changeType;
            if (parent) {
                parent.addChild(this);
            }
        }
        Object.defineProperty(FileDelta.prototype, "name", {
            get: function () {
                return this._name;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FileDelta.prototype, "pathArray", {
            get: function () {
                return this.makePathArray(0);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FileDelta.prototype, "changeType", {
            get: function () {
                return this._changeType;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FileDelta.prototype, "renamed", {
            get: function () {
                return !!this._movedTo || !!this._movedFrom;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FileDelta.prototype, "movedFrom", {
            get: function () {
                return this._movedFrom;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FileDelta.prototype, "movedTo", {
            get: function () {
                return this._movedTo;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FileDelta.prototype, "parent", {
            get: function () {
                return this._parent;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FileDelta.prototype, "children", {
            get: function () {
                if (!this._children) {
                    return null;
                }
                else if (Array.isArray(this._children)) {
                    return this._children;
                }
                else {
                    return [this._children];
                }
            },
            enumerable: true,
            configurable: true
        });
        FileDelta.prototype.addChild = function (event) {
            if (!this._children) {
                this._children = event;
            }
            else if (Array.isArray(this._children)) {
                this._children.push(event);
            }
            else {
                this._children = [this._children, event];
            }
        };
        FileDelta.prototype.makePathArray = function (size) {
            if (this._parent === null) {
                return new Array(size);
            }
            else {
                var array = this._parent.makePathArray(size + 1);
                array[array.length - size - 1] = this._name;
                return array;
            }
        };
        FileDelta.prototype.setChangeType = function (value) {
            this._changeType = value;
        };
        FileDelta.prototype.setMovedFrom = function (delta) {
            this._movedFrom = delta;
        };
        FileDelta.prototype.clearMovedTo = function (clearMovedFrom) {
            if (this._movedTo) {
                if (clearMovedFrom) {
                    this._movedTo.clearMovedFrom(false);
                }
                delete this._movedTo;
            }
        };
        FileDelta.prototype.setMovedTo = function (delta) {
            this._movedTo = delta;
        };
        FileDelta.prototype.clearMovedFrom = function (clearMovedTo) {
            if (this._movedFrom) {
                if (clearMovedTo) {
                    this._movedFrom.clearMovedTo(false);
                }
                delete this._movedFrom;
            }
        };
        FileDelta.prototype.print = function (indent) {
            var buffer = [];
            for (var i = 0; i < indent; i++) {
                buffer.push('  ');
            }
            buffer.push(this._name);
            if (this._changeType !== null) {
                buffer.push(' - ');
                buffer.push(this.changeTypeToString(this._changeType));
            }
            console.log(buffer.join(''));
            var children = this.children;
            if (children) {
                for (var i = 0; i < children.length; i++) {
                    children[i].print(indent + 1);
                }
            }
        };
        FileDelta.prototype.changeTypeToString = function (changeType) {
            switch (changeType) {
                case watcher.ChangeTypes.CHANGED:
                    return 'changed';
                case watcher.ChangeTypes.CREATED:
                    return 'created';
                case watcher.ChangeTypes.DELETED:
                    return 'deleted';
            }
        };
        return FileDelta;
    })();
    exports.FileDelta = FileDelta;
    var Win32DeltaBuilder = (function () {
        function Win32DeltaBuilder() {
            this.stringMap = Object.create(null);
            this.deltaMap = Object.create(null);
            this.root = new FileDelta(null, '', null);
            this.deltaMap[this.root.name] = this.root;
        }
        Win32DeltaBuilder.prototype.processEvent = function (event) {
            if (!event.path) {
                this.root.setChangeType(Win32DeltaBuilder.changeTypeMap[event.changeType]);
            }
            else {
                var fileDelta = this.deltaMap[event.path];
                var index;
                var parent;
                if (event.changeType <= 2) {
                    // We have a CHANGED, CREATED or DELETED
                    if (fileDelta) {
                        var currentChangeType = fileDelta.changeType;
                        var newChangeType = Win32DeltaBuilder.changeTypeMap[event.changeType];
                        if (currentChangeType === watcher.ChangeTypes.DELETED && newChangeType === watcher.ChangeTypes.CREATED) {
                            fileDelta.setChangeType(watcher.ChangeTypes.CHANGED);
                            fileDelta.clearMovedTo(true);
                        }
                        else if (currentChangeType === watcher.ChangeTypes.CREATED && newChangeType === watcher.ChangeTypes.CHANGED) {
                        }
                        else {
                            fileDelta.setChangeType(newChangeType);
                        }
                    }
                    else {
                        index = event.path.lastIndexOf('\\');
                        parent = this.getParentFileDelta(event.path, index);
                        fileDelta = new FileDelta(parent, this.getCachedName(event.path.substring(index + 1)), Win32DeltaBuilder.changeTypeMap[event.changeType]);
                        this.deltaMap[event.path] = fileDelta;
                    }
                }
                else {
                    // We have a RENAMED
                    var renameEvent = event;
                    var targetDelta = fileDelta;
                    if (targetDelta) {
                        if (targetDelta.changeType !== watcher.ChangeTypes.CHANGED) {
                            targetDelta.setChangeType(watcher.ChangeTypes.CREATED);
                        }
                    }
                    else {
                        index = event.path.lastIndexOf('\\');
                        parent = this.getParentFileDelta(event.path, index);
                        targetDelta = new FileDelta(parent, this.getCachedName(event.path.substring(index + 1)), watcher.ChangeTypes.CREATED);
                        this.deltaMap[event.path] = targetDelta;
                    }
                    var sourceDelta = this.deltaMap[renameEvent.oldPath];
                    if (sourceDelta) {
                        sourceDelta.setChangeType(watcher.ChangeTypes.DELETED);
                    }
                    else {
                        index = renameEvent.oldPath.lastIndexOf('\\');
                        parent = this.getParentFileDelta(renameEvent.oldPath, index);
                        sourceDelta = new FileDelta(parent, this.getCachedName(renameEvent.oldPath.substring(index + 1)), watcher.ChangeTypes.DELETED);
                        this.deltaMap[renameEvent.oldPath] = sourceDelta;
                    }
                    targetDelta.setMovedFrom(sourceDelta);
                    sourceDelta.setMovedTo(targetDelta);
                }
            }
        };
        Win32DeltaBuilder.prototype.getParentFileDelta = function (path, index) {
            if (index === void 0) { index = path.lastIndexOf('\\'); }
            if (index === -1) {
                return this.root;
            }
            else {
                var parentPath = path.substring(0, index);
                var result = this.deltaMap[parentPath];
                if (result) {
                    return result;
                }
                else {
                    index = parentPath.lastIndexOf('\\');
                    var parent = this.getParentFileDelta(parentPath, index);
                    var name = parentPath.substring(index + 1);
                    result = new FileDelta(parent, this.getCachedName(name), null);
                    this.deltaMap[parentPath] = result;
                    return result;
                }
            }
        };
        Win32DeltaBuilder.prototype.getCachedName = function (name) {
            var result = this.stringMap[name];
            if (result) {
                return result;
            }
            this.stringMap[name] = name;
            return name;
        };
        Win32DeltaBuilder.changeTypeMap = [watcher.ChangeTypes.CHANGED, watcher.ChangeTypes.CREATED, watcher.ChangeTypes.DELETED];
        return Win32DeltaBuilder;
    })();
    exports.Win32DeltaBuilder = Win32DeltaBuilder;
});
