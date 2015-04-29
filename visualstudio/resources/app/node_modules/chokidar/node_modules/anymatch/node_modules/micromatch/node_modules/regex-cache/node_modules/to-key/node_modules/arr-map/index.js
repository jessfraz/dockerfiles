/*!
 * arr-map <https://github.com/jonschlinkert/arr-map>
 *
 * Copyright (c) 2015 Jon Schlinkert, contributors.
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function map(arr, fn) {
  if (arr == null) {
    return [];
  }

  var len = arr.length;
  var res = new Array(len);
  var i = -1;

  while (++i < len) {
    res[i] = fn(arr[i], i, arr);
  }

  return res;
};
