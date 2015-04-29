/**
 * Output abbreviation on a single line (i.e. no line breaks)
 */
if (typeof module === 'object' && typeof define !== 'function') {
	var define = function (factory) {
		module.exports = factory(require, exports, module);
	};
}

define(function(require, exports, module) {
	var abbrUtils = require('../utils/abbreviation');
	var rePad = /^\s+/;
	var reNl = /[\n\r]/g;

	return function process(tree) {
		tree.children.forEach(function(item) {
			if (!abbrUtils.isSnippet(item)) {
				// remove padding from item 
				item.start = item.start.replace(rePad, '');
				item.end = item.end.replace(rePad, '');
			}
			
			// remove newlines 
			item.start = item.start.replace(reNl, '');
			item.end = item.end.replace(reNl, '');
			item.content = item.content.replace(reNl, '');
			
			process(item);
		});
		
		return tree;
	};
});
