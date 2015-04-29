/**
 * A filter for React.js (JSX):
 * ranames attributes like `class` and `for`
 * for proper representation in JSX
 */
if (typeof module === 'object' && typeof define !== 'function') {
	var define = function (factory) {
		module.exports = factory(require, exports, module);
	};
}

define(function(require, exports, module) {
	var attrMap = {
		'class': 'className',
		'for': 'htmlFor'
	};

	return function process(tree) {
		tree.children.forEach(function(item) {
			item._attributes.forEach(function(attr) {
				if (attr.name in attrMap) {
					attr.name = attrMap[attr.name]
				}
			});
			process(item);
		});

		return tree;
	};
});