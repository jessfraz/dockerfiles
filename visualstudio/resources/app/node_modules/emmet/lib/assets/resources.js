/**
 * Parsed resources (snippets, abbreviations, variables, etc.) for Emmet.
 * Contains convenient method to get access for snippets with respect of 
 * inheritance. Also provides ability to store data in different vocabularies
 * ('system' and 'user') for fast and safe resource update
 * @author Sergey Chikuyonok (serge.che@gmail.com)
 * @link http://chikuyonok.ru
 */
if (typeof module === 'object' && typeof define !== 'function') {
	var define = function (factory) {
		module.exports = factory(require, exports, module);
	};
}

define(function(require, exports, module) {
	var handlerList = require('./handlerList');
	var utils = require('../utils/common');
	var elements = require('./elements');
	var logger = require('../assets/logger');
	var stringScore = require('../vendor/stringScore');
	var cssResolver = require('../resolver/css');

	var VOC_SYSTEM = 'system';
	var VOC_USER = 'user';
	
	var cache = {};
		
	/** Regular expression for XML tag matching */
	var reTag = /^<(\w+\:?[\w\-]*)((?:\s+[@\!]?[\w\:\-]+\s*=\s*(['"]).*?\3)*)\s*(\/?)>/;
		
	var systemSettings = {};
	var userSettings = {};
	
	/** @type HandlerList List of registered abbreviation resolvers */
	var resolvers = handlerList.create();

	function each(obj, fn) {
		if (!obj) {
			return;
		}

		Object.keys(obj).forEach(function(key) {
			fn(obj[key], key);
		});
	}
	
	/**
	 * Normalizes caret plceholder in passed text: replaces | character with
	 * default caret placeholder
	 * @param {String} text
	 * @returns {String}
	 */
	function normalizeCaretPlaceholder(text) {
		return utils.replaceUnescapedSymbol(text, '|', utils.getCaretPlaceholder());
	}
	
	function parseItem(name, value, type) {
		value = normalizeCaretPlaceholder(value);
		
		if (type == 'snippets') {
			return elements.create('snippet', value);
		}
		
		if (type == 'abbreviations') {
			return parseAbbreviation(name, value);
		}
	}
	
	/**
	 * Parses single abbreviation
	 * @param {String} key Abbreviation name
	 * @param {String} value Abbreviation value
	 * @return {Object}
	 */
	function parseAbbreviation(key, value) {
		key = utils.trim(key);
		var m;
		if ((m = reTag.exec(value))) {
			return elements.create('element', m[1], m[2], m[4] == '/');
		} else {
			// assume it's reference to another abbreviation
			return elements.create('reference', value);
		}
	}
	
	/**
	 * Normalizes snippet key name for better fuzzy search
	 * @param {String} str
	 * @returns {String}
	 */
	function normalizeName(str) {
		return str.replace(/:$/, '').replace(/:/g, '-');
	}

	function expandSnippetsDefinition(snippets) {
		var out = {};
		each(snippets, function(val, key) {
			var items = key.split('|');
			// do not use iterators for better performance
			for (var i = items.length - 1; i >= 0; i--) {
				out[items[i]] = val;
			}
		});

		return out;
	}

	utils.extend(exports, {
		/**
		 * Sets new unparsed data for specified settings vocabulary
		 * @param {Object} data
		 * @param {String} type Vocabulary type ('system' or 'user')
		 * @memberOf resources
		 */
		setVocabulary: function(data, type) {
			cache = {};

			// sections like "snippets" and "abbreviations" could have
			// definitions like `"f|fs": "fieldset"` which is the same as distinct
			// "f" and "fs" keys both equals to "fieldset".
			// We should parse these definitions first
			var voc = {};
			each(data, function(section, syntax) {
				var _section = {};
				each(section, function(subsection, name) {
					if (name == 'abbreviations' || name == 'snippets') {
						subsection = expandSnippetsDefinition(subsection);
					}
					_section[name] = subsection;
				});

				voc[syntax] = _section;
			});
			 

			if (type == VOC_SYSTEM) {
				systemSettings = voc;
			} else {
				userSettings = voc;
			}
		},
		
		/**
		 * Returns resource vocabulary by its name
		 * @param {String} name Vocabulary name ('system' or 'user')
		 * @return {Object}
		 */
		getVocabulary: function(name) {
			return name == VOC_SYSTEM ? systemSettings : userSettings;
		},
		
		/**
		 * Returns resource (abbreviation, snippet, etc.) matched for passed 
		 * abbreviation
		 * @param {AbbreviationNode} node
		 * @param {String} syntax
		 * @returns {Object}
		 */
		getMatchedResource: function(node, syntax) {
			return resolvers.exec(null, utils.toArray(arguments)) 
				|| this.findSnippet(syntax, node.name());
		},
		
		/**
		 * Returns variable value
		 * @return {String}
		 */
		getVariable: function(name) {
			return (this.getSection('variables') || {})[name];
		},
		
		/**
		 * Store runtime variable in user storage
		 * @param {String} name Variable name
		 * @param {String} value Variable value
		 */
		setVariable: function(name, value){
			var voc = this.getVocabulary('user') || {};
			if (!('variables' in voc))
				voc.variables = {};
				
			voc.variables[name] = value;
			this.setVocabulary(voc, 'user');
		},
		
		/**
		 * Check if there are resources for specified syntax
		 * @param {String} syntax
		 * @return {Boolean}
		 */
		hasSyntax: function(syntax) {
			return syntax in this.getVocabulary(VOC_USER) 
				|| syntax in this.getVocabulary(VOC_SYSTEM);
		},
		
		/**
		 * Registers new abbreviation resolver.
		 * @param {Function} fn Abbreviation resolver which will receive 
		 * abbreviation as first argument and should return parsed abbreviation
		 * object if abbreviation has handled successfully, <code>null</code>
		 * otherwise
		 * @param {Object} options Options list as described in 
		 * {@link HandlerList#add()} method
		 */
		addResolver: function(fn, options) {
			resolvers.add(fn, options);
		},
		
		removeResolver: function(fn) {
			resolvers.remove(fn);
		},
		
		/**
		 * Returns actual section data, merged from both
		 * system and user data
		 * @param {String} name Section name (syntax)
		 * @param {String} ...args Subsections
		 * @returns
		 */
		getSection: function(name) {
			if (!name)
				return null;
			
			if (!(name in cache)) {
				cache[name] = utils.deepMerge({}, systemSettings[name], userSettings[name]);
			}
			
			var data = cache[name], subsections = utils.toArray(arguments, 1), key;
			while (data && (key = subsections.shift())) {
				if (key in data) {
					data = data[key];
				} else {
					return null;
				}
			}
			
			return data;
		},
		
		/**
		 * Recursively searches for a item inside top level sections (syntaxes)
		 * with respect of `extends` attribute
		 * @param {String} topSection Top section name (syntax)
		 * @param {String} subsection Inner section name
		 * @returns {Object}
		 */
		findItem: function(topSection, subsection) {
			var data = this.getSection(topSection);
			while (data) {
				if (subsection in data)
					return data[subsection];
				
				data = this.getSection(data['extends']);
			}
		},
		
		/**
		 * Recursively searches for a snippet definition inside syntax section.
		 * Definition is searched inside `snippets` and `abbreviations` 
		 * subsections  
		 * @param {String} syntax Top-level section name (syntax)
		 * @param {String} name Snippet name
		 * @returns {Object}
		 */
		findSnippet: function(syntax, name, memo) {
			if (!syntax || !name)
				return null;
			
			memo = memo || [];
			
			var names = [name];
			// create automatic aliases to properties with colons,
			// e.g. pos-a == pos:a
			if (~name.indexOf('-')) {
				names.push(name.replace(/\-/g, ':'));
			}
			
			var data = this.getSection(syntax), matchedItem = null;
			['snippets', 'abbreviations'].some(function(sectionName) {
				var data = this.getSection(syntax, sectionName);
				if (data) {
					return names.some(function(n) {
						if (data[n]) {
							return matchedItem = parseItem(n, data[n], sectionName);
						}
					});
				}
			}, this);
			
			memo.push(syntax);
			if (!matchedItem && data['extends'] && !~memo.indexOf(data['extends'])) {
				// try to find item in parent syntax section
				return this.findSnippet(data['extends'], name, memo);
			}
			
			return matchedItem;
		},
		
		/**
		 * Performs fuzzy search of snippet definition
		 * @param {String} syntax Top-level section name (syntax)
		 * @param {String} name Snippet name
		 * @returns
		 */
		fuzzyFindSnippet: function(syntax, name, minScore) {
			var result = this.fuzzyFindMatches(syntax, name, minScore)[0];
			if (result) {
				return result.value.parsedValue;
			}
		},

		fuzzyFindMatches: function(syntax, name, minScore) {
			minScore = minScore || 0.3;
			name = normalizeName(name);
			var snippets = this.getAllSnippets(syntax);
			
			return Object.keys(snippets)
				.map(function(key) {
					var value = snippets[key];
					return {
						key: key,
						score: stringScore.score(value.nk, name, 0.1),
						value: value
					};
				})
				.filter(function(item) {
					return item.score >= minScore;
				})
				.sort(function(a, b) {
					return a.score - b.score;
				})
				.reverse();
		},
		
		/**
		 * Returns plain dictionary of all available abbreviations and snippets
		 * for specified syntax with respect of inheritance
		 * @param {String} syntax
		 * @returns {Object}
		 */
		getAllSnippets: function(syntax) {
			var cacheKey = 'all-' + syntax;
			if (!cache[cacheKey]) {
				var stack = [], sectionKey = syntax;
				var memo = [];
				
				do {
					var section = this.getSection(sectionKey);
					if (!section)
						break;
					
					['snippets', 'abbreviations'].forEach(function(sectionName) {
						var stackItem = {};
						each(section[sectionName] || null, function(v, k) {
							stackItem[k] = {
								nk: normalizeName(k),
								value: v,
								parsedValue: parseItem(k, v, sectionName),
								type: sectionName
							};
						});
						
						stack.push(stackItem);
					});
					
					memo.push(sectionKey);
					sectionKey = section['extends'];
				} while (sectionKey && !~memo.indexOf(sectionKey));
				
				
				cache[cacheKey] = utils.extend.apply(utils, stack.reverse());
			}
			
			return cache[cacheKey];
		},

		/**
		 * Returns newline character
		 * @returns {String}
		 */
		getNewline: function() {
			var nl = this.getVariable('newline');
			return typeof nl === 'string' ? nl : '\n';
		},
		
		/**
		 * Sets new newline character that will be used in output
		 * @param {String} str
		 */
		setNewline: function(str) {
			this.setVariable('newline', str);
			this.setVariable('nl', str);
		}
	});

	// XXX add default resolvers
	exports.addResolver(cssResolver.resolve.bind(cssResolver));

	// try to load snippets
	// hide it from Require.JS parser
	(function(r) {
		if (typeof define === 'undefined' || !define.amd) {
			try {
				var fs = r('fs');
				var path = r('path');
				
				var defaultSnippets = fs.readFileSync(path.join(__dirname, '../snippets.json'), {encoding: 'utf8'});
				exports.setVocabulary(JSON.parse(defaultSnippets), VOC_SYSTEM);
			} catch (e) {}
		}
	})(require);
	

	return exports;
});