/**
 * @author Sergey Chikuyonok (serge.che@gmail.com)
 * @link http://chikuyonok.ru
 */
if (typeof module === 'object' && typeof define !== 'function') {
	var define = function (factory) {
		module.exports = factory(require, exports, module);
	};
}

define(function(require, exports, module) {
	var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
	
	return {
		/**
		 * Encodes data using base64 algorithm
		 * @author Tyler Akins (http://rumkin.com)
		 * @param {String} input
		 * @returns {String}
		 */
		encode : function(input) {
			var output = [];
			var chr1, chr2, chr3, enc1, enc2, enc3, enc4, cdp1, cdp2, cdp3;
			var i = 0, il = input.length, b64 = chars;

			while (i < il) {

				cdp1 = input.charCodeAt(i++);
				cdp2 = input.charCodeAt(i++);
				cdp3 = input.charCodeAt(i++);

				chr1 = cdp1 & 0xff;
				chr2 = cdp2 & 0xff;
				chr3 = cdp3 & 0xff;

				enc1 = chr1 >> 2;
				enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
				enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
				enc4 = chr3 & 63;

				if (isNaN(cdp2)) {
					enc3 = enc4 = 64;
				} else if (isNaN(cdp3)) {
					enc4 = 64;
				}

				output.push(b64.charAt(enc1) + b64.charAt(enc2) + b64.charAt(enc3) + b64.charAt(enc4));
			}

			return output.join('');
		},

		/**
		 * Decodes string using MIME base64 algorithm
		 * 
		 * @author Tyler Akins (http://rumkin.com)
		 * @param {String} data
		 * @return {String}
		 */
		decode : function(data) {
			var o1, o2, o3, h1, h2, h3, h4, bits, i = 0, ac = 0, tmpArr = [];
			var b64 = chars, il = data.length;

			if (!data) {
				return data;
			}

			data += '';

			do { // unpack four hexets into three octets using index points in b64
				h1 = b64.indexOf(data.charAt(i++));
				h2 = b64.indexOf(data.charAt(i++));
				h3 = b64.indexOf(data.charAt(i++));
				h4 = b64.indexOf(data.charAt(i++));

				bits = h1 << 18 | h2 << 12 | h3 << 6 | h4;

				o1 = bits >> 16 & 0xff;
				o2 = bits >> 8 & 0xff;
				o3 = bits & 0xff;

				if (h3 == 64) {
					tmpArr[ac++] = String.fromCharCode(o1);
				} else if (h4 == 64) {
					tmpArr[ac++] = String.fromCharCode(o1, o2);
				} else {
					tmpArr[ac++] = String.fromCharCode(o1, o2, o3);
				}
			} while (i < il);

			return tmpArr.join('');
		}
	};
});