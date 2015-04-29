'use strict';

var diff = module.exports = function diff(a, b) {
  var arr = [];

  for (var i = a.length - 1; i >= 0; i--) {
    var key = a[i];
    if (-1 === b.indexOf(key)) {
      arr.push(key);
    }
  }
  return arr;
};
