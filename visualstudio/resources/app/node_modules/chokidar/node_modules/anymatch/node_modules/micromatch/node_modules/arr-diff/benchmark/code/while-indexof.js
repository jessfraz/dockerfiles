'use strict';

module.exports = function diff(a, b) {
  var len = a.length;
  var arr = [];
  var i = 0;

  while (len--) {
    if (b.indexOf(a[i]) === -1) {
      arr.push(a[i]);
    }
    i++;
  }
  return arr;
};
