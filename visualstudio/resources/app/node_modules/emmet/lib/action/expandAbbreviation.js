/**
 * 'Expand abbreviation' editor action: extracts abbreviation from current caret 
 * position and replaces it with formatted output. 
 * <br><br>
 * This behavior can be overridden with custom handlers which can perform 
 * different actions when 'Expand Abbreviation' action is called.
 * For example, a CSS gradient handler that produces vendor-prefixed gradient
 * definitions registers its own expand abbreviation handler.  
 */
if (typeof module === 'object' && typeof define !== 'function') {
	var define = function (factory) {
		module.exports = factory(require, exports, module);
	};
}

define(function(require, exports, module) {
	var handlerList = require('../assets/handlerList');
	var range = require('../assets/range');
	var prefs = require('../assets/preferences');
	var utils = require('../utils/common');
	var editorUtils = require('../utils/editor');
	var actionUtils = require('../utils/action');
	var cssGradient = require('../resolver/cssGradient');
	var parser = require('../parser/abbreviation');

	/**
	 * Search for abbreviation in editor from current caret position
	 * @param {IEmmetEditor} editor Editor instance
	 * @return {String}
	 */
	function findAbbreviation(editor) {
		var r = range(editor.getSelectionRange());
		var content = String(editor.getContent());
		if (r.length()) {
			// abbreviation is selected by user
			return r.substring(content);
		}
		
		// search for new abbreviation from current caret position
		var curLine = editor.getCurrentLineRange();
		return actionUtils.extractAbbreviation(content.substring(curLine.start, r.start));
	}

	/**
	 * @type HandlerList List of registered handlers
	 */
	var handlers = handlerList.create();

	// XXX setup default expand handlers
	
	/**
	 * Extracts abbreviation from current caret 
	 * position and replaces it with formatted output 
	 * @param {IEmmetEditor} editor Editor instance
	 * @param {String} syntax Syntax type (html, css, etc.)
	 * @param {String} profile Output profile name (html, xml, xhtml)
	 * @return {Boolean} Returns <code>true</code> if abbreviation was expanded 
	 * successfully
	 */
	handlers.add(function(editor, syntax, profile) {
		var caretPos = editor.getSelectionRange().end;
		var abbr = findAbbreviation(editor);
			
		if (abbr) {
			var content = parser.expand(abbr, {
				syntax: syntax, 
				profile: profile, 
				contextNode: actionUtils.captureContext(editor)
			});

			if (content) {
				var replaceFrom = caretPos - abbr.length;
				var replaceTo = caretPos;

				// a special case for CSS: if editor already contains
				// semicolon right after current caret position — replace it too
				var cssSyntaxes = prefs.getArray('css.syntaxes');
				if (cssSyntaxes && ~cssSyntaxes.indexOf(syntax)) {
					var curContent = editor.getContent();
					if (curContent.charAt(caretPos) == ';' && content.charAt(content.length - 1) == ';') {
						replaceTo++;
					}
				}

				editor.replaceContent(content, replaceFrom, replaceTo);
				return true;
			}
		}
		
		return false;
	}, {order: -1});
	handlers.add(cssGradient.expandAbbreviationHandler.bind(cssGradient));
		
	return {
		/**
		 * The actual “Expand Abbreviation“ action routine
		 * @param  {IEmmetEditor} editor  Editor instance
		 * @param  {String} syntax  Current document syntax
		 * @param  {String} profile Output profile name
		 * @return {Boolean}
		 */
		expandAbbreviationAction: function(editor, syntax, profile) {
			var args = utils.toArray(arguments);
			
			// normalize incoming arguments
			var info = editorUtils.outputInfo(editor, syntax, profile);
			args[1] = info.syntax;
			args[2] = info.profile;
			
			return handlers.exec(false, args);
		},

		/**
		 * A special case of “Expand Abbreviation“ action, invoked by Tab key.
		 * In this case if abbreviation wasn’t expanded successfully or there’s a selecetion, 
		 * the current line/selection will be indented. 
		 * @param  {IEmmetEditor} editor  Editor instance
		 * @param  {String} syntax  Current document syntax
		 * @param  {String} profile Output profile name
		 * @return {Boolean}
		 */
		expandAbbreviationWithTabAction: function(editor, syntax, profile) {
			var sel = editor.getSelection();
			var indent = '\t';

			// if something is selected in editor,
			// we should indent the selected content
			if (sel) {
				var selRange = range(editor.getSelectionRange());
				var content = utils.padString(sel, indent);
				
				editor.replaceContent(indent + '${0}', editor.getCaretPos());
				var replaceRange = range(editor.getCaretPos(), selRange.length());
				editor.replaceContent(content, replaceRange.start, replaceRange.end, true);
				editor.createSelection(replaceRange.start, replaceRange.start + content.length);
				return true;
			}
	
			// nothing selected, try to expand
			if (!this.expandAbbreviationAction(editor, syntax, profile)) {
				editor.replaceContent(indent, editor.getCaretPos());
			}
			
			return true;
		},

		
		_defaultHandler: function(editor, syntax, profile) {
			var caretPos = editor.getSelectionRange().end;
			var abbr = this.findAbbreviation(editor);
				
			if (abbr) {
				var ctx = actionUtils.captureContext(editor);
				var content = parser.expand(abbr, syntax, profile, ctx);
				if (content) {
					editor.replaceContent(content, caretPos - abbr.length, caretPos);
					return true;
				}
			}
			
			return false;
		},

		/**
		 * Adds custom expand abbreviation handler. The passed function should 
		 * return <code>true</code> if it was performed successfully, 
		 * <code>false</code> otherwise.
		 * 
		 * Added handlers will be called when 'Expand Abbreviation' is called
		 * in order they were added
		 * @memberOf expandAbbreviation
		 * @param {Function} fn
		 * @param {Object} options
		 */
		addHandler: function(fn, options) {
			handlers.add(fn, options);
		},
		
		/**
		 * Removes registered handler
		 * @returns
		 */
		removeHandler: function(fn) {
			handlers.remove(fn);
		},
		
		findAbbreviation: findAbbreviation
	};
});