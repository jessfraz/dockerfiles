/**
 * Processor function that matches parsed <code>AbbreviationNode</code>
 * against resources defined in <code>resource</code> module
 */ 
if (typeof module === 'object' && typeof define !== 'function') {
	var define = function (factory) {
		module.exports = factory(require, exports, module);
	};
}

define(function(require, exports, module) {
	var resources = require('../../assets/resources');
	var elements = require('../../assets/elements');
	var utils = require('../../utils/common');
	var abbreviationUtils = require('../../utils/abbreviation');

	/**
	 * Finds matched resources for child nodes of passed <code>node</code> 
	 * element. A matched resource is a reference to <i>snippets.json</i> entry
	 * that describes output of parsed node 
	 * @param {AbbreviationNode} node
	 * @param {String} syntax
	 */
	function matchResources(node, syntax, parser) {
		// do a shallow copy because the children list can be modified during
		// resource matching
		node.children.slice(0).forEach(function(child) {
			var r = resources.getMatchedResource(child, syntax);
			if (typeof r === 'string') {
				r = elements.create('snippet', r);
			}

			child.data('resource', r);
			var elemType = elements.type(r);

			if (elemType == 'snippet') {
				var content = r.data;
				var curContent = child._text || child.content;
				if (curContent) {
					content = abbreviationUtils.insertChildContent(content, curContent);
				}

				child.content = content;
			} else if (elemType == 'element') {
				child._name = r.name;
				if (Array.isArray(r.attributes)) {
					child._attributes = [].concat(r.attributes, child._attributes);
				}
			} else if (elemType == 'reference') {
				// it’s a reference to another abbreviation:
				// parse it and insert instead of current child
				/** @type AbbreviationNode */
				var subtree = parser.parse(r.data, {
					syntax: syntax
				});

				// if context element should be repeated, check if we need to 
				// transfer repeated element to specific child node
				if (child.repeatCount > 1) {
					var repeatedChildren = subtree.findAll(function(node) {
						return node.hasImplicitRepeat;
					});

					if (!repeatedChildren.length) {
						repeatedChildren = subtree.children
					}
					
					repeatedChildren.forEach(function(node) {
						node.repeatCount = child.repeatCount;
						node.hasImplicitRepeat = false;
					});
				}

				// move child‘s children into the deepest child of new subtree
				var deepestChild = subtree.deepestChild();
				if (deepestChild) {
					child.children.forEach(function(c) {
						deepestChild.addChild(c);
					});
					deepestChild.content = child.content;
				}

				// copy current attributes to children
				subtree.children.forEach(function(node) {
					child.attributeList().forEach(function(attr) {
						node.attribute(attr.name, attr.value);
					});
				});
				
				child.replace(subtree.children);
			}
			
			matchResources(child, syntax, parser);
		});
	}
	
	return {
		preprocessor: function(tree, options, parser) {
			var syntax = options.syntax || utils.defaultSyntax();
			matchResources(tree, syntax, parser);
		}
	};
});