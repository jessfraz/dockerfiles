/*!---------------------------------------------------------
* Copyright (C) Microsoft Corporation. All rights reserved.
*--------------------------------------------------------*/
/// <reference path="./declare/node.d.ts" />
/// <reference path="./declare/atom-renderer.d.ts" />
'use strict';
var path = require('path');
var fs = require('fs');
var events = require('events');
var env = require('./env');
var dbPath = path.join(env.appHome, 'storage.json');
var database = null;
var EventTypes = {
    STORE: 'store'
};
var eventEmitter = new events.EventEmitter();
function onStore(clb) {
    eventEmitter.addListener(EventTypes.STORE, clb);
    return function () { return eventEmitter.removeListener(EventTypes.STORE, clb); };
}
exports.onStore = onStore;
function getItem(key) {
    if (!database) {
        database = load();
    }
    return database[key];
}
exports.getItem = getItem;
function setItem(key, data) {
    if (!database) {
        database = load();
    }
    // Shortcut for primitives that did not change
    if (typeof data === 'string' || typeof data === 'number' || typeof data === 'boolean') {
        if (database[key] === data) {
            return;
        }
    }
    var oldValue = database[key];
    database[key] = data;
    save();
    eventEmitter.emit(EventTypes.STORE, key, oldValue, data);
}
exports.setItem = setItem;
function removeItem(key) {
    if (!database) {
        database = load();
    }
    if (database[key]) {
        var oldValue = database[key];
        delete database[key];
        save();
        eventEmitter.emit(EventTypes.STORE, key, oldValue, null);
    }
}
exports.removeItem = removeItem;
function load() {
    try {
        return JSON.parse(fs.readFileSync(dbPath).toString());
    }
    catch (error) {
        if (env.cliArgs.verboseLogging) {
            console.error(error);
        }
        return {};
    }
}
function save() {
    fs.writeFileSync(dbPath, JSON.stringify(database, null, 4));
}
