'use strict';

module.exports = function diff(a, b) {
  var len = a.length - 1;
  var arr = [];

  for (var i = len; i >= 0; i--) {
    var key = a[i];
    if (-1 === b.indexOf(key)) {
      arr.push(key);
    }
  }
  return arr;
};
