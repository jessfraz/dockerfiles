'use strict';

module.exports = function diff(a, b) {
  var len = a.length;
  var arr = [];

  for (var i = 0; i < len; i++) {
    if (b.indexOf(a[i]) === -1) {
      arr.push(a[i]);
    }
  }
  return arr;
};
