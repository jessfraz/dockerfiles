/**
 * Resolves tag names in abbreviations with implied name
 */
if (typeof module === 'object' && typeof define !== 'function') {
	var define = function (factory) {
		module.exports = factory(require, exports, module);
	};
}

define(function(require, exports, module) {
	var tagName = require('../../resolver/tagName');

	/**
	 * Resolves implicit node names in parsed tree
	 * @param {AbbreviationNode} tree
	 */
	function resolveNodeNames(tree) {
		tree.children.forEach(function(node) {
			if (node.hasImplicitName() || node.data('forceNameResolving')) {
				node._name = tagName.resolve(node.parent.name());
				node.data('nameResolved', true);
			}
			resolveNodeNames(node);
		});
		
		return tree;
	}

	return {
		postprocessor: resolveNodeNames
	};
});