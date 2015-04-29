/**
 * Automatically updates image size attributes in HTML's &lt;img&gt; element or
 * CSS rule
 */
if (typeof module === 'object' && typeof define !== 'function') {
	var define = function (factory) {
		module.exports = factory(require, exports, module);
	};
}

define(function(require, exports, module) {
	var utils = require('../utils/common');
	var editorUtils = require('../utils/editor');
	var actionUtils = require('../utils/action');
	var xmlEditTree = require('../editTree/xml');
	var cssEditTree = require('../editTree/css');
	var base64 = require('../utils/base64');
	var file = require('../plugin/file');

	/**
	 * Updates image size of &lt;img src=""&gt; tag
	 * @param {IEmmetEditor} editor
	 */
	function updateImageSizeHTML(editor) {
		var offset = editor.getCaretPos();
		
		// find tag from current caret position
		var info = editorUtils.outputInfo(editor);
		var xmlElem = xmlEditTree.parseFromPosition(info.content, offset, true);
		if (xmlElem && (xmlElem.name() || '').toLowerCase() == 'img') {
			getImageSizeForSource(editor, xmlElem.value('src'), function(size) {
				if (size) {
					var compoundData = xmlElem.range(true);
					xmlElem.value('width', size.width);
					xmlElem.value('height', size.height, xmlElem.indexOf('width') + 1);
					
					actionUtils.compoundUpdate(editor, utils.extend(compoundData, {
						data: xmlElem.toString(),
						caret: offset
					}));
				}
			});
		}
	}
	
	/**
	 * Updates image size of CSS property
	 * @param {IEmmetEditor} editor
	 */
	function updateImageSizeCSS(editor) {
		var offset = editor.getCaretPos();
		
		// find tag from current caret position
		var info = editorUtils.outputInfo(editor);
		var cssRule = cssEditTree.parseFromPosition(info.content, offset, true);
		if (cssRule) {
			// check if there is property with image under caret
			var prop = cssRule.itemFromPosition(offset, true), m;
			if (prop && (m = /url\((["']?)(.+?)\1\)/i.exec(prop.value() || ''))) {
				getImageSizeForSource(editor, m[2], function(size) {
					if (size) {
						var compoundData = cssRule.range(true);
						cssRule.value('width', size.width + 'px');
						cssRule.value('height', size.height + 'px', cssRule.indexOf('width') + 1);
						
						actionUtils.compoundUpdate(editor, utils.extend(compoundData, {
							data: cssRule.toString(),
							caret: offset
						}));
					}
				});
			}
		}
	}
	
	/**
	 * Returns image dimensions for source
	 * @param {IEmmetEditor} editor
	 * @param {String} src Image source (path or data:url)
	 */
	function getImageSizeForSource(editor, src, callback) {
		var fileContent;
		if (src) {
			// check if it is data:url
			if (/^data:/.test(src)) {
				fileContent = base64.decode( src.replace(/^data\:.+?;.+?,/, '') );
				return callback(actionUtils.getImageSize(fileContent));
			}
			
			var absPath = file.locateFile(editor.getFilePath(), src);
			if (absPath === null) {
				throw "Can't find " + src + ' file';
			}
			
			file.read(absPath, function(err, content) {
				if (err) {
					throw 'Unable to read ' + absPath + ': ' + err;
				}
				
				content = String(content);
				callback(actionUtils.getImageSize(content));
			});
		}
	}
	
	return {
		updateImageSizeAction: function(editor) {
			// this action will definitely won’t work in SASS dialect,
			// but may work in SCSS or LESS
			if (actionUtils.isSupportedCSS(editor.getSyntax())) {
				updateImageSizeCSS(editor);
			} else {
				updateImageSizeHTML(editor);
			}
			
			return true;
		}
	};
});