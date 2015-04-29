'use strict';

var slice = require('array-slice');

module.exports = function diff(a, b, c) {
  var len = a.length;
  var rest = [];
  var arr = [];

  if (!b) {
    return a;
  }

  if (!c) {
    rest = b;
  } else {
    rest = [].concat.apply([], slice(arguments, 1));
  }

  while (len--) {
    if (rest.indexOf(a[len]) === -1) {
      arr.push(a[len]);
    }
  }
  return arr;
};
