/**
 * Bundler, used in builder script to statically
 * include optimized caniuse.json into bundle
 */
var ciu = require('../lib/assets/caniuse');
var db = require('../lib/caniuse.json');
ciu.load(db, true);