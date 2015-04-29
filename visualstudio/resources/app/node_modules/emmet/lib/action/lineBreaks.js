/**
 * Actions to insert line breaks. Some simple editors (like browser's 
 * &lt;textarea&gt;, for example) do not provide such simple things
 */
if (typeof module === 'object' && typeof define !== 'function') {
	var define = function (factory) {
		module.exports = factory(require, exports, module);
	};
}

define(function(require, exports, module) {
	var prefs = require('../assets/preferences');
	var utils = require('../utils/common');
	var resources = require('../assets/resources');
	var htmlMatcher = require('../assets/htmlMatcher');
	var editorUtils = require('../utils/editor');

	var xmlSyntaxes = ['html', 'xml', 'xsl'];

	// setup default preferences
	prefs.define('css.closeBraceIndentation', '\n',
			'Indentation before closing brace of CSS rule. Some users prefere ' 
			+ 'indented closing brace of CSS rule for better readability. '
			+ 'This preference’s value will be automatically inserted before '
			+ 'closing brace when user adds newline in newly created CSS rule '
			+ '(e.g. when “Insert formatted linebreak” action will be performed ' 
			+ 'in CSS file). If you’re such user, you may want to write put a value ' 
			+ 'like <code>\\n\\t</code> in this preference.');

	return {
		/**
		 * Inserts newline character with proper indentation. This action is used in
		 * editors that doesn't have indentation control (like textarea element) to 
		 * provide proper indentation for inserted newlines
		 * @param {IEmmetEditor} editor Editor instance
		 */
		insertLineBreakAction: function(editor) {
			if (!this.insertLineBreakOnlyAction(editor)) {
				var curPadding = editorUtils.getCurrentLinePadding(editor);
				var content = String(editor.getContent());
				var caretPos = editor.getCaretPos();
				var len = content.length;
				var nl = '\n';
					
				// check out next line padding
				var lineRange = editor.getCurrentLineRange();
				var nextPadding = '';
					
				for (var i = lineRange.end + 1, ch; i < len; i++) {
					ch = content.charAt(i);
					if (ch == ' ' || ch == '\t')
						nextPadding += ch;
					else
						break;
				}
				
				if (nextPadding.length > curPadding.length) {
					editor.replaceContent(nl + nextPadding, caretPos, caretPos, true);
				} else {
					editor.replaceContent(nl, caretPos);
				}
			}
			
			return true;
		},

		/**
		 * Inserts newline character with proper indentation in specific positions only.
		 * @param {IEmmetEditor} editor
		 * @return {Boolean} Returns <code>true</code> if line break was inserted 
		 */
		insertLineBreakOnlyAction: function(editor) {
			var info = editorUtils.outputInfo(editor);
			var caretPos = editor.getCaretPos();
			var nl = '\n';
			var pad = '\t';
			
			if (~xmlSyntaxes.indexOf(info.syntax)) {
				// let's see if we're breaking newly created tag
				var tag = htmlMatcher.tag(info.content, caretPos);
				if (tag && !tag.innerRange.length()) {
					editor.replaceContent(nl + pad + utils.getCaretPlaceholder() + nl, caretPos);
					return true;
				}
			} else if (info.syntax == 'css') {
				/** @type String */
				var content = info.content;
				if (caretPos && content.charAt(caretPos - 1) == '{') {
					var append = prefs.get('css.closeBraceIndentation');
					
					var hasCloseBrace = content.charAt(caretPos) == '}';
					if (!hasCloseBrace) {
						// do we really need special formatting here?
						// check if this is really a newly created rule,
						// look ahead for a closing brace
						for (var i = caretPos, il = content.length, ch; i < il; i++) {
							ch = content.charAt(i);
							if (ch == '{') {
								// ok, this is a new rule without closing brace
								break;
							}
							
							if (ch == '}') {
								// not a new rule, just add indentation
								append = '';
								hasCloseBrace = true;
								break;
							}
						}
					}
					
					if (!hasCloseBrace) {
						append += '}';
					}
					
					// defining rule set
					var insValue = nl + pad + utils.getCaretPlaceholder() + append;
					editor.replaceContent(insValue, caretPos);
					return true;
				}
			}
				
			return false;
		}
	};
});