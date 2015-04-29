/**
 * Emmet abbreviation parser.
 * Takes string abbreviation and recursively parses it into a tree. The parsed 
 * tree can be transformed into a string representation with 
 * <code>toString()</code> method. Note that string representation is defined
 * by custom processors (called <i>filters</i>), not by abbreviation parser 
 * itself.
 * 
 * This module can be extended with custom pre-/post-processors to shape-up
 * final tree or its representation. Actually, many features of abbreviation 
 * engine are defined in other modules as tree processors
 */
if (typeof module === 'object' && typeof define !== 'function') {
	var define = function (factory) {
		module.exports = factory(require, exports, module);
	};
}

define(function(require, exports, module) {
	var tabStops = require('../assets/tabStops');
	var profile = require('../assets/profile');
	var filters = require('../filter/main');
	var utils = require('../utils/common');
	var abbreviationUtils = require('../utils/abbreviation');
	var stringStream = require('../assets/stringStream');

	// pre- and post-processorcs
	var lorem = require('../generator/lorem');
	var procPastedContent = require('./processor/pastedContent');
	var procTagName = require('./processor/tagName');
	var procResourceMatcher = require('./processor/resourceMatcher');
	var procAttributes = require('./processor/attributes');
	var procHref = require('./processor/href');

	var reValidName = /^[\w\-\$\:@\!%]+\+?$/i;
	var reWord = /[\w\-:\$@]/;
	var DEFAULT_ATTR_NAME = '%default';
	
	var pairs = {
		'[': ']',
		'(': ')',
		'{': '}'
	};
	
	var spliceFn = Array.prototype.splice;
	
	var preprocessors = [];
	var postprocessors = [];
	var outputProcessors = [];
	
	/**
	 * @type AbbreviationNode
	 */
	function AbbreviationNode(parent) {
		/** @type AbbreviationNode */
		this.parent = null;
		this.children = [];
		this._attributes = [];
		
		/** @type String Raw abbreviation for current node */
		this.abbreviation = '';
		this.counter = 1;
		this._name = null;
		this._text = '';
		this.repeatCount = 1;
		this.hasImplicitRepeat = false;
		
		/** Custom data dictionary */
		this._data = {};
		
		// output properties
		this.start = '';
		this.end = '';
		this.content = '';
		this.padding = '';
	}
	
	AbbreviationNode.prototype = {
		/**
		 * Adds passed node as child or creates new child
		 * @param {AbbreviationNode} child
		 * @param {Number} position Index in children array where child should 
		 * be inserted
		 * @return {AbbreviationNode}
		 */
		addChild: function(child, position) {
			child = child || new AbbreviationNode();
			child.parent = this;
			
			if (typeof position === 'undefined') {
				this.children.push(child);
			} else {
				this.children.splice(position, 0, child);
			}
			
			return child;
		},
		
		/**
		 * Creates a deep copy of current node
		 * @returns {AbbreviationNode}
		 */
		clone: function() {
			var node = new AbbreviationNode();
			var attrs = ['abbreviation', 'counter', '_name', '_text', 'repeatCount', 'hasImplicitRepeat', 'start', 'end', 'content', 'padding'];
			attrs.forEach(function(a) {
				node[a] = this[a];
			}, this);
			
			// clone attributes
			node._attributes = this._attributes.map(function(attr) {
				return utils.extend({}, attr);
			});
			
			node._data = utils.extend({}, this._data);
			
			// clone children
			node.children = this.children.map(function(child) {
				child = child.clone();
				child.parent = node;
				return child;
			});
			
			return node;
		},
		
		/**
		 * Removes current node from parent‘s child list
		 * @returns {AbbreviationNode} Current node itself
		 */
		remove: function() {
			if (this.parent) {
				var ix = this.parent.children.indexOf(this);
				if (~ix) {
					this.parent.children.splice(ix, 1);
				}
			}
			
			return this;
		},
		
		/**
		 * Replaces current node in parent‘s children list with passed nodes
		 * @param {AbbreviationNode} node Replacement node or array of nodes
		 */
		replace: function() {
			var parent = this.parent;
			var ix = parent.children.indexOf(this);
			var items = utils.flatten(arguments);
			spliceFn.apply(parent.children, [ix, 1].concat(items));
			
			// update parent
			items.forEach(function(item) {
				item.parent = parent;
			});
		},
		
		/**
		 * Recursively sets <code>property</code> to <code>value</code> of current
		 * node and its children 
		 * @param {String} name Property to update
		 * @param {Object} value New property value
		 */
		updateProperty: function(name, value) {
			this[name] = value;
			this.children.forEach(function(child) {
				child.updateProperty(name, value);
			});
			
			return this;
		},
		
		/**
		 * Finds first child node that matches truth test for passed 
		 * <code>fn</code> function
		 * @param {Function} fn
		 * @returns {AbbreviationNode}
		 */
		find: function(fn) {
			return this.findAll(fn, {amount: 1})[0];
		},
		
		/**
		 * Finds all child nodes that matches truth test for passed 
		 * <code>fn</code> function
		 * @param {Function} fn
		 * @returns {Array}
		 */
		findAll: function(fn, state) {
			state = utils.extend({amount: 0, found: 0}, state || {});

			if (typeof fn !== 'function') {
				var elemName = fn.toLowerCase();
				fn = function(item) {return item.name().toLowerCase() == elemName;};
			}
				
			var result = [];
			this.children.forEach(function(child) {
				if (fn(child)) {
					result.push(child);
					state.found++;
					if (state.amount && state.found >= state.amount) {
						return;
					}
				}
				
				result = result.concat(child.findAll(fn));
			});
			
			return result.filter(function(item) {
				return !!item;
			});
		},
		
		/**
		 * Sets/gets custom data
		 * @param {String} name
		 * @param {Object} value
		 * @returns {Object}
		 */
		data: function(name, value) {
			if (arguments.length == 2) {
				this._data[name] = value;
			}
			
			return this._data[name];
		},
		
		/**
		 * Returns name of current node
		 * @returns {String}
		 */
		name: function() {
			return this._name;
		},
		
		/**
		 * Returns list of attributes for current node
		 * @returns {Array}
		 */
		attributeList: function() {
			return optimizeAttributes(this._attributes.slice(0));
		},
		
		/**
		 * Returns or sets attribute value
		 * @param {String} name Attribute name
		 * @param {String} value New attribute value. `Null` value 
		 * will remove attribute
		 * @returns {String}
		 */
		attribute: function(name, value) {
			if (arguments.length == 2) {
				if (value === null) {
					// remove attribute
					var vals = this._attributes.filter(function(attr) {
						return attr.name === name;
					});

					var that = this;
					vals.forEach(function(attr) {
						var ix = that._attributes.indexOf(attr);
						if (~ix) {
							that._attributes.splice(ix, 1);
						}
					});

					return;
				}

				// modify attribute
				var attrNames = this._attributes.map(function(attr) {
					return attr.name;
				});
				var ix = attrNames.indexOf(name.toLowerCase());
				if (~ix) {
					this._attributes[ix].value = value;
				} else {
					this._attributes.push({
						name: name,
						value: value
					});
				}
			}
			
			return (utils.find(this.attributeList(), function(attr) {
				return attr.name == name;
			}) || {}).value;
		},
		
		/**
		 * Returns index of current node in parent‘s children list
		 * @returns {Number}
		 */
		index: function() {
			return this.parent ? this.parent.children.indexOf(this) : -1;
		},
		
		/**
		 * Sets how many times current element should be repeated
		 * @private
		 */
		_setRepeat: function(count) {
			if (count) {
				this.repeatCount = parseInt(count, 10) || 1;
			} else {
				this.hasImplicitRepeat = true;
			}
		},
		
		/**
		 * Sets abbreviation that belongs to current node
		 * @param {String} abbr
		 */
		setAbbreviation: function(abbr) {
			abbr = abbr || '';
			
			var that = this;
			
			// find multiplier
			abbr = abbr.replace(/\*(\d+)?$/, function(str, repeatCount) {
				that._setRepeat(repeatCount);
				return '';
			});
			
			this.abbreviation = abbr;
			
			var abbrText = extractText(abbr);
			if (abbrText) {
				abbr = abbrText.element;
				this.content = this._text = abbrText.text;
			}
			
			var abbrAttrs = parseAttributes(abbr);
			if (abbrAttrs) {
				abbr = abbrAttrs.element;
				this._attributes = abbrAttrs.attributes;
			}
			
			this._name = abbr;
			
			// validate name
			if (this._name && !reValidName.test(this._name)) {
				throw new Error('Invalid abbreviation');
			}
		},
		
		/**
		 * Returns string representation of current node
		 * @return {String}
		 */
		valueOf: function() {
			var start = this.start;
			var end = this.end;
			var content = this.content;
			
			// apply output processors
			var node = this;
			outputProcessors.forEach(function(fn) {
				start = fn(start, node, 'start');
				content = fn(content, node, 'content');
				end = fn(end, node, 'end');
			});
			
			
			var innerContent = this.children.map(function(child) {
				return child.valueOf();
			}).join('');
			
			content = abbreviationUtils.insertChildContent(content, innerContent, {
				keepVariable: false
			});
			
			return start + utils.padString(content, this.padding) + end;
		},

		toString: function() {
			return this.valueOf();
		},
		
		/**
		 * Check if current node contains children with empty <code>expr</code>
		 * property
		 * @return {Boolean}
		 */
		hasEmptyChildren: function() {
			return !!utils.find(this.children, function(child) {
				return child.isEmpty();
			});
		},
		
		/**
		 * Check if current node has implied name that should be resolved
		 * @returns {Boolean}
		 */
		hasImplicitName: function() {
			return !this._name && !this.isTextNode();
		},
		
		/**
		 * Indicates that current element is a grouping one, e.g. has no 
		 * representation but serves as a container for other nodes
		 * @returns {Boolean}
		 */
		isGroup: function() {
			return !this.abbreviation;
		},
		
		/**
		 * Indicates empty node (i.e. without abbreviation). It may be a 
		 * grouping node and should not be outputted
		 * @return {Boolean}
		 */
		isEmpty: function() {
			return !this.abbreviation && !this.children.length;
		},
		
		/**
		 * Indicates that current node should be repeated
		 * @returns {Boolean}
		 */
		isRepeating: function() {
			return this.repeatCount > 1 || this.hasImplicitRepeat;
		},
		
		/**
		 * Check if current node is a text-only node
		 * @return {Boolean}
		 */
		isTextNode: function() {
			return !this.name() && !this.attributeList().length;
		},
		
		/**
		 * Indicates whether this node may be used to build elements or snippets
		 * @returns {Boolean}
		 */
		isElement: function() {
			return !this.isEmpty() && !this.isTextNode();
		},
		
		/**
		 * Returns latest and deepest child of current tree
		 * @returns {AbbreviationNode}
		 */
		deepestChild: function() {
			if (!this.children.length)
				return null;
				
			var deepestChild = this;
			while (deepestChild.children.length) {
				deepestChild = deepestChild.children[deepestChild.children.length - 1];
			}
			
			return deepestChild;
		}
	};
	
	/**
	 * Returns stripped string: a string without first and last character.
	 * Used for “unquoting” strings
	 * @param {String} str
	 * @returns {String}
	 */
	function stripped(str) {
		return str.substring(1, str.length - 1);
	}
	
	function consumeQuotedValue(stream, quote) {
		var ch;
		while ((ch = stream.next())) {
			if (ch === quote)
				return true;
			
			if (ch == '\\')
				continue;
		}
		
		return false;
	}
	
	/**
	 * Parses abbreviation into a tree
	 * @param {String} abbr
	 * @returns {AbbreviationNode}
	 */
	function parseAbbreviation(abbr) {
		abbr = utils.trim(abbr);
		
		var root = new AbbreviationNode();
		var context = root.addChild(), ch;
		
		/** @type StringStream */
		var stream = stringStream.create(abbr);
		var loopProtector = 1000, multiplier;
		var addChild = function(child) {
			context.addChild(child);
		};

		var consumeAbbr = function() {
			stream.start = stream.pos;
			stream.eatWhile(function(c) {
				if (c == '[' || c == '{') {
					if (stream.skipToPair(c, pairs[c])) {
						stream.backUp(1);
						return true;
					}
					
					throw new Error('Invalid abbreviation: mo matching "' + pairs[c] + '" found for character at ' + stream.pos);
				}
				
				if (c == '+') {
					// let's see if this is an expando marker
					stream.next();
					var isMarker = stream.eol() ||  ~'+>^*'.indexOf(stream.peek());
					stream.backUp(1);
					return isMarker;
				}
				
				return c != '(' && isAllowedChar(c);
			});
		};
		
		while (!stream.eol() && --loopProtector > 0) {
			ch = stream.peek();
			
			switch (ch) {
				case '(': // abbreviation group
					stream.start = stream.pos;
					if (stream.skipToPair('(', ')')) {
						var inner = parseAbbreviation(stripped(stream.current()));
						if ((multiplier = stream.match(/^\*(\d+)?/, true))) {
							context._setRepeat(multiplier[1]);
						}
						
						inner.children.forEach(addChild);
					} else {
						throw new Error('Invalid abbreviation: mo matching ")" found for character at ' + stream.pos);
					}
					break;
					
				case '>': // child operator
					context = context.addChild();
					stream.next();
					break;
					
				case '+': // sibling operator
					context = context.parent.addChild();
					stream.next();
					break;
					
				case '^': // climb up operator
					var parent = context.parent || context;
					context = (parent.parent || parent).addChild();
					stream.next();
					break;
					
				default: // consume abbreviation
					consumeAbbr();
					context.setAbbreviation(stream.current());
					stream.start = stream.pos;
			}
		}
		
		if (loopProtector < 1) {
			throw new Error('Endless loop detected');
		}
		
		return root;
	}

	/**
	 * Splits attribute set into a list of attributes string
	 * @param  {String} attrSet 
	 * @return {Array}
	 */
	function splitAttributes(attrSet) {
		attrSet = utils.trim(attrSet);
		var parts = [];

		// split attribute set by spaces
		var stream = stringStream(attrSet), ch;
		while ((ch = stream.next())) {
			if (ch == ' ') {
				parts.push(utils.trim(stream.current()));
				// skip spaces
				while (stream.peek() == ' ') {
					stream.next();
				}

				stream.start = stream.pos;
			} else if (ch == '"' || ch == "'") {
				// skip values in strings
				if (!stream.skipString(ch)) {
					throw new Error('Invalid attribute set');
				}
			}
		}

		parts.push(utils.trim(stream.current()));
		return parts;
	}

	/**
	 * Removes opening and closing quotes from given string
	 * @param  {String} str
	 * @return {String}
	 */
	function unquote(str) {
		var ch = str.charAt(0);
		if (ch == '"' || ch == "'") {
			str = str.substr(1);
			var last = str.charAt(str.length - 1);
			if (last === ch) {
				str = str.substr(0, str.length - 1);
			}
		}

		return str;
	}

	/**
	 * Extract attributes and their values from attribute set: 
	 * <code>[attr col=3 title="Quoted string"]</code> (without square braces)
	 * @param {String} attrSet
	 * @returns {Array}
	 */
	function extractAttributes(attrSet) {
		var reAttrName = /^[\w\-:\$@]+\.?$/;
		return splitAttributes(attrSet).map(function(attr) {
			// attribute name: [attr]
			if (reAttrName.test(attr)) {
				var value = '';
				if (attr.charAt(attr.length - 1) == '.') {
					// a boolean attribute
					attr = attr.substr(0, attr.length - 1);
					value = attr;
				}
				return {
					name: attr,
					value: value
				};
			}

			// attribute with value: [name=val], [name="val"]
			if (~attr.indexOf('=')) {
				var parts = attr.split('=');
				return {
					name: parts.shift(),
					value: unquote(parts.join('='))
				};
			}

			// looks like it’s implied attribute
			return {
				name: DEFAULT_ATTR_NAME,
				value: unquote(attr)
			};
		});
	}
	
	/**
	 * Parses tag attributes extracted from abbreviation. If attributes found, 
	 * returns object with <code>element</code> and <code>attributes</code>
	 * properties
	 * @param {String} abbr
	 * @returns {Object} Returns <code>null</code> if no attributes found in 
	 * abbreviation
	 */
	function parseAttributes(abbr) {
		/*
		 * Example of incoming data:
		 * #header
		 * .some.data
		 * .some.data#header
		 * [attr]
		 * #item[attr=Hello other="World"].class
		 */
		var result = [];
		var attrMap = {'#': 'id', '.': 'class'};
		var nameEnd = null;
		
		/** @type StringStream */
		var stream = stringStream.create(abbr);
		while (!stream.eol()) {
			switch (stream.peek()) {
				case '#': // id
				case '.': // class
					if (nameEnd === null)
						nameEnd = stream.pos;
					
					var attrName = attrMap[stream.peek()];
					
					stream.next();
					stream.start = stream.pos;
					stream.eatWhile(reWord);
					result.push({
						name: attrName, 
						value: stream.current()
					});
					break;
				case '[': //begin attribute set
					if (nameEnd === null)
						nameEnd = stream.pos;
					
					stream.start = stream.pos;
					if (!stream.skipToPair('[', ']')) {
						throw new Error('Invalid attribute set definition');
					}
					
					result = result.concat(
						extractAttributes(stripped(stream.current()))
					);
					break;
				default:
					stream.next();
			}
		}
		
		if (!result.length)
			return null;
		
		return {
			element: abbr.substring(0, nameEnd),
			attributes: optimizeAttributes(result)
		};
	}
	
	/**
	 * Optimize attribute set: remove duplicates and merge class attributes
	 * @param attrs
	 */
	function optimizeAttributes(attrs) {
		// clone all attributes to make sure that original objects are 
		// not modified
		attrs = attrs.map(function(attr) {
			return utils.clone(attr);
		});
		
		var lookup = {};

		return attrs.filter(function(attr) {
			if (!(attr.name in lookup)) {
				return lookup[attr.name] = attr;
			}
			
			var la = lookup[attr.name];
			
			if (attr.name.toLowerCase() == 'class') {
				la.value += (la.value.length ? ' ' : '') + attr.value;
			} else {
				la.value = attr.value;
				la.isImplied = !!attr.isImplied;
			}
			
			return false;
		});
	}
	
	/**
	 * Extract text data from abbreviation: if <code>a{hello}</code> abbreviation
	 * is passed, returns object <code>{element: 'a', text: 'hello'}</code>.
	 * If nothing found, returns <code>null</code>
	 * @param {String} abbr
	 * 
	 */
	function extractText(abbr) {
		if (!~abbr.indexOf('{'))
			return null;
		
		/** @type StringStream */
		var stream = stringStream.create(abbr);
		while (!stream.eol()) {
			switch (stream.peek()) {
				case '[':
				case '(':
					stream.skipToPair(stream.peek(), pairs[stream.peek()]); break;
					
				case '{':
					stream.start = stream.pos;
					stream.skipToPair('{', '}');
					return {
						element: abbr.substring(0, stream.start),
						text: stripped(stream.current())
					};
					
				default:
					stream.next();
			}
		}
	}
	
	/**
	 * “Un-rolls“ contents of current node: recursively replaces all repeating 
	 * children with their repeated clones
	 * @param {AbbreviationNode} node
	 * @returns {AbbreviationNode}
	 */
	function unroll(node) {
		for (var i = node.children.length - 1, j, child, maxCount; i >= 0; i--) {
			child = node.children[i];
			
			if (child.isRepeating()) {
				maxCount = j = child.repeatCount;
				child.repeatCount = 1;
				child.updateProperty('counter', 1);
				child.updateProperty('maxCount', maxCount);
				while (--j > 0) {
					child.parent.addChild(child.clone(), i + 1)
						.updateProperty('counter', j + 1)
						.updateProperty('maxCount', maxCount);
				}
			}
		}
		
		// to keep proper 'counter' property, we need to walk
		// on children once again
		node.children.forEach(unroll);
		
		return node;
	}
	
	/**
	 * Optimizes tree node: replaces empty nodes with their children
	 * @param {AbbreviationNode} node
	 * @return {AbbreviationNode}
	 */
	function squash(node) {
		for (var i = node.children.length - 1; i >= 0; i--) {
			/** @type AbbreviationNode */
			var n = node.children[i];
			if (n.isGroup()) {
				n.replace(squash(n).children);
			} else if (n.isEmpty()) {
				n.remove();
			}
		}
		
		node.children.forEach(squash);
		
		return node;
	}
	
	function isAllowedChar(ch) {
		var charCode = ch.charCodeAt(0);
		var specialChars = '#.*:$-_!@|%';
		
		return (charCode > 64 && charCode < 91)       // uppercase letter
				|| (charCode > 96 && charCode < 123)  // lowercase letter
				|| (charCode > 47 && charCode < 58)   // number
				|| specialChars.indexOf(ch) != -1;    // special character
	}

	// XXX add counter replacer function as output processor
	outputProcessors.push(function(text, node) {
		return utils.replaceCounter(text, node.counter, node.maxCount);
	});

	// XXX add tabstop updater
	outputProcessors.push(tabStops.abbrOutputProcessor.bind(tabStops));

	// include default pre- and postprocessors
	[lorem, procResourceMatcher, procAttributes, procPastedContent, procTagName, procHref].forEach(function(mod) {
		if (mod.preprocessor) {
			preprocessors.push(mod.preprocessor.bind(mod));
		}

		if (mod.postprocessor) {
			postprocessors.push(mod.postprocessor.bind(mod));
		}
	});

	return {
		DEFAULT_ATTR_NAME: DEFAULT_ATTR_NAME,

		/**
		 * Parses abbreviation into tree with respect of groups, 
		 * text nodes and attributes. Each node of the tree is a single 
		 * abbreviation. Tree represents actual structure of the outputted 
		 * result
		 * @memberOf abbreviationParser
		 * @param {String} abbr Abbreviation to parse
		 * @param {Object} options Additional options for parser and processors
		 * 
		 * @return {AbbreviationNode}
		 */
		parse: function(abbr, options) {
			options = options || {};
			
			var tree = parseAbbreviation(abbr);
			var that = this;
			
			if (options.contextNode) {
				// add info about context node –
				// a parent XHTML node in editor inside which abbreviation is 
				// expanded
				tree._name = options.contextNode.name;
				var attrLookup = {};
				tree._attributes.forEach(function(attr) {
					attrLookup[attr.name] = attr;
				});
				
				options.contextNode.attributes.forEach(function(attr) {
					if (attr.name in attrLookup) {
						attrLookup[attr.name].value = attr.value;
					} else {
						attr = utils.clone(attr);
						tree._attributes.push(attr);
						attrLookup[attr.name] = attr;
					}
				});
			}
			
			// apply preprocessors
			preprocessors.forEach(function(fn) {
				fn(tree, options, that);
			});

			if ('counter' in options) {
				tree.updateProperty('counter', options.counter);
			}
			
			tree = squash(unroll(tree));
			
			// apply postprocessors
			postprocessors.forEach(function(fn) {
				fn(tree, options, that);
			});
			
			return tree;
		},

		/**
		 * Expands given abbreviation into a formatted code structure.
		 * This is the main method that is used for expanding abbreviation
		 * @param {String} abbr Abbreviation to expand
		 * @param {Options} options Additional options for abbreviation
		 * expanding and transformation: `syntax`, `profile`, `contextNode` etc.
		 * @return {String}
		 */
		expand: function(abbr, options) {
			if (!abbr) return '';
			if (typeof options == 'string') {
				throw new Error('Deprecated use of `expand` method: `options` must be object');
			}

			options = options || {};

			if (!options.syntax) {
				options.syntax = utils.defaultSyntax();
			}

			var p = profile.get(options.profile, options.syntax);
			tabStops.resetTabstopIndex();
			
			var data = filters.extract(abbr);
			var outputTree = this.parse(data[0], options);

			var filtersList = filters.composeList(options.syntax, p, data[1]);
			filters.apply(outputTree, filtersList, p);

			return outputTree.valueOf();
		},
		
		AbbreviationNode: AbbreviationNode,
		
		/**
		 * Add new abbreviation preprocessor. <i>Preprocessor</i> is a function
		 * that applies to a parsed abbreviation tree right after it get parsed.
		 * The passed tree is in unoptimized state.
		 * @param {Function} fn Preprocessor function. This function receives
		 * two arguments: parsed abbreviation tree (<code>AbbreviationNode</code>)
		 * and <code>options</code> hash that was passed to <code>parse</code>
		 * method
		 */
		addPreprocessor: function(fn) {
			if (!~preprocessors.indexOf(fn)) {
				preprocessors.push(fn);
			}
		},
		
		/**
		 * Removes registered preprocessor
		 */
		removeFilter: function(fn) {
			var ix = preprocessors.indexOf(fn);
			if (~ix) {
				preprocessors.splice(ix, 1);
			}
		},
		
		/**
		 * Adds new abbreviation postprocessor. <i>Postprocessor</i> is a 
		 * functinon that applies to <i>optimized</i> parsed abbreviation tree
		 * right before it returns from <code>parse()</code> method
		 * @param {Function} fn Postprocessor function. This function receives
		 * two arguments: parsed abbreviation tree (<code>AbbreviationNode</code>)
		 * and <code>options</code> hash that was passed to <code>parse</code>
		 * method
		 */
		addPostprocessor: function(fn) {
			if (!~postprocessors.indexOf(fn)) {
				postprocessors.push(fn);
			}
		},
		
		/**
		 * Removes registered postprocessor function
		 */
		removePostprocessor: function(fn) {
			var ix = postprocessors.indexOf(fn);
			if (~ix) {
				postprocessors.splice(ix, 1);
			}
		},
		
		/**
		 * Registers output postprocessor. <i>Output processor</i> is a 
		 * function that applies to output part (<code>start</code>, 
		 * <code>end</code> and <code>content</code>) when 
		 * <code>AbbreviationNode.toString()</code> method is called
		 */
		addOutputProcessor: function(fn) {
			if (!~outputProcessors.indexOf(fn)) {
				outputProcessors.push(fn);
			}
		},
		
		/**
		 * Removes registered output processor
		 */
		removeOutputProcessor: function(fn) {
			var ix = outputProcessors.indexOf(fn);
			if (~ix) {
				outputProcessors.splice(ix, 1);
			}
		},
		
		/**
		 * Check if passed symbol is valid symbol for abbreviation expression
		 * @param {String} ch
		 * @return {Boolean}
		 */
		isAllowedChar: function(ch) {
			ch = String(ch); // convert Java object to JS
			return isAllowedChar(ch) || ~'>+^[](){}'.indexOf(ch);
		}
	};
});