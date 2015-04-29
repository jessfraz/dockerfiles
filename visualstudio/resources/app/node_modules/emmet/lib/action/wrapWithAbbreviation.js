/**
 * Action that wraps content with abbreviation. For convenience, action is 
 * defined as reusable module
 */
if (typeof module === 'object' && typeof define !== 'function') {
	var define = function (factory) {
		module.exports = factory(require, exports, module);
	};
}

define(function(require, exports, module) {
	var range = require('../assets/range');
	var htmlMatcher = require('../assets/htmlMatcher');
	var utils = require('../utils/common');
	var editorUtils = require('../utils/editor');
	var actionUtils = require('../utils/action');
	var parser = require('../parser/abbreviation');
	
	return {
		/**
		 * Wraps content with abbreviation
		 * @param {IEmmetEditor} Editor instance
		 * @param {String} abbr Abbreviation to wrap with
		 * @param {String} syntax Syntax type (html, css, etc.)
		 * @param {String} profile Output profile name (html, xml, xhtml)
		 */
		wrapWithAbbreviationAction: function(editor, abbr, syntax, profile) {
			var info = editorUtils.outputInfo(editor, syntax, profile);
			abbr = abbr || editor.prompt("Enter abbreviation");
			
			if (!abbr) {
				return null;
			}
			
			abbr = String(abbr);
			
			var r = range(editor.getSelectionRange());
			
			if (!r.length()) {
				// no selection, find tag pair
				var match = htmlMatcher.tag(info.content, r.start);
				if (!match) {  // nothing to wrap
					return false;
				}
				
				r = utils.narrowToNonSpace(info.content, match.range);
			}
			
			var newContent = utils.escapeText(r.substring(info.content));
			var result = parser.expand(abbr, {
				pastedContent: editorUtils.unindent(editor, newContent),
				syntax: info.syntax,
				profile: info.profile,
				contextNode: actionUtils.captureContext(editor)
			});
			
			if (result) {
				editor.replaceContent(result, r.start, r.end);
				return true;
			}
			
			return false;
		}
	};
});