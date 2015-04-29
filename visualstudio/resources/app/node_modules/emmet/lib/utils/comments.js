/**
 * Utility module for working with comments in source code
 * (mostly stripping it from source)
 */
if (typeof module === 'object' && typeof define !== 'function') {
	var define = function (factory) {
		module.exports = factory(require, exports, module);
	};
}

define(function(require, exports, module) {
	var utils = require('./common');
	var range = require('../assets/range');
	var stringStream = require('../assets/stringStream');
	var reHasComment = /\/\*|\/\//;

	return {
		/**
		 * Replaces all comments in given CSS source with spaces,
		 * which allows more reliable (and faster) token search
		 * in CSS content
		 * @param  {String} content CSS content
		 * @return {String}
		 */
		strip: function(content) {
			if (!reHasComment.test(content)) {
				return content;
			}

			var stream = stringStream(content);
			var replaceRanges = [];
			var ch, ch2;

			while ((ch = stream.next())) {
				if (ch === '/') {
					ch2 = stream.peek();
					if (ch2 === '*') { // multiline CSS comment
						stream.start = stream.pos - 1;

						if (stream.skipTo('*/')) {
							stream.pos += 2;
						} else {
							// unclosed comment
							stream.skipToEnd();
						}

						replaceRanges.push([stream.start, stream.pos]);
					} else if (ch2 === '/') {
						// preprocessor’s single line comments
						stream.start = stream.pos - 1;
						while ((ch2 = stream.next())) {
							if (ch2 === '\n' || ch2 == '\r') {
								break
							}
						}

						replaceRanges.push([stream.start, stream.pos]);
					}
				} else {
					stream.skipQuoted();
				}
			}

			return utils.replaceWith(content, replaceRanges, ' ');
		}
	};
});