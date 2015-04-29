/**
 * Filter for outputting CSS and alike
 */
if (typeof module === 'object' && typeof define !== 'function') {
	var define = function (factory) {
		module.exports = factory(require, exports, module);
	};
}

define(function(require, exports, module) {
	/**
	 * Test if passed item is very first child in parsed tree
	 * @param {AbbreviationNode} item
	 */
	function isVeryFirstChild(item) {
		return item.parent && !item.parent.parent && !item.index();
	}

	return function process(tree, profile, level) {
		level = level || 0;
		
		tree.children.forEach(function(item) {
			if (!isVeryFirstChild(item) && profile.tag_nl !== false) {
				item.start = '\n' + item.start;
			}
			process(item, profile, level + 1);
		});
		
		return tree;
	};
});