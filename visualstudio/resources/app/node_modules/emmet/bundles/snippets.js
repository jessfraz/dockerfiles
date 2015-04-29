/**
 * Bundler, used in builder script to statically
 * include snippets.json into bundle
 */
var res = require('../lib/assets/resources');
var snippets = require('../lib/snippets.json');
res.setVocabulary(snippets, 'system');
