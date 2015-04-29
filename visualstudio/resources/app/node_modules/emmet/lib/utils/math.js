if (typeof module === 'object' && typeof define !== 'function') {
	var define = function (factory) {
		module.exports = factory(require, exports, module);
	};
}

define(function(require, exports, module) {
	/*
	 Source: https://github.com/silentmatt/js-expression-eval

	 Based on ndef.parser, by Raphael Graf(r@undefined.ch)
	 http://www.undefined.ch/mparser/index.html

	 Ported to JavaScript and modified by Matthew Crumley (email@matthewcrumley.com, http://silentmatt.com/)

	 You are free to use and modify this code in anyway you find useful. Please leave this comment in the code
	 to acknowledge its original source. If you feel like it, I enjoy hearing about projects that use my code,
	 but don't feel like you have to let me know or ask permission.
	*/

	function object(o) {
		function F() {}
		F.prototype = o;
		return new F();
	}

	var TNUMBER = 0;
	var TOP1 = 1;
	var TOP2 = 2;
	var TVAR = 3;
	var TFUNCALL = 4;

	function Token(type_, index_, prio_, number_) {
		this.type_ = type_;
		this.index_ = index_ || 0;
		this.prio_ = prio_ || 0;
		this.number_ = (number_ !== undefined && number_ !== null) ? number_ : 0;
		this.toString = function () {
			switch (this.type_) {
			case TNUMBER:
				return this.number_;
			case TOP1:
			case TOP2:
			case TVAR:
				return this.index_;
			case TFUNCALL:
				return "CALL";
			default:
				return "Invalid Token";
			}
		};
	}

	function Expression(tokens, ops1, ops2, functions) {
		this.tokens = tokens;
		this.ops1 = ops1;
		this.ops2 = ops2;
		this.functions = functions;
	}

	// Based on http://www.json.org/json2.js
    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\'\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            "'" : "\\'",
            '\\': '\\\\'
        };

	function escapeValue(v) {
		if (typeof v === "string") {
			escapable.lastIndex = 0;
	        return escapable.test(v) ?
	            "'" + v.replace(escapable, function (a) {
	                var c = meta[a];
	                return typeof c === 'string' ? c :
	                    '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
	            }) + "'" :
	            "'" + v + "'";
		}
		return v;
	}

	Expression.prototype = {
		simplify: function (values) {
			values = values || {};
			var nstack = [];
			var newexpression = [];
			var n1;
			var n2;
			var f;
			var L = this.tokens.length;
			var item;
			var i = 0;
			for (i = 0; i < L; i++) {
				item = this.tokens[i];
				var type_ = item.type_;
				if (type_ === TNUMBER) {
					nstack.push(item);
				}
				else if (type_ === TVAR && (item.index_ in values)) {
					item = new Token(TNUMBER, 0, 0, values[item.index_]);
					nstack.push(item);
				}
				else if (type_ === TOP2 && nstack.length > 1) {
					n2 = nstack.pop();
					n1 = nstack.pop();
					f = this.ops2[item.index_];
					item = new Token(TNUMBER, 0, 0, f(n1.number_, n2.number_));
					nstack.push(item);
				}
				else if (type_ === TOP1 && nstack.length > 0) {
					n1 = nstack.pop();
					f = this.ops1[item.index_];
					item = new Token(TNUMBER, 0, 0, f(n1.number_));
					nstack.push(item);
				}
				else {
					while (nstack.length > 0) {
						newexpression.push(nstack.shift());
					}
					newexpression.push(item);
				}
			}
			while (nstack.length > 0) {
				newexpression.push(nstack.shift());
			}

			return new Expression(newexpression, object(this.ops1), object(this.ops2), object(this.functions));
		},

		substitute: function (variable, expr) {
			if (!(expr instanceof Expression)) {
				expr = new Parser().parse(String(expr));
			}
			var newexpression = [];
			var L = this.tokens.length;
			var item;
			var i = 0;
			for (i = 0; i < L; i++) {
				item = this.tokens[i];
				var type_ = item.type_;
				if (type_ === TVAR && item.index_ === variable) {
					for (var j = 0; j < expr.tokens.length; j++) {
						var expritem = expr.tokens[j];
						var replitem = new Token(expritem.type_, expritem.index_, expritem.prio_, expritem.number_);
						newexpression.push(replitem);
					}
				}
				else {
					newexpression.push(item);
				}
			}

			var ret = new Expression(newexpression, object(this.ops1), object(this.ops2), object(this.functions));
			return ret;
		},

		evaluate: function (values) {
			values = values || {};
			var nstack = [];
			var n1;
			var n2;
			var f;
			var L = this.tokens.length;
			var item;
			var i = 0;
			for (i = 0; i < L; i++) {
				item = this.tokens[i];
				var type_ = item.type_;
				if (type_ === TNUMBER) {
					nstack.push(item.number_);
				}
				else if (type_ === TOP2) {
					n2 = nstack.pop();
					n1 = nstack.pop();
					f = this.ops2[item.index_];
					nstack.push(f(n1, n2));
				}
				else if (type_ === TVAR) {
					if (item.index_ in values) {
						nstack.push(values[item.index_]);
					}
					else if (item.index_ in this.functions) {
						nstack.push(this.functions[item.index_]);
					}
					else {
						throw new Error("undefined variable: " + item.index_);
					}
				}
				else if (type_ === TOP1) {
					n1 = nstack.pop();
					f = this.ops1[item.index_];
					nstack.push(f(n1));
				}
				else if (type_ === TFUNCALL) {
					n1 = nstack.pop();
					f = nstack.pop();
					if (f.apply && f.call) {
						if (Object.prototype.toString.call(n1) == "[object Array]") {
							nstack.push(f.apply(undefined, n1));
						}
						else {
							nstack.push(f.call(undefined, n1));
						}
					}
					else {
						throw new Error(f + " is not a function");
					}
				}
				else {
					throw new Error("invalid Expression");
				}
			}
			if (nstack.length > 1) {
				throw new Error("invalid Expression (parity)");
			}
			return nstack[0];
		},

		toString: function (toJS) {
			var nstack = [];
			var n1;
			var n2;
			var f;
			var L = this.tokens.length;
			var item;
			var i = 0;
			for (i = 0; i < L; i++) {
				item = this.tokens[i];
				var type_ = item.type_;
				if (type_ === TNUMBER) {
					nstack.push(escapeValue(item.number_));
				}
				else if (type_ === TOP2) {
					n2 = nstack.pop();
					n1 = nstack.pop();
					f = item.index_;
					if (toJS && f == "^") {
						nstack.push("Math.pow(" + n1 + "," + n2 + ")");
					}
					else {
						nstack.push("(" + n1 + f + n2 + ")");
					}
				}
				else if (type_ === TVAR) {
					nstack.push(item.index_);
				}
				else if (type_ === TOP1) {
					n1 = nstack.pop();
					f = item.index_;
					if (f === "-") {
						nstack.push("(" + f + n1 + ")");
					}
					else {
						nstack.push(f + "(" + n1 + ")");
					}
				}
				else if (type_ === TFUNCALL) {
					n1 = nstack.pop();
					f = nstack.pop();
					nstack.push(f + "(" + n1 + ")");
				}
				else {
					throw new Error("invalid Expression");
				}
			}
			if (nstack.length > 1) {
				throw new Error("invalid Expression (parity)");
			}
			return nstack[0];
		},

		variables: function () {
			var L = this.tokens.length;
			var vars = [];
			for (var i = 0; i < L; i++) {
				var item = this.tokens[i];
				if (item.type_ === TVAR && (vars.indexOf(item.index_) == -1)) {
					vars.push(item.index_);
				}
			}

			return vars;
		},

		toJSFunction: function (param, variables) {
			var f = new Function(param, "with(Parser.values) { return " + this.simplify(variables).toString(true) + "; }");
			return f;
		}
	};

	function add(a, b) {
		return Number(a) + Number(b);
	}
	function sub(a, b) {
		return a - b; 
	}
	function mul(a, b) {
		return a * b;
	}
	function div(a, b) {
		return a / b;
	}
	function mod(a, b) {
		return a % b;
	}
	function concat(a, b) {
		return "" + a + b;
	}

	function neg(a) {
		return -a;
	}

	function random(a) {
		return Math.random() * (a || 1);
	}
	function fac(a) { //a!
		a = Math.floor(a);
		var b = a;
		while (a > 1) {
			b = b * (--a);
		}
		return b;
	}

	// TODO: use hypot that doesn't overflow
	function pyt(a, b) {
		return Math.sqrt(a * a + b * b);
	}

	function append(a, b) {
		if (Object.prototype.toString.call(a) != "[object Array]") {
			return [a, b];
		}
		a = a.slice();
		a.push(b);
		return a;
	}

	function Parser() {
		this.success = false;
		this.errormsg = "";
		this.expression = "";

		this.pos = 0;

		this.tokennumber = 0;
		this.tokenprio = 0;
		this.tokenindex = 0;
		this.tmpprio = 0;

		this.ops1 = {
			"sin": Math.sin,
			"cos": Math.cos,
			"tan": Math.tan,
			"asin": Math.asin,
			"acos": Math.acos,
			"atan": Math.atan,
			"sqrt": Math.sqrt,
			"log": Math.log,
			"abs": Math.abs,
			"ceil": Math.ceil,
			"floor": Math.floor,
			"round": Math.round,
			"-": neg,
			"exp": Math.exp
		};

		this.ops2 = {
			"+": add,
			"-": sub,
			"*": mul,
			"/": div,
			"%": mod,
			"^": Math.pow,
			",": append,
			"||": concat
		};

		this.functions = {
			"random": random,
			"fac": fac,
			"min": Math.min,
			"max": Math.max,
			"pyt": pyt,
			"pow": Math.pow,
			"atan2": Math.atan2
		};

		this.consts = {
			"E": Math.E,
			"PI": Math.PI
		};
	}

	Parser.parse = function (expr) {
		return new Parser().parse(expr);
	};

	Parser.evaluate = function (expr, variables) {
		return Parser.parse(expr).evaluate(variables);
	};

	Parser.Expression = Expression;

	Parser.values = {
		sin: Math.sin,
		cos: Math.cos,
		tan: Math.tan,
		asin: Math.asin,
		acos: Math.acos,
		atan: Math.atan,
		sqrt: Math.sqrt,
		log: Math.log,
		abs: Math.abs,
		ceil: Math.ceil,
		floor: Math.floor,
		round: Math.round,
		random: random,
		fac: fac,
		exp: Math.exp,
		min: Math.min,
		max: Math.max,
		pyt: pyt,
		pow: Math.pow,
		atan2: Math.atan2,
		E: Math.E,
		PI: Math.PI
	};

	var PRIMARY      = 1 << 0;
	var OPERATOR     = 1 << 1;
	var FUNCTION     = 1 << 2;
	var LPAREN       = 1 << 3;
	var RPAREN       = 1 << 4;
	var COMMA        = 1 << 5;
	var SIGN         = 1 << 6;
	var CALL         = 1 << 7;
	var NULLARY_CALL = 1 << 8;

	Parser.prototype = {
		parse: function (expr) {
			this.errormsg = "";
			this.success = true;
			var operstack = [];
			var tokenstack = [];
			this.tmpprio = 0;
			var expected = (PRIMARY | LPAREN | FUNCTION | SIGN);
			var noperators = 0;
			this.expression = expr;
			this.pos = 0;

			while (this.pos < this.expression.length) {
				if (this.isOperator()) {
					if (this.isSign() && (expected & SIGN)) {
						if (this.isNegativeSign()) {
							this.tokenprio = 2;
							this.tokenindex = "-";
							noperators++;
							this.addfunc(tokenstack, operstack, TOP1);
						}
						expected = (PRIMARY | LPAREN | FUNCTION | SIGN);
					}
					else if (this.isComment()) {

					}
					else {
						if ((expected & OPERATOR) === 0) {
							this.error_parsing(this.pos, "unexpected operator");
						}
						noperators += 2;
						this.addfunc(tokenstack, operstack, TOP2);
						expected = (PRIMARY | LPAREN | FUNCTION | SIGN);
					}
				}
				else if (this.isNumber()) {
					if ((expected & PRIMARY) === 0) {
						this.error_parsing(this.pos, "unexpected number");
					}
					var token = new Token(TNUMBER, 0, 0, this.tokennumber);
					tokenstack.push(token);

					expected = (OPERATOR | RPAREN | COMMA);
				}
				else if (this.isString()) {
					if ((expected & PRIMARY) === 0) {
						this.error_parsing(this.pos, "unexpected string");
					}
					var token = new Token(TNUMBER, 0, 0, this.tokennumber);
					tokenstack.push(token);

					expected = (OPERATOR | RPAREN | COMMA);
				}
				else if (this.isLeftParenth()) {
					if ((expected & LPAREN) === 0) {
						this.error_parsing(this.pos, "unexpected \"(\"");
					}

					if (expected & CALL) {
						noperators += 2;
						this.tokenprio = -2;
						this.tokenindex = -1;
						this.addfunc(tokenstack, operstack, TFUNCALL);
					}

					expected = (PRIMARY | LPAREN | FUNCTION | SIGN | NULLARY_CALL);
				}
				else if (this.isRightParenth()) {
				    if (expected & NULLARY_CALL) {
						var token = new Token(TNUMBER, 0, 0, []);
						tokenstack.push(token);
					}
					else if ((expected & RPAREN) === 0) {
						this.error_parsing(this.pos, "unexpected \")\"");
					}

					expected = (OPERATOR | RPAREN | COMMA | LPAREN | CALL);
				}
				else if (this.isComma()) {
					if ((expected & COMMA) === 0) {
						this.error_parsing(this.pos, "unexpected \",\"");
					}
					this.addfunc(tokenstack, operstack, TOP2);
					noperators += 2;
					expected = (PRIMARY | LPAREN | FUNCTION | SIGN);
				}
				else if (this.isConst()) {
					if ((expected & PRIMARY) === 0) {
						this.error_parsing(this.pos, "unexpected constant");
					}
					var consttoken = new Token(TNUMBER, 0, 0, this.tokennumber);
					tokenstack.push(consttoken);
					expected = (OPERATOR | RPAREN | COMMA);
				}
				else if (this.isOp2()) {
					if ((expected & FUNCTION) === 0) {
						this.error_parsing(this.pos, "unexpected function");
					}
					this.addfunc(tokenstack, operstack, TOP2);
					noperators += 2;
					expected = (LPAREN);
				}
				else if (this.isOp1()) {
					if ((expected & FUNCTION) === 0) {
						this.error_parsing(this.pos, "unexpected function");
					}
					this.addfunc(tokenstack, operstack, TOP1);
					noperators++;
					expected = (LPAREN);
				}
				else if (this.isVar()) {
					if ((expected & PRIMARY) === 0) {
						this.error_parsing(this.pos, "unexpected variable");
					}
					var vartoken = new Token(TVAR, this.tokenindex, 0, 0);
					tokenstack.push(vartoken);

					expected = (OPERATOR | RPAREN | COMMA | LPAREN | CALL);
				}
				else if (this.isWhite()) {
				}
				else {
					if (this.errormsg === "") {
						this.error_parsing(this.pos, "unknown character");
					}
					else {
						this.error_parsing(this.pos, this.errormsg);
					}
				}
			}
			if (this.tmpprio < 0 || this.tmpprio >= 10) {
				this.error_parsing(this.pos, "unmatched \"()\"");
			}
			while (operstack.length > 0) {
				var tmp = operstack.pop();
				tokenstack.push(tmp);
			}
			if (noperators + 1 !== tokenstack.length) {
				//print(noperators + 1);
				//print(tokenstack);
				this.error_parsing(this.pos, "parity");
			}

			return new Expression(tokenstack, object(this.ops1), object(this.ops2), object(this.functions));
		},

		evaluate: function (expr, variables) {
			return this.parse(expr).evaluate(variables);
		},

		error_parsing: function (column, msg) {
			this.success = false;
			this.errormsg = "parse error [column " + (column) + "]: " + msg;
			throw new Error(this.errormsg);
		},

//\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\

		addfunc: function (tokenstack, operstack, type_) {
			var operator = new Token(type_, this.tokenindex, this.tokenprio + this.tmpprio, 0);
			while (operstack.length > 0) {
				if (operator.prio_ <= operstack[operstack.length - 1].prio_) {
					tokenstack.push(operstack.pop());
				}
				else {
					break;
				}
			}
			operstack.push(operator);
		},

		isNumber: function () {
			var r = false;
			var str = "";
			while (this.pos < this.expression.length) {
				var code = this.expression.charCodeAt(this.pos);
				if ((code >= 48 && code <= 57) || code === 46) {
					str += this.expression.charAt(this.pos);
					this.pos++;
					this.tokennumber = parseFloat(str);
					r = true;
				}
				else {
					break;
				}
			}
			return r;
		},

		// Ported from the yajjl JSON parser at http://code.google.com/p/yajjl/
		unescape: function(v, pos) {
			var buffer = [];
			var escaping = false;

			for (var i = 0; i < v.length; i++) {
				var c = v.charAt(i);
	
				if (escaping) {
					switch (c) {
					case "'":
						buffer.push("'");
						break;
					case '\\':
						buffer.push('\\');
						break;
					case '/':
						buffer.push('/');
						break;
					case 'b':
						buffer.push('\b');
						break;
					case 'f':
						buffer.push('\f');
						break;
					case 'n':
						buffer.push('\n');
						break;
					case 'r':
						buffer.push('\r');
						break;
					case 't':
						buffer.push('\t');
						break;
					case 'u':
						// interpret the following 4 characters as the hex of the unicode code point
						var codePoint = parseInt(v.substring(i + 1, i + 5), 16);
						buffer.push(String.fromCharCode(codePoint));
						i += 4;
						break;
					default:
						throw this.error_parsing(pos + i, "Illegal escape sequence: '\\" + c + "'");
					}
					escaping = false;
				} else {
					if (c == '\\') {
						escaping = true;
					} else {
						buffer.push(c);
					}
				}
			}
	
			return buffer.join('');
		},

		isString: function () {
			var r = false;
			var str = "";
			var startpos = this.pos;
			if (this.pos < this.expression.length && this.expression.charAt(this.pos) == "'") {
				this.pos++;
				while (this.pos < this.expression.length) {
					var code = this.expression.charAt(this.pos);
					if (code != "'" || str.slice(-1) == "\\") {
						str += this.expression.charAt(this.pos);
						this.pos++;
					}
					else {
						this.pos++;
						this.tokennumber = this.unescape(str, startpos);
						r = true;
						break;
					}
				}
			}
			return r;
		},

		isConst: function () {
			var str;
			for (var i in this.consts) {
				if (true) {
					var L = i.length;
					str = this.expression.substr(this.pos, L);
					if (i === str) {
						this.tokennumber = this.consts[i];
						this.pos += L;
						return true;
					}
				}
			}
			return false;
		},

		isOperator: function () {
			var code = this.expression.charCodeAt(this.pos);
			if (code === 43) { // +
				this.tokenprio = 0;
				this.tokenindex = "+";
			}
			else if (code === 45) { // -
				this.tokenprio = 0;
				this.tokenindex = "-";
			}
			else if (code === 124) { // |
				if (this.expression.charCodeAt(this.pos + 1) === 124) {
					this.pos++;
					this.tokenprio = 0;
					this.tokenindex = "||";
				}
				else {
					return false;
				}
			}
			else if (code === 42) { // *
				this.tokenprio = 1;
				this.tokenindex = "*";
			}
			else if (code === 47) { // /
				this.tokenprio = 2;
				this.tokenindex = "/";
			}
			else if (code === 37) { // %
				this.tokenprio = 2;
				this.tokenindex = "%";
			}
			else if (code === 94) { // ^
				this.tokenprio = 3;
				this.tokenindex = "^";
			}
			else {
				return false;
			}
			this.pos++;
			return true;
		},

		isSign: function () {
			var code = this.expression.charCodeAt(this.pos - 1);
			if (code === 45 || code === 43) { // -
				return true;
			}
			return false;
		},

		isPositiveSign: function () {
			var code = this.expression.charCodeAt(this.pos - 1);
			if (code === 43) { // -
				return true;
			}
			return false;
		},

		isNegativeSign: function () {
			var code = this.expression.charCodeAt(this.pos - 1);
			if (code === 45) { // -
				return true;
			}
			return false;
		},

		isLeftParenth: function () {
			var code = this.expression.charCodeAt(this.pos);
			if (code === 40) { // (
				this.pos++;
				this.tmpprio += 10;
				return true;
			}
			return false;
		},

		isRightParenth: function () {
			var code = this.expression.charCodeAt(this.pos);
			if (code === 41) { // )
				this.pos++;
				this.tmpprio -= 10;
				return true;
			}
			return false;
		},

		isComma: function () {
			var code = this.expression.charCodeAt(this.pos);
			if (code === 44) { // ,
				this.pos++;
				this.tokenprio = -1;
				this.tokenindex = ",";
				return true;
			}
			return false;
		},

		isWhite: function () {
			var code = this.expression.charCodeAt(this.pos);
			if (code === 32 || code === 9 || code === 10 || code === 13) {
				this.pos++;
				return true;
			}
			return false;
		},

		isOp1: function () {
			var str = "";
			for (var i = this.pos; i < this.expression.length; i++) {
				var c = this.expression.charAt(i);
				if (c.toUpperCase() === c.toLowerCase()) {
					if (i === this.pos || (c != '_' && (c < '0' || c > '9'))) {
						break;
					}
				}
				str += c;
			}
			if (str.length > 0 && (str in this.ops1)) {
				this.tokenindex = str;
				this.tokenprio = 5;
				this.pos += str.length;
				return true;
			}
			return false;
		},

		isOp2: function () {
			var str = "";
			for (var i = this.pos; i < this.expression.length; i++) {
				var c = this.expression.charAt(i);
				if (c.toUpperCase() === c.toLowerCase()) {
					if (i === this.pos || (c != '_' && (c < '0' || c > '9'))) {
						break;
					}
				}
				str += c;
			}
			if (str.length > 0 && (str in this.ops2)) {
				this.tokenindex = str;
				this.tokenprio = 5;
				this.pos += str.length;
				return true;
			}
			return false;
		},

		isVar: function () {
			var str = "";
			for (var i = this.pos; i < this.expression.length; i++) {
				var c = this.expression.charAt(i);
				if (c.toUpperCase() === c.toLowerCase()) {
					if (i === this.pos || (c != '_' && (c < '0' || c > '9'))) {
						break;
					}
				}
				str += c;
			}
			if (str.length > 0) {
				this.tokenindex = str;
				this.tokenprio = 4;
				this.pos += str.length;
				return true;
			}
			return false;
		},

		isComment: function () {
			var code = this.expression.charCodeAt(this.pos - 1);
			if (code === 47 && this.expression.charCodeAt(this.pos) === 42) {
				this.pos = this.expression.indexOf("*/", this.pos) + 2;
				if (this.pos === 1) {
					this.pos = this.expression.length;
				}
				return true;
			}
			return false;
		}
	};

	return Parser;
});