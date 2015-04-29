/*!
 * to-key <https://github.com/jonschlinkert/to-key>
 *
 * Copyright (c) 2015 Jon Schlinkert.
 * Licensed under the MIT license.
 */

'use strict';

var forIn = require('for-in');
var map = require('arr-map');

module.exports = toKey;

function toKey(val) {
  if (val === undefined || val === null) {
    return '';
  }

  if (typeof val !== 'object') {
    return '' + val;
  }

  if (Array.isArray(val)) {
    return map(val, toKey).join('');
  }

  var type = toString.call(val);

  if (type === '[object Function]') {
    return '';
  }

  if (val instanceof RegExp || type === '[object RegExp]') {
    return val.source;
  }

  if (val instanceof Date || type === '[object Date]') {
    return Date.parse(val);
  }

  if (Buffer.isBuffer(val)) {
    return val.toString();
  }

  return toString(val);
}

function toString(obj) {
  if (typeof obj !== 'object') {
    return obj + '';
  }

  var str = '';

  if (Array.isArray(obj)) {
    str += map(obj, toString);
  } else {
    forIn(obj, function (val, key) {
      if (typeof val === 'object') {
        str += key + toString(val);
      } else {
        str += key + val;
      }
    });
    str = str.split(/[\W\s]/).join('');
  }
  return str;
}
