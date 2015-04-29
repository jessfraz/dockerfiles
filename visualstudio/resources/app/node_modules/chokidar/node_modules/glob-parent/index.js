'use strict';

var path = require('path');
var isglob = require('is-glob');

module.exports = function globParent(str) {
	while (isglob(str)) str = path.dirname(str);
	return str;
};
