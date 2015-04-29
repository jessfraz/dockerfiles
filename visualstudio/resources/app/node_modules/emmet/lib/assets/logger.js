/**
 * Simple logger for Emmet
 */
if (typeof module === 'object' && typeof define !== 'function') {
	var define = function (factory) {
		module.exports = factory(require, exports, module);
	};
}

define(function(require, exports, module) {
	return {
		log: function() {
			if (typeof console != 'undefined' && console.log) {
				console.log.apply(console, arguments);
			}
		}
	}
})