/**
 * Update Tag action: allows users to update existing HTML tags and add/remove
 * attributes or even tag name
 */
if (typeof module === 'object' && typeof define !== 'function') {
	var define = function (factory) {
		module.exports = factory(require, exports, module);
	};
}

define(function(require, exports, module) {
	var xmlEditTree = require('../editTree/xml');
	var editorUtils = require('../utils/editor');
	var actionUtils = require('../utils/action');
	var utils = require('../utils/common');
	var parser = require('../parser/abbreviation');

	function updateAttributes(tag, abbrNode, ix) {
		var classNames = (abbrNode.attribute('class') || '').split(/\s+/g);
		if (ix) {
			classNames.push('+' + abbrNode.name());
		}

		var r = function(str) {
			return utils.replaceCounter(str, abbrNode.counter);
		};

		// update class
		classNames.forEach(function(className) {
			if (!className) {
				return;
			}

			className = r(className);
			var ch = className.charAt(0);
			if (ch == '+') {
				tag.addClass(className.substr(1));
			} else if (ch == '-') {
				tag.removeClass(className.substr(1));
			} else {
				tag.value('class', className);
			}
		});

		// update attributes
		abbrNode.attributeList().forEach(function(attr) {
			if (attr.name.toLowerCase() == 'class') {
				return;
			}

			var ch = attr.name.charAt(0);
			if (ch == '+') {
				var attrName = attr.name.substr(1);
				var tagAttr = tag.get(attrName);
				if (tagAttr) {
					tagAttr.value(tagAttr.value() + r(attr.value));
				} else {
					tag.value(attrName, r(attr.value));
				}
			} else if (ch == '-') {
				tag.remove(attr.name.substr(1));
			} else {
				tag.value(attr.name, r(attr.value));
			}
		});
	}
	
	return {
		/**
		 * Matches HTML tag under caret and updates its definition
		 * according to given abbreviation
		 * @param {IEmmetEditor} Editor instance
		 * @param {String} abbr Abbreviation to update with
		 */
		updateTagAction: function(editor, abbr) {
			abbr = abbr || editor.prompt("Enter abbreviation");

			if (!abbr) {
				return false;
			}

			var content = editor.getContent();
			var ctx = actionUtils.captureContext(editor);
			var tag = this.getUpdatedTag(abbr, ctx, content);

			if (!tag) {
				// nothing to update
				return false;
			}

			// check if tag name was updated
			if (tag.name() != ctx.name && ctx.match.close) {
				editor.replaceContent('</' + tag.name() + '>', ctx.match.close.range.start, ctx.match.close.range.end, true);
			}

			editor.replaceContent(tag.source, ctx.match.open.range.start, ctx.match.open.range.end, true);
			return true;
		},

		/**
		 * Returns XMLEditContainer node with updated tag structure
		 * of existing tag context.
		 * This data can be used to modify existing tag
		 * @param  {String} abbr    Abbreviation
		 * @param  {Object} ctx     Tag to be updated (captured with `htmlMatcher`)
		 * @param  {String} content Original editor content
		 * @return {XMLEditContainer}
		 */
		getUpdatedTag: function(abbr, ctx, content, options) {
			if (!ctx) {
				// nothing to update
				return null;
			}

			var tree = parser.parse(abbr, options || {});

			// for this action some characters in abbreviation has special
			// meaning. For example, `.-c2` means “remove `c2` class from
			// element” and `.+c3` means “append class `c3` to exising one.
			// 
			// But `.+c3` abbreviation will actually produce two elements:
			// <div class=""> and <c3>. Thus, we have to walk on each element
			// of parsed tree and use their definitions to update current element
			var tag = xmlEditTree.parse(ctx.match.open.range.substring(content), {
				offset: ctx.match.outerRange.start
			});

			tree.children.forEach(function(node, i) {
				updateAttributes(tag, node, i);
			});

			// if tag name was resolved by implicit tag name resolver,
			// then user omitted it in abbreviation and wants to keep
			// original tag name
			var el = tree.children[0];
			if (!el.data('nameResolved')) {
				tag.name(el.name());
			}

			return tag;
		}
	};
});