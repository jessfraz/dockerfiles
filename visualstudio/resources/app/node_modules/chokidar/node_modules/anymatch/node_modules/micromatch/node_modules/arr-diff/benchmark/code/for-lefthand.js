'use strict';

module.exports = function diff(a, b) {
  var alen = a.length - 1;
  var arr = [];

  for (var i = alen; i >= 0; i--) {
    var key = a[i];
    if (b.indexOf(key) === -1) {
      arr.push(key);
    }
  }
  return arr;
};
