'use strict';

module.exports = function diff(a, b) {
  b.forEach(function (value) {
    while (a.indexOf(value) !== -1) {
      a.splice(a.indexOf(value), 1);
    }
  });
  return a;
};
