/**
 * A very simple, ERB-style templating. Basically, just as string substitution.
 * The reason to not use default Lo-dash’es `_.template()` implementation
 * is because it fails to run in CSP-enabled environments (Chrome extension, Atom)
 */
if (typeof module === 'object' && typeof define !== 'function') {
	var define = function (factory) {
		module.exports = factory(require, exports, module);
	};
}

define(function(require, exports, module) {
	var stringStream = require('../assets/stringStream');
	var utils = require('./common');

	function parseArgs(str) {
		var args = [];
		var stream = stringStream(str);

		while (!stream.eol()) {
			if (stream.peek() == ',') {
				args.push(utils.trim(stream.current()));
				stream.next();
				stream.start = stream.pos;
			}
			stream.next();
		}

		args.push(utils.trim(stream.current()));
		return args.filter(function(a) {
			return !!a;
		});
	}

	function parseFunctionCall(str) {
		var fnName = null, args;
		var stream = stringStream(str);
		while (!stream.eol()) {
			if (stream.peek() == '(') {
				fnName = stream.current();
				stream.start = stream.pos;
				stream.skipToPair('(', ')', true);
				args = stream.current();
				args = parseArgs(args.substring(1, args.length - 1));
				break;
			}

			stream.next();
		}

		return fnName && {
			name: fnName,
			args: args
		};
	}

	function evalArg(arg, context) {
		if (/^['"]/.test(arg)) {
			// plain string
			return arg.replace(/^(['"])(.+?)\1$/, '$2');
		}

		if (!isNaN(+arg)) {
			// a number
			return +arg;
		}

		// otherwise, treat argument as a property name
		if (arg) {
			var parts = arg.split('.');
			var prop = context;
			while (parts.length) {
				prop = prop[parts.shift()];
			}

			return prop;
		}
	}

	function process(template, context) {
		return template.replace(/<%[=\-](.+?)%>/g, function(str, match) {
			match = utils.trim(match);
			var fn = parseFunctionCall(match);
			if (fn) {
				var fnArgs = fn.args.map(function(arg) {
					return evalArg(arg, context);
				});
				return context[fn.name].apply(context, fnArgs);
			}

			return evalArg(match, context);
		});
	}

	return function(template, context) {
		return context ? process(template, context) : function(context) {
			return process(template, context);
		};
	};
});