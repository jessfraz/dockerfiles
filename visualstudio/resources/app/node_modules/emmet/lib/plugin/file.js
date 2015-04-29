/**
 * Module for working with file. Shall implement
 * IEmmetFile interface.
 *
 * Since implementation of this module depends
 * greatly on current runtime, this module must be
 * initialized with actual implementation first
 * before use. E.g. 
 * require('./plugin/file')({
 * 	read: function() {...}
 * })
 *
 * By default, this module provides Node.JS implementation
 */

if (typeof module === 'object' && typeof define !== 'function') {
	var define = function (factory) {
		module.exports = factory(require, exports, module);
	};
}

define(function(require, exports, module) {
	var utils = require('../utils/common');

	// hide it from Require.JS parser
	(function(r) {
		if (typeof define === 'undefined' || !define.amd) {
			try {
				fs = r('fs');
				path = r('path');
			} catch(e) {}
		}
	})(require);

	// module is a function that can extend itself
	module.exports = function(obj) {
		if (obj) {
			utils.extend(module.exports, obj);
		}
	};

	function bts(bytes) {
		var out = [];
		for (var i = 0, il = bytes.length; i < il; i++) {
			out.push(String.fromCharCode(bytes[i]));
		}
		return out.join('');
	}

	function isURL(path) {
		var re = /^https?:\/\//;
		return re.test(path);
	}

	return utils.extend(module.exports, {
		_parseParams: function(args) {
			var params = {
				path: args[0],
				size: 0
			};

			args = utils.toArray(args, 1);
			params.callback = args[args.length - 1];
			args = args.slice(0, args.length - 1);
			if (args.length) {
				params.size = args[0];
			}

			return params;
		},

		_read: function(params, callback) {
			if (isURL(params.path)) {
				var req = require(/^https:/.test(params.path) ? 'https' : 'http').get(params.path, function(res) {
					var bufs = [];
					var totalLength = 0;
					var finished = false;
					res
						.on('data', function(chunk) {
							totalLength += chunk.length;
							bufs.push(chunk);
							if (params.size && totalLength >= params.size) {
								finished = true;
								callback(null, Buffer.concat(bufs));
								req.abort();
							}
						})
						.on('end', function() {
							if (!finished) {
								finished = true;
								callback(null, Buffer.concat(bufs));
							}
						});
				}).on('error', callback);
			} else {
				if (params.size) {
					var fd = fs.openSync(params.path, 'r');
					var buf = new Buffer(params.size);
					fs.read(fd, buf, 0, params.size, null, function(err, bytesRead) {
						callback(err, buf)
					});
				} else {
					callback(null, fs.readFileSync(params.path));
				}
			}
		},

		/**
		 * Reads binary file content and return it
		 * @param {String} path File's relative or absolute path
		 * @return {String}
		 */
		read: function(path, size, callback) {
			var params = this._parseParams(arguments);
			this._read(params, function(err, buf) {
				params.callback(err, err ? '' : bts(buf));
			});
		},

		/**
		 * Read file content and return it
		 * @param {String} path File's relative or absolute path
		 * @return {String}
		 */
		readText: function(path, size, callback) {
			var params = this._parseParams(arguments);
			this._read(params, function(err, buf) {
				params.callback(err, err ? '' : buf.toString());
			});
		},
		
		/**
		 * Locate <code>file_name</code> file that relates to <code>editor_file</code>.
		 * File name may be absolute or relative path
		 * 
		 * <b>Dealing with absolute path.</b>
		 * Many modern editors have a "project" support as information unit, but you
		 * should not rely on project path to find file with absolute path. First,
		 * it requires user to create a project before using this method (and this 
		 * is not very convenient). Second, project path doesn't always points to
		 * to website's document root folder: it may point, for example, to an 
		 * upper folder which contains server-side scripts.
		 * 
		 * For better result, you should use the following algorithm in locating
		 * absolute resources:
		 * 1) Get parent folder for <code>editorFile</code> as a start point
		 * 2) Append required <code>fileName</code> to start point and test if
		 * file exists
		 * 3) If it doesn't exists, move start point one level up (to parent folder)
		 * and repeat step 2.
		 * 
		 * @param {String} editorFile
		 * @param {String} fileName
		 * @return {String} Returns null if <code>fileName</code> cannot be located
		 */
		locateFile: function(editorFile, fileName) {
			if (isURL(fileName)) {
				return fileName;
			}

			var dirname = editorFile, f;
			fileName = fileName.replace(/^\/+/, '');
			while (dirname && dirname !== path.dirname(dirname)) {
				dirname = path.dirname(dirname);
				f = path.join(dirname, fileName);
				if (fs.existsSync(f))
					return f;
			}
			
			return '';
		},
		
		/**
		 * Creates absolute path by concatenating <code>parent</code> and <code>fileName</code>.
		 * If <code>parent</code> points to file, its parent directory is used
		 * @param {String} parent
		 * @param {String} fileName
		 * @return {String}
		 */
		createPath: function(parent, fileName, callback) {
			var stat = fs.statSync(parent);
			if (stat && !stat.isDirectory()) {
				parent = path.dirname(parent);
			}
			
			return callback(path.resolve(parent, fileName));
		},
		
		/**
		 * Saves <code>content</code> as <code>file</code>
		 * @param {String} file File's absolute path
		 * @param {String} content File content
		 */
		save: function(file, content) {
			fs.writeFileSync(file, content, 'ascii');
		},
		
		/**
		 * Returns file extension in lower case
		 * @param {String} file
		 * @return {String}
		 */
		getExt: function(file) {
			var m = (file || '').match(/\.([\w\-]+)$/);
			return m ? m[1].toLowerCase() : '';
		}
	
	});
});