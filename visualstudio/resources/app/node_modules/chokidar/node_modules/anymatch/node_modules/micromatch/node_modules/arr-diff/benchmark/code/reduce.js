'use strict';

module.exports = function diff(a, b) {
  return a.reduce(function (acc, value, i) {
    if (b.indexOf(value) === -1) {
      acc.push(value);
    }
    return acc;
  }, []);
};
