/**
 * HTML pair matching (balancing) actions
 * @constructor
 */
if (typeof module === 'object' && typeof define !== 'function') {
	var define = function (factory) {
		module.exports = factory(require, exports, module);
	};
}

define(function(require, exports, module) {
	var htmlMatcher = require('../assets/htmlMatcher');
	var utils = require('../utils/common');
	var editorUtils = require('../utils/editor');
	var actionUtils = require('../utils/action');
	var range = require('../assets/range');
	var cssEditTree = require('../editTree/css');
	var cssSections = require('../utils/cssSections');
	var lastMatch = null;

	function last(arr) {
		return arr[arr.length - 1];
	}

	function balanceHTML(editor, direction) {
		var info = editorUtils.outputInfo(editor);
		var content = info.content;
		var sel = range(editor.getSelectionRange());
		
		// validate previous match
		if (lastMatch && !lastMatch.range.equal(sel)) {
			lastMatch = null;
		}
		
		if (lastMatch && sel.length()) {
			if (direction == 'in') {
				// user has previously selected tag and wants to move inward
				if (lastMatch.type == 'tag' && !lastMatch.close) {
					// unary tag was selected, can't move inward
					return false;
				} else {
					if (lastMatch.range.equal(lastMatch.outerRange)) {
						lastMatch.range = lastMatch.innerRange;
					} else {
						var narrowed = utils.narrowToNonSpace(content, lastMatch.innerRange);
						lastMatch = htmlMatcher.find(content, narrowed.start + 1);
						if (lastMatch && lastMatch.range.equal(sel) && lastMatch.outerRange.equal(sel)) {
							lastMatch.range = lastMatch.innerRange;
						}
					}
				}
			} else {
				if (
					!lastMatch.innerRange.equal(lastMatch.outerRange) 
					&& lastMatch.range.equal(lastMatch.innerRange) 
					&& sel.equal(lastMatch.range)) {
					lastMatch.range = lastMatch.outerRange;
				} else {
					lastMatch = htmlMatcher.find(content, sel.start);
					if (lastMatch && lastMatch.range.equal(sel) && lastMatch.innerRange.equal(sel)) {
						lastMatch.range = lastMatch.outerRange;
					}
				}
			}
		} else {
			lastMatch = htmlMatcher.find(content, sel.start);
		}

		if (lastMatch) {
			if (lastMatch.innerRange.equal(sel)) {
				lastMatch.range = lastMatch.outerRange;
			}

			if (!lastMatch.range.equal(sel)) {
				editor.createSelection(lastMatch.range.start, lastMatch.range.end);
				return true;
			}
		}
		
		lastMatch = null;
		return false;
	}

	function rangesForCSSRule(rule, pos) {
		// find all possible ranges
		var ranges = [rule.range(true)];

		// braces content
		ranges.push(rule.valueRange(true));

		// find nested sections
		var nestedSections = cssSections.nestedSectionsInRule(rule);

		// real content, e.g. from first property name to
		// last property value
		var items = rule.list();
		if (items.length || nestedSections.length) {
			var start = Number.POSITIVE_INFINITY, end = -1;
			if (items.length) {
				start = items[0].namePosition(true);
				end = last(items).range(true).end;
			}

			if (nestedSections.length) {
				if (nestedSections[0].start < start) {
					start = nestedSections[0].start;
				}

				if (last(nestedSections).end > end) {
					end = last(nestedSections).end;
				}
			}

			ranges.push(range.create2(start, end));
		}

		ranges = ranges.concat(nestedSections);

		var prop = cssEditTree.propertyFromPosition(rule, pos) || items[0];
		if (prop) {
			ranges.push(prop.range(true));
			var valueRange = prop.valueRange(true);
			if (!prop.end()) {
				valueRange._unterminated = true;
			}
			ranges.push(valueRange);
		}

		return ranges;
	}

	/**
	 * Returns all possible selection ranges for given caret position
	 * @param  {String} content CSS content
	 * @param  {Number} pos     Caret position(where to start searching)
	 * @return {Array}
	 */
	function getCSSRanges(content, pos) {
		var rule;
		if (typeof content === 'string') {
			var ruleRange = cssSections.matchEnclosingRule(content, pos);
			if (ruleRange) {
				rule = cssEditTree.parse(ruleRange.substring(content), {
					offset: ruleRange.start
				});
			}
		} else {
			// passed parsed CSS rule
			rule = content;
		}

		if (!rule) {
			return null;
		}

		// find all possible ranges
		var ranges = rangesForCSSRule(rule, pos);

		// remove empty ranges
		ranges = ranges.filter(function(item) {
			return !!item.length;
		});

		return utils.unique(ranges, function(item) {
			return item.valueOf();
		});
	}

	function balanceCSS(editor, direction) {
		var info = editorUtils.outputInfo(editor);
		var content = info.content;
		var sel = range(editor.getSelectionRange());

		var ranges = getCSSRanges(info.content, sel.start);
		if (!ranges && sel.length()) {
			// possible reason: user has already selected
			// CSS rule from last match
			try {
				var rule = cssEditTree.parse(sel.substring(info.content), {
					offset: sel.start
				});
				ranges = getCSSRanges(rule, sel.start);
			} catch(e) {}
		}

		if (!ranges) {
			return false;
		}

		ranges = range.sort(ranges, true);

		// edge case: find match that equals current selection,
		// in case if user moves inward after selecting full CSS rule
		var bestMatch = utils.find(ranges, function(r) {
			return r.equal(sel);
		});

		if (!bestMatch) {
			bestMatch = utils.find(ranges, function(r) {
				// Check for edge case: caret right after CSS value
				// but it doesn‘t contains terminating semicolon.
				// In this case we have to check full value range
				return r._unterminated ? r.include(sel.start) : r.inside(sel.start);
			});
		}

		if (!bestMatch) {
			return false;
		}

		// if best match equals to current selection, move index
		// one position up or down, depending on direction
		var bestMatchIx = ranges.indexOf(bestMatch);
		if (bestMatch.equal(sel)) {
			bestMatchIx += direction == 'out' ? 1 : -1;
		}

		if (bestMatchIx < 0 || bestMatchIx >= ranges.length) {
			if (bestMatchIx >= ranges.length && direction == 'out') {
				pos = bestMatch.start - 1;

				var outerRanges = getCSSRanges(content, pos);
				if (outerRanges) {
					bestMatch = last(outerRanges.filter(function(r) {
						return r.inside(pos);
					}));
				}
			} else if (bestMatchIx < 0 && direction == 'in') {
				bestMatch = null;
			} else {
				bestMatch = null;
			}
		} else {
			bestMatch = ranges[bestMatchIx];	
		}

		if (bestMatch) {
			editor.createSelection(bestMatch.start, bestMatch.end);
			return true;
		}
		
		return false;
	}
	
	return {
		/**
		 * Find and select HTML tag pair
		 * @param {IEmmetEditor} editor Editor instance
		 * @param {String} direction Direction of pair matching: 'in' or 'out'. 
		 * Default is 'out'
		 */
		balance: function(editor, direction) {
			direction = String((direction || 'out').toLowerCase());
			var info = editorUtils.outputInfo(editor);
			if (actionUtils.isSupportedCSS(info.syntax)) {
				return balanceCSS(editor, direction);
			}
			
			return balanceHTML(editor, direction);
		},

		balanceInwardAction: function(editor) {
			return this.balance(editor, 'in');
		},

		balanceOutwardAction: function(editor) {
			return this.balance(editor, 'out');	
		},

		/**
		 * Moves caret to matching opening or closing tag
		 * @param {IEmmetEditor} editor
		 */
		goToMatchingPairAction: function(editor) {
			var content = String(editor.getContent());
			var caretPos = editor.getCaretPos();
			
			if (content.charAt(caretPos) == '<') 
				// looks like caret is outside of tag pair  
				caretPos++;
				
			var tag = htmlMatcher.tag(content, caretPos);
			if (tag && tag.close) { // exclude unary tags
				if (tag.open.range.inside(caretPos)) {
					editor.setCaretPos(tag.close.range.start);
				} else {
					editor.setCaretPos(tag.open.range.start);
				}
				
				return true;
			}
			
			return false;
		}
	};
});