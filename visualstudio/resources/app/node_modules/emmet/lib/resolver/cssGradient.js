/**
 * 'Expand Abbreviation' handler that parses gradient definition from under 
 * cursor and updates CSS rule with vendor-prefixed values.
 */
if (typeof module === 'object' && typeof define !== 'function') {
	var define = function (factory) {
		module.exports = factory(require, exports, module);
	};
}

define(function(require, exports, module) {
	var prefs = require('../assets/preferences');
	var resources = require('../assets/resources');
	var utils = require('../utils/common');
	var stringStream = require('../assets/stringStream');
	var cssResolver = require('./css');
	var range = require('../assets/range');
	var cssEditTree = require('../editTree/css');
	var editorUtils = require('../utils/editor');
	var linearGradient = require('./gradient/linear');

	var cssSyntaxes = ['css', 'less', 'sass', 'scss', 'stylus', 'styl'];
	
	// XXX define preferences
	prefs.define('css.gradient.prefixes', 'webkit, moz, o',
			'A comma-separated list of vendor-prefixes for which values should ' 
			+ 'be generated.');
	
	prefs.define('css.gradient.oldWebkit', false,
			'Generate gradient definition for old Webkit implementations');
	
	prefs.define('css.gradient.omitDefaultDirection', true,
		'Do not output default direction definition in generated gradients.');
	
	prefs.define('css.gradient.defaultProperty', 'background-image',
		'When gradient expanded outside CSS value context, it will produce '
			+ 'properties with this name.');
	
	prefs.define('css.gradient.fallback', false,
			'With this option enabled, CSS gradient generator will produce '
			+ '<code>background-color</code> property with gradient first color '
			+ 'as fallback for old browsers.');

	/**
	 * Resolves property name (abbreviation): searches for snippet definition in 
	 * 'resources' and returns new name of matched property
	 */
	function resolvePropertyName(name, syntax) {
		var snippet = resources.findSnippet(syntax, name);
		
		if (!snippet && prefs.get('css.fuzzySearch')) {
			var minScore = parseFloat(prefs.get('css.fuzzySearchMinScore'));
			snippet = resources.fuzzyFindSnippet(syntax, name, minScore);
		}
		
		if (snippet) {
			if (typeof snippet !== 'string') {
				snippet = snippet.data;
			}
			
			return cssResolver.splitSnippet(snippet).name;
		}
	}

	/**
	 * Returns vendor prefixes for given gradient type
	 * @param {String} type Gradient type (currently, 'linear-gradient' 
	 * is the only supported value)
	 * @return {Array}
	 */
	function getGradientPrefixes(type) {
		var prefixes = cssResolver.vendorPrefixes(type);
		if (!prefixes) {
			// disabled Can I Use, fallback to property list
			prefixes = prefs.getArray('css.gradient.prefixes');
		}

		return prefixes || [];
	}
	
	function getPrefixedNames(type) {
		var prefixes = getGradientPrefixes(type);
		var names = prefixes 
			? prefixes.map(function(p) {
				return '-' + p + '-' + type;
			}) 
			: [];
		
		names.push(type);
		
		return names;
	}
	
	/**
	 * Returns list of CSS properties with gradient
	 * @param {Array} gradient List of gradient objects
	 * @param {CSSEditElement} property Original CSS property
	 * @returns {Array}
	 */
	function getPropertiesForGradient(gradients, property) {
		var props = [];
		var propertyName = property.name();
		var omitDir = prefs.get('css.gradient.omitDefaultDirection');
		
		if (prefs.get('css.gradient.fallback') && ~propertyName.toLowerCase().indexOf('background')) {
			props.push({
				name: 'background-color',
				value: '${1:' + gradients[0].gradient.colorStops[0].color + '}'
			});
		}
		
		var value = property.value();
		getGradientPrefixes('linear-gradient').forEach(function(prefix) {
			var name = cssResolver.prefixed(propertyName, prefix);
			if (prefix == 'webkit' && prefs.get('css.gradient.oldWebkit')) {
				try {
					props.push({
						name: name,
						value: insertGradientsIntoCSSValue(gradients, value, {
							prefix: prefix, 
							oldWebkit: true,
							omitDefaultDirection: omitDir
						})
					});
				} catch(e) {}
			}
			
			props.push({
				name: name,
				value: insertGradientsIntoCSSValue(gradients, value, {
					prefix: prefix,
					omitDefaultDirection: omitDir
				})
			});
		});
		
		return props.sort(function(a, b) {
			return b.name.length - a.name.length;
		});
	}

	/**
	 * Replaces old gradient definitions in given CSS property value
	 * with new ones, preserving original formatting
	 * @param  {Array} gradients List of CSS gradients
	 * @param  {String} value     Original CSS value
	 * @param  {Object} options   Options for gradient’s stringify() method
	 * @return {String}
	 */
	function insertGradientsIntoCSSValue(gradients, value, options) {
		// gradients *should* passed in order they actually appear in CSS property
		// iterate over it in backward direction to preserve gradient locations
		options = options || {};
		gradients = utils.clone(gradients);
		gradients.reverse().forEach(function(item, i) {
			var suffix = !i && options.placeholder ? options.placeholder : '';
			var str = options.oldWebkit ? item.gradient.stringifyOldWebkit(options) : item.gradient.stringify(options);
			value = utils.replaceSubstring(value, str + suffix, item.matchedPart);
		});

		return value;
	}

	/**
	 * Returns list of properties with the same meaning 
	 * (e.g. vendor-prefixed + original name)
	 * @param  {String} property CSS property name
	 * @return {Array}
	 */
	function similarPropertyNames(property) {
		if (typeof property !== 'string') {
			property = property.name();
		}

		var similarProps = (cssResolver.vendorPrefixes(property) || []).map(function(prefix) {
			return '-' + prefix + '-' + property;
		});
		similarProps.push(property);
		return similarProps;
	}
	
	/**
	 * Pastes gradient definition into CSS rule with correct vendor-prefixes
	 * @param {EditElement} property Matched CSS property
	 * @param {Array} gradients List of gradients to insert
	 */
	function pasteGradient(property, gradients) {
		var rule = property.parent;
		var alignVendor = prefs.get('css.alignVendor');
		var omitDir = prefs.get('css.gradient.omitDefaultDirection');
		
		// we may have aligned gradient definitions: find the smallest value
		// separator
		var sep = property.styleSeparator;
		var before = property.styleBefore;
		
		// first, remove all properties within CSS rule with the same name and
		// gradient definition
		rule.getAll(similarPropertyNames(property)).forEach(function(item) {
			if (item != property && /gradient/i.test(item.value())) {
				if (item.styleSeparator.length < sep.length) {
					sep = item.styleSeparator;
				}
				if (item.styleBefore.length < before.length) {
					before = item.styleBefore;
				}
				rule.remove(item);
			}
		});
		
		if (alignVendor) {
			// update prefix
			if (before != property.styleBefore) {
				var fullRange = property.fullRange();
				rule._updateSource(before, fullRange.start, fullRange.start + property.styleBefore.length);
				property.styleBefore = before;
			}
			
			// update separator value
			if (sep != property.styleSeparator) {
				rule._updateSource(sep, property.nameRange().end, property.valueRange().start);
				property.styleSeparator = sep;
			}
		}
		
		var value = property.value();

		// create list of properties to insert
		var propsToInsert = getPropertiesForGradient(gradients, property);
		
		// align prefixed values
		if (alignVendor) {
			var names = [], values = [];
			propsToInsert.forEach(function(item) {
				names.push(item.name);
				values.push(item.value);
			});
			values.push(property.value());
			names.push(property.name());
			
			var valuePads = utils.getStringsPads(values.map(function(v) {
				return v.substring(0, v.indexOf('('));
			}));
			
			var namePads = utils.getStringsPads(names);
			property.name(namePads[namePads.length - 1] + property.name());
			
			propsToInsert.forEach(function(prop, i) {
				prop.name = namePads[i] + prop.name;
				prop.value = valuePads[i] + prop.value;
			});
			
			property.value(valuePads[valuePads.length - 1] + property.value());
		}
		
		// put vendor-prefixed definitions before current rule
		propsToInsert.forEach(function(prop) {
			rule.add(prop.name, prop.value, rule.indexOf(property));
		});

		// put vanilla-clean gradient definition into current rule
		property.value(insertGradientsIntoCSSValue(gradients, value, {
			placeholder: '${2}',
			omitDefaultDirection: omitDir
		}));
	}

	/**
	 * Validates caret position relatively to located gradients
	 * in CSS rule. In other words, it checks if it’s safe to 
	 * expand gradients for current caret position or not.
	 * 
	 * See issue https://github.com/sergeche/emmet-sublime/issues/411
	 * 
	 * @param  {Array} gradients List of parsed gradients
	 * @param  {Number} caretPos  Current caret position
	 * @param  {String} syntax    Current document syntax
	 * @return {Boolean}
	 */
	function isValidCaretPosition(gradients, caretPos, syntax) {
		syntax = syntax || 'css';
		if (syntax == 'css' || syntax == 'less' || syntax == 'scss') {
			return true;
		}

		var offset = gradients.property.valueRange(true).start;
		var parts = gradients.gradients;

		// in case of preprocessors where properties are separated with
		// newlines, make sure there’s no gradient definition past
		// current caret position. 
		for (var i = parts.length - 1; i >= 0; i--) {
			if (parts[i].matchedPart.start + offset >= caretPos) {
				return false;
			}
		}

		return true;
	}
	
	module = module || {};
	return module.exports = {
		/**
		 * Search for gradient definitions inside CSS property value
		 * @returns {Array} Array of matched gradients
		 */
		findGradients: function(cssProp) {
			var value = cssProp.value();
			var gradients = [];
			var that = this;
			cssProp.valueParts().forEach(function(part) {
				var partValue = part.substring(value);
				if (linearGradient.isLinearGradient(partValue)) {
					var gradient = linearGradient.parse(partValue);
					if (gradient) {
						gradients.push({
							gradient: gradient,
							matchedPart: part
						});
					}
				}
			});
			
			return gradients.length ? gradients : null;
		},

		/**
		 * Returns list of gradients found in CSS property
		 * of given CSS code in specified (caret) position
		 * @param  {String} css CSS code snippet
		 * @param  {Number} pos Character index where to start searching for CSS property
		 * @return {Array}
		 */
		gradientsFromCSSProperty: function(css, pos) {
			var cssProp = cssEditTree.propertyFromPosition(css, pos);
			if (cssProp) {
				var grd = this.findGradients(cssProp);
				if (grd) {
					return {
						property: cssProp,
						gradients: grd
					};
				}
			}

			return null;
		},

		/**
		 * Handler for “Expand Abbreviation” action
		 * @param  {IEmmetEditor} editor
		 * @param  {String} syntax
		 * @param  {String} profile
		 * return {Boolean}
		 */
		expandAbbreviationHandler: function(editor, syntax, profile) {
			var info = editorUtils.outputInfo(editor, syntax, profile);
			if (!~cssSyntaxes.indexOf(info.syntax)) {
				return false;
			}
			
			// let's see if we are expanding gradient definition
			var caret = editor.getCaretPos();
			var content = info.content;
			var gradients = this.gradientsFromCSSProperty(content, caret);
			if (gradients) {
				if (!isValidCaretPosition(gradients, caret, info.syntax)) {
					return false;
				}

				var cssProperty = gradients.property;
				var cssRule = cssProperty.parent;
				var ruleStart = cssRule.options.offset || 0;
				var ruleEnd = ruleStart + cssRule.toString().length;
				
				// Handle special case:
				// user wrote gradient definition between existing CSS 
				// properties and did not finished it with semicolon.
				// In this case, we have semicolon right after gradient 
				// definition and re-parse rule again
				if (/[\n\r]/.test(cssProperty.value())) {
					// insert semicolon at the end of gradient definition
					var insertPos = cssProperty.valueRange(true).start + utils.last(gradients.gradients).matchedPart.end;
					content = utils.replaceSubstring(content, ';', insertPos);
					
					var _gradients = this.gradientsFromCSSProperty(content, caret);
					if (_gradients) {
						gradients = _gradients;
						cssProperty = gradients.property;
						cssRule = cssProperty.parent;
					}
				}
				
				// make sure current property has terminating semicolon
				cssProperty.end(';');
				
				// resolve CSS property name
				var resolvedName = resolvePropertyName(cssProperty.name(), syntax);
				if (resolvedName) {
					cssProperty.name(resolvedName);
				}
				
				pasteGradient(cssProperty, gradients.gradients);
				editor.replaceContent(cssRule.toString(), ruleStart, ruleEnd, true);
				return true;
			}
			
			return this.expandGradientOutsideValue(editor, syntax);
		},

		/**
		 * Tries to expand gradient outside CSS value 
		 * @param {IEmmetEditor} editor
		 * @param {String} syntax
		 */
		expandGradientOutsideValue: function(editor, syntax) {
			var propertyName = prefs.get('css.gradient.defaultProperty');
			var omitDir = prefs.get('css.gradient.omitDefaultDirection');
			
			if (!propertyName) {
				return false;
			}
			
			// assuming that gradient definition is written on new line,
			// do a simplified parsing
			var content = String(editor.getContent());
			/** @type Range */
			var lineRange = range.create(editor.getCurrentLineRange());
			
			// get line content and adjust range with padding
			var line = lineRange.substring(content)
				.replace(/^\s+/, function(pad) {
					lineRange.start += pad.length;
					return '';
				})
				.replace(/\s+$/, function(pad) {
					lineRange.end -= pad.length;
					return '';
				});

			// trick parser: make it think that we’re parsing actual CSS property
			var fakeCSS = 'a{' + propertyName + ': ' + line + ';}';
			var gradients = this.gradientsFromCSSProperty(fakeCSS, fakeCSS.length - 2);
			if (gradients) {
				var props = getPropertiesForGradient(gradients.gradients, gradients.property);
				props.push({
					name: gradients.property.name(),
					value: insertGradientsIntoCSSValue(gradients.gradients, gradients.property.value(), {
						placeholder: '${2}',
						omitDefaultDirection: omitDir
					})
				});
				
				var sep = cssResolver.getSyntaxPreference('valueSeparator', syntax);
				var end = cssResolver.getSyntaxPreference('propertyEnd', syntax);
				
				if (prefs.get('css.alignVendor')) {
					var pads = utils.getStringsPads(props.map(function(prop) {
						return prop.value.substring(0, prop.value.indexOf('('));
					}));
					props.forEach(function(prop, i) {
						prop.value = pads[i] + prop.value;
					});
				}
				
				props = props.map(function(item) {
					return item.name + sep + item.value + end;
				});
				
				editor.replaceContent(props.join('\n'), lineRange.start, lineRange.end);
				return true;
			}
			
			return false;
		},

		/**
		 * Handler for “Reflect CSS Value“ action
		 * @param  {String} property
		 */
		reflectValueHandler: function(property) {
			var omitDir = prefs.get('css.gradient.omitDefaultDirection');
			var gradients = this.findGradients(property);
			if (!gradients) {
				return false;
			}
			
			var that = this;
			var value = property.value();
			
			// reflect value for properties with the same name
			property.parent.getAll(similarPropertyNames(property)).forEach(function(prop) {
				if (prop === property) {
					return;
				}

				// make sure current property contains gradient definition,
				// otherwise – skip it
				var localGradients = that.findGradients(prop);
				if (localGradients) {
					// detect vendor prefix for current property
					var localValue = prop.value();
					var dfn = localGradients[0].matchedPart.substring(localValue);
					var prefix = '';
					if (/^\s*\-([a-z]+)\-/.test(dfn)) {
						prefix = RegExp.$1;
					}

					prop.value(insertGradientsIntoCSSValue(gradients, value, {
						prefix: prefix,
						omitDefaultDirection: omitDir
					}));
				}
			});
			
			return true;
		}
	};
});