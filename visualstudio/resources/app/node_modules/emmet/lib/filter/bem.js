/**
 * Filter for aiding of writing elements with complex class names as described
 * in Yandex's BEM (Block, Element, Modifier) methodology. This filter will
 * automatically inherit block and element names from parent elements and insert
 * them into child element classes
 */
if (typeof module === 'object' && typeof define !== 'function') {
	var define = function (factory) {
		module.exports = factory(require, exports, module);
	};
}

define(function(require, exports, module) {
	var htmlFilter = require('./html');
	var prefs = require('../assets/preferences');
	var abbreviationUtils = require('../utils/abbreviation');
	var utils = require('../utils/common');

	prefs.define('bem.elementSeparator', '__', 'Class name’s element separator.');
	prefs.define('bem.modifierSeparator', '_', 'Class name’s modifier separator.');
	prefs.define('bem.shortElementPrefix', '-', 
			'Symbol for describing short “block-element” notation. Class names '
			+ 'prefixed with this symbol will be treated as element name for parent‘s '
			+ 'block name. Each symbol instance traverses one level up in parsed ' 
			+ 'tree for block name lookup. Empty value will disable short notation.');
	
	var shouldRunHtmlFilter = false;
	
	function getSeparators() {
		return {
			element: prefs.get('bem.elementSeparator'),
			modifier: prefs.get('bem.modifierSeparator')
		};
	}

	/**
	 * @param {AbbreviationNode} item
	 */
	function bemParse(item) {
		if (abbreviationUtils.isSnippet(item))
			return item;
		
		// save BEM stuff in cache for faster lookups
		item.__bem = {
			block: '',
			element: '',
			modifier: ''
		};
		
		var classNames = normalizeClassName(item.attribute('class')).split(' ');
		
		// guess best match for block name
		var reBlockName = /^[a-z]\-/i;
		item.__bem.block = utils.find(classNames, function(name) {
			return reBlockName.test(name);
		});
		
		// guessing doesn't worked, pick first class name as block name
		if (!item.__bem.block) {
			reBlockName = /^[a-z]/i;
			item.__bem.block = utils.find(classNames, function(name) {
				return reBlockName.test(name);
			}) || '';
		}

		classNames = classNames.map(function(name) {
			return processClassName(name, item);
		});

		classNames = utils.unique(utils.flatten(classNames)).join(' ');
		if (classNames) {
			item.attribute('class', classNames);
		}
		
		return item;
	}
	
	/**
	 * @param {String} className
	 * @returns {String}
	 */
	function normalizeClassName(className) {
		className = (' ' + (className || '') + ' ').replace(/\s+/g, ' ');
		
		var shortSymbol = prefs.get('bem.shortElementPrefix');
		if (shortSymbol) {
			var re = new RegExp('\\s(' + utils.escapeForRegexp(shortSymbol) + '+)', 'g');
			className = className.replace(re, function(str, p1) {
				return ' ' + utils.repeatString(getSeparators().element, p1.length);
			});
		}
		
		return utils.trim(className);
	}
	
	/**
	 * Processes class name
	 * @param {String} name Class name item to process
	 * @param {AbbreviationNode} item Host node for provided class name
	 * @returns Processed class name. May return <code>Array</code> of
	 * class names 
	 */
	function processClassName(name, item) {
		name = transformClassName(name, item, 'element');
		name = transformClassName(name, item, 'modifier');
		
		// expand class name
		// possible values:
		// * block__element
		// * block__element_modifier
		// * block__element_modifier1_modifier2
		// * block_modifier
		var block = '', element = '', modifier = '';
		var separators = getSeparators();
		if (~name.indexOf(separators.element)) {
			var elements = name.split(separators.element);
			block = elements.shift();

			var modifiers = elements.pop().split(separators.modifier);
			elements.push(modifiers.shift());
			element = elements.join(separators.element);
			modifier = modifiers.join(separators.modifier);
		} else if (~name.indexOf(separators.modifier)) {
			var blockModifiers = name.split(separators.modifier);
			
			block = blockModifiers.shift();
			modifier = blockModifiers.join(separators.modifier);
		}
		
		if (block || element || modifier) {
			if (!block) {
				block = item.__bem.block;
			}
			
			// inherit parent bem element, if exists
//			if (item.parent && item.parent.__bem && item.parent.__bem.element)
//				element = item.parent.__bem.element + separators.element + element;
			
			// produce multiple classes
			var prefix = block;
			var result = [];
			
			if (element) {
				prefix += separators.element + element;
				result.push(prefix);
			} else {
				result.push(prefix);
			}
			
			if (modifier) {
				result.push(prefix + separators.modifier + modifier);
			}
			
			item.__bem.block = block;
			item.__bem.element = element;
			item.__bem.modifier = modifier;
			
			return result;
		}
		
		// ...otherwise, return processed or original class name
		return name;
	}
	
	/**
	 * Low-level function to transform user-typed class name into full BEM class
	 * @param {String} name Class name item to process
	 * @param {AbbreviationNode} item Host node for provided class name
	 * @param {String} entityType Type of entity to be tried to transform 
	 * ('element' or 'modifier')
	 * @returns {String} Processed class name or original one if it can't be
	 * transformed
	 */
	function transformClassName(name, item, entityType) {
		var separators = getSeparators();
		var reSep = new RegExp('^(' + separators[entityType] + ')+', 'g');
		if (reSep.test(name)) {
			var depth = 0; // parent lookup depth
			var cleanName = name.replace(reSep, function(str) {
				depth = str.length / separators[entityType].length;
				return '';
			});
			
			// find donor element
			var donor = item;
			while (donor.parent && depth--) {
				donor = donor.parent;
			}
			
			if (!donor || !donor.__bem)
				donor = item;
			
			if (donor && donor.__bem) {
				var prefix = donor.__bem.block;
				
				// decide if we should inherit element name
//				if (entityType == 'element') {
//					var curElem = cleanName.split(separators.modifier, 1)[0];
//					if (donor.__bem.element && donor.__bem.element != curElem)
//						prefix += separators.element + donor.__bem.element;
//				}
				
				if (entityType == 'modifier' &&  donor.__bem.element)
					prefix += separators.element + donor.__bem.element;
				
				return prefix + separators[entityType] + cleanName;
			}
		}
		
		return name;
	}
	
	/**
	 * Recursive function for processing tags, which extends class names 
	 * according to BEM specs: http://bem.github.com/bem-method/pages/beginning/beginning.ru.html
	 * <br><br>
	 * It does several things:<br>
	 * <ul>
	 * <li>Expands complex class name (according to BEM symbol semantics):
	 * .block__elem_modifier → .block.block__elem.block__elem_modifier
	 * </li>
	 * <li>Inherits block name on child elements: 
	 * .b-block > .__el > .__el → .b-block > .b-block__el > .b-block__el__el
	 * </li>
	 * <li>Treats first dash symbol as '__'</li>
	 * <li>Double underscore (or typographic '–') is also treated as an element 
	 * level lookup, e.g. ____el will search for element definition in parent’s 
	 * parent element:
	 * .b-block > .__el1 > .____el2 → .b-block > .b-block__el1 > .b-block__el2
	 * </li>
	 * </ul>
	 * 
	 * @param {AbbreviationNode} tree
	 * @param {Object} profile
	 */
	function process(tree, profile) {
		if (tree.name) {
			bemParse(tree, profile);
		}
		
		tree.children.forEach(function(item) {
			process(item, profile);
			if (!abbreviationUtils.isSnippet(item) && item.start) {
				shouldRunHtmlFilter = true;
			}
		});
		
		return tree;
	}

	return function(tree, profile) {
		shouldRunHtmlFilter = false;
		tree = process(tree, profile);
		// in case 'bem' filter is applied after 'html' filter: run it again
		// to update output
		if (shouldRunHtmlFilter) {
			tree = htmlFilter(tree, profile);
		}
		
		return tree;
	};
});