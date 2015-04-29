/**
 * Filter for producing HAML code from abbreviation.
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

	function transformClassName(className) {
		return utils.trim(className).replace(/\s+/g, '.');
	}

	/**
	 * Condenses all "data-" attributes into a single entry.
	 * HAML allows data attributes to be ouputted as a sub-hash
	 * of `:data` key
	 * @param  {Array} attrs
	 * @return {Array}
	 */
	function condenseDataAttrs(attrs) {
		var out = [], data = null;
		var reData = /^data-/i;
		attrs.forEach(function(attr) {
			if (reData.test(attr.name)) {
				if (!data) {
					data = [];
					out.push({
						name: 'data',
						value: data
					});
				}

				data.push(utils.extend({}, attr, {name: attr.name.replace(reData, '')}));
			} else {
				out.push(attr);
			}
		});

		return out;
	}

	function stringifyAttrs(attrs, profile) {
		var attrQuote = profile.attributeQuote();
		return '{' + attrs.map(function(attr) {
			var value = attrQuote + attr.value + attrQuote;
			if (Array.isArray(attr.value)) {
				value = stringifyAttrs(attr.value, profile);
			} else if (attr.isBoolean) {
				value = 'true';
			}

			return ':' + attr.name + ' => ' + value
		}).join(', ') + '}';
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
			attrs += stringifyAttrs(condenseDataAttrs(otherAttrs), profile);
		}
		
		return attrs;
	}
	
	/**
	 * Processes element with <code>tag</code> type
	 * @param {AbbreviationNode} item
	 * @param {OutputProfile} profile
	 */
	function processTag(item, profile) {
		if (!item.parent)
			// looks like it's root element
			return item;
		
		var attrs = makeAttributesString(item, profile);
		var cursor = profile.cursor();
		var isUnary = abbrUtils.isUnary(item);
		var selfClosing = profile.self_closing_tag && isUnary ? '/' : '';
		var start= '';
			
		// define tag name
		var tagName = '%' + profile.tagName(item.name());
		if (tagName.toLowerCase() == '%div' && attrs && attrs.indexOf('{') == -1)
			// omit div tag
			tagName = '';
			
		item.end = '';
		start = tagName + attrs + selfClosing;
		if (item.content && !/^\s/.test(item.content)) {
			item.content = ' ' + item.content;
		}
		
		var placeholder = '%s';
		// We can't just replace placeholder with new value because
		// JavaScript will treat double $ character as a single one, assuming
		// we're using RegExp literal.
		item.start = utils.replaceSubstring(item.start, start, item.start.indexOf(placeholder), placeholder);
		
		if (!item.children.length && !isUnary)
			item.start += cursor;
		
		return item;
	}

	return function process(tree, profile, level) {
		level = level || 0;
		
		if (!level) {
			tree = formatFilter(tree, '_format', profile);
		}
		
		tree.children.forEach(function(item) {
			if (!abbrUtils.isSnippet(item)) {
				processTag(item, profile, level);
			}
			
			process(item, profile, level + 1);
		});
		
		return tree;
	};
});