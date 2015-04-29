/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/

// Start up code in node js with a module system.

var isAMD = true;// TODO@AMD

exports.load = function(opts, loadCallback) {
	var mainModule = opts.mainModule || null;
	var mainRequire = opts.mainRequire || null;
	var relativeModulePath = opts.relativeModulePath || null;
	var bufferProcessMessages = opts.bufferProcessMessages || false;
	if (isAMD) {
		var loader = require('./loader');
		var path = require('path');
		
		var absoluteModulePath;
		if (mainModule) {
			absoluteModulePath = path.join(path.dirname(mainModule.filename), relativeModulePath);
		} else {
			absoluteModulePath = relativeModulePath;
		}
		
		if (!mainRequire) {
			mainRequire = require;
		}
		
		if (absoluteModulePath.indexOf(__dirname) !== 0) {
			console.error('Cannot load absoluteModulePath ' + absoluteModulePath + ' because it is not inside  ' + __dirname);
			return;
		}
		
		var relativeModulePathToMe = './' + absoluteModulePath.substr(__dirname.length + 1).replace(/\\/g, '/');
		
		loader.config({
		    nodeRequire: mainRequire,
		    nodeMain: __filename,
		});
		
		if (bufferProcessMessages) {
			// Cache process.on('message') for 10s since loading is asynchronous with AMD
			var shouldRecordMessages = true,
				recordedMessages = [],
				actualOnProcessMessage = null;
				
			process.on('message', function (msg) {
				if (actualOnProcessMessage) {
					actualOnProcessMessage(msg);
					return;
				}
				if (shouldRecordMessages) {
					recordedMessages.push(msg);
				}
			});
			
			// Stop recording if there's no listener within 10s
			setTimeout(function () {
				shouldRecordMessages = false;
				recordedMessages = [];
			}, 10 * 1000 /* 10s */);
			
			var original = process.on;
			process.on = function (what, callback) {
				if (what !== 'message') {
					original.call(process, what, callback);
					return;
				}
	
				actualOnProcessMessage = callback;
				
				// Flush recorded messages
				shouldRecordMessages = false;
				recordedMessages.forEach(function (msg) { callback(msg); });
			};
		}
		
		loader([relativeModulePathToMe], loadCallback, function (err) { console.error(err); });
	} else {
		loadCallback(mainRequire(relativeModulePath));
	}
}
