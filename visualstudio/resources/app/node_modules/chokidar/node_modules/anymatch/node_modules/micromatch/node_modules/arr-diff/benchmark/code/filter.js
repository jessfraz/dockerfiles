'use strict';

module.exports = function diff(a, b) {
  return a.filter(function (value) {
    return (b.indexOf(value) === -1);
  });
};
