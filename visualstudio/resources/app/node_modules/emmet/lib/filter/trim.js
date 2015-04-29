/**
 * Trim filter: removes characters at the beginning of the text
 * content that indicates lists: numbers, #, *, -, etc.
 * 
 * Useful for wrapping lists with abbreviation.
 */
if (typeof module === 'object' && typeof define !== 'function') {
	var define = function (factory) {
		module.exports = factory(require, exports, module);
	};
}

define(function(require, exports, module) {
	var prefs = require('../assets/preferences');
	prefs.define('filter.trimRegexp', 
		'[\\s|\\u00a0]*[\\d|#|\\-|\*|\\u2022]+\\.?\\s*',
		'Regular expression used to remove list markers (numbers, dashes, ' 
		+ 'bullets, etc.) in <code>t</code> (trim) filter. The trim filter '
		+ 'is useful for wrapping with abbreviation lists, pased from other ' 
		+ 'documents (for example, Word documents).');
	
	function process(tree, re) {
		tree.children.forEach(function(item) {
			if (item.content) {
				item.content = item.content.replace(re, '');
			}
			
			process(item, re);
		});
		
		return tree;
	}

	return function(tree) {
		var re = new RegExp(prefs.get('filter.trimRegexp'));
		return process(tree, re);
	};
});
