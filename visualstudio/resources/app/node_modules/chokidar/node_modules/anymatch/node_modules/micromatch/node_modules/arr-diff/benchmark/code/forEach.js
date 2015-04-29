'use strict';

module.exports = function diff(a, b) {
  var arr = [];

  a.forEach(function (key) {
    if (b.indexOf(key) === -1) {
      arr.push(key);
    }
  });

  return arr;
};
