/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/

(function () {
	
	var isAMD = (typeof exports === 'undefined' && typeof define === 'function' && define.amd);
	var isWindows = /^win/.test(process.platform);
	
	if (isWindows) {
		if (isAMD) {
			define(['edge'], function (edge) {
				return edge;
			});
		} else {
			module.exports = require('edge');
		}
	} else {
		var fakeEdge = {
			func: function () {
				throw new Error('edge is not available on this platform');
			}
		};
		
		if (isAMD) {
			define(fakeEdge);
		} else {
			module.exports = fakeEdge;
		}
	}
})();