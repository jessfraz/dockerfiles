/**
 * Comment important tags (with 'id' and 'class' attributes)
 */
if (typeof module === 'object' && typeof define !== 'function') {
	var define = function (factory) {
		module.exports = factory(require, exports, module);
	};
}

define(function(require, exports, module) {
	var prefs = require('../assets/preferences');
	var utils = require('../utils/common');
	var template = require('../utils/template');
	var abbrUtils = require('../utils/abbreviation');
	var filterCore = require('./main');
	
	prefs.define('filter.commentAfter', 
			'\n<!-- /<%= attr("id", "#") %><%= attr("class", ".") %> -->',
			'A definition of comment that should be placed <i>after</i> matched '
			+ 'element when <code>comment</code> filter is applied. This definition '
			+ 'is an ERB-style template passed to <code>_.template()</code> '
			+ 'function (see Underscore.js docs for details). In template context, '
			+ 'the following properties and functions are availabe:\n'
			+ '<ul>'
			
			+ '<li><code>attr(name, before, after)</code> – a function that outputs' 
			+ 'specified attribute value concatenated with <code>before</code> ' 
			+ 'and <code>after</code> strings. If attribute doesn\'t exists, the ' 
			+ 'empty string will be returned.</li>'
			
			+ '<li><code>node</code> – current node (instance of <code>AbbreviationNode</code>)</li>'
			
			+ '<li><code>name</code> – name of current tag</li>'
			
			+ '<li><code>padding</code> – current string padding, can be used ' 
			+ 'for formatting</li>'
			
			+'</ul>');
	
	prefs.define('filter.commentBefore', 
			'',
			'A definition of comment that should be placed <i>before</i> matched '
			+ 'element when <code>comment</code> filter is applied. '
			+ 'For more info, read description of <code>filter.commentAfter</code> '
			+ 'property');
	
	prefs.define('filter.commentTrigger', 'id, class',
			'A comma-separated list of attribute names that should exist in abbreviatoin '
			+ 'where comment should be added. If you wish to add comment for '
			+ 'every element, set this option to <code>*</code>');
	
	/**
	 * Add comments to tag
	 * @param {AbbreviationNode} node
	 */
	function addComments(node, templateBefore, templateAfter) {
		// check if comments should be added
		var trigger = prefs.get('filter.commentTrigger');
		if (trigger != '*') {
			var shouldAdd = utils.find(trigger.split(','), function(name) {
				return !!node.attribute(utils.trim(name));
			});

			if (!shouldAdd) {
				return;
			}
		}
		
		var ctx = {
			node: node,
			name: node.name(),
			padding: node.parent ? node.parent.padding : '',
			attr: function(name, before, after) {
				var attr = node.attribute(name);
				if (attr) {
					return (before || '') + attr + (after || '');
				}
				
				return '';
			}
		};
		
		var nodeBefore = templateBefore ? templateBefore(ctx) : '';
		var nodeAfter = templateAfter ? templateAfter(ctx) : '';
		
		node.start = node.start.replace(/</, nodeBefore + '<');
		node.end = node.end.replace(/>/, '>' + nodeAfter);
	}
	
	function process(tree, before, after) {
		tree.children.forEach(function(item) {
			if (abbrUtils.isBlock(item)) {
				addComments(item, before, after);
			}
			
			process(item, before, after);
		});
			
		return tree;
	}

	return function(tree) {
		var templateBefore = template(prefs.get('filter.commentBefore'));
		var templateAfter = template(prefs.get('filter.commentAfter'));
		
		return process(tree, templateBefore, templateAfter);
	};
});
