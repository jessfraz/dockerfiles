/**
 * Module for handling filters
 */
if (typeof module === 'object' && typeof define !== 'function') {
	var define = function (factory) {
		module.exports = factory(require, exports, module);
	};
}

define(function(require, exports, module) {
	var utils = require('../utils/common');
	var profile = require('../assets/profile');
	var resources = require('../assets/resources');

	/** List of registered filters */
	var registeredFilters = {
		html: require('./html'),
		haml: require('./haml'),
		jade: require('./jade'),
		jsx: require('./jsx'),
		slim: require('./slim'),
		xsl: require('./xsl'),
		css: require('./css'),
		bem: require('./bem'),
		c: require('./comment'),
		e: require('./escape'),
		s: require('./singleLine'),
		t: require('./trim')
	};
	
	/** Filters that will be applied for unknown syntax */
	var basicFilters = 'html';
	
	function list(filters) {
		if (!filters)
			return [];
		
		if (typeof filters === 'string') {
			return filters.split(/[\|,]/g);
		}
		
		return filters;
	}
	
	return  {
		/**
		 * Register new filter
		 * @param {String} name Filter name
		 * @param {Function} fn Filter function
		 */
		add: function(name, fn) {
			registeredFilters[name] = fn;
		},
		
		/**
		 * Apply filters for final output tree
		 * @param {AbbreviationNode} tree Output tree
		 * @param {Array} filters List of filters to apply. Might be a 
		 * <code>String</code>
		 * @param {Object} profile Output profile, defined in <i>profile</i> 
		 * module. Filters defined it profile are not used, <code>profile</code>
		 * is passed to filter function
		 * @memberOf emmet.filters
		 * @returns {AbbreviationNode}
		 */
		apply: function(tree, filters, profileName) {
			profileName = profile.get(profileName);
			
			list(filters).forEach(function(filter) {
				var name = utils.trim(filter.toLowerCase());
				if (name && name in registeredFilters) {
					tree = registeredFilters[name](tree, profileName);
				}
			});
			
			return tree;
		},
		
		/**
		 * Composes list of filters that should be applied to a tree, based on 
		 * passed data
		 * @param {String} syntax Syntax name ('html', 'css', etc.)
		 * @param {Object} profile Output profile
		 * @param {String} additionalFilters List or pipe-separated
		 * string of additional filters to apply
		 * @returns {Array}
		 */
		composeList: function(syntax, profileName, additionalFilters) {
			profileName = profile.get(profileName);
			var filters = list(profileName.filters || resources.findItem(syntax, 'filters') || basicFilters);
			
			if (profileName.extraFilters) {
				filters = filters.concat(list(profileName.extraFilters));
			}
				
			if (additionalFilters) {
				filters = filters.concat(list(additionalFilters));
			}
				
			if (!filters || !filters.length) {
				// looks like unknown syntax, apply basic filters
				filters = list(basicFilters);
			}
				
			return filters;
		},
		
		/**
		 * Extracts filter list from abbreviation
		 * @param {String} abbr
		 * @returns {Array} Array with cleaned abbreviation and list of 
		 * extracted filters
		 */
		extract: function(abbr) {
			var filters = '';
			abbr = abbr.replace(/\|([\w\|\-]+)$/, function(str, p1){
				filters = p1;
				return '';
			});
			
			return [abbr, list(filters)];
		}
	};
});