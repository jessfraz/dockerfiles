/**
 * Reflect CSS value: takes rule's value under caret and pastes it for the same 
 * rules with vendor prefixes
 */
if (typeof module === 'object' && typeof define !== 'function') {
	var define = function (factory) {
		module.exports = factory(require, exports, module);
	};
}

define(function(require, exports, module) {
	var handlerList = require('../assets/handlerList');
	var prefs = require('../assets/preferences');
	var cssResolver = require('../resolver/css');
	var cssEditTree = require('../editTree/css');
	var utils = require('../utils/common');
	var actionUtils = require('../utils/action');
	var editorUtils = require('../utils/editor');
	var cssGradient = require('../resolver/cssGradient');

	prefs.define('css.reflect.oldIEOpacity', false, 'Support IE6/7/8 opacity notation, e.g. <code>filter:alpha(opacity=...)</code>.\
		Note that CSS3 and SVG also provides <code>filter</code> property so this option is disabled by default.')

	/**
	 * @type HandlerList List of registered handlers
	 */
	var handlers = handlerList.create();
	
	function doCSSReflection(editor) {
		var outputInfo = editorUtils.outputInfo(editor);
		var caretPos = editor.getCaretPos();
		
		var cssRule = cssEditTree.parseFromPosition(outputInfo.content, caretPos);
		if (!cssRule) return;
		
		var property = cssRule.itemFromPosition(caretPos, true);
		// no property under cursor, nothing to reflect
		if (!property) return;
		
		var oldRule = cssRule.source;
		var offset = cssRule.options.offset;
		var caretDelta = caretPos - offset - property.range().start;
		
		handlers.exec(false, [property]);
		
		if (oldRule !== cssRule.source) {
			return {
				data:  cssRule.source,
				start: offset,
				end:   offset + oldRule.length,
				caret: offset + property.range().start + caretDelta
			};
		}
	}
	
	/**
	 * Returns regexp that should match reflected CSS property names
	 * @param {String} name Current CSS property name
	 * @return {RegExp}
	 */
	function getReflectedCSSName(name) {
		name = cssEditTree.baseName(name);
		var vendorPrefix = '^(?:\\-\\w+\\-)?', m;
		
		if ((name == 'opacity' || name == 'filter') && prefs.get('css.reflect.oldIEOpacity')) {
			return new RegExp(vendorPrefix + '(?:opacity|filter)$');
		} else if ((m = name.match(/^border-radius-(top|bottom)(left|right)/))) {
			// Mozilla-style border radius
			return new RegExp(vendorPrefix + '(?:' + name + '|border-' + m[1] + '-' + m[2] + '-radius)$');
		} else if ((m = name.match(/^border-(top|bottom)-(left|right)-radius/))) { 
			return new RegExp(vendorPrefix + '(?:' + name + '|border-radius-' + m[1] + m[2] + ')$');
		}
		
		return new RegExp(vendorPrefix + name + '$');
	}

	/**
	 * Reflects inner CSS properites in given value
	 * agains name‘s vendor prefix. In other words, it tries
	 * to modify `transform 0.2s linear` value for `-webkit-transition`
	 * property
	 * @param  {String} name  Reciever CSS property name
	 * @param  {String} value New property value
	 * @return {String}
	 */
	function reflectValueParts(name, value) {
		// detects and updates vendor-specific properties in value,
		// e.g. -webkit-transition: -webkit-transform
		
		var reVendor = /^\-(\w+)\-/;
		var propPrefix = reVendor.test(name) ? RegExp.$1.toLowerCase() : '';
		var parts = cssEditTree.findParts(value);

		parts.reverse();
		parts.forEach(function(part) {
			var partValue = part.substring(value).replace(reVendor, '');
			var prefixes = cssResolver.vendorPrefixes(partValue);
			if (prefixes) {
				// if prefixes are not null then given value can
				// be resolved against Can I Use database and may or
				// may not contain prefixed variant
				if (propPrefix && ~prefixes.indexOf(propPrefix)) {
					partValue = '-' + propPrefix + '-' + partValue;
				}

				value = utils.replaceSubstring(value, partValue, part);
			}
		});

		return value;
	}
	
	/**
	 * Reflects value from <code>donor</code> into <code>receiver</code>
	 * @param {CSSProperty} donor Donor CSS property from which value should
	 * be reflected
	 * @param {CSSProperty} receiver Property that should receive reflected 
	 * value from donor
	 */
	function reflectValue(donor, receiver) {
		var value = getReflectedValue(donor.name(), donor.value(), 
				receiver.name(), receiver.value());
		
		value = reflectValueParts(receiver.name(), value);
		receiver.value(value);
	}
	
	/**
	 * Returns value that should be reflected for <code>refName</code> CSS property
	 * from <code>curName</code> property. This function is used for special cases,
	 * when the same result must be achieved with different properties for different
	 * browsers. For example: opаcity:0.5; → filter:alpha(opacity=50);<br><br>
	 * 
	 * This function does value conversion between different CSS properties
	 * 
	 * @param {String} curName Current CSS property name
	 * @param {String} curValue Current CSS property value
	 * @param {String} refName Receiver CSS property's name 
	 * @param {String} refValue Receiver CSS property's value
	 * @return {String} New value for receiver property
	 */
	function getReflectedValue(curName, curValue, refName, refValue) {
		curName = cssEditTree.baseName(curName);
		refName = cssEditTree.baseName(refName);
		
		if (curName == 'opacity' && refName == 'filter') {
			return refValue.replace(/opacity=[^)]*/i, 'opacity=' + Math.floor(parseFloat(curValue) * 100));
		} else if (curName == 'filter' && refName == 'opacity') {
			var m = curValue.match(/opacity=([^)]*)/i);
			return m ? utils.prettifyNumber(parseInt(m[1], 10) / 100) : refValue;
		}
		
		return curValue;
	}
	
	module = module || {};
	module.exports = {
		reflectCSSValueAction: function(editor) {
			if (editor.getSyntax() != 'css') {
				return false;
			}

			return actionUtils.compoundUpdate(editor, doCSSReflection(editor));
		},

		_defaultHandler: function(property) {
			var reName = getReflectedCSSName(property.name());
			property.parent.list().forEach(function(p) {
				if (reName.test(p.name())) {
					reflectValue(property, p);
				}
			});
		},

		/**
		 * Adds custom reflect handler. The passed function will receive matched
		 * CSS property (as <code>CSSEditElement</code> object) and should
		 * return <code>true</code> if it was performed successfully (handled 
		 * reflection), <code>false</code> otherwise.
		 * @param {Function} fn
		 * @param {Object} options
		 */
		addHandler: function(fn, options) {
			handlers.add(fn, options);
		},
		
		/**
		 * Removes registered handler
		 * @returns
		 */
		removeHandler: function(fn) {
			handlers.remove(fn);
		}
	};

	// XXX add default handlers
	handlers.add(module.exports._defaultHandler.bind(module.exports), {order: -1});
	handlers.add(cssGradient.reflectValueHandler.bind(cssGradient));

	return module.exports;
});