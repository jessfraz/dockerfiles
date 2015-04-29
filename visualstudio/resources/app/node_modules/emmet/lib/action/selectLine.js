/**
 * Select current line (for simple editors like browser's &lt;textarea&gt;)
 */
if (typeof module === 'object' && typeof define !== 'function') {
	var define = function (factory) {
		module.exports = factory(require, exports, module);
	};
}

define(function(require, exports, module) {
	return {
		selectLineAction: function(editor) {
			var range = editor.getCurrentLineRange();
			editor.createSelection(range.start, range.end);
			return true;
		}
	};
});