/**
 * Utility module that provides ordered storage of function handlers. 
 * Many Emmet modules' functionality can be extended/overridden by custom
 * function. This modules provides unified storage of handler functions, their 
 * management and execution
 */
if (typeof module === 'object' && typeof define !== 'function') {
	var define = function (factory) {
		module.exports = factory(require, exports, module);
	};
}

define(function(require, exports, module) {
	var utils = require('../utils/common');
	
	/**
	 * @type HandlerList
	 * @constructor
	 */
	function HandlerList() {
		this._list = [];
	}
	
	HandlerList.prototype = {
		/**
		 * Adds function handler
		 * @param {Function} fn Handler
		 * @param {Object} options Handler options. Possible values are:<br><br>
		 * <b>order</b> : (<code>Number</code>) – order in handler list. Handlers
		 * with higher order value will be executed earlier.
		 */
		add: function(fn, options) {
			// TODO hack for stable sort, remove after fixing `list()`
			var order = this._list.length;
			if (options && 'order' in options) {
				order = options.order * 10000;
			}
			this._list.push(utils.extend({}, options, {order: order, fn: fn}));
		},
		
		/**
		 * Removes handler from list
		 * @param {Function} fn
		 */
		remove: function(fn) {
			var item = utils.find(this._list, function(item) {
				return item.fn === fn;
			});
			if (item) {
				this._list.splice(this._list.indexOf(item), 1);
			}
		},
		
		/**
		 * Returns ordered list of handlers. By default, handlers 
		 * with the same <code>order</code> option returned in reverse order, 
		 * i.e. the latter function was added into the handlers list, the higher 
		 * it will be in the returned array 
		 * @returns {Array}
		 */
		list: function() {
			// TODO make stable sort
			return this._list.sort(function(a, b) {
				return b.order - a.order;
			});
		},
		
		/**
		 * Returns ordered list of handler functions
		 * @returns {Array}
		 */
		listFn: function() {
			return this.list().map(function(item) {
				return item.fn;
			});
		},
		
		/**
		 * Executes handler functions in their designated order. If function
		 * returns <code>skipVal</code>, meaning that function was unable to 
		 * handle passed <code>args</code>, the next function will be executed
		 * and so on.
		 * @param {Object} skipValue If function returns this value, execute 
		 * next handler.
		 * @param {Array} args Arguments to pass to handler function
		 * @returns {Boolean} Whether any of registered handlers performed
		 * successfully  
		 */
		exec: function(skipValue, args) {
			args = args || [];
			var result = null;
			utils.find(this.list(), function(h) {
				result = h.fn.apply(h, args);
				if (result !== skipValue) {
					return true;
				}
			});
			
			return result;
		}
	};
	
	return {
		/**
		 * Factory method that produces <code>HandlerList</code> instance
		 * @returns {HandlerList}
		 * @memberOf handlerList
		 */
		create: function() {
			return new HandlerList();
		}
	};
});