/**
 * Utility methods for Emmet actions
 * @author Sergey Chikuyonok (serge.che@gmail.com) <http://chikuyonok.ru>
 */
if (typeof module === 'object' && typeof define !== 'function') {
	var define = function (factory) {
		module.exports = factory(require, exports, module);
	};
}

define(function(require, exports, module) {
	var utils = require('./common');
	var cssSections = require('./cssSections');
	var abbreviationParser = require('../parser/abbreviation');
	var htmlMatcher = require('../assets/htmlMatcher');
	var xmlEditTree = require('../editTree/xml');
	var range = require('../assets/range');
	var resources = require('../assets/resources');

	return {
		mimeTypes: {
			'gif' : 'image/gif',
			'png' : 'image/png',
			'jpg' : 'image/jpeg',
			'jpeg': 'image/jpeg',
			'svg' : 'image/svg+xml',
			'html': 'text/html',
			'htm' : 'text/html'
		},
		
		/**
		 * Extracts abbreviations from text stream, starting from the end
		 * @param {String} str
		 * @return {String} Abbreviation or empty string
		 * @memberOf emmet.actionUtils
		 */
		extractAbbreviation: function(str) {
			var curOffset = str.length;
			var startIndex = -1;
			var groupCount = 0;
			var braceCount = 0;
			var textCount = 0;
			
			while (true) {
				curOffset--;
				if (curOffset < 0) {
					// moved to the beginning of the line
					startIndex = 0;
					break;
				}
				
				var ch = str.charAt(curOffset);
				
				if (ch == ']') {
					braceCount++;
				} else if (ch == '[') {
					if (!braceCount) { // unexpected brace
						startIndex = curOffset + 1;
						break;
					}
					braceCount--;
				} else if (ch == '}') {
					textCount++;
				} else if (ch == '{') {
					if (!textCount) { // unexpected brace
						startIndex = curOffset + 1;
						break;
					}
					textCount--;
				} else if (ch == ')') {
					groupCount++;
				} else if (ch == '(') {
					if (!groupCount) { // unexpected brace
						startIndex = curOffset + 1;
						break;
					}
					groupCount--;
				} else {
					if (braceCount || textCount) 
						// respect all characters inside attribute sets or text nodes
						continue;
					else if (!abbreviationParser.isAllowedChar(ch) || (ch == '>' && utils.endsWithTag(str.substring(0, curOffset + 1)))) {
						// found stop symbol
						startIndex = curOffset + 1;
						break;
					}
				}
			}
			
			if (startIndex != -1 && !textCount && !braceCount && !groupCount) 
				// found something, remove some invalid symbols from the 
				// beginning and return abbreviation
				return str.substring(startIndex).replace(/^[\*\+\>\^]+/, '');
			else
				return '';
		},
		
		/**
		 * Gets image size from image byte stream.
		 * @author http://romeda.org/rePublish/
		 * @param {String} stream Image byte stream (use <code>IEmmetFile.read()</code>)
		 * @return {Object} Object with <code>width</code> and <code>height</code> properties
		 */
		getImageSize: function(stream) {
			var pngMagicNum = "\211PNG\r\n\032\n",
				jpgMagicNum = "\377\330",
				gifMagicNum = "GIF8",
				pos = 0,
				nextByte = function() {
					return stream.charCodeAt(pos++);
				};
		
			if (stream.substr(0, 8) === pngMagicNum) {
				// PNG. Easy peasy.
				pos = stream.indexOf('IHDR') + 4;
			
				return {
					width:  (nextByte() << 24) | (nextByte() << 16) | (nextByte() <<  8) | nextByte(),
					height: (nextByte() << 24) | (nextByte() << 16) | (nextByte() <<  8) | nextByte()
				};
			
			} else if (stream.substr(0, 4) === gifMagicNum) {
				pos = 6;
			
				return {
					width:  nextByte() | (nextByte() << 8),
					height: nextByte() | (nextByte() << 8)
				};
			
			} else if (stream.substr(0, 2) === jpgMagicNum) {
				pos = 2;
			
				var l = stream.length;
				while (pos < l) {
					if (nextByte() != 0xFF) return;
				
					var marker = nextByte();
					if (marker == 0xDA) break;
				
					var size = (nextByte() << 8) | nextByte();
				
					if (marker >= 0xC0 && marker <= 0xCF && !(marker & 0x4) && !(marker & 0x8)) {
						pos += 1;
						return {
							height: (nextByte() << 8) | nextByte(),
							width: (nextByte() << 8) | nextByte()
						};
				
					} else {
						pos += size - 2;
					}
				}
			}
		},
		
		/**
		 * Captures context XHTML element from editor under current caret position.
		 * This node can be used as a helper for abbreviation extraction
		 * @param {IEmmetEditor} editor
		 * @returns {Object}
		 */
		captureContext: function(editor, pos) {
			var allowedSyntaxes = {'html': 1, 'xml': 1, 'xsl': 1};
			var syntax = editor.getSyntax();
			if (syntax in allowedSyntaxes) {
				var content = editor.getContent();
				if (typeof pos === 'undefined') {
					pos = editor.getCaretPos();
				}

				var tag = htmlMatcher.find(content, pos);
				if (tag && tag.type == 'tag') {
					var startTag = tag.open;
					var contextNode = {
						name: startTag.name,
						attributes: [],
						match: tag
					};
					
					// parse attributes
					var tagTree = xmlEditTree.parse(startTag.range.substring(content));
					if (tagTree) {
						contextNode.attributes = tagTree.getAll().map(function(item) {
							return {
								name: item.name(),
								value: item.value()
							};
						});
					}
					
					return contextNode;
				}
			}
			
			return null;
		},
		
		/**
		 * Find expression bounds in current editor at caret position. 
		 * On each character a <code>fn</code> function will be called and must 
		 * return <code>true</code> if current character meets requirements, 
		 * <code>false</code> otherwise
		 * @param {IEmmetEditor} editor
		 * @param {Function} fn Function to test each character of expression
		 * @return {Range}
		 */
		findExpressionBounds: function(editor, fn) {
			var content = String(editor.getContent());
			var il = content.length;
			var exprStart = editor.getCaretPos() - 1;
			var exprEnd = exprStart + 1;
				
			// start by searching left
			while (exprStart >= 0 && fn(content.charAt(exprStart), exprStart, content)) exprStart--;
			
			// then search right
			while (exprEnd < il && fn(content.charAt(exprEnd), exprEnd, content)) exprEnd++;
			
			if (exprEnd > exprStart) {
				return range([++exprStart, exprEnd]);
			}
		},
		
		/**
		 * @param {IEmmetEditor} editor
		 * @param {Object} data
		 * @returns {Boolean}
		 */
		compoundUpdate: function(editor, data) {
			if (data) {
				var sel = editor.getSelectionRange();
				editor.replaceContent(data.data, data.start, data.end, true);
				editor.createSelection(data.caret, data.caret + sel.end - sel.start);
				return true;
			}
			
			return false;
		},
		
		/**
		 * Common syntax detection method for editors that doesn’t provide any
		 * info about current syntax scope. 
		 * @param {IEmmetEditor} editor Current editor
		 * @param {String} hint Any syntax hint that editor can provide 
		 * for syntax detection. Default is 'html'
		 * @returns {String} 
		 */
		detectSyntax: function(editor, hint) {
			var syntax = hint || 'html';
			
			if (!resources.hasSyntax(syntax)) {
				syntax = 'html';
			}
			
			if (syntax == 'html' && (this.isStyle(editor) || this.isInlineCSS(editor))) {
				syntax = 'css';
			}

			if (syntax == 'styl') {
				syntax = 'stylus';
			}
			
			return syntax;
		},
		
		/**
		 * Common method for detecting output profile
		 * @param {IEmmetEditor} editor
		 * @returns {String}
		 */
		detectProfile: function(editor) {
			var syntax = editor.getSyntax();
			
			// get profile from syntax definition
			var profile = resources.findItem(syntax, 'profile');
			if (profile) {
				return profile;
			}
			
			switch(syntax) {
				case 'xml':
				case 'xsl':
					return 'xml';
				case 'css':
					if (this.isInlineCSS(editor)) {
						return 'line';
					}
					break;
				case 'html':
					profile = resources.getVariable('profile');
					if (!profile) { // no forced profile, guess from content
						// html or xhtml?
						profile = this.isXHTML(editor) ? 'xhtml': 'html';
					}

					return profile;
			}

			return 'xhtml';
		},
		
		/**
		 * Tries to detect if current document is XHTML one.
		 * @param {IEmmetEditor} editor
		 * @returns {Boolean}
		 */
		isXHTML: function(editor) {
			return editor.getContent().search(/<!DOCTYPE[^>]+XHTML/i) != -1;
		},

		/**
		 * Check if current caret position is inside &lt;style&gt; tag
		 * @param {IEmmetEditor} editor
		 * @returns {Range} Inner range of &lt;style&gt; tag
		 */
		isStyle: function(editor) {
			return !!cssSections.styleTagRange(editor.getContent(), editor.getCaretPos());
		},

		/**
		 * Check if given CSS dialect is supported by CSS actions
		 * @param  {String}  syntax
		 * @return {Boolean}
		 */
		isSupportedCSS: function(syntax) {
			return syntax == 'css' || syntax == 'less' || syntax == 'scss';
		},
		
		/**
		 * Check if current caret position is inside "style" attribute of HTML
		 * element
		 * @param {IEmmetEditor} editor
		 * @returns {Range} Inner range of style attribute
		 */
		isInlineCSS: function(editor) {
			return !!cssSections.styleAttrRange(editor.getContent(), editor.getCaretPos());
		}
	};
});