'use strict';

module.exports = function diff(a, b) {
  var arr = [];

  a.forEach(function (key) {
    if (-1 === b.indexOf(key)) {
      arr.push(key);
    }
  });
  return arr;
};
