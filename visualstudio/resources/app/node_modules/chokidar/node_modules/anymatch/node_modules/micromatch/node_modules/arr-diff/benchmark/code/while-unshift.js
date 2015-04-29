'use strict';

module.exports = function diff(a, b) {
  var len = a.length;
  var arr = [];

  while (len--) {
    if (b.indexOf(a[len]) === -1) {
      arr.unshift(a[len]);
    }
  }
  return arr;
};
