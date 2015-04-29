# Chokidar [![Mac/Linux Build Status](https://img.shields.io/travis/paulmillr/chokidar/master.svg?label=Mac%20OSX%20%26%20Linux)](https://travis-ci.org/paulmillr/chokidar) [![Windows Build status](https://img.shields.io/appveyor/ci/es128/chokidar/master.svg?label=Windows)](https://ci.appveyor.com/project/es128/chokidar/branch/master) [![Coverage Status](https://coveralls.io/repos/paulmillr/chokidar/badge.svg)](https://coveralls.io/r/paulmillr/chokidar)
A neat wrapper around node.js fs.watch / fs.watchFile / fsevents.

[![NPM](https://nodei.co/npm-dl/chokidar.png)](https://nodei.co/npm/chokidar/)
[![NPM](https://nodei.co/npm/chokidar.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/chokidar/)

#### [See what's new in v1.0](https://github.com/paulmillr/chokidar/blob/master/CHANGELOG.md#chokidar-100-7-april-2015)

## Why?
Node.js `fs.watch`:

* Doesn't report filenames on OS X.
* Doesn't report events at all when using editors like Sublime on OS X.
* Often reports events twice.
* Emits most changes as `rename`.
* Has [a lot of other issues](https://github.com/joyent/node/search?q=fs.watch&type=Issues)
* Does not provide an easy way to recursively watch file trees.

Node.js `fs.watchFile`:

* Almost as bad at event handling.
* Also does not provide any recursive watching.
* Results in high CPU utilization.

Other node.js watching libraries:

* Are not using ultra-fast non-polling fsevents watcher implementation on OS X

Chokidar resolves these problems.

It is used in
[brunch](http://brunch.io),
[karma](http://karma-runner.github.io),
[PM2](https://github.com/Unitech/PM2),
[socketstream](http://www.socketstream.org),
[derby](http://derbyjs.com/),
[watchify](https://github.com/substack/watchify),
and [many others](https://www.npmjs.org/browse/depended/chokidar/).
It has proven itself in production environments.

## Getting started
Install chokidar via node.js package manager:

    npm install chokidar

Then just require the package in your code:

```javascript
var chokidar = require('chokidar');

// One-liner for current directory, ignores .dotfiles
chokidar.watch('.', {ignored: /[\/\\]\./}).on('all', function(event, path) {
  console.log(event, path);
});



var watcher = chokidar.watch('file, dir, or glob', {
  ignored: /[\/\\]\./,
  persistent: true
});

var log = console.log.bind(console);

watcher
  .on('add', function(path) { log('File', path, 'has been added'); })
  .on('change', function(path) { log('File', path, 'has been changed'); })
  .on('unlink', function(path) { log('File', path, 'has been removed'); })
  // More events.
  .on('addDir', function(path) { log('Directory', path, 'has been added'); })
  .on('unlinkDir', function(path) { log('Directory', path, 'has been removed'); })
  .on('error', function(error) { log('Error happened', error); })
  .on('ready', function() { log('Initial scan complete. Ready for changes.'); })
  .on('raw', function(event, path, details) { log('Raw event info:', event, path, details); })

// 'add', 'addDir' and 'change' events also receive stat() results as second
// argument when available: http://nodejs.org/api/fs.html#fs_class_fs_stats
watcher.on('change', function(path, stats) {
  if (stats) console.log('File', path, 'changed size to', stats.size);
});

// Watch new files.
watcher.add('new-file');
watcher.add(['new-file-2', 'new-file-3', '**/other-file*']);

// Un-watch some files.
watcher.unwatch('new-file*');

// Only needed if watching is `persistent: true`.
watcher.close();

// Full list of options. See below for descriptions.
chokidar.watch('file', {
  persistent: true,

  ignored: '*.txt',
  ignoreInitial: false,
  followSymlinks: true,
  cwd: '.',

  usePolling: true,
  alwaysStat: false,
  depth: undefined,
  interval: 100,

  ignorePermissionErrors: false,
  atomic: true
});

```

## API

`chokidar.watch(paths, options)` — takes one or more paths (which may be paths to files,
  dirs to be watched recursively, or glob patterns) and options:

#### Persistence

* `persistent` (default: `true`). Indicates whether the process
should continue to run as long as files are being watched. If set to
`false` when using `fsevents` to watch, no more events will be emitted
after `ready`, even if the process continues to run.

#### Path filtering

* `ignored` ([anymatch](https://github.com/es128/anymatch)-compatible definition)
Defines files/paths to be ignored. The whole relative or absolute path is
tested, not just filename. If a function with two arguments is provided, it
gets called twice per path - once with a single argument (the path), second
time with two arguments (the path and the
[`fs.Stats`](http://nodejs.org/api/fs.html#fs_class_fs_stats)
object of that path).
* `ignoreInitial` (default: `false`). Indicates whether chokidar
should ignore the initial `add` events or not.
* `followSymlinks` (default: `true`). When `false`, only the
symlinks themselves will be watched for changes instead of following
the link references and bubbling events through the link's path.
* `cwd` (no default). The base directory from which watch `paths` are to be
derived. Paths emitted with events will be relative to this.

#### Performance

* `usePolling` (default: `false`).
Whether to use fs.watchFile (backed by polling), or fs.watch. If polling
leads to high CPU utilization, consider setting this to `false`. It is
typically necessary to **set this to `true` to successfully watch files over
a network**, and it may be necessary to successfully watch files in other
non-standard situations. Setting to `true` explicitly on OS X overrides the
`useFsEvents` default.
* `useFsEvents` (default: `true` on OS X). Whether to use the
`fsevents` watching interface if available. When set to `true` explicitly
and `fsevents` is available this supercedes the `usePolling` setting. When
set to `false` on OS X, `usePolling: true` becomes the default.
* `alwaysStat` (default: `false`). If relying upon the
[`fs.Stats`](http://nodejs.org/api/fs.html#fs_class_fs_stats)
object that may get passed with `add`, `addDir`, and `change` events, set
this to `true` to ensure it is provided even in cases where it wasn't
already available from the underlying watch events.
* `depth` (default: `undefined`). If set, limits how many levels of
subdirectories will be traversed.
* _Polling-specific settings_ (effective when `usePolling: true`)
  * `interval` (default: `100`). Interval of file system polling.
  * `binaryInterval` (default: `300`). Interval of file system
  polling for binary files.
  ([see list of binary extensions](https://github.com/sindresorhus/binary-extensions/blob/master/binary-extensions.json))

#### Errors
* `ignorePermissionErrors` (default: `false`). Indicates whether to watch files
that don't have read permissions if possible. If watching fails due to `EPERM`
or `EACCES` with this set to `true`, the errors will be suppressed silently.
* `atomic` (default: `true` if `useFsEvents` and `usePolling` are `false`).
Automatically filters out artifacts that occur when using editors that use
"atomic writes" instead of writing directly to the source file.

### Methods & Events

`chokidar.watch()` produces an instance of `FSWatcher`. Methods of `FSWatcher`:

* `.add(path / paths)`: Add files, directories, or glob patterns for tracking.
Takes an array of strings or just one string.
* `.on(event, callback)`: Listen for an FS event.
Available events: `add`, `addDir`, `change`, `unlink`, `unlinkDir`, `ready`, `raw`, `error`.
Additionally `all` is available which gets emitted with the underlying event name
and path for every event other than `ready`, `raw`, and `error`.
* `.unwatch(path / paths)`: Stop watching files, directories, or glob patterns.
Takes an array of strings or just one string.
* `.close()`: Removes all listeners from watched files.

## Install Troubleshooting

* `npm WARN optional dep failed, continuing fsevents@n.n.n`
  * This message is normal part of how `npm` handles optional dependencies and is
    not indicative of a problem. Even if accompanied by other related error messages,
    Chokidar should function properly.

* `ERR! stack Error: Python executable "python" is v3.4.1, which is not supported by gyp.`
  * You should be able to resolve this by installing python 2.7 and running:
    `npm config set python python2.7`

* `gyp ERR! stack Error: not found: make`
  * On Mac, install the XCode command-line tools

## License
The MIT license.

Copyright (c) 2012 - 2015 Paul Miller (http://paulmillr.com) & Elan Shanker

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
