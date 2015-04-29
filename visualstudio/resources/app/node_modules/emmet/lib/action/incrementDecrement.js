/**
 * Increment/decrement number under cursor
 */
if (typeof module === 'object' && typeof define !== 'function') {
	var define = function (factory) {
		module.exports = factory(require, exports, module);
	};
}

define(function(require, exports, module) {
	var utils = require('../utils/common');
	var actionUtils = require('../utils/action');

	/**
	 * Returns length of integer part of number
	 * @param {String} num
	 */
	function intLength(num) {
		num = num.replace(/^\-/, '');
		if (~num.indexOf('.')) {
			return num.split('.')[0].length;
		}
		
		return num.length;
	}

	return {
		increment01Action: function(editor) {
			return this.incrementNumber(editor, .1);
		},

		increment1Action: function(editor) {
			return this.incrementNumber(editor, 1);
		},

		increment10Action: function(editor) {
			return this.incrementNumber(editor, 10);
		},

		decrement01Action: function(editor) {
			return this.incrementNumber(editor, -.1);
		},

		decrement1Action: function(editor) {
			return this.incrementNumber(editor, -1);
		},

		decrement10Action: function(editor) {
			return this.incrementNumber(editor, -10);
		},

		/**
		 * Default method to increment/decrement number under
		 * caret with given step
		 * @param  {IEmmetEditor} editor
		 * @param  {Number} step
		 * @return {Boolean}
		 */
		incrementNumber: function(editor, step) {
			var hasSign = false;
			var hasDecimal = false;
				
			var r = actionUtils.findExpressionBounds(editor, function(ch, pos, content) {
				if (utils.isNumeric(ch))
					return true;
				if (ch == '.') {
					// make sure that next character is numeric too
					if (!utils.isNumeric(content.charAt(pos + 1)))
						return false;
					
					return hasDecimal ? false : hasDecimal = true;
				}
				if (ch == '-')
					return hasSign ? false : hasSign = true;
					
				return false;
			});
				
			if (r && r.length()) {
				var strNum = r.substring(String(editor.getContent()));
				var num = parseFloat(strNum);
				if (!isNaN(num)) {
					num = utils.prettifyNumber(num + step);
					
					// do we have zero-padded number?
					if (/^(\-?)0+[1-9]/.test(strNum)) {
						var minus = '';
						if (RegExp.$1) {
							minus = '-';
							num = num.substring(1);
						}
							
						var parts = num.split('.');
						parts[0] = utils.zeroPadString(parts[0], intLength(strNum));
						num = minus + parts.join('.');
					}
					
					editor.replaceContent(num, r.start, r.end);
					editor.createSelection(r.start, r.start + num.length);
					return true;
				}
			}
			
			return false;
		}
	};
});