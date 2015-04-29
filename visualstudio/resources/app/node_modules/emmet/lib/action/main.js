/**
 * Module describes and performs Emmet actions. The actions themselves are
 * defined in <i>actions</i> folder
 */
if (typeof module === 'object' && typeof define !== 'function') {
	var define = function (factory) {
		module.exports = factory(require, exports, module);
	};
}

define(function(require, exports, module) {
	var utils = require('../utils/common');

	// all registered actions
	var actions = {};

	// load all default actions
	var actionModules = {
		base64: require('./base64'),
		editPoints: require('./editPoints'),
		evaluateMath: require('./evaluateMath'),
		expandAbbreviation: require('./expandAbbreviation'),
		incrementDecrement: require('./incrementDecrement'),
		lineBreaks: require('./lineBreaks'),
		balance: require('./balance'),
		mergeLines: require('./mergeLines'),
		reflectCSSValue: require('./reflectCSSValue'),
		removeTag: require('./removeTag'),
		selectItem: require('./selectItem'),
		selectLine: require('./selectLine'),
		splitJoinTag: require('./splitJoinTag'),
		toggleComment: require('./toggleComment'),
		updateImageSize: require('./updateImageSize'),
		wrapWithAbbreviation: require('./wrapWithAbbreviation'),
		updateTag: require('./updateTag')
	};

	function addAction(name, fn, options) {
		name = name.toLowerCase();
		options = options || {};
		
		if (typeof options === 'string') {
			options = {label: options};
		}

		if (!options.label) {
			options.label = humanizeActionName(name);
		}
		
		actions[name] = {
			name: name,
			fn: fn,
			options: options
		};
	}
	
	/**
	 * “Humanizes” action name, makes it more readable for people
	 * @param {String} name Action name (like 'expand_abbreviation')
	 * @return Humanized name (like 'Expand Abbreviation')
	 */
	function humanizeActionName(name) {
		return utils.trim(name.charAt(0).toUpperCase() 
			+ name.substring(1).replace(/_[a-z]/g, function(str) {
				return ' ' + str.charAt(1).toUpperCase();
			}));
	}

	var bind = function(name, method) {
		var m = actionModules[name];
		return m[method].bind(m);
	};

	// XXX register default actions
	addAction('encode_decode_data_url', bind('base64', 'encodeDecodeDataUrlAction'), 'Encode\\Decode data:URL image');
	addAction('prev_edit_point', bind('editPoints', 'previousEditPointAction'), 'Previous Edit Point');
	addAction('next_edit_point', bind('editPoints', 'nextEditPointAction'), 'Next Edit Point');
	addAction('evaluate_math_expression', bind('evaluateMath', 'evaluateMathAction'), 'Numbers/Evaluate Math Expression');
	addAction('expand_abbreviation_with_tab', bind('expandAbbreviation', 'expandAbbreviationWithTabAction'), {hidden: true});
	addAction('expand_abbreviation', bind('expandAbbreviation', 'expandAbbreviationAction'), 'Expand Abbreviation');
	addAction('insert_formatted_line_break_only', bind('lineBreaks', 'insertLineBreakOnlyAction'), {hidden: true});
	addAction('insert_formatted_line_break', bind('lineBreaks', 'insertLineBreakAction'), {hidden: true});
	addAction('balance_inward', bind('balance', 'balanceInwardAction'), 'Balance (inward)');
	addAction('balance_outward', bind('balance', 'balanceOutwardAction'), 'Balance (outward)');
	addAction('matching_pair', bind('balance', 'goToMatchingPairAction'), 'HTML/Go To Matching Tag Pair');
	addAction('merge_lines', bind('mergeLines', 'mergeLinesAction'), 'Merge Lines');
	addAction('reflect_css_value', bind('reflectCSSValue', 'reflectCSSValueAction'), 'CSS/Reflect Value');
	addAction('remove_tag', bind('removeTag', 'removeTagAction'), 'HTML/Remove Tag');
	addAction('select_next_item', bind('selectItem', 'selectNextItemAction'), 'Select Next Item');
	addAction('select_previous_item', bind('selectItem', 'selectPreviousItemAction'), 'Select Previous Item');
	addAction('split_join_tag', bind('splitJoinTag', 'splitJoinTagAction'), 'HTML/Split\\Join Tag Declaration');
	addAction('toggle_comment', bind('toggleComment', 'toggleCommentAction'), 'Toggle Comment');
	addAction('update_image_size', bind('updateImageSize', 'updateImageSizeAction'), 'Update Image Size');
	addAction('wrap_with_abbreviation', bind('wrapWithAbbreviation', 'wrapWithAbbreviationAction'), 'Wrap With Abbreviation');
	addAction('update_tag', bind('updateTag', 'updateTagAction'), 'HTML/Update Tag');

	[1, -1, 10, -10, 0.1, -0.1].forEach(function(num) {
		var prefix = num > 0 ? 'increment' : 'decrement';
		var suffix = String(Math.abs(num)).replace('.', '').substring(0, 2);
		var actionId = prefix + '_number_by_' + suffix;
		var actionMethod = prefix + suffix + 'Action';
		var actionLabel = 'Numbers/' + prefix.charAt(0).toUpperCase() + prefix.substring(1) + ' number by ' + Math.abs(num);
		addAction(actionId, bind('incrementDecrement', actionMethod), actionLabel);
	});
	
	return {
		/**
		 * Registers new action
		 * @param {String} name Action name
		 * @param {Function} fn Action function
		 * @param {Object} options Custom action options:<br>
		 * <b>label</b> : (<code>String</code>) – Human-readable action name. 
		 * May contain '/' symbols as submenu separators<br>
		 * <b>hidden</b> : (<code>Boolean</code>) – Indicates whether action
		 * should be displayed in menu (<code>getMenu()</code> method)
		 */
		add: addAction,
		
		/**
		 * Returns action object
		 * @param {String} name Action name
		 * @returns {Object}
		 */
		get: function(name) {
			return actions[name.toLowerCase()];
		},
		
		/**
		 * Runs Emmet action. For list of available actions and their
		 * arguments see <i>actions</i> folder.
		 * @param {String} name Action name 
		 * @param {Array} args Additional arguments. It may be array of arguments
		 * or inline arguments. The first argument should be <code>IEmmetEditor</code> instance
		 * @returns {Boolean} Status of performed operation, <code>true</code>
		 * means action was performed successfully.
		 * @example
		 * require('action/main').run('expand_abbreviation', editor);  
		 * require('action/main').run('wrap_with_abbreviation', [editor, 'div']);  
		 */
		run: function(name, args) {
			if (!Array.isArray(args)) {
				args = utils.toArray(arguments, 1);
			}
			
			var action = this.get(name);
			if (!action) {
				throw new Error('Action "' + name + '" is not defined');
			}

			return action.fn.apply(action, args);
		},
		
		/**
		 * Returns all registered actions as object
		 * @returns {Object}
		 */
		getAll: function() {
			return actions;
		},
		
		/**
		 * Returns all registered actions as array
		 * @returns {Array}
		 */
		getList: function() {
			var all = this.getAll();
			return Object.keys(all).map(function(key) {
				return all[key];
			});
		},
		
		/**
		 * Returns actions list as structured menu. If action has <i>label</i>,
		 * it will be splitted by '/' symbol into submenus (for example: 
		 * CSS/Reflect Value) and grouped with other items
		 * @param {Array} skipActions List of action identifiers that should be 
		 * skipped from menu
		 * @returns {Array}
		 */
		getMenu: function(skipActions) {
			var result = [];
			skipActions = skipActions || [];
			this.getList().forEach(function(action) {
				if (action.options.hidden || ~skipActions.indexOf(action.name))
					return;
				
				var actionName = humanizeActionName(action.name);
				var ctx = result;
				if (action.options.label) {
					var parts = action.options.label.split('/');
					actionName = parts.pop();
					
					// create submenus, if needed
					var menuName, submenu;
					while ((menuName = parts.shift())) {
						submenu = utils.find(ctx, function(item) {
							return item.type == 'submenu' && item.name == menuName;
						});
						
						if (!submenu) {
							submenu = {
								name: menuName,
								type: 'submenu',
								items: []
							};
							ctx.push(submenu);
						}
						
						ctx = submenu.items;
					}
				}
				
				ctx.push({
					type: 'action',
					name: action.name,
					label: actionName
				});
			});
			
			return result;
		},

		/**
		 * Returns action name associated with menu item title
		 * @param {String} title
		 * @returns {String}
		 */
		getActionNameForMenuTitle: function(title, menu) {
			return utils.find(menu || this.getMenu(), function(val) {
				if (val.type == 'action') {
					if (val.label == title || val.name == title) {
						return val.name;
					}
				} else {
					return this.getActionNameForMenuTitle(title, val.items);
				}
			}, this);
		}
	};
});