/*!
 * arr-diff <https://github.com/jonschlinkert/arr-diff>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors.
 * Licensed under the MIT License
 */

'use strict';

var should = require('should');
var diff = require('./');

describe('diff', function () {
  it('should diff array:', function () {
    diff(['a', 'b', 'c'], ['b', 'c', 'e']).should.eql(['a']);
    diff(['x', 'b', 'c', 'e', 'y'], ['b', 'x', 'e']).should.eql(['c', 'y']);
    diff(['x', 'x'], ['a', 'b', 'c']).should.eql(['x', 'x']);
    diff(['x'], ['a', 'b', 'c']).should.eql(['x']);
  });

  it('should include duplicates:', function () {
    diff(['x', 'b', 'b', 'b', 'c', 'e', 'y'], ['x', 'e']).should.eql(['b', 'b', 'b', 'c', 'y']);
  });

  it('should diff elements from multiple arrays:', function () {
    diff(['a', 'b', 'c'], ['a'], ['b']).should.eql(['c']);
  });

  it('should return an empty array if no unique elements are in the first array:', function () {
    diff(['a'], ['a', 'b', 'c']).should.eql([]);
  });

  it('should return the first array if the second array is empty:', function () {
    diff(['a', 'b', 'c'], []).should.eql(['a', 'b', 'c']);
  });

  it('should return the first array if the second array is null or undefined:', function () {
    diff(['a', 'b', 'c'], null).should.eql(['a', 'b', 'c']);
    diff(['a', 'b', 'c']).should.eql(['a', 'b', 'c']);
  });
});
