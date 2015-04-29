/**
 * HTML matcher: takes string and searches for HTML tag pairs for given position 
 * 
 * Unlike “classic” matchers, it parses content from the specified 
 * position, not from the start, so it may work even outside HTML documents
 * (for example, inside strings of programming languages like JavaScript, Python 
 * etc.)
 */
if (typeof module === 'object' && typeof define !== 'function') {
	var define = function (factory) {
		module.exports = factory(require, exports, module);
	};
}

define(function(require, exports, module) {
	var range = require('./range');

	// Regular Expressions for parsing tags and attributes
	var reOpenTag = /^<([\w\:\-]+)((?:\s+[\w\-:]+(?:\s*=\s*(?:(?:"[^"]*")|(?:'[^']*')|[^>\s]+))?)*)\s*(\/?)>/;
	var reCloseTag = /^<\/([\w\:\-]+)[^>]*>/;

	function openTag(i, match) {
		return {
			name: match[1],
			selfClose: !!match[3],
			/** @type Range */
			range: range(i, match[0]),
			type: 'open'
		};
	}
	
	function closeTag(i, match) {
		return {
			name: match[1],
			/** @type Range */
			range: range(i, match[0]),
			type: 'close'
		};
	}
	
	function comment(i, match) {
		return {
			/** @type Range */
			range: range(i, typeof match == 'number' ? match - i : match[0]),
			type: 'comment'
		};
	}
	
	/**
	 * Creates new tag matcher session
	 * @param {String} text
	 */
	function createMatcher(text) {
		var memo = {}, m;
		return {
			/**
			 * Test if given position matches opening tag
			 * @param {Number} i
			 * @returns {Object} Matched tag object
			 */
			open: function(i) {
				var m = this.matches(i);
				return m && m.type == 'open' ? m : null;
			},
			
			/**
			 * Test if given position matches closing tag
			 * @param {Number} i
			 * @returns {Object} Matched tag object
			 */
			close: function(i) {
				var m = this.matches(i);
				return m && m.type == 'close' ? m : null;
			},
			
			/**
			 * Matches either opening or closing tag for given position
			 * @param i
			 * @returns
			 */
			matches: function(i) {
				var key = 'p' + i;
				
				if (!(key in memo)) {
					memo[key] = false;
					if (text.charAt(i) == '<') {
						var substr = text.slice(i);
						if ((m = substr.match(reOpenTag))) {
							memo[key] = openTag(i, m);
						} else if ((m = substr.match(reCloseTag))) {
							memo[key] = closeTag(i, m);
						}
					}
				}
				
				return memo[key];
			},
			
			/**
			 * Returns original text
			 * @returns {String}
			 */
			text: function() {
				return text;
			},

			clean: function() {
				memo = text = m = null;
			}
		};
	}
	
	function matches(text, pos, pattern) {
		return text.substring(pos, pos + pattern.length) == pattern;
	}
	
	/**
	 * Search for closing pair of opening tag
	 * @param {Object} open Open tag instance
	 * @param {Object} matcher Matcher instance
	 */
	function findClosingPair(open, matcher) {
		var stack = [], tag = null;
		var text = matcher.text();
		
		for (var pos = open.range.end, len = text.length; pos < len; pos++) {
			if (matches(text, pos, '<!--')) {
				// skip to end of comment
				for (var j = pos; j < len; j++) {
					if (matches(text, j, '-->')) {
						pos = j + 3;
						break;
					}
				}
			}
			
			if ((tag = matcher.matches(pos))) {
				if (tag.type == 'open' && !tag.selfClose) {
					stack.push(tag.name);
				} else if (tag.type == 'close') {
					if (!stack.length) { // found valid pair?
						return tag.name == open.name ? tag : null;
					}
					
					// check if current closing tag matches previously opened one
					if (stack[stack.length - 1] == tag.name) {
						stack.pop();
					} else {
						var found = false;
						while (stack.length && !found) {
							var last = stack.pop();
							if (last == tag.name) {
								found = true;
							}
						}
						
						if (!stack.length && !found) {
							return tag.name == open.name ? tag : null;
						}
					}
				}

				pos = tag.range.end - 1;
			}
		}
	}
	
	return {
		/**
		 * Main function: search for tag pair in <code>text</code> for given 
		 * position
		 * @memberOf htmlMatcher
		 * @param {String} text 
		 * @param {Number} pos
		 * @returns {Object}
		 */
		find: function(text, pos) {
			var matcher = createMatcher(text); 
			var open = null, close = null;
			var j, jl;
			
			for (var i = pos; i >= 0; i--) {
				if ((open = matcher.open(i))) {
					// found opening tag
					if (open.selfClose) {
						if (open.range.cmp(pos, 'lt', 'gt')) {
							// inside self-closing tag, found match
							break;
						}
						
						// outside self-closing tag, continue
						continue;
					}
					
					close = findClosingPair(open, matcher);
					if (close) {
						// found closing tag.
						var r = range.create2(open.range.start, close.range.end);
						if (r.contains(pos)) {
							break;
						}
					} else if (open.range.contains(pos)) {
						// we inside empty HTML tag like <br>
						break;
					}
					
					open = null;
				} else if (matches(text, i, '-->')) {
					// skip back to comment start
					for (j = i - 1; j >= 0; j--) {
						if (matches(text, j, '-->')) {
							// found another comment end, do nothing
							break;
						} else if (matches(text, j, '<!--')) {
							i = j;
							break;
						}
					}
				} else if (matches(text, i, '<!--')) {
					// we're inside comment, match it
					for (j = i + 4, jl = text.length; j < jl; j++) {
						if (matches(text, j, '-->')) {
							j += 3;
							break;
						}
					}
					
					open = comment(i, j);
					break;
				}
			}
			
			matcher.clean();

			if (open) {
				var outerRange = null;
				var innerRange = null;
				
				if (close) {
					outerRange = range.create2(open.range.start, close.range.end);
					innerRange = range.create2(open.range.end, close.range.start);
				} else {
					outerRange = innerRange = range.create2(open.range.start, open.range.end);
				}
				
				if (open.type == 'comment') {
					// adjust positions of inner range for comment
					var _c = outerRange.substring(text);
					innerRange.start += _c.length - _c.replace(/^<\!--\s*/, '').length;
					innerRange.end -= _c.length - _c.replace(/\s*-->$/, '').length;
				}
				
				return {
					open: open,
					close: close,
					type: open.type == 'comment' ? 'comment' : 'tag',
					innerRange: innerRange,
					innerContent: function() {
						return this.innerRange.substring(text);
					},
					outerRange: outerRange,
					outerContent: function() {
						return this.outerRange.substring(text);
					},
					range: !innerRange.length() || !innerRange.cmp(pos, 'lte', 'gte') ? outerRange : innerRange,
					content: function() {
						return this.range.substring(text);
					},
					source: text
				};
			}
		},
		
		/**
		 * The same as <code>find()</code> method, but restricts matched result 
		 * to <code>tag</code> type
		 * @param {String} text 
		 * @param {Number} pos
		 * @returns {Object}
		 */
		tag: function(text, pos) {
			var result = this.find(text, pos);
			if (result && result.type == 'tag') {
				return result;
			}
		}
	};
});