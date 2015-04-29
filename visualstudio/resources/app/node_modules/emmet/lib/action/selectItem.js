/**
 * Actions that use stream parsers and tokenizers for traversing:
 * -- Search for next/previous items in HTML
 * -- Search for next/previous items in CSS
 */
if (typeof module === 'object' && typeof define !== 'function') {
	var define = function (factory) {
		module.exports = factory(require, exports, module);
	};
}

define(function(require, exports, module) {
	var range = require('../assets/range');
	var utils = require('../utils/common');
	var editorUtils = require('../utils/editor');
	var actionUtils = require('../utils/action');
	var stringStream = require('../assets/stringStream');
	var xmlParser = require('../parser/xml');
	var cssEditTree = require('../editTree/css');
	var cssSections = require('../utils/cssSections');

	var startTag = /^<([\w\:\-]+)((?:\s+[\w\-:]+(?:\s*=\s*(?:(?:"[^"]*")|(?:'[^']*')|[^>\s]+))?)*)\s*(\/?)>/;

	/**
	 * Generic function for searching for items to select
	 * @param {IEmmetEditor} editor
	 * @param {Boolean} isBackward Search backward (search forward otherwise)
	 * @param {Function} extractFn Function that extracts item content
	 * @param {Function} rangeFn Function that search for next token range
	 */
	function findItem(editor, isBackward, extractFn, rangeFn) {
		var content = editorUtils.outputInfo(editor).content;
		
		var contentLength = content.length;
		var itemRange, rng;
		/** @type Range */
		var prevRange = range(-1, 0);
		/** @type Range */
		var sel = range(editor.getSelectionRange());
		
		var searchPos = sel.start, loop = 100000; // endless loop protection
		while (searchPos >= 0 && searchPos < contentLength && --loop > 0) {
			if ( (itemRange = extractFn(content, searchPos, isBackward)) ) {
				if (prevRange.equal(itemRange)) {
					break;
				}
				
				prevRange = itemRange.clone();
				rng = rangeFn(itemRange.substring(content), itemRange.start, sel.clone());
				
				if (rng) {
					editor.createSelection(rng.start, rng.end);
					return true;
				} else {
					searchPos = isBackward ? itemRange.start : itemRange.end - 1;
				}
			}
			
			searchPos += isBackward ? -1 : 1;
		}
		
		return false;
	}
	
	// XXX HTML section
	
	/**
	 * Find next HTML item
	 * @param {IEmmetEditor} editor
	 */
	function findNextHTMLItem(editor) {
		var isFirst = true;
		return findItem(editor, false, function(content, searchPos){
			if (isFirst) {
				isFirst = false;
				return findOpeningTagFromPosition(content, searchPos);
			} else {
				return getOpeningTagFromPosition(content, searchPos);
			}
		}, function(tag, offset, selRange) {
			return getRangeForHTMLItem(tag, offset, selRange, false);
		});
	}
	
	/**
	 * Find previous HTML item
	 * @param {IEmmetEditor} editor
	 */
	function findPrevHTMLItem(editor) {
		return findItem(editor, true, getOpeningTagFromPosition, function (tag, offset, selRange) {
			return getRangeForHTMLItem(tag, offset, selRange, true);
		});
	}
	
	/**
	 * Creates possible selection ranges for HTML tag
	 * @param {String} source Original HTML source for tokens
	 * @param {Array} tokens List of HTML tokens
	 * @returns {Array}
	 */
	function makePossibleRangesHTML(source, tokens, offset) {
		offset = offset || 0;
		var result = [];
		var attrStart = -1, attrName = '', attrValue = '', attrValueRange, tagName;
		tokens.forEach(function(tok) {
			switch (tok.type) {
				case 'tag':
					tagName = source.substring(tok.start, tok.end);
					if (/^<[\w\:\-]/.test(tagName)) {
						// add tag name
						result.push(range({
							start: tok.start + 1, 
							end: tok.end
						}));
					}
					break;
				case 'attribute':
					attrStart = tok.start;
					attrName = source.substring(tok.start, tok.end);
					break;
					
				case 'string':
					// attribute value
					// push full attribute first
					result.push(range(attrStart, tok.end - attrStart));
					
					attrValueRange = range(tok);
					attrValue = attrValueRange.substring(source);
					
					// is this a quoted attribute?
					if (isQuote(attrValue.charAt(0)))
						attrValueRange.start++;
					
					if (isQuote(attrValue.charAt(attrValue.length - 1)))
						attrValueRange.end--;
					
					result.push(attrValueRange);
					
					if (attrName == 'class') {
						result = result.concat(classNameRanges(attrValueRange.substring(source), attrValueRange.start));
					}
					
					break;
			}
		});
		
		// offset ranges
		result = result.filter(function(item) {
			if (item.length()) {
				item.shift(offset);
				return true;
			}
		});

		// remove duplicates
		return utils.unique(result, function(item) {
			return item.toString();
		});
	}
	
	/**
	 * Returns ranges of class names in "class" attribute value
	 * @param {String} className
	 * @returns {Array}
	 */
	function classNameRanges(className, offset) {
		offset = offset || 0;
		var result = [];
		/** @type StringStream */
		var stream = stringStream.create(className);
		
		// skip whitespace
		stream.eatSpace();
		stream.start = stream.pos;
		
		var ch;
		while ((ch = stream.next())) {
			if (/[\s\u00a0]/.test(ch)) {
				result.push(range(stream.start + offset, stream.pos - stream.start - 1));
				stream.eatSpace();
				stream.start = stream.pos;
			}
		}
		
		result.push(range(stream.start + offset, stream.pos - stream.start));
		return result;
	}
	
	/**
	 * Returns best HTML tag range match for current selection
	 * @param {String} tag Tag declaration
	 * @param {Number} offset Tag's position index inside content
	 * @param {Range} selRange Selection range
	 * @return {Range} Returns range if next item was found, <code>null</code> otherwise
	 */
	function getRangeForHTMLItem(tag, offset, selRange, isBackward) {
		var ranges = makePossibleRangesHTML(tag, xmlParser.parse(tag), offset);
		
		if (isBackward)
			ranges.reverse();
		
		// try to find selected range
		var curRange = utils.find(ranges, function(r) {
			return r.equal(selRange);
		});
		
		if (curRange) {
			var ix = ranges.indexOf(curRange);
			if (ix < ranges.length - 1)
				return ranges[ix + 1];
			
			return null;
		}
		
		// no selected range, find nearest one
		if (isBackward)
			// search backward
			return utils.find(ranges, function(r) {
				return r.start < selRange.start;
			});
		
		// search forward
		// to deal with overlapping ranges (like full attribute definition
		// and attribute value) let's find range under caret first
		if (!curRange) {
			var matchedRanges = ranges.filter(function(r) {
				return r.inside(selRange.end);
			});
			
			if (matchedRanges.length > 1)
				return matchedRanges[1];
		}
		
		
		return utils.find(ranges, function(r) {
			return r.end > selRange.end;
		});
	}
	
	/**
	 * Search for opening tag in content, starting at specified position
	 * @param {String} html Where to search tag
	 * @param {Number} pos Character index where to start searching
	 * @return {Range} Returns range if valid opening tag was found,
	 * <code>null</code> otherwise
	 */
	function findOpeningTagFromPosition(html, pos) {
		var tag;
		while (pos >= 0) {
			if ((tag = getOpeningTagFromPosition(html, pos)))
				return tag;
			pos--;
		}
		
		return null;
	}
	
	/**
	 * @param {String} html Where to search tag
	 * @param {Number} pos Character index where to start searching
	 * @return {Range} Returns range if valid opening tag was found,
	 * <code>null</code> otherwise
	 */
	function getOpeningTagFromPosition(html, pos) {
		var m;
		if (html.charAt(pos) == '<' && (m = html.substring(pos, html.length).match(startTag))) {
			return range(pos, m[0]);
		}
	}
	
	function isQuote(ch) {
		return ch == '"' || ch == "'";
	}

	/**
	 * Returns all ranges inside given rule, available for selection
	 * @param  {CSSEditContainer} rule
	 * @return {Array}
	 */
	function findInnerRanges(rule) {
		// rule selector
		var ranges = [rule.nameRange(true)];

		// find nested sections, keep selectors only
		var nestedSections = cssSections.nestedSectionsInRule(rule);
		nestedSections.forEach(function(section) {
			ranges.push(range.create2(section.start, section._selectorEnd));
		});

		// add full property ranges and values
		rule.list().forEach(function(property) {
			ranges = ranges.concat(makePossibleRangesCSS(property));
		});

		ranges = range.sort(ranges);

		// optimize result: remove empty ranges and duplicates
		ranges = ranges.filter(function(item) {
			return !!item.length();
		});
		return utils.unique(ranges, function(item) {
			return item.toString();
		});
	}
	
	/**
	 * Makes all possible selection ranges for specified CSS property
	 * @param {CSSProperty} property
	 * @returns {Array}
	 */
	function makePossibleRangesCSS(property) {
		// find all possible ranges, sorted by position and size
		var valueRange = property.valueRange(true);
		var result = [property.range(true), valueRange];
		
		// locate parts of complex values.
		// some examples:
		// – 1px solid red: 3 parts
		// – arial, sans-serif: enumeration, 2 parts
		// – url(image.png): function value part
		var value = property.value();
		property.valueParts().forEach(function(r) {
			// add absolute range
			var clone = r.clone();
			result.push(clone.shift(valueRange.start));
			
			/** @type StringStream */
			var stream = stringStream.create(r.substring(value));
			if (stream.match(/^[\w\-]+\(/, true)) {
				// we have a function, find values in it.
				// but first add function contents
				stream.start = stream.pos;
				stream.backUp(1);
				stream.skipToPair('(', ')');
				stream.backUp(1);
				var fnBody = stream.current();
				result.push(range(clone.start + stream.start, fnBody));
				
				// find parts
				cssEditTree.findParts(fnBody).forEach(function(part) {
					result.push(range(clone.start + stream.start + part.start, part.substring(fnBody)));
				});
			}
		});

		return result;
	}
	
	/**
	 * Tries to find matched CSS property and nearest range for selection
	 * @param {CSSRule} rule
	 * @param {Range} selRange
	 * @param {Boolean} isBackward
	 * @returns {Range}
	 */
	function matchedRangeForCSSProperty(rule, selRange, isBackward) {
		var ranges = findInnerRanges(rule);
		if (isBackward) {
			ranges.reverse();
		}
		
		// return next to selected range, if possible
		var r = utils.find(ranges, function(item) {
			return item.equal(selRange);
		});

		if (r) {
			return ranges[ranges.indexOf(r) + 1];
		}

		// find matched and (possibly) overlapping ranges
		var nested = ranges.filter(function(item) {
			return item.inside(selRange.end);
		});

		if (nested.length) {
			return nested.sort(function(a, b) {
				return a.length() - b.length();
			})[0];
		}

		// return range next to caret
		var test = 
		r = utils.find(ranges, isBackward 
			? function(item) {return item.end < selRange.start;}
			: function(item) {return item.end > selRange.start;}
		);

		if (!r) {
			// can’t find anything, just pick first one
			r = ranges[0];
		}

		return r;
	}
	
	function findNextCSSItem(editor) {
		return findItem(editor, false, cssSections.locateRule.bind(cssSections), getRangeForNextItemInCSS);
	}
	
	function findPrevCSSItem(editor) {
		return findItem(editor, true, cssSections.locateRule.bind(cssSections), getRangeForPrevItemInCSS);
	}
	
	/**
	 * Returns range for item to be selected in CSS after current caret 
	 * (selection) position
	 * @param {String} rule CSS rule declaration
	 * @param {Number} offset Rule's position index inside content
	 * @param {Range} selRange Selection range
	 * @return {Range} Returns range if next item was found, <code>null</code> otherwise
	 */
	function getRangeForNextItemInCSS(rule, offset, selRange) {
		var tree = cssEditTree.parse(rule, {
			offset: offset
		});

		return matchedRangeForCSSProperty(tree, selRange, false);
	}
	
	/**
	 * Returns range for item to be selected in CSS before current caret 
	 * (selection) position
	 * @param {String} rule CSS rule declaration
	 * @param {Number} offset Rule's position index inside content
	 * @param {Range} selRange Selection range
	 * @return {Range} Returns range if previous item was found, <code>null</code> otherwise
	 */
	function getRangeForPrevItemInCSS(rule, offset, selRange) {
		var tree = cssEditTree.parse(rule, {
			offset: offset
		});

		return matchedRangeForCSSProperty(tree, selRange, true);
	}

	return {
		selectNextItemAction: function(editor) {
			if (actionUtils.isSupportedCSS(editor.getSyntax())) {
				return findNextCSSItem(editor);
			} else {
				return findNextHTMLItem(editor);
			}
		},

		selectPreviousItemAction: function(editor) {
			if (actionUtils.isSupportedCSS(editor.getSyntax())) {
				return findPrevCSSItem(editor);
			} else {
				return findPrevHTMLItem(editor);
			}
		}
	};
});