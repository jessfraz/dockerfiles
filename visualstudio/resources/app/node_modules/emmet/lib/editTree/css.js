/**
 * CSS EditTree is a module that can parse a CSS rule into a tree with 
 * convenient methods for adding, modifying and removing CSS properties. These 
 * changes can be written back to string with respect of code formatting.
 */
if (typeof module === 'object' && typeof define !== 'function') {
	var define = function (factory) {
		module.exports = factory(require, exports, module);
	};
}

define(function(require, exports, module) {
	var utils = require('../utils/common');
	var editTree = require('./base');
	var cssParser = require('../parser/css');
	var cssSections = require('../utils/cssSections');
	var range = require('../assets/range');
	var stringStream = require('../assets/stringStream');
	var tokenIterator = require('../assets/tokenIterator');

	var defaultOptions = {
		styleBefore: '\n\t',
		styleSeparator: ': ',
		offset: 0
	};
	
	var reSpaceStart = /^\s+/;
	var reSpaceEnd = /\s+$/;
	var WHITESPACE_REMOVE_FROM_START = 1;
	var WHITESPACE_REMOVE_FROM_END   = 2;
	
	/**
	 * Modifies given range to remove whitespace from beginning
	 * and/or from the end
	 * @param  {Range} rng Range to modify
	 * @param  {String} text  Text that range belongs to
	 * @param  {Number} mask  Mask indicating from which end 
	 * whitespace should be removed
	 * @return {Range}
	 */
	function trimWhitespaceInRange(rng, text, mask) {
		mask = mask || (WHITESPACE_REMOVE_FROM_START | WHITESPACE_REMOVE_FROM_END);
		text = rng.substring(text);
		var m;
		if ((mask & WHITESPACE_REMOVE_FROM_START) && (m = text.match(reSpaceStart))) {
			rng.start += m[0].length;
		}

		if ((mask & WHITESPACE_REMOVE_FROM_END) && (m = text.match(reSpaceEnd))) {
			rng.end -= m[0].length;
		}

		// in case given range is just a whatespace
		if (rng.end < rng.start) {
			rng.end = rng.start;
		}

		return rng;
	}

	/**
	 * Consumes CSS property and value from current token
	 * iterator state. Offsets iterator pointer into token
	 * that can be used for next value consmption
	 * @param  {TokenIterator} it
	 * @param  {String} text
	 * @return {Object}    Object with `name` and `value` properties 
	 * ar ranges. Value range can be zero-length.
	 */
	function consumeSingleProperty(it, text) {
		var name, value, end;
		var token = it.current();

		if (!token) {
			return null;
		}

		// skip whitespace
		var ws = {'white': 1, 'line': 1, 'comment': 1};
		while ((token = it.current())) {
			if (!(token.type in ws)) {
				break;
			}
			it.next();
		}

		if (!it.hasNext()) {
			return null;
		}

		// consume property name
		token = it.current();
		name = range(token.start, token.value);
		var isAtProperty = token.value.charAt(0) == '@';
		while (token = it.next()) {
			name.end = token.end;
			if (token.type == ':' || token.type == 'white') {
				name.end = token.start;
				it.next();
				if (token.type == ':' || isAtProperty) {
					// XXX I really ashame of this hardcode, but I need
					// to stop parsing if this is an SCSS mixin call,
					// for example: @include border-radius(10px)
					break;
				}
			} else if (token.type == ';' || token.type == 'line') {
				// there’s no value, looks like a mixin
				// or a special use case:
				// user is writing a new property or abbreviation
				name.end = token.start;
				value = range(token.start, 0);
				it.next();
				break;
			}
		}

		token = it.current();
		if (!value && token) {
			if (token.type == 'line') {
				lastNewline = token;
			}
			// consume value
			value = range(token.start, token.value);
			var lastNewline;
			while ((token = it.next())) {
				value.end = token.end;
				if (token.type == 'line') {
					lastNewline = token;
				} else if (token.type == '}' || token.type == ';') {
					value.end = token.start;
					if (token.type == ';') {
						end = range(token.start, token.value);
					}
					it.next();
					break;
				} else if (token.type == ':' && lastNewline) {
					// A special case: 
					// user is writing a value before existing
					// property, but didn’t inserted closing semi-colon.
					// In this case, limit value range to previous
					// newline
					value.end = lastNewline.start;
					it._i = it.tokens.indexOf(lastNewline);
					break;
				}
			}
		}

		if (!value) {
			value = range(name.end, 0);
		}

		return {
			name: trimWhitespaceInRange(name, text),
			value: trimWhitespaceInRange(value, text, WHITESPACE_REMOVE_FROM_START | (end ? WHITESPACE_REMOVE_FROM_END : 0)),
			end: end || range(value.end, 0)
		};
	}

	/**
	 * Finds parts of complex CSS value
	 * @param {String} str
	 * @returns {Array} Returns list of <code>Range</code>'s
	 */
	function findParts(str) {
		/** @type StringStream */
		var stream = stringStream.create(str);
		var ch;
		var result = [];
		var sep = /[\s\u00a0,;]/;
		
		var add = function() {
			stream.next();
			result.push(range(stream.start, stream.current()));
			stream.start = stream.pos;
		};
		
		// skip whitespace
		stream.eatSpace();
		stream.start = stream.pos;
		
		while ((ch = stream.next())) {
			if (ch == '"' || ch == "'") {
				stream.next();
				if (!stream.skipTo(ch)) break;
				add();
			} else if (ch == '(') {
				// function found, may have nested function
				stream.backUp(1);
				if (!stream.skipToPair('(', ')')) break;
				stream.backUp(1);
				add();
			} else {
				if (sep.test(ch)) {
					result.push(range(stream.start, stream.current().length - 1));
					stream.eatWhile(sep);
					stream.start = stream.pos;
				}
			}
		}
		
		add();

		return utils.unique(result.filter(function(item) {
			return !!item.length();
		}));
	}
	
	/**
	 * Parses CSS properties from given CSS source
	 * and adds them to CSSEditContainer node
	 * @param  {CSSEditContainer} node
	 * @param  {String} source CSS source
	 * @param {Number} offset Offset of properties subset from original source
	 */
	function consumeProperties(node, source, offset) {
		var list = extractPropertiesFromSource(source, offset);

		list.forEach(function(property) {
			node._children.push(new CSSEditElement(node,
				editTree.createToken(property.name.start, property.nameText),
				editTree.createToken(property.value.start, property.valueText),
				editTree.createToken(property.end.start, property.endText)
				));
		});
	}

	/**
	 * Parses given CSS source and returns list of ranges of located CSS properties.
	 * Normally, CSS source must contain properties only, it must be,
	 * for example, a content of CSS selector or text between nested
	 * CSS sections
	 * @param  {String} source CSS source
	 * @param {Number} offset Offset of properties subset from original source.
	 * Used to provide proper ranges of locates items
	 */
	function extractPropertiesFromSource(source, offset) {
		offset = offset || 0;
		source = source.replace(reSpaceEnd, '');
		var out = [];

		if (!source) {
			return out;
		}

		var tokens = cssParser.parse(source);
		var it = tokenIterator.create(tokens);
		var property;

		while ((property = consumeSingleProperty(it, source))) {
			out.push({
				nameText: property.name.substring(source),
				name: property.name.shift(offset),

				valueText: property.value.substring(source),
				value: property.value.shift(offset),

				endText: property.end.substring(source),
				end: property.end.shift(offset)
			});
		}

		return out;
	}
	
	/**
	 * @class
	 * @extends EditContainer
	 */
	var CSSEditContainer = editTree.EditContainer.extend({
		initialize: function(source, options) {
			utils.extend(this.options, defaultOptions, options);
			
			if (Array.isArray(source)) {
				source = cssParser.toSource(source);
			}

			var allRules = cssSections.findAllRules(source);
			var currentRule = allRules.shift();

			// keep top-level rules only since they will
			// be parsed by nested CSSEditContainer call
			var topLevelRules = [];
			allRules.forEach(function(r) {
				var isTopLevel = !utils.find(topLevelRules, function(tr) {
					return tr.contains(r);
				});

				if (isTopLevel) {
					topLevelRules.push(r);
				}
			});


			var selectorRange = range.create2(currentRule.start, currentRule._selectorEnd);
			this._name = selectorRange.substring(source);
			this._positions.name = selectorRange.start;
			this._positions.contentStart = currentRule._contentStart + 1;

			var sectionOffset = currentRule._contentStart + 1;
			var sectionEnd = currentRule.end - 1;

			// parse properties between nested rules
			// and add nested rules as children
			var that = this;
			topLevelRules.forEach(function(r) {
				consumeProperties(that, source.substring(sectionOffset, r.start), sectionOffset);
				var opt = utils.extend({}, that.options, {offset: r.start + that.options.offset});
				// XXX I think I don’t need nested containers here
				// They should be handled separately
				// that._children.push(new CSSEditContainer(r.substring(source), opt));
				sectionOffset = r.end;
			});

			// consume the rest of data
			consumeProperties(this, source.substring(sectionOffset, currentRule.end - 1), sectionOffset);
			this._saveStyle();
		},
		
		/**
		 * Remembers all styles of properties
		 * @private
		 */
		_saveStyle: function() {
			var start = this._positions.contentStart;
			var source = this.source;
			
			this.list().forEach(function(p) {
				if (p.type === 'container') {
					return;
				}

				p.styleBefore = source.substring(start, p.namePosition());
				// a small hack here:
				// Sometimes users add empty lines before properties to logically
				// separate groups of properties. In this case, a blind copy of
				// characters between rules may lead to undesired behavior,
				// especially when current rule is duplicated or used as a donor
				// to create new rule.
				// To solve this issue, we‘ll take only last newline indentation
				var lines = utils.splitByLines(p.styleBefore);
				if (lines.length > 1) {
					p.styleBefore = '\n' + lines[lines.length - 1];
				}
				
				p.styleSeparator = source.substring(p.nameRange().end, p.valuePosition());
				
				// graceful and naive comments removal 
				var parts = p.styleBefore.split('*/');
				p.styleBefore = parts[parts.length - 1];
				p.styleSeparator = p.styleSeparator.replace(/\/\*.*?\*\//g, '');
				
				start = p.range().end;
			});
		},

		/**
		 * Returns position of element name token
		 * @param {Boolean} isAbsolute Return absolute position
		 * @returns {Number}
		 */
		namePosition: function(isAbsolute) {
			return this._pos(this._positions.name, isAbsolute);
		},
		
		/**
		 * Returns position of element value token
		 * @param {Boolean} isAbsolute Return absolute position
		 * @returns {Number}
		 */
		valuePosition: function(isAbsolute) {
			return this._pos(this._positions.contentStart, isAbsolute);
		},

		/**
		 * Returns element value range
		 * @param {Boolean} isAbsolute Return absolute range
		 * @returns {Range}
		 */
		valueRange: function(isAbsolute) {
			return range.create2(this.valuePosition(isAbsolute), this._pos(this.valueOf().length, isAbsolute) - 1);
		},
		
		/**
		 * Adds new CSS property 
		 * @param {String} name Property name
		 * @param {String} value Property value
		 * @param {Number} pos Position at which to insert new property. By 
		 * default the property is inserted at the end of rule 
		 * @returns {CSSEditProperty}
		 */
		add: function(name, value, pos) {
			var list = this.list();
			var start = this._positions.contentStart;
			var styles = utils.pick(this.options, 'styleBefore', 'styleSeparator');
			
			if (typeof pos === 'undefined') {
				pos = list.length;
			}
			
			/** @type CSSEditProperty */
			var donor = list[pos];
			if (donor) {
				start = donor.fullRange().start;
			} else if ((donor = list[pos - 1])) {
				// make sure that donor has terminating semicolon
				donor.end(';');
				start = donor.range().end;
			}
			
			if (donor) {
				styles = utils.pick(donor, 'styleBefore', 'styleSeparator');
			}
			
			var nameToken = editTree.createToken(start + styles.styleBefore.length, name);
			var valueToken = editTree.createToken(nameToken.end + styles.styleSeparator.length, value);
			
			var property = new CSSEditElement(this, nameToken, valueToken,
					editTree.createToken(valueToken.end, ';'));
			
			utils.extend(property, styles);
			
			// write new property into the source
			this._updateSource(property.styleBefore + property.toString(), start);
			
			// insert new property
			this._children.splice(pos, 0, property);
			return property;
		}
	});
	
	/**
	 * @class
	 * @type CSSEditElement
	 * @constructor
	 */
	var CSSEditElement = editTree.EditElement.extend({
		initialize: function(rule, name, value, end) {
			this.styleBefore = rule.options.styleBefore;
			this.styleSeparator = rule.options.styleSeparator;
			
			this._end = end.value;
			this._positions.end = end.start;
		},
		
		/**
		 * Returns ranges of complex value parts
		 * @returns {Array} Returns <code>null</code> if value is not complex
		 */
		valueParts: function(isAbsolute) {
			var parts = findParts(this.value());
			if (isAbsolute) {
				var offset = this.valuePosition(true);
				parts.forEach(function(p) {
					p.shift(offset);
				});
			}
			
			return parts;
		},

		/**
		 * Sets of gets element value. 
		 * When setting value, this implementation will ensure that your have 
		 * proper name-value separator
		 * @param {String} val New element value. If not passed, current 
		 * value is returned
		 * @returns {String}
		 */
		value: function(val) {
			var isUpdating = typeof val !== 'undefined';
			var allItems = this.parent.list();
			if (isUpdating && this.isIncomplete()) {
				var self = this;
				var donor = utils.find(allItems, function(item) {
					return item !== self && !item.isIncomplete();
				});

				this.styleSeparator = donor 
					? donor.styleSeparator 
					: this.parent.options.styleSeparator;
				this.parent._updateSource(this.styleSeparator, range(this.valueRange().start, 0));
			}

			var value = this.constructor.__super__.value.apply(this, arguments);
			if (isUpdating) {
				// make sure current property has terminating semi-colon
				// if it’s not the last one
				var ix = allItems.indexOf(this);
				if (ix !== allItems.length - 1 && !this.end()) {
					this.end(';');
				}
			}
			return value;
		},

		/**
		 * Test if current element is incomplete, e.g. has no explicit
		 * name-value separator
		 * @return {Boolean} [description]
		 */
		isIncomplete: function() {
			return this.nameRange().end === this.valueRange().start;
		},
		
		/**
		 * Sets of gets property end value (basically, it's a semicolon)
		 * @param {String} val New end value. If not passed, current 
		 * value is returned
		 */
		end: function(val) {
			if (typeof val !== 'undefined' && this._end !== val) {
				this.parent._updateSource(val, this._positions.end, this._positions.end + this._end.length);
				this._end = val;
			}
			
			return this._end;
		},
		
		/**
		 * Returns full rule range, with indentation
		 * @param {Boolean} isAbsolute Return absolute range (with respect of
		 * rule offset)
		 * @returns {Range}
		 */
		fullRange: function(isAbsolute) {
			var r = this.range(isAbsolute);
			r.start -= this.styleBefore.length;
			return r;
		},
		
		/**
		 * Returns item string representation
		 * @returns {String}
		 */
		valueOf: function() {
			return this.name() + this.styleSeparator + this.value() + this.end();
		}
	});
	
	return {
		/**
		 * Parses CSS rule into editable tree
		 * @param {String} source
		 * @param {Object} options
		 * @memberOf emmet.cssEditTree
		 * @returns {EditContainer}
		 */
		parse: function(source, options) {
			return new CSSEditContainer(source, options);
		},
		
		/**
		 * Extract and parse CSS rule from specified position in <code>content</code> 
		 * @param {String} content CSS source code
		 * @param {Number} pos Character position where to start source code extraction
		 * @returns {EditContainer}
		 */
		parseFromPosition: function(content, pos, isBackward) {
			var bounds = cssSections.locateRule(content, pos, isBackward);
			if (!bounds || !bounds.inside(pos)) {
				// no matching CSS rule or caret outside rule bounds
				return null;
			}
			
			return this.parse(bounds.substring(content), {
				offset: bounds.start
			});
		},

		/**
		 * Locates CSS property in given CSS code fragment under specified character position
		 * @param  {String} css CSS code or parsed CSSEditContainer
		 * @param  {Number} pos Character position where to search CSS property
		 * @return {CSSEditElement}
		 */
		propertyFromPosition: function(css, pos) {
			var cssProp = null;
			/** @type EditContainer */
			var cssRule = typeof css === 'string' ? this.parseFromPosition(css, pos, true) : css;
			if (cssRule) {
				cssProp = cssRule.itemFromPosition(pos, true);
				if (!cssProp) {
					// in case user just started writing CSS property
					// and didn't include semicolon–try another approach
					cssProp = utils.find(cssRule.list(), function(elem) {
						return elem.range(true).end == pos;
					});
				}
			}

			return cssProp;
		},
		
		/**
		 * Removes vendor prefix from CSS property
		 * @param {String} name CSS property
		 * @return {String}
		 */
		baseName: function(name) {
			return name.replace(/^\s*\-\w+\-/, '');
		},
		
		/**
		 * Finds parts of complex CSS value
		 * @param {String} str
		 * @returns {Array}
		 */
		findParts: findParts,

		extractPropertiesFromSource: extractPropertiesFromSource
	};
});