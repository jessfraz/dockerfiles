/**
 * Splits or joins tag, e.g. transforms it into a short notation and vice versa:<br>
 * &lt;div&gt;&lt;/div&gt; → &lt;div /&gt; : join<br>
 * &lt;div /&gt; → &lt;div&gt;&lt;/div&gt; : split
 */
if (typeof module === 'object' && typeof define !== 'function') {
	var define = function (factory) {
		module.exports = factory(require, exports, module);
	};
}

define(function(require, exports, module) {
	var utils = require('../utils/common');
	var resources = require('../assets/resources');
	var matcher = require('../assets/htmlMatcher');
	var editorUtils = require('../utils/editor');
	var profile = require('../assets/profile');

	/**
	 * @param {IEmmetEditor} editor
	 * @param {Object} profile
	 * @param {Object} tag
	 */
	function joinTag(editor, profile, tag) {
		// empty closing slash is a nonsense for this action
		var slash = profile.selfClosing() || ' /';
		var content = tag.open.range.substring(tag.source).replace(/\s*>$/, slash + '>');
		
		var caretPos = editor.getCaretPos();
		
		// update caret position
		if (content.length + tag.outerRange.start < caretPos) {
			caretPos = content.length + tag.outerRange.start;
		}
		
		content = utils.escapeText(content);
		editor.replaceContent(content, tag.outerRange.start, tag.outerRange.end);
		editor.setCaretPos(caretPos);
		return true;
	}
	
	function splitTag(editor, profile, tag) {
		var caretPos = editor.getCaretPos();
		
		// define tag content depending on profile
		var tagContent = (profile.tag_nl === true) ? '\n\t\n' : '';
		var content = tag.outerContent().replace(/\s*\/>$/, '>');
		caretPos = tag.outerRange.start + content.length;
		content += tagContent + '</' + tag.open.name + '>';
		
		content = utils.escapeText(content);
		editor.replaceContent(content, tag.outerRange.start, tag.outerRange.end);
		editor.setCaretPos(caretPos);
		return true;
	}

	return {
		splitJoinTagAction: function(editor, profileName) {
			var info = editorUtils.outputInfo(editor, null, profileName);
			var curProfile = profile.get(info.profile);
			
			// find tag at current position
			var tag = matcher.tag(info.content, editor.getCaretPos());
			if (tag) {
				return tag.close 
					? joinTag(editor, curProfile, tag) 
					: splitTag(editor, curProfile, tag);
			}
			
			return false;
		}
	};
});