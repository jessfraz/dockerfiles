/**
 * Pasted content abbreviation processor. A pasted content is a content that
 * should be inserted into implicitly repeated abbreviation nodes.
 * This processor powers “Wrap With Abbreviation” action
 */
if (typeof module === 'object' && typeof define !== 'function') {
	var define = function (factory) {
		module.exports = factory(require, exports, module);
	};
}

define(function(require, exports, module) {
	var utils = require('../../utils/common');
	var abbrUtils = require('../../utils/abbreviation');
	var stringStream = require('../../assets/stringStream');
	var range = require('../../assets/range');

	var outputPlaceholder = '$#';
	
	/**
	 * Locates output placeholders inside text
	 * @param {String} text
	 * @returns {Array} Array of ranges of output placeholder in text
	 */
	function locateOutputPlaceholder(text) {
		var result = [];
		
		var stream = stringStream.create(text);
		
		while (!stream.eol()) {
			if (stream.peek() == '\\') {
				stream.next();
			} else {
				stream.start = stream.pos;
				if (stream.match(outputPlaceholder, true)) {
					result.push(range.create(stream.start, outputPlaceholder));
					continue;
				}
			}
			stream.next();
		}
		
		return result;
	}
	
	/**
	 * Replaces output placeholders inside <code>source</code> with 
	 * <code>value</code>
	 * @param {String} source
	 * @param {String} value
	 * @returns {String}
	 */
	function replaceOutputPlaceholders(source, value) {
		var ranges = locateOutputPlaceholder(source);
		
		ranges.reverse().forEach(function(r) {
			source = utils.replaceSubstring(source, value, r);
		});
		
		return source;
	}
	
	/**
	 * Check if parsed node contains output placeholder – a target where
	 * pasted content should be inserted
	 * @param {AbbreviationNode} node
	 * @returns {Boolean}
	 */
	function hasOutputPlaceholder(node) {
		if (locateOutputPlaceholder(node.content).length)
			return true;
		
		// check if attributes contains placeholder
		return !!utils.find(node.attributeList(), function(attr) {
			return !!locateOutputPlaceholder(attr.value).length;
		});
	}
	
	/**
	 * Insert pasted content into correct positions of parsed node
	 * @param {AbbreviationNode} node
	 * @param {String} content
	 * @param {Boolean} overwrite Overwrite node content if no value placeholders
	 * found instead of appending to existing content
	 */
	function insertPastedContent(node, content, overwrite) {
		var nodesWithPlaceholders = node.findAll(function(item) {
			return hasOutputPlaceholder(item);
		});
		
		if (hasOutputPlaceholder(node))
			nodesWithPlaceholders.unshift(node);
		
		if (nodesWithPlaceholders.length) {
			nodesWithPlaceholders.forEach(function(item) {
				item.content = replaceOutputPlaceholders(item.content, content);
				item._attributes.forEach(function(attr) {
					attr.value = replaceOutputPlaceholders(attr.value, content);
				});
			});
		} else {
			// on output placeholders in subtree, insert content in the deepest
			// child node
			var deepest = node.deepestChild() || node;
			if (overwrite) {
				deepest.content = content;
			} else {
				deepest.content = abbrUtils.insertChildContent(deepest.content, content);
			}
		}
	}

	return {
		pastedContent: function(item) {
			var content = item.data('paste');
			if (Array.isArray(content)) {
				return content[item.counter - 1];
			} else if (typeof content === 'function') {
				return content(item.counter - 1, item.content);
			} else if (content) {
				return content;
			}
		},

		/**
		 * @param {AbbreviationNode} tree
		 * @param {Object} options
		 */
		preprocessor: function(tree, options) {
			if (options.pastedContent) {
				var lines = utils.splitByLines(options.pastedContent, true).map(utils.trim);
				
				// set repeat count for implicitly repeated elements before
				// tree is unrolled
				tree.findAll(function(item) {
					if (item.hasImplicitRepeat) {
						item.data('paste', lines);
						return item.repeatCount = lines.length;
					}
				});
			}
		},

		/**
		 * @param {AbbreviationNode} tree
		 * @param {Object} options
		 */
		postprocessor: function(tree, options) {
			var that = this;
			// for each node with pasted content, update text data
			var targets = tree.findAll(function(item) {
				var pastedContent = that.pastedContent(item);
				if (pastedContent) {
					insertPastedContent(item, pastedContent, !!item.data('pasteOverwrites'));
				}
				
				return !!pastedContent;
			});
			
			if (!targets.length && options.pastedContent) {
				// no implicitly repeated elements, put pasted content in
				// the deepest child
				insertPastedContent(tree, options.pastedContent);
			}
		}
	};
});