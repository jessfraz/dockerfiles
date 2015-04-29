/**
 * Toggles HTML and CSS comments depending on current caret context. Unlike
 * the same action in most editors, this action toggles comment on currently
 * matched item—HTML tag or CSS selector—when nothing is selected.
 */
if (typeof module === 'object' && typeof define !== 'function') {
	var define = function (factory) {
		module.exports = factory(require, exports, module);
	};
}

define(function(require, exports, module) {
	var prefs = require('../assets/preferences');
	var range = require('../assets/range');
	var utils = require('../utils/common');
	var actionUtils = require('../utils/action');
	var editorUtils = require('../utils/editor');
	var htmlMatcher = require('../assets/htmlMatcher');
	var cssEditTree = require('../editTree/css');

	/**
	 * Toggle HTML comment on current selection or tag
	 * @param {IEmmetEditor} editor
	 * @return {Boolean} Returns <code>true</code> if comment was toggled
	 */
	function toggleHTMLComment(editor) {
		/** @type Range */
		var r = range(editor.getSelectionRange());
		var info = editorUtils.outputInfo(editor);
			
		if (!r.length()) {
			// no selection, find matching tag
			var tag = htmlMatcher.tag(info.content, editor.getCaretPos());
			if (tag) { // found pair
				r = tag.outerRange;
			}
		}
		
		return genericCommentToggle(editor, '<!--', '-->', r);
	}

	/**
	 * Simple CSS commenting
	 * @param {IEmmetEditor} editor
	 * @return {Boolean} Returns <code>true</code> if comment was toggled
	 */
	function toggleCSSComment(editor) {
		/** @type Range */
		var rng = range(editor.getSelectionRange());
		var info = editorUtils.outputInfo(editor);
			
		if (!rng.length()) {
			// no selection, try to get current rule
			/** @type CSSRule */
			var rule = cssEditTree.parseFromPosition(info.content, editor.getCaretPos());
			if (rule) {
				var property = cssItemFromPosition(rule, editor.getCaretPos());
				rng = property 
					? property.range(true) 
					: range(rule.nameRange(true).start, rule.source);
			}
		}
		
		if (!rng.length()) {
			// still no selection, get current line
			rng = range(editor.getCurrentLineRange());
			utils.narrowToNonSpace(info.content, rng);
		}
		
		return genericCommentToggle(editor, '/*', '*/', rng);
	}
	
	/**
	 * Returns CSS property from <code>rule</code> that matches passed position
	 * @param {EditContainer} rule
	 * @param {Number} absPos
	 * @returns {EditElement}
	 */
	function cssItemFromPosition(rule, absPos) {
		// do not use default EditContainer.itemFromPosition() here, because
		// we need to make a few assumptions to make CSS commenting more reliable
		var relPos = absPos - (rule.options.offset || 0);
		var reSafeChar = /^[\s\n\r]/;
		return utils.find(rule.list(), function(item) {
			if (item.range().end === relPos) {
				// at the end of property, but outside of it
				// if there’s a space character at current position,
				// use current property
				return reSafeChar.test(rule.source.charAt(relPos));
			}
			
			return item.range().inside(relPos);
		});
	}

	/**
	 * Search for nearest comment in <code>str</code>, starting from index <code>from</code>
	 * @param {String} text Where to search
	 * @param {Number} from Search start index
	 * @param {String} start_token Comment start string
	 * @param {String} end_token Comment end string
	 * @return {Range} Returns null if comment wasn't found
	 */
	function searchComment(text, from, startToken, endToken) {
		var commentStart = -1;
		var commentEnd = -1;
		
		var hasMatch = function(str, start) {
			return text.substr(start, str.length) == str;
		};
			
		// search for comment start
		while (from--) {
			if (hasMatch(startToken, from)) {
				commentStart = from;
				break;
			}
		}
		
		if (commentStart != -1) {
			// search for comment end
			from = commentStart;
			var contentLen = text.length;
			while (contentLen >= from++) {
				if (hasMatch(endToken, from)) {
					commentEnd = from + endToken.length;
					break;
				}
			}
		}
		
		return (commentStart != -1 && commentEnd != -1) 
			? range(commentStart, commentEnd - commentStart) 
			: null;
	}

	/**
	 * Generic comment toggling routine
	 * @param {IEmmetEditor} editor
	 * @param {String} commentStart Comment start token
	 * @param {String} commentEnd Comment end token
	 * @param {Range} range Selection range
	 * @return {Boolean}
	 */
	function genericCommentToggle(editor, commentStart, commentEnd, range) {
		var content = editorUtils.outputInfo(editor).content;
		var caretPos = editor.getCaretPos();
		var newContent = null;
			
		/**
		 * Remove comment markers from string
		 * @param {Sting} str
		 * @return {String}
		 */
		function removeComment(str) {
			return str
				.replace(new RegExp('^' + utils.escapeForRegexp(commentStart) + '\\s*'), function(str){
					caretPos -= str.length;
					return '';
				}).replace(new RegExp('\\s*' + utils.escapeForRegexp(commentEnd) + '$'), '');
		}
		
		// first, we need to make sure that this substring is not inside 
		// comment
		var commentRange = searchComment(content, caretPos, commentStart, commentEnd);
		if (commentRange && commentRange.overlap(range)) {
			// we're inside comment, remove it
			range = commentRange;
			newContent = removeComment(range.substring(content));
		} else {
			// should add comment
			// make sure that there's no comment inside selection
			newContent = commentStart + ' ' +
				range.substring(content)
					.replace(new RegExp(utils.escapeForRegexp(commentStart) + '\\s*|\\s*' + utils.escapeForRegexp(commentEnd), 'g'), '') +
				' ' + commentEnd;
				
			// adjust caret position
			caretPos += commentStart.length + 1;
		}

		// replace editor content
		if (newContent !== null) {
			newContent = utils.escapeText(newContent);
			editor.setCaretPos(range.start);
			editor.replaceContent(editorUtils.unindent(editor, newContent), range.start, range.end);
			editor.setCaretPos(caretPos);
			return true;
		}
		
		return false;
	}
	
	return {
		/**
		 * Toggle comment on current editor's selection or HTML tag/CSS rule
		 * @param {IEmmetEditor} editor
		 */
		toggleCommentAction: function(editor) {
			var info = editorUtils.outputInfo(editor);
			if (actionUtils.isSupportedCSS(info.syntax)) {
				// in case our editor is good enough and can recognize syntax from 
				// current token, we have to make sure that cursor is not inside
				// 'style' attribute of html element
				var caretPos = editor.getCaretPos();
				var tag = htmlMatcher.tag(info.content, caretPos);
				if (tag && tag.open.range.inside(caretPos)) {
					info.syntax = 'html';
				}
			}
			
			var cssSyntaxes = prefs.getArray('css.syntaxes');
			if (~cssSyntaxes.indexOf(info.syntax)) {
				return toggleCSSComment(editor);
			}
			
			return toggleHTMLComment(editor);
		}
	};
});