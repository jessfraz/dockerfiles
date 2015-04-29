# micromatch [![NPM version](https://badge.fury.io/js/micromatch.svg)](http://badge.fury.io/js/micromatch)  [![Build Status](https://travis-ci.org/jonschlinkert/micromatch.svg)](https://travis-ci.org/jonschlinkert/micromatch) 

> Glob matching for javascript/node.js. A drop-in replacement and faster alternative to minimatch and multimatch. Just use `micromatch.isMatch()` instead of `minimatch()`, or use `micromatch()` instead of `multimatch()`.

## Features

Micromatch is [10-55x faster](#benchmarks) than [minimatch], resulting from a combination of caching, tokenization, parsing, runtime compilation and regex optimization strategies.

- [Drop-in replacement][switch] for [minimatch] and [multimatch]
- Built-in support for multiple glob patterns, like `['foo/*.js', '!bar.js']`
- Better support for the Bash 4.3 specification, and less buggy
- Extensive [unit tests](./test) (approx. 1,300 tests). Minimatch fails many of the tests.

**Supports**

Mainstream glob features:

 + [Brace Expansion][braces] (`foo/bar-{1..5}.md`, `one/{two,three}/four.md`)
 + Typical glob patterns, like `**/*`, `a/b/*.js`, or `['foo/*.js', '!bar.js']`

Extended globbing features:

 + Logical `OR` (`foo/bar/(abc|xyz).js`)
 + Regex character classes (`foo/bar/baz-[1-5].js`)
 + POSIX bracket expressions (`**/[[:alpha:][:digit:]]/`)
 + extglobs (`**/+(x|y)`, `!(a|b)`, etc)

You can combine these to create whatever matching patterns you need.

## Install with [npm](npmjs.org)

```bash
npm i micromatch --save
```

## Usage

```js
var mm = require('micromatch');
mm(array, patterns);
```

**Examples**

```js
mm(['a.js', 'b.md', 'c.txt'], '*.{js,txt}');
//=> ['a.js', 'c.txt']
```

**Multiple patterns**

Multiple patterns can also be passed:

```js
mm(['a.md', 'b.js', 'c.txt', 'd.json'], ['*.md', '*.txt']);
//=> ['a.md', 'c.txt']
```

**Negation patterns:**

```js
mm(['a.js', 'b.md', 'c.txt'], '!*.{js,txt}');
//=> ['b.md']

mm(['a.md', 'b.js', 'c.txt', 'd.json'], ['*.*', '!*.{js,txt}']);
//=> ['a.md', 'd.json']
```

## Switch from minimatch

> Use `micromatch.isMatch()` instead of `minimatch()`

**Minimatch**

The main `minimatch()` function returns true/false for a single file path and pattern:

```js
var minimatch = require('minimatch');
minimatch('foo.js', '*.js');
//=> 'true'
```

**Micromatch**

Use `.isMatch()` to get the same result:


```js
var mm = require('micromatch');
mm.isMatch('foo.js', '*.js');
//=> 'true'
```

This implementation difference is necessary since the main `micromatch()` method supports matching on multiple globs, with behavior similar to [multimatch].


## Methods

```js
var mm = require('micromatch');
```

### .isMatch

```js
mm.isMatch(filepath, globPattern);
```

Returns true if a file path matches the given glob pattern.


**Example**

```js
mm.isMatch('.verb.md', '*.md');
//=> false

mm.isMatch('.verb.md', '*.md', {dot: true});
//=> true
```

### .contains

Returns true if any part of a file path matches the given glob pattern. Think of this is "has path" versus "is path".

**Example**

`.isMatch()` would return false for both of the following:

```js
mm.contains('a/b/c', 'a/b');
//=> true

mm.contains('a/b/c', 'a/*');
//=> true
```

### .matcher

Returns a function for matching using the supplied pattern. e.g. create your own "matcher". The advantage of this method is that the pattern can be compiled outside of a loop.

**Pattern**

Can be any of the following:

- `glob/string`
- `regex`
- `function`

**Example**

```js
var isMatch = mm.matcher('*.md');
var files = [];

['a.md', 'b.txt', 'c.md'].forEach(function(fp) {
  if (isMatch(fp)) {
    files.push(fp);
  }
});
```

### .filter

Returns a function that can be passed to `Array#filter()`. 

**Params**

- `patterns` **{String|Array}**: 

**Examples**

Single glob:

```js
var fn = mm.filter('*.md');
['a.js', 'b.txt', 'c.md'].filter(fn);
//=> ['c.md']

var fn = mm.filter('[a-c]');
['a', 'b', 'c', 'd', 'e'].filter(fn);
//=> ['a', 'b', 'c']
```

Array of glob patterns:

```js
var arr = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15];

var fn = mm.filter(['{1..10}', '![7-9]', '!{3..4}']);
arr.filter(fn);
//=> [1, 2, 5, 6, 10]
```

_(Internally this function generates the matching function by using the [matcher] method. You can use the [matcher] method directly to create your own filter function)_


### .any

Returns true if a file path matches any of the given patterns.

```js
mm.any(filepath, patterns, options);
```

**Params**

- filepath `{String}`: The file path to test.
- patterns `{String|Array}`: One or more glob patterns
- options: `{Object}`: options to pass to the `.matcher()` method.


**Example**

```js
mm.any('abc', ['!*z']);
//=> true
mm.any('abc', ['a*', 'z*']);
//=> true
mm.any('abc', 'a*');
//=> true
mm.any('abc', ['z*']);
//=> false
```


### .expand

Returns an object with a regex-compatible string and tokens.

```js
mm.expand('*.js');

// when `track` is enabled (for debugging), the `history` array is used
// to record each mutation to the glob pattern as it's converted to regex
{ options: { track: false, dot: undefined, makeRe: true, negated: false },
  pattern: '(.*\\/|^)bar\\/(?:(?!(?:^|\\/)\\.).)*?',
  history: [],
  tokens:
   { path:
      { whole: '**/bar/**',
        dirname: '**/bar/',
        filename: '**',
        basename: '**',
        extname: '',
        ext: '' },
     is:
      { glob: true,
        negated: false,
        globstar: true,
        dotfile: false,
        dotdir: false },
     match: {},
     original: '**/bar/**',
     pattern: '**/bar/**',
     base: '' } }
```

### .makeRe

Create a regular expression for matching file paths based on the given pattern:

```js
mm.makeRe('*.js');
//=> /^(?:(?!\.)(?=.)[^/]*?\.js)$/
```

## Options

All options should work the same way as [minimatch].

### options.dot

Match dotfiles.

Type: `{Boolean}`

Default: `false`


### options.matchBase

Allow glob patterns without slashes to match a file path based on its basename.

Type: `{Boolean}`

Default: `false`

**Example**

```js
mm(['a/b.js', 'a/c.md'], '*.js');
//=> []

mm(['a/b.js', 'a/c.md'], '*.js', {matchBase: true});
//=> ['a/b.js']
```

### options.nobraces

Don't expand braces in glob patterns.

Type: `{Boolean}`

Default: `false`


### options.nocase

Use a case-insensitive regex for matching files.

Type: `{Boolean}`

Default: `false`


### options.nonull

If `true`, when no matches are found the actual (array-ified) glob pattern is returned instead of an empty array.

Type: `{Boolean}`

Default: `false`


### options.cache

Cache the platform (e.g. `win32`) to prevent this from being looked up for every fil.

Type: `{Boolean}`

Default: `true`


## Other features

Micromatch also supports the following.

### Extended globbing

Extended globbing as described by the bash man page:

| **pattern** | **regex equivalent** | **description** |
| --- | --- | --- |
| `?(pattern-list)` | `(...|...)?` |  Matches zero or one occurrence of the given patterns |
| `*(pattern-list)` | `(...|...)*` |  Matches zero or more occurrences of the given patterns |
| `+(pattern-list)` | `(...|...)+` |  Matches one or more occurrences of the given patterns |
| `@(pattern-list)` | `(...|...)` <sup>*</sup> |  Matches one of the given patterns |
| `!(pattern-list)` | N/A |  Matches anything except one of the given patterns |

<sup><strong>*</strong></sup> `@` isn't a RegEx character.


### Brace Expansion

In simple cases, brace expansion appears to work the same way as the logical `OR` operator. For example, `(a|b)` will achieve the same result as `{a,b}`.

Here are some powerful features unique to brace expansion (versus character classes):

 - range expansion: `a{1..3}b/*.js` expands to: `['a1b/*.js', 'a2b/*.js', 'a3b/*.js']`
 - nesting: `a{c,{d,e}}b/*.js` expands to: `['acb/*.js', 'adb/*.js', 'aeb/*.js']`


Learn about [brace expansion][braces], or visit [braces][braces] to ask questions and create an issue related to brace-expansion, or to see the full range of features and options related to brace expansion.


### Regex character classes

With the exception of brace expansion (`{a,b}`, `{1..5}`, etc), most of the special characters convert directly to regex, so you can expect them to follow the same rules and produce the same results as regex.

For example, given the list: `['a.js', 'b.js', 'c.js', 'd.js', 'E.js']`:

 - `[ac].js`: matches both `a` and `c`, returning `['a.js', 'c.js']`
 - `[b-d].js`: matches from `b` to `d`, returning `['b.js', 'c.js', 'd.js']`
 - `[b-d].js`: matches from `b` to `d`, returning `['b.js', 'c.js', 'd.js']`
 - `a/[A-Z].js`: matches and uppercase letter, returning `['a/E.md']`

Learn about [regex character classes][character-classes].

### Regex groups

Given `['a.js', 'b.js', 'c.js', 'd.js', 'E.js']`:

 - `(a|c).js`: would match either `a` or `c`, returning `['a.js', 'c.js']`
 - `(b|d).js`: would match either `b` or `d`, returning `['b.js', 'd.js']`
 - `(b|[A-Z]).js`: would match either `b` or an uppercase letter, returning `['b.js', 'E.js']`

As with regex, parenthese can be nested, so patterns like `((a|b)|c)/b` will work. But it might be easier to achieve your goal using brace expansion.

## Notes

Whenever possible parsing behavior for patterns is based on globbing specifications in Bash 4.3. Patterns that aren't described by Bash follow wildmatch spec (used by git).


## Benchmarks

Run the [benchmarks](./benchmark):

```bash
npm run benchmark
```

As of March 27, 2015:

```bash
#1: basename-braces
  micromatch x 27,734 ops/sec ±0.75% (93 runs sampled)
  minimatch x 3,409 ops/sec ±0.77% (97 runs sampled)

#2: basename
  micromatch x 26,727 ops/sec ±0.81% (97 runs sampled)
  minimatch x 4,122 ops/sec ±0.77% (97 runs sampled)

#3: braces-no-glob
  micromatch x 324,367 ops/sec ±0.62% (95 runs sampled)
  minimatch x 29,682 ops/sec ±0.71% (94 runs sampled)

#4: braces
  micromatch x 63,430 ops/sec ±1.14% (95 runs sampled)
  minimatch x 2,749 ops/sec ±0.77% (97 runs sampled)

#5: immediate
  micromatch x 21,842 ops/sec ±0.66% (98 runs sampled)
  minimatch x 3,638 ops/sec ±0.66% (97 runs sampled)

#6: large
  micromatch x 802 ops/sec ±0.58% (96 runs sampled)
  minimatch x 15.72 ops/sec ±1.25% (42 runs sampled)

#7: long
  micromatch x 8,061 ops/sec ±0.69% (96 runs sampled)
  minimatch x 560 ops/sec ±0.71% (90 runs sampled)

#8: mid
  micromatch x 67,972 ops/sec ±0.78% (93 runs sampled)
  minimatch x 1,745 ops/sec ±0.87% (96 runs sampled)

#9: multi-patterns
  micromatch x 25,136 ops/sec ±0.87% (95 runs sampled)
  minimatch x 1,986 ops/sec ±1.03% (95 runs sampled)

#10: no-glob
  micromatch x 1,062,274 ops/sec ±0.90% (94 runs sampled)
  minimatch x 53,150 ops/sec ±0.85% (96 runs sampled)

#11: range
  micromatch x 270,918 ops/sec ±0.75% (97 runs sampled)
  minimatch x 13,548 ops/sec ±0.85% (96 runs sampled)

#12: shallow
  micromatch x 198,022 ops/sec ±0.80% (97 runs sampled)
  minimatch x 20,093 ops/sec ±0.62% (95 runs sampled)

#13: short
  micromatch x 440,230 ops/sec ±0.84% (97 runs sampled)
  minimatch x 58,116 ops/sec ±0.74% (92 runs sampled)

```

## Run tests
Install dev dependencies:

```bash
npm i -d && npm test
```

## Contributing
Pull requests and stars are always welcome. For bugs and feature requests, [please create an issue](https://github.com/jonschlinkert/micromatch/issues)

Please be sure to run the benchmarks before/after any code changes to judge the impact before you do a PR. thanks!

## Related 
 * [braces](https://github.com/jonschlinkert/braces): Fastest brace expansion for node.js, with the most complete support for the Bash 4.3 braces specification.
 * [fill-range](https://github.com/jonschlinkert/fill-range): Fill in a range of numbers or letters, optionally passing an increment or multiplier to use.
 * [expand-range](https://github.com/jonschlinkert/expand-range): Fast, bash-like range expansion. Expand a range of numbers or letters, uppercase or lowercase. See the benchmarks. Used by micromatch.
 * [parse-glob](https://github.com/jonschlinkert/parse-glob): Parse a glob pattern into an object of tokens.
 * [is-glob](https://github.com/jonschlinkert/is-glob): Returns `true` if the given string looks like a glob pattern.

## Author

**Jon Schlinkert**
 
+ [github/jonschlinkert](https://github.com/jonschlinkert)
+ [twitter/jonschlinkert](http://twitter.com/jonschlinkert) 

## License
Copyright (c) 2014-2015 Jon Schlinkert  
Released under the MIT license

***

_This file was generated by [verb-cli](https://github.com/assemble/verb-cli) on March 27, 2015._

[switch]: #switch-from-minimatch
[multimatch]: https://github.com/sindresorhus/multimatch
[minimatch]: https://github.com/isaacs/minimatch
[brace expansion]: https://github.com/jonschlinkert/braces
[braces]: https://github.com/jonschlinkert/braces
[bracket expressions]: https://github.com/jonschlinkert/expand-brackets
[character-classes]: http://www.regular-expressions.info/charclass.html
[expand]: https://github.com/jonschlinkert/micromatch#expand
[extended]: http://mywiki.wooledge.org/BashGuide/Patterns#Extended_Globs
[extglobs]: https://github.com/jonschlinkert/extglob
<!-- deps:mocha browserify -->
