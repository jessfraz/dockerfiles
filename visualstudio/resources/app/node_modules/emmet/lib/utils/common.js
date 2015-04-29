/**
 * Common utility helper for Emmet
 */
if (typeof module === 'object' && typeof define !== 'function') {
	var define = function (factory) {
		module.exports = factory(require, exports, module);
	};
}

define(function(require, exports, module) {
	var range = require('../assets/range');

	/** 
	 * Special token used as a placeholder for caret positions inside 
	 * generated output 
	 */
	var caretPlaceholder = '${0}';
	
	return {
		reTag: /<\/?[\w:\-]+(?:\s+[\w\-:]+(?:\s*=\s*(?:(?:"[^"]*")|(?:'[^']*')|[^>\s]+))?)*\s*(\/?)>$/,

		defaultSyntax: function() {
			return 'html';
		},

		defaultProfile: function() {
			return 'plain';
		},
		
		/**
		 * Test if passed string ends with XHTML tag. This method is used for testing
		 * '>' character: it belongs to tag or it's a part of abbreviation? 
		 * @param {String} str
		 * @return {Boolean}
		 */
		endsWithTag: function(str) {
			return this.reTag.test(str);
		},
		
		/**
		 * Check if passed symbol is a number
		 * @param {String} ch
		 * @returns {Boolean}
		 */
		isNumeric: function(ch) {
			if (typeof(ch) == 'string')
				ch = ch.charCodeAt(0);
				
			return (ch && ch > 47 && ch < 58);
		},
		
		/**
		 * Trim whitespace from string
		 * @param {String} text
		 * @return {String}
		 */
		trim: (function() {
			if (String.prototype.trim) {
				return function(text) {
					return text ? text.trim() : '';
				};
			}

			return function(text) {
				return (text || "").replace(/^\s+|\s+$/g, "");
			}
		})(),
		
		/**
		 * Split text into lines. Set <code>remove_empty</code> to true to filter
		 * empty lines
		 * @param {String} text Text to split
		 * @param {Boolean} removeEmpty Remove empty lines from result
		 * @return {Array}
		 */
		splitByLines: function(text, removeEmpty) {
			// IE fails to split string by regexp, 
			// need to normalize newlines first
			// Also, Mozilla's Rhiho JS engine has a weird newline bug
			var nl = '\n';
			var lines = (text || '')
				.replace(/\r\n/g, '\n')
				.replace(/\n\r/g, '\n')
				.replace(/\r/g, '\n')
				.replace(/\n/g, nl)
				.split(nl);
			
			if (removeEmpty) {
				lines = lines.filter(function(line) {
					return line.length && !!this.trim(line);
				}, this);
			}
			
			return lines;
		},
		
		/**
		 * Repeats string <code>howMany</code> times
		 * @param {String} str
		 * @param {Number} how_many
		 * @return {String}
		 */
		repeatString: function(str, howMany) {
			var out = '';
			while (howMany--) {
				out += str;
			}

			return out;
		},
		
		/**
		 * Returns list of paddings that should be used to align passed string
		 * @param {Array} strings
		 * @returns {Array}
		 */
		getStringsPads: function(strings) {
			var lengths = strings.map(function(s) {
				return typeof s === 'string' ? s.length : +s;
			});
			
			var max = lengths.reduce(function(prev, cur) {
				return typeof prev === 'undefined' ? cur : Math.max(prev, cur);
			});
			return lengths.map(function(l) {
				var pad = max - l;
				return pad ? this.repeatString(' ', pad) : '';
			}, this);
		},
		
		/**
		 * Indents text with padding
		 * @param {String} text Text to indent
		 * @param {String} pad Padding size (number) or padding itself (string)
		 * @return {String}
		 */
		padString: function(text, pad) {
			var result = [];
			var lines = this.splitByLines(text);
			var nl = '\n';
				
			result.push(lines[0]);
			for (var j = 1; j < lines.length; j++) 
				result.push(nl + pad + lines[j]);
				
			return result.join('');
		},
		
		/**
		 * Pad string with zeroes
		 * @param {String} str String to pad
		 * @param {Number} pad Desired string length
		 * @return {String}
		 */
		zeroPadString: function(str, pad) {
			var padding = '';
			var il = str.length;
				
			while (pad > il++) padding += '0';
			return padding + str; 
		},
		
		/**
		 * Removes padding at the beginning of each text's line
		 * @param {String} text
		 * @param {String} pad
		 */
		unindentString: function(text, pad) {
			var lines = this.splitByLines(text);
			var pl = pad.length;
			for (var i = 0, il = lines.length, line; i < il; i++) {
				line = lines[i];
				if (line.substr(0, pl) === pad) {
					lines[i] = line.substr(pl);
				}
			}
			
			return lines.join('\n');
		},
		
		/**
		 * Replaces unescaped symbols in <code>str</code>. For example, the '$' symbol
		 * will be replaced in 'item$count', but not in 'item\$count'.
		 * @param {String} str Original string
		 * @param {String} symbol Symbol to replace
		 * @param {String} replace Symbol replacement. Might be a function that 
		 * returns new value
		 * @return {String}
		 */
		replaceUnescapedSymbol: function(str, symbol, replace) {
			var i = 0;
			var il = str.length;
			var sl = symbol.length;
			var matchCount = 0;
				
			while (i < il) {
				if (str.charAt(i) == '\\') {
					// escaped symbol, skip next character
					i += sl + 1;
				} else if (str.substr(i, sl) == symbol) {
					// have match
					var curSl = sl;
					matchCount++;
					var newValue = replace;
					if (typeof replace === 'function') {
						var replaceData = replace(str, symbol, i, matchCount);
						if (replaceData) {
							curSl = replaceData[0].length;
							newValue = replaceData[1];
						} else {
							newValue = false;
						}
					}
					
					if (newValue === false) { // skip replacement
						i++;
						continue;
					}
					
					str = str.substring(0, i) + newValue + str.substring(i + curSl);
					// adjust indexes
					il = str.length;
					i += newValue.length;
				} else {
					i++;
				}
			}
			
			return str;
		},
		
		/**
		 * Replaces '$' character in string assuming it might be escaped with '\'
		 * @param {String} str String where character should be replaced
		 * @param {String} value New value
		 * @return {String}
		 */
		replaceCounter: function(str, value, total) {
			var symbol = '$';
			// in case we received strings from Java, convert the to native strings
			str = String(str);
			value = String(value);
			
			if (/^\-?\d+$/.test(value)) {
				value = +value;
			}
			
			var that = this;
			
			return this.replaceUnescapedSymbol(str, symbol, function(str, symbol, pos, matchNum){
				if (str.charAt(pos + 1) == '{' || that.isNumeric(str.charAt(pos + 1)) ) {
					// it's a variable, skip it
					return false;
				}
				
				// replace sequense of $ symbols with padded number  
				var j = pos + 1;
				while(str.charAt(j) == '$' && str.charAt(j + 1) != '{') j++;
				var pad = j - pos;
				
				// get counter base
				var base = 0, decrement = false, m;
				if ((m = str.substr(j).match(/^@(\-?)(\d*)/))) {
					j += m[0].length;
					
					if (m[1]) {
						decrement = true;
					}
					
					base = parseInt(m[2] || 1, 10) - 1;
				}
				
				if (decrement && total && typeof value === 'number') {
					value = total - value + 1;
				}
				
				value += base;
				
				return [str.substring(pos, j), that.zeroPadString(value + '', pad)];
			});
		},
		
		/**
		 * Check if string matches against <code>reTag</code> regexp. This 
		 * function may be used to test if provided string contains HTML tags
		 * @param {String} str
		 * @returns {Boolean}
		 */
		matchesTag: function(str) {
			return this.reTag.test(str || '');
		},
		
		/**
		 * Escapes special characters used in Emmet, like '$', '|', etc.
		 * Use this method before passing to actions like "Wrap with Abbreviation"
		 * to make sure that existing special characters won't be altered
		 * @param {String} text
		 * @return {String}
		 */
		escapeText: function(text) {
			return text.replace(/([\$\\])/g, '\\$1');
		},
		
		/**
		 * Unescapes special characters used in Emmet, like '$', '|', etc.
		 * @param {String} text
		 * @return {String}
		 */
		unescapeText: function(text) {
			return text.replace(/\\(.)/g, '$1');
		},
		
		/**
		 * Returns caret placeholder
		 * @returns {String}
		 */
		getCaretPlaceholder: function() {
			return typeof caretPlaceholder === 'function'
				? caretPlaceholder.apply(this, arguments)
				: caretPlaceholder;
		},
		
		/**
		 * Sets new representation for carets in generated output
		 * @param {String} value New caret placeholder. Might be a 
		 * <code>Function</code>
		 */
		setCaretPlaceholder: function(value) {
			caretPlaceholder = value;
		},
		
		/**
		 * Returns line padding
		 * @param {String} line
		 * @return {String}
		 */
		getLinePadding: function(line) {
			return (line.match(/^(\s+)/) || [''])[0];
		},
		
		/**
		 * Helper function that returns padding of line of <code>pos</code>
		 * position in <code>content</code>
		 * @param {String} content
		 * @param {Number} pos
		 * @returns {String}
		 */
		getLinePaddingFromPosition: function(content, pos) {
			var lineRange = this.findNewlineBounds(content, pos);
			return this.getLinePadding(lineRange.substring(content));
		},
		
		/**
		 * Escape special regexp chars in string, making it usable for creating dynamic
		 * regular expressions
		 * @param {String} str
		 * @return {String}
		 */
		escapeForRegexp: function(str) {
			var specials = new RegExp("[.*+?|()\\[\\]{}\\\\]", "g"); // .*+?|()[]{}\
			return str.replace(specials, "\\$&");
		},
		
		/**
		 * Make decimal number look good: convert it to fixed precision end remove
		 * traling zeroes 
		 * @param {Number} num
		 * @param {Number} fracion Fraction numbers (default is 2)
		 * @return {String}
		 */
		prettifyNumber: function(num, fraction) {
			return num.toFixed(typeof fraction == 'undefined' ? 2 : fraction).replace(/\.?0+$/, '');
		},
		
		/**
		 * Replace substring of <code>str</code> with <code>value</code>
		 * @param {String} str String where to replace substring
		 * @param {String} value New substring value
		 * @param {Number} start Start index of substring to replace. May also
		 * be a <code>Range</code> object: in this case, the <code>end</code>
		 * argument is not required
		 * @param {Number} end End index of substring to replace. If ommited, 
		 * <code>start</code> argument is used
		 */
		replaceSubstring: function(str, value, start, end) {
			if (typeof start === 'object' && 'end' in start) {
				end = start.end;
				start = start.start;
			}
			
			if (typeof end === 'string') {
				end = start + end.length;
			}
			
			if (typeof end === 'undefined') {
				end = start;
			}
			
			if (start < 0 || start > str.length)
				return str;
			
			return str.substring(0, start) + value + str.substring(end);
		},

		/**
		 * Fills substrings in `content`, defined by given ranges,
		 * wich `ch` character
		 * @param  {String} content
		 * @param  {Array} ranges
		 * @return {String}
		 */
		replaceWith: function(content, ranges, ch, noRepeat) {
			if (ranges.length) {
				var offset = 0, fragments = [];
				ranges.forEach(function(r) {
					var repl = noRepeat ? ch : this.repeatString(ch, r[1] - r[0]);
					fragments.push(content.substring(offset, r[0]), repl);
					offset = r[1];
				}, this);

				content = fragments.join('') + content.substring(offset);
			}

			return content;
		},
		
		/**
		 * Narrows down text range, adjusting selection to non-space characters
		 * @param {String} text
		 * @param {Number} start Starting range in <code>text</code> where 
		 * slection should be adjusted. Can also be any object that is accepted
		 * by <code>Range</code> class
		 * @return {Range}
		 */
		narrowToNonSpace: function(text, start, end) {
			var rng = range.create(start, end);
			
			var reSpace = /[\s\n\r\u00a0]/;
			// narrow down selection until first non-space character
			while (rng.start < rng.end) {
				if (!reSpace.test(text.charAt(rng.start)))
					break;
					
				rng.start++;
			}
			
			while (rng.end > rng.start) {
				rng.end--;
				if (!reSpace.test(text.charAt(rng.end))) {
					rng.end++;
					break;
				}
			}
			
			return rng;
		},
		
		/**
		 * Find start and end index of text line for <code>from</code> index
		 * @param {String} text 
		 * @param {Number} from
		 */
		findNewlineBounds: function(text, from) {
			var len = text.length,
				start = 0,
				end = len - 1, 
				ch;

			
			// search left
			for (var i = from - 1; i > 0; i--) {
				ch = text.charAt(i);
				if (ch == '\n' || ch == '\r') {
					start = i + 1;
					break;
				}
			}
			// search right
			for (var j = from; j < len; j++) {
				ch = text.charAt(j);
				if (ch == '\n' || ch == '\r') {
					end = j;
					break;
				}
			}
			
			return range.create(start, end - start);
		},

		/**
		 * Deep merge of two or more objects. Taken from jQuery.extend()
		 */
		deepMerge: function() {
			var options, name, src, copy, copyIsArray, clone,
				target = arguments[0] || {},
				i = 1,
				length = arguments.length;


			// Handle case when target is a string or something (possible in deep copy)
			if (typeof target !== 'object' && typeof target !== 'function') {
				target = {};
			}

			for ( ; i < length; i++ ) {
				// Only deal with non-null/undefined values
				if ( (options = arguments[ i ]) !== null ) {
					// Extend the base object
					for ( name in options ) {
						src = target[ name ];
						copy = options[ name ];

						// Prevent never-ending loop
						if ( target === copy ) {
							continue;
						}

						// Recurse if we're merging plain objects or arrays
						if ( copy && ( typeof copy === 'object' || (copyIsArray = Array.isArray(copy)) ) ) {
							if ( copyIsArray ) {
								copyIsArray = false;
								clone = src && Array.isArray(src) ? src : [];

							} else {
								clone = src && typeof src === 'object' ? src : {};
							}

							// Never move original objects, clone them
							target[ name ] = this.deepMerge(clone, copy );

						// Don't bring in undefined values
						} else if ( copy !== undefined ) {
							target[ name ] = copy;
						}
					}
				}
			}

			// Return the modified object
			return target;
		},

		/**
		 * Dead simple string-to-JSON parser
		 * @param {String} str
		 * @returns {Object}
		 */
		parseJSON: function(str) {
			if (typeof str == 'object') {
				return str;
			}
			
			try {
				return JSON.parse(str);
			} catch(e) {
				return {};
			}
		},


		/**************************
		 * Utility belt
		 **************************/
		unique: function(arr, comparator) {
			var lookup = [];
			return arr.filter(function(item) {
				var val = comparator ? comparator(item) : item;
				if (lookup.indexOf(val) < 0) {
					lookup.push(val);
					return true;
				}
			});
		},

		/**
		 * Return a copy of the object, filtered to only have values for 
		 * the whitelisted keys. 
		 * @param  {Object} obj
		 * @return {Object}
		 */
		pick: function(obj) {
			var result = {};
			var keys = this.toArray(arguments, 1);
			Object.keys(obj).forEach(function(key) {
				if (~keys.indexOf(key)) {
					result[key] = obj[key];
				}
			});
			return result;
		},

		find: function(arr, comparator, ctx) {
			var result;
			if (ctx) {
				comparator = comparator.bind(ctx);
			}

			if (Array.isArray(arr)) {
				arr.some(function(item, i) {
					if (comparator(item, i)) {
						return result = item;
					}
				});
			} else {
				Object.keys(arr).some(function(key, i) {
					if (comparator(arr[key], i)) {
						return result = arr[key];
					}
				});
			}

			return result;
		},

		toArray: function(obj, sliceIx) {
			if (Array.isArray(obj) && !sliceIx) {
				return obj;
			}
			return Array.prototype.slice.call(obj, sliceIx || 0);
		},

		extend: function(obj) {
			for (var i = 1, il = arguments.length, a; i < il; i++) {
				a = arguments[i];
				if (a) {
					Object.keys(a).forEach(function(key) {
						obj[key] = a[key];
					});
				}
			}
			return obj;
		},

		defaults: function(obj) {
			for (var i = 1, il = arguments.length, a; i < il; i++) {
				a = arguments[i];
				if (a) {
					Object.keys(a).forEach(function(key) {
						if (!(key in obj)) {
							obj[key] = a[key];
						}
					});
				}
			}
			return obj;
		},

		flatten: function(arr, out) {
			out = out || [];
			var self = this;
			self.toArray(arr).forEach(function(item) {
				if (Array.isArray(item)) {
					self.flatten(item, out);
				} else {
					out.push(item);
				}
			});

			return out;
		},

		clone: function(obj) {
			if (Array.isArray(obj)) {
				return obj.slice(0);
			}

			return this.extend({}, obj);
		},

		without: function(arr) {
			this.toArray(arguments, 1).forEach(function(item) {
				var ix;
				while (~(ix = arr.indexOf(item))) {
					arr.splice(ix, 1);
				}
			});
			return arr;
		},

		last: function(arr) {
			return arr[arr.length - 1];
		}
	};
});
