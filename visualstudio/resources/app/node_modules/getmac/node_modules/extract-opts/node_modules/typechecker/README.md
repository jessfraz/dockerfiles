
<!-- TITLE/ -->

# TypeChecker

<!-- /TITLE -->


<!-- BADGES/ -->

[![Build Status](http://img.shields.io/travis-ci/bevry/typechecker.png?branch=master)](http://travis-ci.org/bevry/typechecker "Check this project's build status on TravisCI")
[![NPM version](https://badge.fury.io/js/typechecker.png)](https://npmjs.org/package/typechecker "View this project on NPM")
[![Gittip donate button](http://img.shields.io/gittip/bevry.png)](https://www.gittip.com/bevry/ "Donate weekly to this project using Gittip")
[![Flattr donate button](https://raw.github.com/balupton/flattr-buttons/master/badge-89x18.gif)](http://flattr.com/thing/344188/balupton-on-Flattr "Donate monthly to this project using Flattr")
[![PayPayl donate button](https://www.paypalobjects.com/en_AU/i/btn/btn_donate_SM.gif)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=QB8GQPZAH84N6 "Donate once-off to this project using Paypal")

<!-- /BADGES -->


<!-- DESCRIPTION/ -->

Utilities to get and check variable types (isString, isPlainObject, isRegExp, etc)

<!-- /DESCRIPTION -->


<!-- INSTALL/ -->

## Install

### [Node](http://nodejs.org/), [Browserify](http://browserify.org/)
- Use: `require('typechecker')`
- Install: `npm install --save typechecker`

### [Ender](http://ender.jit.su/)
- Use: `require('typechecker')`
- Install: `ender add typechecker`

<!-- /INSTALL -->


## Usage

### Example

``` javascript
require('typechecker').isRegExp(/^a/)  // returns true
```

### Methods

- `getObjectType` - returns the object string of the value, e.g. when passed `/^a/` it'll return `"[object RegExp]"`
- `getType` - returns lower case string of the type, e.g. when passed `/^a/` it'll return `"regex"`
- `isPlainObject` - returns `true` if the value doesn't have a custom prototype
- `isError` - returns `true` if the value an error, otherwise `false`
- `isDate` - returns `true` if the value is a date, otherwise `false`
- `isArguments` - returns `true` if the value is function arguments, otherwise `false`
- `isFunction` - returns `true` if the value is a function, otherwise `false`
- `isRegExp` - returns `true` if the value is a regular expression instance, otherwise `false`
- `isArray` - returns `true` if the value is an array, otherwise `false`
- `isNumber` - returns `true` if the value is a number (`"2"` is a string), otherwise `false`
- `isString` - returns `true` if the value is a string, otherwise `false`
- `isBoolean` - returns `true` if the value is a boolean, otherwise `false`
- `isNull` - returns `true` if the value is null, otherwise `false`
- `isUndefined` - returns `true` if the value is undefined, otherwise `false`
- `isEmpty` - returns `true` if the value is `null` or `undefined`
- `isEmptyObject` - returns `true` if the object has no keys that are its own


### Notes

Why should I use this instead of say `instanceof`? Under certain circumstances `instanceof` may not return the correct results.
This occurs with [node's vm module](http://nodejs.org/api/vm.html#vm_globals) especially, and circumstances where an object's prototype has been dereferenced from the original.
As such, for basic `==` and `===` checks (like `a === null`), you're fine not using this, but for checks when you would have done `instanceof` (like `err instanceof Error`), you should try to use this instead.
Plus things like `isEmptyObject` and `isPlainObject` are darn useful!


<!-- HISTORY/ -->

## History
[Discover the change history by heading on over to the `History.md` file.](https://github.com/bevry/typechecker/blob/master/History.md#files)

<!-- /HISTORY -->


<!-- CONTRIBUTE/ -->

## Contribute

[Discover how you can contribute by heading on over to the `Contributing.md` file.](https://github.com/bevry/typechecker/blob/master/Contributing.md#files)

<!-- /CONTRIBUTE -->


<!-- BACKERS/ -->

## Backers

### Maintainers

These amazing people are maintaining this project:

- Benjamin Lupton <b@lupton.cc> (https://github.com/balupton)

### Sponsors

No sponsors yet! Will you be the first?

[![Gittip donate button](http://img.shields.io/gittip/bevry.png)](https://www.gittip.com/bevry/ "Donate weekly to this project using Gittip")
[![Flattr donate button](https://raw.github.com/balupton/flattr-buttons/master/badge-89x18.gif)](http://flattr.com/thing/344188/balupton-on-Flattr "Donate monthly to this project using Flattr")
[![PayPayl donate button](https://www.paypalobjects.com/en_AU/i/btn/btn_donate_SM.gif)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=QB8GQPZAH84N6 "Donate once-off to this project using Paypal")

### Contributors

These amazing people have contributed code to this project:

- Benjamin Lupton <b@lupton.cc> (https://github.com/balupton) - [view contributions](https://github.com/bevry/typechecker/commits?author=balupton)
- sfrdmn (https://github.com/sfrdmn) - [view contributions](https://github.com/bevry/typechecker/commits?author=sfrdmn)

[Become a contributor!](https://github.com/bevry/typechecker/blob/master/Contributing.md#files)

<!-- /BACKERS -->


<!-- LICENSE/ -->

## License

Licensed under the incredibly [permissive](http://en.wikipedia.org/wiki/Permissive_free_software_licence) [MIT license](http://creativecommons.org/licenses/MIT/)

Copyright &copy; 2013+ Bevry Pty Ltd <us@bevry.me> (http://bevry.me)
<br/>Copyright &copy; 2011-2012 Benjamin Lupton <b@lupton.cc> (http://balupton.com)

<!-- /LICENSE -->


