/*!
 * micromatch <https://github.com/jonschlinkert/micromatch>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

var utils = require('./utils');
var Glob = require('./glob');

/**
 * Expose `expand`
 */

module.exports = expand;

/**
 * Expand a glob pattern to resolve braces and
 * similar patterns before converting to regex.
 *
 * @param  {String|Array} `pattern`
 * @param  {Array} `files`
 * @param  {Options} `opts`
 * @return {Array}
 */

function expand(pattern, options) {
  if (typeof pattern !== 'string') {
    throw new TypeError('micromatch.expand(): argument should be a string.');
  }

  var glob = new Glob(pattern, options || {});
  var opts = glob.options;

  // return early if glob pattern matches special patterns
  if (specialCase(pattern) && opts.safemode) {
    return new RegExp(utils.escapeRe(pattern), 'g');
  }

  if (opts.nonegate !== true) {
    opts.negated = glob.negated;
  }

  glob._replace('/.', '/\\.');

  // parse the glob pattern into tokens
  glob.parse();

  var tok = glob.tokens;
  tok.is.negated = opts.negated;

  if (tok.is.dotfile) {
    glob.options.dot = true;
    opts.dot = true;
  }

  if (!tok.is.glob) {
    return {
      pattern: utils.escapePath(glob.pattern),
      tokens: tok,
      options: opts
    };
  }

  // see if it might be a dotfile pattern
  if (/[{,]\./.test(glob.pattern)) {
    opts.makeRe = false;
    opts.dot = true;
  }

  // expand braces, e.g `{1..5}`
  glob.track('before brackets');
  if (tok.is.brackets) {
    glob.brackets();
  }
  glob.track('before braces');
  if (tok.is.braces) {
    glob.braces();
  }

  glob.track('after braces');

  glob._replace('[]', '\\[\\]');
  glob._replace('(?', '__QMARK_GROUP__');

  // windows drives
  glob._replace(/^(\w):([\\\/]+?)/gi, lookahead + '$1:$2', true);

  // negate slashes in exclusion ranges
  if (glob.pattern.indexOf('[^') !== -1) {
    glob.pattern = negateSlash(glob.pattern);
  }

  if (glob.pattern === '**' && opts.globstar !== false) {
     glob.pattern = globstar(opts);

  } else {
    if (/^\*\.\w*$/.test(glob.pattern)) {
      glob._replace('*', star(opts.dot) + '\\');
      glob._replace('__QMARK_GROUP__', '(?');
      return glob;
    }

    // '/*/*/*' => '(?:/*){3}'
    glob._replace(/(\/\*)+/g, function (match) {
      var len = match.length / 2;
      if (len === 1) { return match; }
      return '(?:\\/*){' + len + '}';
    });

    glob.pattern = balance(glob.pattern, '[', ']');
    glob.escape(glob.pattern);

    // if the glob is for one directory deep, we can
    // simplify the parsing and generated regex
    if (tok.path.dirname === '' && !tok.is.globstar) {
      glob.track('before expand filename');
      return expandFilename(glob, opts);
    }

    // if the pattern has `**`
    if (tok.is.globstar) {
      glob._replace(/\*{2,}/g, '**');
      glob.pattern = collapse(glob.pattern, '/**');
      glob.pattern = optionalGlobstar(glob.pattern);

      // reduce extraneous globstars
      glob._replace(/(^|[^\\])\*{2,}([^\\]|$)/g, '$1**$2');

      // 'foo/*'
      glob._replace(/(\w+)\*(?!\/)/g, '(?=.)$1[^/]*?', true);
      glob._replace('**', globstar(opts), true);
    }

    // ends with /*
    glob._replace(/\/\*$/, '\\/' + stardot(opts), true);
    // ends with *, no slashes
    glob._replace(/(?!\/)\*$/, boxQ, true);
    // has '*'
    glob._replace('*', stardot(opts), true);
    glob._replace('?.', '?\\.', true);
    glob._replace('?:', '?:', true);

    glob._replace(/\?+/g, function (match) {
      var len = match.length;
      if (len === 1) {
        return box;
      }
      return box + '{' + len + '}';
    });

    // escape '.abc' => '\\.abc'
    glob._replace(/\.([*\w]+)/g, '\\.$1');
    // fix '[^\\\\/]'
    glob._replace(/\[\^[\\\/]+\]/g, box);
    // '///' => '\/'
    glob._replace(/\/+/g, '\\/');
    // '\\\\\\' => '\\'
    glob._replace(/\\{2,}/g, '\\');
  }

  glob._replace('__QMARK_GROUP__', '(?');
  glob.unescape(glob.pattern);
  glob._replace('__UNESC_STAR__', '*');
  glob._replace('%~', '?');
  glob._replace('%%', '*');
  glob._replace('?.', '?\\.');
  glob._replace('[^\\/]', '[^/]');
  return glob;
}

/**
 * Expand the filename part of the glob into a regex
 * compatible string
 *
 * @param  {String} glob
 * @param  {Object} tok Tokens
 * @param  {Options} opts
 * @return {Object}
 */

function expandFilename(glob, opts) {
  var tok = glob.tokens;
  switch (glob.pattern) {
    case '.':
      glob.pattern = '\\.';
      break;
    case '.*':
      glob.pattern = '\\..*';
      break;
    case '*.*':
      glob.pattern = star(opts.dot) + '\\.[^/]*?';
      break;
    case '*':
      glob.pattern = star(opts.dot);
      break;
    default:
    if (tok.path.filename === '*' && !tok.path.dirname) {
      glob.pattern = star(opts.dot) + '\\' + glob.pattern.slice(1);
    } else {
      glob._replace(/(?!\()\?/g, '[^/]');
      if (tok.path.basename.charAt(0) !== '.') {
        opts.dot = true;
      }
      glob._replace('*', star(opts.dot));
    }
  }

  if (glob.pattern.charAt(0) === '.') {
    glob.pattern = '\\' + glob.pattern;
  }

  glob._replace('__QMARK_GROUP__', '(?');
  glob.unescape(glob.pattern);
  glob._replace('__UNESC_STAR__', '*');
  glob._replace('%~', '?');
  glob._replace('%%', '*');
  return glob;
}

/**
 * Special cases
 */

function specialCase(glob) {
  if (glob === '\\') {
    return true;
  }
  return false;
}

/**
 * Collapse repeated character sequences.
 *
 * ```js
 * collapse('a/../../../b', '../');
 * //=> 'a/../b'
 * ```
 *
 * @param  {String} `str`
 * @param  {String} `ch`
 * @return {String}
 */

function collapse(str, ch, repeat) {
  var res = str.split(ch);
  var len = res.length;
  var isFirst = res[0] === '';
  var isLast = res[res.length - 1] === '';
  res = res.filter(Boolean);
  if (isFirst) {
    res.unshift('');
  }
  if (isLast) {
    res.push('');
  }
  var diff = len - res.length;
  if (repeat && diff >= 1) {
    ch = '(?:' + ch + '){' + (diff + 1) + '}';
  }
  return res.join(ch);
}

/**
 * Make globstars optional, as in glob spec:
 *
 * ```js
 * optionalGlobstar('a\/**\/b');
 * //=> '(?:a\/b|a\/**\/b)'
 * ```
 *
 * @param  {String} `str`
 * @return {String}
 */

function optionalGlobstar(glob) {
  // globstars preceded and followed by a word character
  if (/[^\/]\/\*\*\/[^\/]/.test(glob)) {
    var tmp = glob.split('/**/').join('/');
    glob = '(?:' + tmp + '|' + glob + ')';
  // leading globstars
  } else if (/^\*\*\/[^\/]/.test(glob)) {
    glob = glob.split(/^\*\*\//).join('(^|.+\\/)');
  }
  return glob;
}

/**
 * Negate slashes in exclusion ranges, per glob spec:
 *
 * ```js
 * negateSlash('[^foo]');
 * //=> '[^\\/foo]'
 * ```
 *
 * @param  {[type]} str [description]
 * @return {[type]}
 */

function negateSlash(str) {
  var re = /\[\^([^\]]*?)\]/g;
  return str.replace(re, function (match, inner) {
    if (inner.indexOf('/') === -1) {
      inner = '\\/' + inner;
    }
    return '[^' + inner + ']';
  });
}

/**
 * Escape imbalanced braces/bracket
 */

function balance(str, a, b) {
  var aarr = str.split(a);
  var alen = aarr.join('').length;
  var blen = str.split(b).join('').length;

  if (alen !== blen) {
    str = aarr.join('\\' + a);
    return str.split(b).join('\\' + b);
  }
  return str;
}

/**
 * Escape utils
 */

function esc(str) {
  str = str.split('?').join('%~');
  str = str.split('*').join('%%');
  return str;
}

/**
 * Special patterns to be converted to regex.
 * Heuristics are used to simplify patterns
 * and speed up processing.
 */

var box         = '[^/]';
var boxQ        = '[^/]*?';
var lookahead   = '(?=.)';
var nodot       = '(?!\\.)(?=.)';

var ex = {};
ex.dotfileGlob = '(?:^|\\/)(?:\\.{1,2})(?:$|\\/)';
ex.stardot     = '(?!' + ex.dotfileGlob + ')(?=.)[^/]*?';
ex.twoStarDot  = '(?:(?!' + ex.dotfileGlob + ').)*?';

/**
 * Create a regex for `*`. If `dot` is true,
 * or the pattern does not begin with a leading
 * star, then return the simple regex.
 */

function star(dotfile) {
  return dotfile ? boxQ : nodot + boxQ;
}

function dotstarbase(dotfile) {
  var re = dotfile ? ex.dotfileGlob : '\\.';
  return '(?!' + re + ')' + lookahead;
}

function globstar(opts) {
  if (opts.dot) { return ex.twoStarDot; }
  return '(?:(?!(?:^|\\/)\\.).)*?';
}

function stardot(opts) {
  return dotstarbase(opts && opts.dot) + '[^/]*?';
}
