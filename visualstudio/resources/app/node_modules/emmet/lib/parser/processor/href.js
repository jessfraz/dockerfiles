/**
 * A preptocessor for &lt;a&gt; tag: tests wrapped content
 * for common URL patterns and, if matched, inserts it as 
 * `href` attribute
 */
if (typeof module === 'object' && typeof define !== 'function') {
	var define = function (factory) {
		module.exports = factory(require, exports, module);
	};
}

define(function(require, exports, module) {
	var prefs = require('../../assets/preferences');
	var utils = require('../../utils/common');
	var pc = require('./pastedContent');

	prefs.define('href.autodetect', true, 
		'Enables or disables automatic URL recognition when wrapping\
		text with <code>&lt;a&gt;</code> tag. With this option enabled,\
		if wrapped text matches URL or e-mail pattern it will be automatically\
		inserted into <code>href</code> attribute.');
	prefs.define('href.urlPattern', '^(?:(?:https?|ftp|file)://|www\\.|ftp\\.)(?:\\([-A-Z0-9+&@#/%=~_|$?!:,.]*\\)|[-A-Z0-9+&@#/%=~_|$?!:,.])*(?:\\([-A-Z0-9+&@#/%=~_|$?!:,.]*\\)|[A-Z0-9+&@#/%=~_|$])', 
		'RegExp pattern to match wrapped URLs. Matched content will be inserts\
		as-is into <code>href</code> attribute, only whitespace will be trimmed.');

	prefs.define('href.emailPattern', '^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,5}$', 
		'RegExp pattern to match wrapped e-mails. Unlike <code>href.urlPattern</code>,\
		wrapped content will be prefixed with <code>mailto:</code> in <code>href</code>\
		attribute');

	return {
		/**
		 * @param {AbbreviationNode} tree
		 * @param {Object} options
		 */
		postprocessor: function(tree, options) {
			if (!prefs.get('href.autodetect')) {
				return;
			}

			var reUrl = new RegExp(prefs.get('href.urlPattern'), 'i');
			var reEmail = new RegExp(prefs.get('href.emailPattern'), 'i');
			var reProto = /^([a-z]+:)?\/\//i;

			tree.findAll(function(item) {
				if (item.name().toLowerCase() != 'a' || item.attribute('href')) {
					return;
				}

				var pastedContent = utils.trim(pc.pastedContent(item) || options.pastedContent);
				if (pastedContent) {
					if (reUrl.test(pastedContent)) {
						// do we have protocol?
						if (!reProto.test(pastedContent)) {
							pastedContent = 'http://' + pastedContent;
						}

						item.attribute('href', pastedContent);
					} else if (reEmail.test(pastedContent)) {
						item.attribute('href', 'mailto:' + pastedContent);
					}
				}
			});
		}
	};
});