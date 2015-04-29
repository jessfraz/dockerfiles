/**
 * Evaluates simple math expression under caret
 */
if (typeof module === 'object' && typeof define !== 'function') {
	var define = function (factory) {
		module.exports = factory(require, exports, module);
	};
}

define(function(require, exports, module) {
	var actionUtils = require('../utils/action');
	var utils = require('../utils/common');
	var math = require('../utils/math');
	var range = require('../assets/range');

	return {
		/**
		 * Evaluates math expression under the caret
		 * @param  {IEmmetEditor} editor
		 * @return {Boolean}
		 */
		evaluateMathAction: function(editor) {
			var content = editor.getContent();
			var chars = '.+-*/\\';
			
			/** @type Range */
			var sel = range(editor.getSelectionRange());
			if (!sel.length()) {
				sel = actionUtils.findExpressionBounds(editor, function(ch) {
					return utils.isNumeric(ch) || chars.indexOf(ch) != -1;
				});
			}
			
			if (sel && sel.length()) {
				var expr = sel.substring(content);
				
				// replace integral division: 11\2 => Math.round(11/2) 
				expr = expr.replace(/([\d\.\-]+)\\([\d\.\-]+)/g, 'round($1/$2)');
				
				try {
					var result = utils.prettifyNumber(math.evaluate(expr));
					editor.replaceContent(result, sel.start, sel.end);
					editor.setCaretPos(sel.start + result.length);
					return true;
				} catch (e) {}
			}
			
			return false;
		}
	};
});
