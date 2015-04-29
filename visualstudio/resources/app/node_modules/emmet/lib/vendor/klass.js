if (typeof module === 'object' && typeof define !== 'function') {
	var define = function (factory) {
		module.exports = factory(require, exports, module);
	};
}

define(function(require, exports, module) {
	var utils = require('../utils/common');

	/**
	 * Shared empty constructor function to aid in prototype-chain creation.
	 */
	var ctor = function(){};

	/**
	 * Helper function to correctly set up the prototype chain, for subclasses.
	 * Similar to `goog.inherits`, but uses a hash of prototype properties and
	 * class properties to be extended.
	 * Took it from Backbone.
	 * @param {Object} parent
	 * @param {Object} protoProps
	 * @param {Object} staticProps
	 * @returns {Object}
	 */
	function inherits(parent, protoProps, staticProps) {
		var child;

		// The constructor function for the new subclass is either defined by
		// you (the "constructor" property in your `extend` definition), or
		// defaulted by us to simply call the parent's constructor.
		if (protoProps && protoProps.hasOwnProperty('constructor')) {
			child = protoProps.constructor;
		} else {
			child = function() {
				parent.apply(this, arguments);
			};
		}

		// Inherit class (static) properties from parent.
		utils.extend(child, parent);

		// Set the prototype chain to inherit from `parent`, without calling
		// `parent`'s constructor function.
		ctor.prototype = parent.prototype;
		child.prototype = new ctor();

		// Add prototype properties (instance properties) to the subclass,
		// if supplied.
		if (protoProps)
			utils.extend(child.prototype, protoProps);

		// Add static properties to the constructor function, if supplied.
		if (staticProps)
			utils.extend(child, staticProps);

		// Correctly set child's `prototype.constructor`.
		child.prototype.constructor = child;

		// Set a convenience property in case the parent's prototype is needed
		// later.
		child.__super__ = parent.prototype;

		return child;
	}

	return {
		/**
		 * The self-propagating extend function for classes.
		 * Took it from Backbone 
		 * @param {Object} protoProps
		 * @param {Object} classProps
		 * @returns {Object}
		 */
		extend: function(protoProps, classProps) {
			var child = inherits(this, protoProps, classProps);
			child.extend = this.extend;
			// a hack required to WSH inherit `toString` method
			if (protoProps.hasOwnProperty('toString'))
				child.prototype.toString = protoProps.toString;
			return child;
		}
	};
});