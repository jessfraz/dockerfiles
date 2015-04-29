if (typeof module === 'object' && typeof define !== 'function') {
	var define = function (factory) {
		module.exports = factory(require, exports, module);
	};
}

define(function(require, exports, module) {
	var session = {tokens: null};
	
	// walks around the source
	var walker = {
		init: function (source) {
			// this.source = source.replace(/\r\n?/g, '\n');
			this.source = source;
			this.ch = '';
			this.chnum = -1;
		
			// advance
			this.nextChar();
		},
		nextChar: function () {
			return this.ch = this.source.charAt(++this.chnum);
		},
		peek: function() {
			return this.source.charAt(this.chnum + 1);
		}
	};

	// utility helpers
	function isNameChar(c, cc) {
		cc = cc || c.charCodeAt(0);
		return (
			(cc >= 97 && cc <= 122 /* a-z */) || 
			(cc >= 65 && cc <= 90 /* A-Z */) || 
			/* 
			Experimental: include cyrillic ranges 
			since some letters, similar to latin ones, can 
			accidentally appear in CSS tokens
			*/
			(cc >= 1024 && cc <= 1279) || 
			c === '&' || /* selector placeholder (LESS, SCSS) */
			c === '_' || 
			c === '<' || /* comparisons (LESS, SCSS) */
			c === '>' || 
			c === '=' || 
			c === '-'
		);
	}

	function isDigit(c, cc) {
		cc = cc || c.charCodeAt(0);
		return (cc >= 48 && cc <= 57);
	}

	var isOp = (function () {
		var opsa = "{}[]()+*=.,;:>~|\\%$#@^!".split(''),
			opsmatcha = "*^|$~".split(''),
			ops = {},
			opsmatch = {},
			i = 0;
		for (; i < opsa.length; i += 1) {
			ops[opsa[i]] = true;
		}
		for (i = 0; i < opsmatcha.length; i += 1) {
			opsmatch[opsmatcha[i]] = true;
		}
		return function (ch, matchattr) {
			if (matchattr) {
				return ch in opsmatch;
			}
			return ch in ops;
		};
	}());
	
	// creates token objects and pushes them to a list
	function tokener(value, type) {
		session.tokens.push({
			value: value,
			type:  type || value,
			start: null,
			end:   null
		});
	}

	function getPosInfo(w) {
		var errPos = w.chnum;
		var source = w.source.replace(/\r\n?/g, '\n');
		var part = w.source.substring(0, errPos + 1).replace(/\r\n?/g, '\n');
		var lines = part.split('\n');
		var ch = (lines[lines.length - 1] || '').length;
		var fullLine = source.split('\n')[lines.length - 1] || '';
		
		var chunkSize = 100;
		var offset = Math.max(0, ch - chunkSize);
		var formattedLine = fullLine.substr(offset, chunkSize * 2) + '\n';
		for (var i = 0; i < ch - offset - 1; i++) {
			formattedLine += '-';
		}
		formattedLine += '^';

		return {
			line: lines.length,
			ch: ch,
			text: fullLine,
			hint: formattedLine
		};
	}

	function raiseError(message) {
		var err = error(message);
		var errObj = new Error(err.message, '', err.line);
		errObj.line = err.line;
		errObj.ch = err.ch;
		errObj.name = err.name;
		errObj.hint = err.hint;

		throw errObj;
	}
	
	// oops
	function error(m) { 
		var w = walker;
		var info = getPosInfo(walker);
		var tokens = session.tokens;
		session.tokens = null;

		var message = 'CSS parsing error at line ' + info.line + ', char ' + info.ch + ': ' + m;
		message += '\n' +  info.hint;
		return {
			name: "ParseError",
			message: message,
			hint: info.hint,
			line: info.line,
			ch: info.ch
		};
	}


	// token handlers follow for:
	// white space, comment, string, identifier, number, operator
	function white() {
		var c = walker.ch,
			token = '';
	
		while (c === " " || c === "\t") {
			token += c;
			c = walker.nextChar();
		}
	
		tokener(token, 'white');
	
	}

	function comment() {
		var w = walker,
			c = w.ch,
			token = c,
			cnext;
	 
		cnext = w.nextChar();

		if (cnext === '/') {
			// inline comment in SCSS and LESS
			while (c && !(cnext === "\n" || cnext === "\r")) {
				token += cnext;
				c = cnext;
				cnext = w.nextChar();
			}
		} else if (cnext === '*') {
			// multiline CSS commment
			while (c && !(c === "*" && cnext === "/")) {
				token += cnext;
				c = cnext;
				cnext = w.nextChar();
			}
		} else {
			// oops, not a comment, just a /
			return tokener(token, token);
		}
		
		token += cnext;
		w.nextChar();
		tokener(token, 'comment');
	}

	function eatString() {
		var w = walker,
			c = w.ch,
			q = c,
			token = c,
			cnext;
	
		c = w.nextChar();

		while (c !== q) {
			if (c === '\n') {
				cnext = w.nextChar();
				if (cnext === "\\") {
					token += c + cnext;
				} else {
					// end of line with no \ escape = bad
					raiseError("Unterminated string");
				}
			} else {
				if (c === "\\") {
					token += c + w.nextChar();
				} else {
					token += c;
				}
			}
		
			c = w.nextChar();
		}

		token += c;

		return token;
	}

	function str() {
		var token = eatString();
		walker.nextChar();
		tokener(token, 'string');
	}
	
	function brace() {
		var w = walker,
			c = w.ch,
			depth = 1,
			token = c,
			stop = false;
	
		c = w.nextChar();
	
		while (c && !stop) {
			if (c === '(') {
				depth++;
			} else if (c === ')') {
				depth--;
				if (!depth) {
					stop = true;
				}
			} else if (c === '"' || c === "'") {
				c = eatString();
			} else if (c === '') {
				raiseError("Unterminated brace");
			}
			
			token += c;
			c = w.nextChar();
		}
		
		tokener(token, 'brace');
	}

	function identifier(pre) {
		var c = walker.ch;
		var token = pre ? pre + c : c;
			
		c = walker.nextChar();
		var cc = c.charCodeAt(0);
		while (isNameChar(c, cc) || isDigit(c, cc)) {
			token += c;
			c = walker.nextChar();
			cc = c.charCodeAt(0);
		}
	
		tokener(token, 'identifier');
	}

	function num() {
		var w = walker,
			c = w.ch,
			token = c,
			point = token === '.',
			nondigit;
		
		c = w.nextChar();
		nondigit = !isDigit(c);
	
		// .2px or .classname?
		if (point && nondigit) {
			// meh, NaN, could be a class name, so it's an operator for now
			return tokener(token, '.');    
		}
		
		// -2px or -moz-something
		if (token === '-' && nondigit) {
			return identifier('-');
		}
	
		while (c !== '' && (isDigit(c) || (!point && c === '.'))) { // not end of source && digit or first instance of .
			if (c === '.') {
				point = true;
			}
			token += c;
			c = w.nextChar();
		}

		tokener(token, 'number');    
	
	}

	function op() {
		var w = walker,
			c = w.ch,
			token = c,
			next = w.nextChar();
			
		if (next === "=" && isOp(token, true)) {
			token += next;
			tokener(token, 'match');
			w.nextChar();
			return;
		} 
		
		tokener(token, token);
	}


	// call the appropriate handler based on the first character in a token suspect
	function tokenize() {
		var ch = walker.ch;
	
		if (ch === " " || ch === "\t") {
			return white();
		}

		if (ch === '/') {
			return comment();
		} 

		if (ch === '"' || ch === "'") {
			return str();
		}
		
		if (ch === '(') {
			return brace();
		}
	
		if (ch === '-' || ch === '.' || isDigit(ch)) { // tricky - char: minus (-1px) or dash (-moz-stuff)
			return num();
		}
	
		if (isNameChar(ch)) {
			return identifier();
		}

		if (isOp(ch)) {
			return op();
		}

		if (ch === '\r') {
			if (walker.peek() === '\n') {
				ch += walker.nextChar();
			}

			tokener(ch, 'line');
			walker.nextChar();
			return;
		}
		
		if (ch === '\n') {
			tokener(ch, 'line');
			walker.nextChar();
			return;
		}
		
		raiseError("Unrecognized character '" + ch + "'");
	}

	return {
		/**
		 * Sprits given source into tokens
		 * @param {String} source
		 * @returns {Array}
		 */
		lex: function (source) {
			walker.init(source);
			session.tokens = [];

			// for empty source, return single space token
			if (!source) {
				session.tokens.push(this.white());
			} else {
				while (walker.ch !== '') {
					tokenize();
				}
			}

			var tokens = session.tokens;
			session.tokens = null;
			return tokens;
		},
		
		/**
		 * Tokenizes CSS source. It's like `lex()` method,
		 * but also stores proper token indexes in source, 
		 * so it's a bit slower
		 * @param {String} source
		 * @returns {Array}
		 */
		parse: function(source) {
			// transform tokens
			var tokens = this.lex(source), pos = 0, token;
			for (var i = 0, il = tokens.length; i < il; i++) {
				token = tokens[i];
				token.start = pos;
				token.end = (pos += token.value.length);
			}
			return tokens;
		},

		white: function() {
			return {
				value: '',
				type:  'white',
				start: 0,
				end:   0
			};
		},
		
		toSource: function(toks) {
			var i = 0, max = toks.length, src = '';
			for (; i < max; i++) {
				src += toks[i].value;
			}
			return src;
		}
	};
});