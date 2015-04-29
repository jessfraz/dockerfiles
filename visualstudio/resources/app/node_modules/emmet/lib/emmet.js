if (typeof module === 'object' && typeof define !== 'function') {
	var define = function (factory) {
		module.exports = factory(require, exports, module);
	};
}

define(function(require, exports, module) {
	var global = typeof self != 'undefined' ? self : this;

	var utils = require('./utils/common');
	var actions = require('./action/main');
	var parser = require('./parser/abbreviation');
	var file = require('./plugin/file');

	var preferences = require('./assets/preferences');
	var resources = require('./assets/resources');
	var profile = require('./assets/profile');
	var ciu = require('./assets/caniuse');
	var logger = require('./assets/logger');

	var sliceFn = Array.prototype.slice;

	/**
	 * Returns file name part from path
	 * @param {String} path Path to file
	 * @return {String}
	 */
	function getFileName(path) {
		var re = /([\w\.\-]+)$/i;
		var m = re.exec(path);
		return m ? m[1] : '';
	}

	/**
	 * Normalizes profile definition: converts some
	 * properties to valid data types
	 * @param {Object} profile
	 * @return {Object}
	 */
	function normalizeProfile(profile) {
		if (typeof profile === 'object') {
			if ('indent' in profile) {
				profile.indent = !!profile.indent;
			}

			if ('self_closing_tag' in profile) {
				if (typeof profile.self_closing_tag === 'number') {
					profile.self_closing_tag = !!profile.self_closing_tag;
				}
			}
		}

		return profile;
	}
	
	return {
		/**
		 * The essential function that expands Emmet abbreviation
		 * @param {String} abbr Abbreviation to parse
		 * @param {String} syntax Abbreviation's context syntax
		 * @param {String} profile Output profile (or its name)
		 * @param {Object} contextNode Contextual node where abbreviation is
		 * written
		 * @return {String}
		 */
		expandAbbreviation: function(abbr, syntax, profile, contextNode) {
			return parser.expand(abbr, {
				syntax: syntax,
				profile: profile,
				contextNode: contextNode
			});
		},

		/**
		 * Runs given action
		 * @param  {String} name Action name
		 * @param  {IEmmetEditor} editor Editor instance
		 * @return {Boolean} Returns true if action was performed successfully
		 */
		run: function(name) {
			return actions.run.apply(actions, sliceFn.call(arguments, 0));
		},

		/**
		 * Loads Emmet extensions. Extensions are simple .js files that
		 * uses Emmet modules and resources to create new actions, modify
		 * existing ones etc.
		 * @param {Array} fileList List of absolute paths to files in extensions 
		 * folder. Back-end app should not filter this list (e.g. by extension) 
		 * but return it "as-is" so bootstrap can decide how to load contents 
		 * of each file.
		 * This method requires a <code>file</code> module of <code>IEmmetFile</code> 
		 * interface to be implemented.
		 * @memberOf bootstrap
		 */
		loadExtensions: function(fileList) {
			var payload = {};
			var userSnippets = null;
			var that = this;

			// make sure file list contians only valid extension files
			fileList = fileList.filter(function(f) {
				var ext = file.getExt(f);
				return ext === 'json' || ext === 'js';
			});

			var reader = (file.readText || file.read).bind(file);
			var next = function() {
				if (fileList.length) {
					var f = fileList.shift();
					reader(f, function(err, content) {
						if (err) {
							logger.log('Unable to read "' + f + '" file: '+ err);
							return next();
						}
												
						switch (file.getExt(f)) {
							case 'js':
								try {
									eval(content);
								} catch (e) {
									logger.log('Unable to eval "' + f + '" file: '+ e);
								}
								break;
							case 'json':
								var fileName = getFileName(f).toLowerCase().replace(/\.json$/, '');
								if (/^snippets/.test(fileName)) {
									if (fileName === 'snippets') {
										// data in snippets.json is more important to user
										userSnippets = utils.parseJSON(content);
									} else {
										payload.snippets = utils.deepMerge(payload.snippets || {}, utils.parseJSON(content));
									}
								} else {
									payload[fileName] = content;
								}
								
								break;
						}
						
						next();
					});
				} else {
					// complete
					if (userSnippets) {
						payload.snippets = utils.deepMerge(payload.snippets || {}, userSnippets);
					}
					
					that.loadUserData(payload);
				}
			};
			
			next();
		},
		
		/**
		 * Loads preferences from JSON object (or string representation of JSON)
		 * @param {Object} data
		 * @returns
		 */
		loadPreferences: function(data) {
			preferences.load(utils.parseJSON(data));
		},
		
		/**
		 * Loads user snippets and abbreviations. It doesn’t replace current
		 * user resource vocabulary but merges it with passed one. If you need 
		 * to <i>replaces</i> user snippets you should call 
		 * <code>resetSnippets()</code> method first
		 */
		loadSnippets: function(data) {
			data = utils.parseJSON(data);
			
			var userData = resources.getVocabulary('user') || {};
			resources.setVocabulary(utils.deepMerge(userData, data), 'user');
		},
		
		/**
		 * Helper function that loads default snippets, defined in project’s
		 * <i>snippets.json</i>
		 * @param {Object} data
		 */
		loadSystemSnippets: function(data) {
			resources.setVocabulary(utils.parseJSON(data), 'system');
		},

		/**
		 * Helper function that loads Can I Use database
		 * @param {Object} data
		 */
		loadCIU: function(data) {
			ciu.load(utils.parseJSON(data));
		},
		
		/**
		 * Removes all user-defined snippets
		 */
		resetSnippets: function() {
			resources.setVocabulary({}, 'user');
		},
		
		/**
		 * Helper function that loads all user data (snippets and preferences)
		 * defined as a single JSON object. This is useful for loading data 
		 * stored in a common storage, for example <code>NSUserDefaults</code>
		 * @param {Object} data
		 */
		loadUserData: function(data) {
			data = utils.parseJSON(data);
			if (data.snippets) {
				this.loadSnippets(data.snippets);
			}
			
			if (data.preferences) {
				this.loadPreferences(data.preferences);
			}
			
			if (data.profiles) {
				this.loadProfiles(data.profiles);
			}

			if (data.caniuse) {
				this.loadCIU(data.caniuse);
			}
			
			var profiles = data.syntaxProfiles || data.syntaxprofiles;
			if (profiles) {
				this.loadSyntaxProfiles(profiles);
			}
		},
		
		/**
		 * Resets all user-defined data: preferences, snippets etc.
		 * @returns
		 */
		resetUserData: function() {
			this.resetSnippets();
			preferences.reset();
			profile.reset();
		},
		
		/**
		 * Load syntax-specific output profiles. These are essentially 
		 * an extension to syntax snippets 
		 * @param {Object} profiles Dictionary of profiles
		 */
		loadSyntaxProfiles: function(profiles) {
			profiles = utils.parseJSON(profiles);
			var snippets = {};
			Object.keys(profiles).forEach(function(syntax) {
				var options = profiles[syntax];
				if (!(syntax in snippets)) {
					snippets[syntax] = {};
				}
				snippets[syntax].profile = normalizeProfile(options);
			});
			
			this.loadSnippets(snippets);
		},
		
		/**
		 * Load named profiles
		 * @param {Object} profiles
		 */
		loadProfiles: function(profiles) {
			profiles = utils.parseJSON(profiles);
			Object.keys(profiles).forEach(function(name) {
				profile.create(name, normalizeProfile(profiles[name]));
			});
		},
		require: require,

		// expose some useful data for plugin authors
		actions: actions,
		file: file,
		preferences: preferences,
		resources: resources,
		profile: profile,
		tabStops: require('./assets/tabStops'),
		htmlMatcher: require('./assets/htmlMatcher'),
		utils: {
			common: utils,
			action: require('./utils/action'),
			editor: require('./utils/editor')
		}
	};
});