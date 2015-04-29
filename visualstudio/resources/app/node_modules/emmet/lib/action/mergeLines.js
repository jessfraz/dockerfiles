/**
 * Merges selected lines or lines between XHTML tag pairs
 * @param {Function} require
 * @param {Underscore} _
 */
if (typeof module === 'object' && typeof define !== 'function') {
	var define = function (factory) {
		module.exports = factory(require, exports, module);
	};
}

define(function(require, exports, module) {
	var htmlMatcher = require('../assets/htmlMatcher');
	var utils = require('../utils/common');
	var editorUtils = require('../utils/editor');
	var range = require('../assets/range');

	return {
		mergeLinesAction: function(editor) {
			var info = editorUtils.outputInfo(editor);
		
			var selection = range(editor.getSelectionRange());
			if (!selection.length()) {
				// find matching tag
				var pair = htmlMatcher.find(info.content, editor.getCaretPos());
				if (pair) {
					selection = pair.outerRange;
				}
			}
			
			if (selection.length()) {
				// got range, merge lines
				var text =  selection.substring(info.content);
				var lines = utils.splitByLines(text);
				
				for (var i = 1; i < lines.length; i++) {
					lines[i] = lines[i].replace(/^\s+/, '');
				}
				
				text = lines.join('').replace(/\s{2,}/, ' ');
				var textLen = text.length;
				text = utils.escapeText(text);
				editor.replaceContent(text, selection.start, selection.end);
				editor.createSelection(selection.start, selection.start + textLen);
				
				return true;
			}
			
			return false;
		}
	};
});