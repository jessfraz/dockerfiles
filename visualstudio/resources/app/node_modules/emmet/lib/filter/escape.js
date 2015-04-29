/**
 * Filter for escaping unsafe XML characters: <, >, &
 */
if (typeof module === 'object' && typeof define !== 'function') {
	var define = function (factory) {
		module.exports = factory(require, exports, module);
	};
}

define(function(require, exports, module) {
	var charMap = {
		'<': '&lt;',
		'>': '&gt;',
		'&': '&amp;'
	};
	
	function escapeChars(str) {
		return str.replace(/([<>&])/g, function(str, p1){
			return charMap[p1];
		});
	}
	
	return function process(tree) {
		tree.children.forEach(function(item) {
			item.start = escapeChars(item.start);
			item.end = escapeChars(item.end);
			item.content = escapeChars(item.content);
			process(item);
		});
		
		return tree;
	};
});