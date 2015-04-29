/**
 * Filter for trimming "select" attributes from some tags that contains
 * child elements
 */
if (typeof module === 'object' && typeof define !== 'function') {
	var define = function (factory) {
		module.exports = factory(require, exports, module);
	};
}

define(function(require, exports, module) {
	var abbrUtils = require('../utils/abbreviation');

	var tags = {
		'xsl:variable': 1,
		'xsl:with-param': 1
	};
	
	/**
	 * Removes "select" attribute from node
	 * @param {AbbreviationNode} node
	 */
	function trimAttribute(node) {
		node.start = node.start.replace(/\s+select\s*=\s*(['"]).*?\1/, '');
	}

	return function process(tree) {
		tree.children.forEach(function(item) {
			if (!abbrUtils.isSnippet(item)
					&& (item.name() || '').toLowerCase() in tags 
					&& item.children.length)
				trimAttribute(item);
			process(item);
		});
		
		return tree;
	};
});