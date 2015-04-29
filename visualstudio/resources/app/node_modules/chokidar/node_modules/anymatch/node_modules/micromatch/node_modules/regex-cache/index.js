/*!
 * regex-cache <https://github.com/jonschlinkert/regex-cache>
 *
 * Copyright (c) 2015 Jon Schlinkert.
 * Licensed under the MIT license.
 */

'use strict';

var toKey = require('to-key');

/**
 * Expose `regexCache`
 */

module.exports = regexCache;

/**
 * Memoize the results of a call to the new RegExp constructor.
 *
 * @param  {Function} fn [description]
 * @param  {String} str [description]
 * @param  {Options} options [description]
 * @param  {Boolean} nocompare [description]
 * @return {RegExp}
 */

function regexCache(fn, str, options) {
  var key = '_default_';

  if (!str) {
    return cache[key] || (cache[key] = fn());
  }

  if (!options) {
    if (typeof str === 'string') {
      return cache[str] || (cache[str] = fn(str));
    } else {
      key = toKey(str);
      return cache[key] || (cache[key] = fn(str));
    }
  }

  key = str + toKey(options);
  return cache[key] || (cache[key] = fn(str, options));
}

/**
 * Expose `cache`
 */

var cache = module.exports.cache = {};
