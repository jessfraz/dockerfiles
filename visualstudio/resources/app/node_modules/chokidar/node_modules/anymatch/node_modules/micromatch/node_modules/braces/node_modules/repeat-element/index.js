/*!
 * repeat-element <https://github.com/jonschlinkert/repeat-element>
 *
 * Copyright (c) 2015 Jon Schlinkert, contributors.
 * Licensed under the MIT license.
 */

'use strict';

module.exports = repeat;

function repeat(ele, num) {
  var arr = new Array(num);

  for (var i = 0; i < num; i++) {
    arr[i] = ele;
  }

  return arr;
}
