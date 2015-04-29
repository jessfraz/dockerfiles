'use strict';

var brackets = require('expand-brackets');
var braces = require('braces');
var parse = require('parse-glob');
var chars = require('./chars');

/**
 * Expose `Glob`
 */

module.exports = Glob;

function Glob(pattern, options) {
  this.options = options || {};
  this.pattern = pattern;
  this.history = [];
  this.tokens = {};
  this.init(pattern);
}

/**
 * Initialize defaults
 */

Glob.prototype.init = function(pattern) {
  this.orig = pattern;
  this.negated = this.isNegated();
  this.options.track = this.options.track || false;
  this.options.dot = this.options.dot || this.options.dotfiles;
  this.options.makeRe = true;
};

/**
 * Push a change into `glob.history`. Useful
 * for debugging.
 */

Glob.prototype.track = function(msg) {
  if (this.options.track) {
    this.history.push({msg: msg, pattern: this.pattern});
  }
};

/**
 * Return true if the glob pattern has the given
 * `ch`aracter.
 *
 * @param  {String} `pattern`
 * @param  {String} `ch`
 * @return {Boolean}
 */

Glob.prototype.has = function(pattern, ch) {
  if (ch instanceof RegExp) {
    return ch.test(pattern);
  }
  return pattern.indexOf(ch) !== -1;
};

/**
 * Return true if `glob.pattern` was negated
 * with `!`. Also removes the `!` from the pattern.
 *
 * @return {Boolean}
 */

Glob.prototype.isNegated = function() {
  if (this.pattern.charCodeAt(0) === 33 /* '!' */) {
    this.pattern = this.pattern.slice(1);
    return true;
  }
  return false;
};

/**
 * Return true if the glob pattern has braces
 *
 * @param  {String} `pattern`
 * @return {Boolean}
 */

Glob.prototype.hasBraces = function(pattern) {
  return this.has((pattern || this.pattern), '{');
};

/**
 * Expand braces in the given glob pattern.
 *
 * We only need to use the [braces] lib when
 * patterns are nested.
 */

Glob.prototype.braces = function() {
  if (this.hasBraces() && this.options.nobraces !== true) {
    var a = this.pattern.match(/[\{\(\[]/g);
    var b = this.pattern.match(/[\}\)\]]/g);
    if (a && b && (a.length !== b.length)) {
      this.options.makeRe = false;
    }
    var expanded = braces(this.pattern, this.options);
    this.pattern = expanded.join('|');
  }
};

/**
 * Return true if the glob pattern has a POSIX
 * bracket expression (character class)
 *
 * @param  {String} `pattern`
 * @return {Boolean}
 */

Glob.prototype.hasBrackets = function(pattern) {
  return this.has((pattern || this.pattern), '[:');
};

/**
 * Expand bracket expressions in `glob.pattern`
 */

Glob.prototype.brackets = function() {
  if (this.hasBrackets() && this.options.nobrackets !== true) {
    this.pattern = brackets(this.pattern);
  }
};

/**
 * Parse the given glob `pattern` or `glob.pattern`
 */

Glob.prototype.parse = function(pattern) {
  this.tokens = parse(pattern || this.pattern, true);
  return this.tokens;
};

/**
 * Replace `a` with `b`. Also tracks the change before and
 * after each replacement. This is disabled by default, but
 * can be enabled by setting `options.track` to true.
 *
 * Also, when the pattern is a string, `.split()` is used,
 * because it's much faster than replace.
 *
 * @param  {RegExp|String} `a`
 * @param  {String} `b`
 * @param  {Boolean} `escape` When `true`, escapes `*` and `?` in the replacement.
 * @return {String}
 */

Glob.prototype._replace = function(a, b, escape) {
  this.track('before (find): "' + a + '" (replace with): "' + b + '"');
  if (escape) b = esc(b);
  if (a && b && typeof a === 'string') {
    this.pattern = this.pattern.split(a).join(b);
  } else if (a instanceof RegExp) {
    this.pattern = this.pattern.replace(a, b);
  }
  this.track('after');
};

/**
 * Escape special characters in the given string.
 *
 * @param  {String} `str` Glob pattern
 * @return {String}
 */

Glob.prototype.escape = function(str) {
  this.track('before escape: ');
  var re = /["\\](['"]?[^"'\\]['"]?)/g;

  this.pattern = str.replace(re, function($0, $1) {
    var o = chars.ESC;
    var ch = o && o[$1];
    if (ch) {
      return ch;
    }
    if (/[a-z]/i.test($0)) {
      return $0.split('\\').join('');
    }
    return $0;
  });

  this.track('after escape: ');
};

/**
 * Unescape special characters in the given string.
 *
 * @param  {String} `str`
 * @return {String}
 */

Glob.prototype.unescape = function(str) {
  var re = /__([A-Z]+)_([A-Z]+)__/g;
  this.pattern = str.replace(re, function($0, $1) {
    return chars[$1][$0];
  });
};

/**
 * Escape utils
 */

function esc(str) {
  str = str.split('?').join('%~');
  str = str.split('*').join('%%');
  return str;
}
