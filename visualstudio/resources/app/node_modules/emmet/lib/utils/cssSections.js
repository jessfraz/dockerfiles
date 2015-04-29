if (typeof module === 'object' && typeof define !== 'function') {
	var define = function (factory) {
		module.exports = factory(require, exports, module);
	};
}

define(function(require, exports, module) {
	var utils = require('./common');
	var commentsUtils = require('./comments');
	var range = require('../assets/range');
	var stringStream = require('../assets/stringStream');
	var cssParser = require('../parser/css');
	var htmlMatcher = require('../assets/htmlMatcher');
	var xmlEditTree = require('../editTree/xml');

	var idCounter = 1;
	var maxId = 1000000;

	var reSpaceTrim = /^(\s*).+?(\s*)$/;
	var reSpace = /\s/g;
	var reComma = /,/;

	function isQuote(ch) {
		return ch == '"' || ch == "'";
	}

	function getId() {
		idCounter = (idCounter + 1) % maxId;
		return 's' + idCounter;
	}

	/**
	 * @param {Range} range Full selector range with additional
	 * properties for matching name and content (@see findAllRules())
	 * @param {String} source CSS source
	 */
	function CSSSection(rng, source) {
		this.id = getId();
		/** @type {CSSSection} */
		this.parent = null;
		/** @type {CSSSection} */
		this.nextSibling = null;
		/** @type {CSSSection} */
		this.previousSibling = null;
		this._source = source;
		this._name = null;
		this._content = null;

		/**
		 * Custom data for current nodes, used by other modules for
		 * caching etc.
		 * @type {Object}
		 */
		this._data = {};

		if (!rng && source) {
			rng = range(0, source);
		}

		this.range = rng;
		this.children = [];
	}

	CSSSection.prototype = {
		addChild: function(section) {
			if (!(section instanceof CSSSection)) {
				section = new CSSSection(section);
			}

			var lastChild = utils.last(this.children);
			if (lastChild) {
				lastChild.nextSibling = section;
				section.previousSibling = lastChild;
			}
			section.parent = this;

			this.children.push(section);
			return section;
		},

		/**
		 * Returns root node
		 * @return {CSSSection}
		 */
		root: function() {
			var root = this;
			do {
				if (!root.parent) {
					return root;
				}
			} while(root = root.parent);

			return root;
		},

		/**
		 * Returns currect CSS source
		 * @return {String}
		 */
		source: function() {
			return this._source || this.root()._source;
		},

		/**
		 * Returns section name
		 * @return {String}
		 */
		name: function() {
			if (this._name === null) {
				var range = this.nameRange();
				if (range) {
					this._name = range.substring(this.source());
				}
			}

			return this._name;
		},

		/**
		 * Returns section name range
		 * @return {[type]} [description]
		 */
		nameRange: function() {
			if (this.range && '_selectorEnd' in this.range) {
				return range.create2(this.range.start, this.range._selectorEnd);
			}
		},

		/**
		 * Returns deepest child of current section (or section itself) 
		 * which includes given position.
		 * @param  {Number} pos
		 * @return {CSSSection}
		 */
		matchDeep: function(pos) {
			if (!this.range.inside(pos)) {
				return null;
			}

			for (var i = 0, il = this.children.length, m; i < il; i++) {
				m = this.children[i].matchDeep(pos);
				if (m) {
					return m;
				}
			};

			return this.parent ? this : null;
		},

		/**
		 * Returns current and all nested sections ranges
		 * @return {Array}
		 */
		allRanges: function() {
			var out = [];
			if (this.parent) {
				// add current range if it is not root node
				out.push(this.range);
			}

			this.children.forEach(function(child) {
				out = out.concat(child.allRanges());
			});

			return out;
		},

		data: function(key, value) {
			if (typeof value !== 'undefined') {
				this._data[key] = value;
			}

			return this._data[key];
		},

		stringify: function(indent) {
			indent = indent || '';
			var out = '';
			this.children.forEach(function(item) {
				out += indent + item.name().replace(/\n/g, '\\n') + '\n';
				out += item.stringify(indent + '--');
			});

			return out;
		},

		/**
		 * Returns current section’s actual content,
		 * e.g. content without nested sections
		 * @return {String} 
		 */
		content: function() {
			if (this._content !== null) {
				return this._content;
			}

			if (!this.range || !('_contentStart' in this.range)) {
				return '';
			}

			var r = range.create2(this.range._contentStart + 1, this.range.end - 1);
			var source = this.source();
			var start = r.start;
			var out = '';

			this.children.forEach(function(child) {
				out += source.substring(start, child.range.start);
				start = child.range.end;
			});

			out += source.substring(start, r.end);
			return this._content = utils.trim(out);
		}
	};

	return {
		/**
		 * Finds all CSS rules‘ ranges in given CSS source
		 * @param  {String} content CSS source
		 * @return {Array} Array of ranges
		 */
		findAllRules: function(content) {
			content = this.sanitize(content);
			var stream = stringStream(content);
			var ranges = [], matchedRanges;
			var self = this;

			var saveRule = function(r) {
				var selRange = self.extractSelector(content, r.start);
				var rule = range.create2(selRange.start, r.end);
				rule._selectorEnd = selRange.end;
				rule._contentStart = r.start;
				ranges.push(rule);
			};

			var ch;
			while (ch = stream.next()) {
				if (isQuote(ch)) {
					if (!stream.skipString(ch)) {
						break; // unterminated string
					}

					continue;
				}

				if (ch == '{') {
					matchedRanges = this.matchBracesRanges(content, stream.pos - 1);
					matchedRanges.forEach(saveRule);

					if (matchedRanges.length) {
						stream.pos = utils.last(matchedRanges).end;
						continue;
					} 
				}
			}
			
			return ranges.sort(function(a, b) {
				return a.start - b.start;
			});
		},

		/**
		 * Matches curly braces content right after given position
		 * @param  {String} content CSS content. Must not contain comments!
		 * @param  {Number} pos     Search start position
		 * @return {Range}
		 */
		matchBracesRanges: function(content, pos, sanitize) {
			if (sanitize) {
				content = this.sanitize(content);
			}

			var stream = stringStream(content);
			stream.start = stream.pos = pos;
			var stack = [], ranges = [];
			var ch;
			while (ch = stream.next()) {
				if (ch == '{') {
					stack.push(stream.pos - 1);
				} else if (ch == '}') {
					if (!stack.length) {
						throw 'Invalid source structure (check for curly braces)';
					}
					ranges.push(range.create2(stack.pop(), stream.pos));
					if (!stack.length) {
						return ranges;
					}
				} else {
					stream.skipQuoted();
				}
			}

			return ranges;
		},

		/**
		 * Extracts CSS selector from CSS document from
		 * given position. The selector is located by moving backward
		 * from given position which means that passed position
		 * must point to the end of selector 
		 * @param  {String}  content CSS source
		 * @param  {Number}  pos     Search position
		 * @param  {Boolean} sanitize Sanitize CSS source before processing.
		 * Off by default and assumes that CSS must be comment-free already
		 * (for performance)
		 * @return {Range}
		 */
		extractSelector: function(content, pos, sanitize) {
			if (sanitize) {
				content = this.sanitize(content);
			}

			var skipString = function() {
				var quote = content.charAt(pos);
				if (quote == '"' || quote == "'") {
					while (--pos >= 0) {
						if (content.charAt(pos) == quote && content.charAt(pos - 1) != '\\') {
							break;
						}
					}
					return true;
				}

				return false;
			};

			// find CSS selector
			var ch;
			var endPos = pos;
			while (--pos >= 0) {
				if (skipString()) continue;

				ch = content.charAt(pos);
				if (ch == ')') {
					// looks like it’s a preprocessor thing,
					// most likely a mixin arguments list, e.g.
					// .mixin (@arg1; @arg2) {...}
					while (--pos >= 0) {
						if (skipString()) continue;

						if (content.charAt(pos) == '(') {
							break;
						}
					}
					continue;
				}

				if (ch == '{' || ch == '}' || ch == ';') {
					pos++;
					break;
				}
			}

			if (pos < 0) {
				pos = 0;
			}
			
			var selector = content.substring(pos, endPos);

			// trim whitespace from matched selector
			var m = selector.replace(reSpace, ' ').match(reSpaceTrim);
			if (m) {
				pos += m[1].length;
				endPos -= m[2].length;
			}

			return range.create2(pos, endPos);
		},

		/**
		 * Search for nearest CSS rule/section that contains
		 * given position
		 * @param  {String} content CSS content or matched CSS rules (array of ranges)
		 * @param  {Number} pos     Search position
		 * @return {Range}
		 */
		matchEnclosingRule: function(content, pos) {
			if (typeof content === 'string') {
				content = this.findAllRules(content);
			}

			var rules = content.filter(function(r) {
				return r.inside(pos);
			});

			return utils.last(rules);
		},

		/**
		 * Locates CSS rule next or before given position
		 * @param  {String}  content    CSS content
		 * @param  {Number}  pos        Search start position
		 * @param  {Boolean} isBackward Search backward (find previous rule insteaf of next one)
		 * @return {Range}
		 */
		locateRule: function(content, pos, isBackward) {
			// possible case: editor reported that current syntax is
			// CSS, but it’s actually a HTML document (either `style` tag or attribute)
			var offset = 0;
			var subrange = this.styleTagRange(content, pos);
			if (subrange) {
				offset = subrange.start;
				pos -= subrange.start;
				content = subrange.substring(content);
			}

			var rules = this.findAllRules(content);
			var ctxRule = this.matchEnclosingRule(rules, pos);

			if (ctxRule) {
				return ctxRule.shift(offset);
			}

			for (var i = 0, il = rules.length; i < il; i++) {
				if (rules[i].start > pos) {
					return rules[isBackward ? i - 1 : i].shift(offset);
				}
			}
		},

		/**
		 * Sanitizes given CSS content: replaces content that may 
		 * interfere with parsing (comments, interpolations, etc.)
		 * with spaces. Sanitized content MUST NOT be used for
		 * editing or outputting, it just simplifies searching
		 * @param  {String} content CSS content
		 * @return {String}
		 */
		sanitize: function(content) {
			content = commentsUtils.strip(content);

			// remove preprocessor string interpolations like #{var}
			var stream = stringStream(content);
			var replaceRanges = [];
			var ch, ch2;

			while ((ch = stream.next())) {
				if (isQuote(ch)) {
					// skip string
					stream.skipString(ch)
					continue;
				} else if (ch === '#' || ch === '@') {
					ch2 = stream.peek();
					if (ch2 === '{') { // string interpolation
						stream.start = stream.pos - 1;

						if (stream.skipTo('}')) {
							stream.pos += 1;
						} else {
							throw 'Invalid string interpolation at ' + stream.start;
						}

						replaceRanges.push([stream.start, stream.pos]);
					}
				}
			}

			return utils.replaceWith(content, replaceRanges, 'a');
		},

		/**
		 * Parses and returns all sections in given CSS
		 * as tree-like structure, e.g. provides nesting
		 * info
		 * @param  {String} content CSS content
		 * @return {CSSSection}
		 */
		sectionTree: function(content) {
			var root = new CSSSection(null, content);
			var rules = this.findAllRules(content);

			// rules are sorted in order they appear in CSS source
			// so we can optimize their nesting routine
			var insert = function(range, ctx) {
				while (ctx && ctx.range) {
					if (ctx.range.contains(range)) {
						return ctx.addChild(range);
					}

					ctx = ctx.parent;
				}

				// if we are here then given range is a top-level section
				return root.addChild(range);
			};

			var ctx = root;
			rules.forEach(function(r) {
				ctx = insert(r, ctx);
			});

			return root;
		},

		/**
		 * Returns ranges for all nested sections, available in
		 * given CSS rule
		 * @param  {CSSEditContainer} rule
		 * @return {Array}
		 */
		nestedSectionsInRule: function(rule) {
			var offset = rule.valueRange(true).start;
			var nestedSections = this.findAllRules(rule.valueRange().substring(rule.source));
			nestedSections.forEach(function(section) {
				section.start += offset;
				section.end += offset;
				section._selectorEnd += offset;
				section._contentStart += offset;
			});
			return nestedSections;
		},

		styleTagRange: function(content, pos) {
			var tag = htmlMatcher.tag(content, pos);
			return tag && tag.open.name.toLowerCase() == 'style' 
				&& tag.innerRange.cmp(pos, 'lte', 'gte')
				&& tag.innerRange;
		},

		styleAttrRange: function(content, pos) {
			var tree = xmlEditTree.parseFromPosition(content, pos, true);
			if (tree) {
				var attr = tree.itemFromPosition(pos, true);
				return attr && attr.name().toLowerCase() == 'style' 
					&& attr.valueRange(true).cmp(pos, 'lte', 'gte')
					&& attr.valueRange(true);
			}
		},

		CSSSection: CSSSection
	};
});