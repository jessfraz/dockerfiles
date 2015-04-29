/**
 * Filter for producing Jade code from abbreviation.
 */
if (typeof module === 'object' && typeof define !== 'function') {
	var define = function (factory) {
		module.exports = factory(require, exports, module);
	};
}

define(function(require, exports, module) {
	var utils = require('../utils/common');
	var abbrUtils = require('../utils/abbreviation');
	var formatFilter = require('./format');
	var tabStops = require('../assets/tabStops');
	var profile = require('../assets/profile');

	var reNl = /[\n\r]/;
	var reIndentedText = /^\s*\|/;
	var reSpace = /^\s/;

	function transformClassName(className) {
		return utils.trim(className).replace(/\s+/g, '.');
	}

	function stringifyAttrs(attrs, profile) {
		var attrQuote = profile.attributeQuote();
		return '(' + attrs.map(function(attr) {
			if (attr.isBoolean) {
				return attr.name;
			}

			return attr.name + '=' + attrQuote + attr.value + attrQuote;
		}).join(', ') + ')';
	}
	
	/**
	 * Creates HAML attributes string from tag according to profile settings
	 * @param {AbbreviationNode} tag
	 * @param {Object} profile
	 */
	function makeAttributesString(tag, profile) {
		var attrs = '';
		var otherAttrs = [];
		var attrQuote = profile.attributeQuote();
		var cursor = profile.cursor();
		
		tag.attributeList().forEach(function(a) {
			var attrName = profile.attributeName(a.name);
			switch (attrName.toLowerCase()) {
				// use short notation for ID and CLASS attributes
				case 'id':
					attrs += '#' + (a.value || cursor);
					break;
				case 'class':
					attrs += '.' + transformClassName(a.value || cursor);
					break;
				// process other attributes
				default:
					otherAttrs.push({
						name: attrName,
						value: a.value || cursor,
						isBoolean: profile.isBoolean(a.name, a.value)
					});
			}
		});
		
		if (otherAttrs.length) {
			attrs += stringifyAttrs(otherAttrs, profile);
		}
		
		return attrs;
	}

	function processTagContent(item) {
		if (!item.content) {
			return;
		}

		var content = tabStops.replaceVariables(item.content, function(str, name) {
			if (name === 'nl' || name === 'newline') {
				return '\n';
			}
			return str;
		});

		if (reNl.test(content) && !reIndentedText.test(content)) {
			// multiline content: pad it with indentation and pipe
			var pad = '| ';
			item.content = '\n' + pad + utils.padString(content, pad);
		} else if (!reSpace.test(content)) {
			item.content = ' ' + content;
		}
	}
	
	/**
	 * Processes element with <code>tag</code> type
	 * @param {AbbreviationNode} item
	 * @param {OutputProfile} profile
	 */
	function processTag(item, profile) {
		if (!item.parent)
			// looks like it's a root (empty) element
			return item;
		
		var attrs = makeAttributesString(item, profile);
		var cursor = profile.cursor();
		var isUnary = abbrUtils.isUnary(item);
			
		// define tag name
		var tagName = profile.tagName(item.name());
		if (tagName.toLowerCase() == 'div' && attrs && attrs.charAt(0) != '(')
			// omit div tag
			tagName = '';
			
		item.end = '';
		var start = tagName + attrs;
		processTagContent(item);

		var placeholder = '%s';
		// We can't just replace placeholder with new value because
		// JavaScript will treat double $ character as a single one, assuming
		// we're using RegExp literal.
		item.start = utils.replaceSubstring(item.start, start, item.start.indexOf(placeholder), placeholder);
		
		if (!item.children.length && !isUnary)
			item.start += cursor;
		
		return item;
	}

	return function process(tree, curProfile, level) {
		level = level || 0;
		
		if (!level) {
			// always format with `xml` profile since
			// Jade requires all tags to be on separate lines
			tree = formatFilter(tree, profile.get('xml'));
		}
		
		tree.children.forEach(function(item) {
			if (!abbrUtils.isSnippet(item)) {
				processTag(item, curProfile, level);
			}
			
			process(item, curProfile, level + 1);
		});
		
		return tree;
	};
});