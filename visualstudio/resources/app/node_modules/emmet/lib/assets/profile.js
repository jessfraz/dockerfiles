/**
 * Output profile module.
 * Profile defines how XHTML output data should look like
 */
if (typeof module === 'object' && typeof define !== 'function') {
	var define = function (factory) {
		module.exports = factory(require, exports, module);
	};
}

define(function(require, exports, module) {
	var utils = require('../utils/common');
	var resources = require('./resources');
	var prefs = require('./preferences');

	prefs.define('profile.allowCompactBoolean', true, 
		'This option can be used to globally disable compact form of boolean ' + 
		'attribues (attributes where name and value are equal). With compact' +
		'form enabled, HTML tags can be outputted as <code>&lt;div contenteditable&gt;</code> ' +
		'instead of <code>&lt;div contenteditable="contenteditable"&gt;</code>');

	prefs.define('profile.booleanAttributes', '^contenteditable|seamless$', 
		'A regular expression for attributes that should be boolean by default.' + 
		'If attribute name matches this expression, you don’t have to write dot ' +
		'after attribute name in Emmet abbreviation to mark it as boolean.');

	var profiles = {};
	
	var defaultProfile = {
		tag_case: 'asis',
		attr_case: 'asis',
		attr_quotes: 'double',
		
		// Each tag on new line
		tag_nl: 'decide',
		
		// With tag_nl === true, defines if leaf node (e.g. node with no children)
		// should have formatted line breaks
		tag_nl_leaf: false,
		
		place_cursor: true,
		
		// Indent tags
		indent: true,
		
		// How many inline elements should be to force line break 
		// (set to 0 to disable)
		inline_break: 3,

		// Produce compact notation of boolean attribues:
		// attributes where name and value are equal.
		// With this option enabled, HTML filter will
		// produce <div contenteditable> instead of <div contenteditable="contenteditable">
		compact_bool: false,
		
		// Use self-closing style for writing empty elements, e.g. <br /> or <br>
		self_closing_tag: 'xhtml',
		
		// Profile-level output filters, re-defines syntax filters 
		filters: '',
		
		// Additional filters applied to abbreviation.
		// Unlike "filters", this preference doesn't override default filters
		// but add the instead every time given profile is chosen
		extraFilters: ''
	};
	
	/**
	 * @constructor
	 * @type OutputProfile
	 * @param {Object} options
	 */
	function OutputProfile(options) {
		utils.extend(this, defaultProfile, options);
	}
	
	OutputProfile.prototype = {
		/**
		 * Transforms tag name case depending on current profile settings
		 * @param {String} name String to transform
		 * @returns {String}
		 */
		tagName: function(name) {
			return stringCase(name, this.tag_case);
		},
		
		/**
		 * Transforms attribute name case depending on current profile settings 
		 * @param {String} name String to transform
		 * @returns {String}
		 */
		attributeName: function(name) {
			return stringCase(name, this.attr_case);
		},
		
		/**
		 * Returns quote character for current profile
		 * @returns {String}
		 */
		attributeQuote: function() {
			return this.attr_quotes == 'single' ? "'" : '"';
		},

		/**
		 * Returns self-closing tag symbol for current profile
		 * @returns {String}
		 */
		selfClosing: function() {
			if (this.self_closing_tag == 'xhtml')
				return ' /';
			
			if (this.self_closing_tag === true)
				return '/';
			
			return '';
		},
		
		/**
		 * Returns cursor token based on current profile settings
		 * @returns {String}
		 */
		cursor: function() {
			return this.place_cursor ? utils.getCaretPlaceholder() : '';
		},

		/**
		 * Check if attribute with given name is boolean,
		 * e.g. written as `contenteditable` instead of 
		 * `contenteditable="contenteditable"`
		 * @param  {String}  name Attribute name
		 * @return {Boolean}
		 */
		isBoolean: function(name, value) {
			if (name == value) {
				return true;
			}

			var boolAttrs = prefs.get('profile.booleanAttributes');
			if (!value && boolAttrs) {
				boolAttrs = new RegExp(boolAttrs, 'i');
				return boolAttrs.test(name);
			}

			return false;
		},

		/**
		 * Check if compact boolean attribute record is 
		 * allowed for current profile
		 * @return {Boolean}
		 */
		allowCompactBoolean: function() {
			return this.compact_bool && prefs.get('profile.allowCompactBoolean');
		}
	};
	
	/**
	 * Helper function that converts string case depending on 
	 * <code>caseValue</code> 
	 * @param {String} str String to transform
	 * @param {String} caseValue Case value: can be <i>lower</i>, 
	 * <i>upper</i> and <i>leave</i>
	 * @returns {String}
	 */
	function stringCase(str, caseValue) {
		switch (String(caseValue || '').toLowerCase()) {
			case 'lower':
				return str.toLowerCase();
			case 'upper':
				return str.toUpperCase();
		}
		
		return str;
	}
	
	/**
	 * Creates new output profile
	 * @param {String} name Profile name
	 * @param {Object} options Profile options
	 */
	function createProfile(name, options) {
		return profiles[name.toLowerCase()] = new OutputProfile(options);
	}
	
	function createDefaultProfiles() {
		createProfile('xhtml');
		createProfile('html', {self_closing_tag: false, compact_bool: true});
		createProfile('xml', {self_closing_tag: true, tag_nl: true});
		createProfile('plain', {tag_nl: false, indent: false, place_cursor: false});
		createProfile('line', {tag_nl: false, indent: false, extraFilters: 's'});
		createProfile('css', {tag_nl: true});
		createProfile('css_line', {tag_nl: false});
	}
	
	createDefaultProfiles();
	
	return  {
		/**
		 * Creates new output profile and adds it into internal dictionary
		 * @param {String} name Profile name
		 * @param {Object} options Profile options
		 * @memberOf emmet.profile
		 * @returns {Object} New profile
		 */
		create: function(name, options) {
			if (arguments.length == 2)
				return createProfile(name, options);
			else
				// create profile object only
				return new OutputProfile(utils.defaults(name || {}, defaultProfile));
		},
		
		/**
		 * Returns profile by its name. If profile wasn't found, returns
		 * 'plain' profile
		 * @param {String} name Profile name. Might be profile itself
		 * @param {String} syntax. Optional. Current editor syntax. If defined,
		 * profile is searched in resources first, then in predefined profiles
		 * @returns {Object}
		 */
		get: function(name, syntax) {
			if (!name && syntax) {
				// search in user resources first
				var profile = resources.findItem(syntax, 'profile');
				if (profile) {
					name = profile;
				}
			}
			
			if (!name) {
				return profiles.plain;
			}
			
			if (name instanceof OutputProfile) {
				return name;
			}
			
			if (typeof name === 'string' && name.toLowerCase() in profiles) {
				return profiles[name.toLowerCase()];
			}
			
			return this.create(name);
		},
		
		/**
		 * Deletes profile with specified name
		 * @param {String} name Profile name
		 */
		remove: function(name) {
			name = (name || '').toLowerCase();
			if (name in profiles)
				delete profiles[name];
		},
		
		/**
		 * Resets all user-defined profiles
		 */
		reset: function() {
			profiles = {};
			createDefaultProfiles();
		},
		
		/**
		 * Helper function that converts string case depending on 
		 * <code>caseValue</code> 
		 * @param {String} str String to transform
		 * @param {String} caseValue Case value: can be <i>lower</i>, 
		 * <i>upper</i> and <i>leave</i>
		 * @returns {String}
		 */
		stringCase: stringCase
	};
});