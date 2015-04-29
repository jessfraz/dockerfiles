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
	var prefs = require('./preferences');
	var utils = require('../utils/common');

	prefs.define('caniuse.enabled', true, 'Enable support of Can I Use database. When enabled,\
		CSS abbreviation resolver will look at Can I Use database first before detecting\
		CSS properties that should be resolved');
	
	prefs.define('caniuse.vendors', 'all', 'A comma-separated list vendor identifiers\
		(as described in Can I Use database) that should be supported\
		when resolving vendor-prefixed properties. Set value to <code>all</code>\
		to support all available properties');
	
	prefs.define('caniuse.era', 'e-2', 'Browser era, as defined in Can I Use database.\
		Examples: <code>e0</code> (current version), <code>e1</code> (near future)\
		<code>e-2</code> (2 versions back) and so on.');
	
	var cssSections = {
		'border-image': ['border-image'],
		'css-boxshadow': ['box-shadow'],
		'css3-boxsizing': ['box-sizing'],
		'multicolumn': ['column-width', 'column-count', 'columns', 'column-gap', 'column-rule-color', 'column-rule-style', 'column-rule-width', 'column-rule', 'column-span', 'column-fill'],
		'border-radius': ['border-radius', 'border-top-left-radius', 'border-top-right-radius', 'border-bottom-right-radius', 'border-bottom-left-radius'],
		'transforms2d': ['transform'],
		'css-hyphens': ['hyphens'],
		'css-transitions': ['transition', 'transition-property', 'transition-duration', 'transition-timing-function', 'transition-delay'],
		'font-feature': ['font-feature-settings'],
		'css-animation': ['animation', 'animation-name', 'animation-duration', 'animation-timing-function', 'animation-iteration-count', 'animation-direction', 'animation-play-state', 'animation-delay', 'animation-fill-mode', '@keyframes'],
		'css-gradients': ['linear-gradient'],
		'css-masks': ['mask-image', 'mask-source-type', 'mask-repeat', 'mask-position', 'mask-clip', 'mask-origin', 'mask-size', 'mask', 'mask-type', 'mask-box-image-source', 'mask-box-image-slice', 'mask-box-image-width', 'mask-box-image-outset', 'mask-box-image-repeat', 'mask-box-image', 'clip-path', 'clip-rule'],
		'css-featurequeries': ['@supports'],
		'flexbox': ['flex', 'inline-flex', 'flex-direction', 'flex-wrap', 'flex-flow', 'order', 'flex'],
		'calc': ['calc'],
		'object-fit': ['object-fit', 'object-position'],
		'css-grid': ['grid', 'inline-grid', 'grid-template-rows', 'grid-template-columns', 'grid-template-areas', 'grid-template', 'grid-auto-rows', 'grid-auto-columns', ' grid-auto-flow', 'grid-auto-position', 'grid', ' grid-row-start', 'grid-column-start', 'grid-row-end', 'grid-column-end', 'grid-column', 'grid-row', 'grid-area', 'justify-self', 'justify-items', 'align-self', 'align-items'],
		'css-repeating-gradients': ['repeating-linear-gradient'],
		'css-filters': ['filter'],
		'user-select-none': ['user-select'],
		'intrinsic-width': ['min-content', 'max-content', 'fit-content', 'fill-available'],
		'css3-tabsize': ['tab-size']
	};

	/** @type {Object} The Can I Use database for CSS */
	var cssDB = null;
	/** @type {Object} A list of available vendors (browsers) and their prefixes */
	var vendorsDB = null;
	var erasDB = null;

	function intersection(arr1, arr2) {
		var result = [];
		var smaller = arr1, larger = arr2;
		if (smaller.length > larger.length) {
			smaller = arr2;
			larger = arr1;
		}
		larger.forEach(function(item) {
			if (~smaller.indexOf(item)) {
				result.push(item);
			}
		});
		return result;
	}

	/**
	 * Parses raw Can I Use database for better lookups
	 * @param  {String} data Raw database
	 * @param  {Boolean} optimized Pass `true` if given `data` is already optimized
	 * @return {Object}
	 */
	function parseDB(data, optimized) {
		if (typeof data == 'string') {
			data = JSON.parse(data);
		}

		if (!optimized) {
			data = optimize(data);
		}

		vendorsDB = data.vendors;
		cssDB = data.css;
		erasDB = data.era;
	}

	/**
	 * Extract required data only from CIU database 
	 * @param  {Object} data Raw Can I Use database
	 * @return {Object}      Optimized database
	 */
	function optimize(data) {
		if (typeof data == 'string') {
			data = JSON.parse(data);
		}

		return {
			vendors: parseVendors(data),
			css: parseCSS(data),
			era: parseEra(data)
		};
	}

	/**
	 * Parses vendor data
	 * @param  {Object} data
	 * @return {Object}
	 */
	function parseVendors(data) {
		var out = {};
		Object.keys(data.agents).forEach(function(name) {
			var agent = data.agents[name];
			out[name] = {
				prefix: agent.prefix,
				versions: agent.versions
			};
		});
		return out;
	}

	/**
	 * Parses CSS data from Can I Use raw database
	 * @param  {Object} data
	 * @return {Object}
	 */
	function parseCSS(data) {
		var out = {};
		var cssCategories = data.cats.CSS;
		Object.keys(data.data).forEach(function(name) {
			var section = data.data[name];
			if (name in cssSections) {
				cssSections[name].forEach(function(kw) {
					out[kw] = section.stats;
				});
			}
		});

		return out;
	}

	/**
	 * Parses era data from Can I Use raw database
	 * @param  {Object} data
	 * @return {Array}
	 */
	function parseEra(data) {
		// some runtimes (like Mozilla Rhino) does not preserves
		// key order so we have to sort values manually
		return Object.keys(data.eras).sort(function(a, b) {
			return parseInt(a.substr(1)) - parseInt(b.substr(1));
		});
	}
	
	/**
	 * Returs list of supported vendors, depending on user preferences
	 * @return {Array}
	 */
	function getVendorsList() {
		var allVendors = Object.keys(vendorsDB);
		var vendors = prefs.getArray('caniuse.vendors');
		if (!vendors || vendors[0] == 'all') {
			return allVendors;
		}

		return intersection(allVendors, vendors);
	}

	/**
	 * Returns size of version slice as defined by era identifier
	 * @return {Number}
	 */
	function getVersionSlice() {
		var era = prefs.get('caniuse.era');
		var ix = erasDB.indexOf(era);
		if (!~ix) {
			ix = erasDB.indexOf('e-2');
		}

		return ix;
	}

	// try to load caniuse database
	// hide it from Require.JS parser
	var db = null;
	(function(r) {
		if (typeof define === 'undefined' || !define.amd) {
			try {
				var fs = r('fs');
				var path = r('path');
				db = fs.readFileSync(path.join(__dirname, '../caniuse.json'), {encoding: 'utf8'});
			} catch(e) {}
		}
	})(require);
	
	if (db) {
		parseDB(db);
	}

	return {
		load: parseDB,
		optimize: optimize,
		
		/**
		 * Resolves prefixes for given property
		 * @param {String} property A property to resolve. It can start with `@` symbol
		 * (CSS section, like `@keyframes`) or `:` (CSS value, like `flex`)
		 * @return {Array} Array of resolved prefixes or <code>null</code>
		 * if prefixes can't be resolved. Empty array means property has no vendor
		 * prefixes
		 */
		resolvePrefixes: function(property) {
			if (!prefs.get('caniuse.enabled') || !cssDB || !(property in cssDB)) {
				return null;
			}

			var prefixes = [];
			var propStats = cssDB[property];
			var versions = getVersionSlice();

			getVendorsList().forEach(function(vendor) {
				var vendorVesions = vendorsDB[vendor].versions.slice(versions);
				for (var i = 0, v; i < vendorVesions.length; i++) {
					v = vendorVesions[i];
					if (!v) {
						continue;
					}

					if (~propStats[vendor][v].indexOf('x')) {
						prefixes.push(vendorsDB[vendor].prefix);
						break;
					}
				}
			});

			return utils.unique(prefixes).sort(function(a, b) {
				return b.length - a.length;
			});
		}
	};
});