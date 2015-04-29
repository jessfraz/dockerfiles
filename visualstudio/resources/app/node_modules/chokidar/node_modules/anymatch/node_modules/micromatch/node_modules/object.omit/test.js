/*!
 * object.omit <https://github.com/jonschlinkert/object.omit>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors.
 * Licensed under the MIT License
 */

'use strict';

var should = require('should');
var omit = require('./');

describe('.omit()', function () {
  it('should omit the given key from the object.', function () {
    omit({a: 'a', b: 'b', c: 'c'}, 'a').should.eql({ b: 'b', c: 'c' });
  });

  it('should omit the given keys from the object.', function () {
    omit({a: 'a', b: 'b', c: 'c'}, ['a', 'c']).should.eql({ b: 'b' });
  });

  it('should return the object if no keys are specified.', function () {
    omit({a: 'a', b: 'b', c: 'c'}, []).should.eql({a: 'a', b: 'b', c: 'c'});
    omit({a: 'a', b: 'b', c: 'c'}).should.eql({a: 'a', b: 'b', c: 'c'});
  });

  it('should return an empty object if the first arg is not an object.', function () {
    omit(null, {a: 'a', b: 'b', c: 'c'}).should.eql({});
  });

  it('should return an empty object if no object is specified.', function () {
    omit().should.eql({});
  });
});
