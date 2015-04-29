var path = require('path');
var gulp = require('gulp');
var uglify = require('gulp-uglify');
var streamify = require('gulp-streamify');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var through = require('through2');
var rename = require('gulp-rename');

var ciu = require('./lib/assets/caniuse');
var DEST = './dist';

function ciuWrapper() {
	var buf = new Buffer('');
	return through(function(chunk, enc, next) {
		buf += chunk;
		next();
	}, function(next) {
		var db = JSON.parse(buf.toString());
		this.push(JSON.stringify(ciu.optimize(db)));
		next();
	});
}

function bundle() {
	var files = ['./lib/emmet.js'];
	for (var i = 0, il = arguments.length; i < il; i++) {
		files.push(arguments[i]);
	}

	return browserify({
		entries: files,
		detectGlobals: false,
		standalone: 'emmet',
		fullPaths: true
	})
	.transform(function(file) {
		if (path.basename(file) === 'caniuse.json') {
			return ciuWrapper();
		}
		return through();
	})
	.bundle()
	.pipe(trimPath(path.join(__dirname, 'lib/')));
}

function escapeRegExp(str) {
	return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
}

function trimPath(base) {
	var buf = new Buffer('');
	var reBase = new RegExp(escapeRegExp(base), 'g');
	return through(function(chunk, enc, next) {
		buf += chunk;
		next();
	}, function(next) {
		this.push(buf.toString().replace(reBase, ''));
		next();
	});
}

// "App" version of Emmet: does not include snippets.json and caniuse.json,
// assuming that it should be loaded by app controller 
gulp.task('app', function() {
	return bundle()
		.pipe(source('emmet-app.js'))
		.pipe(gulp.dest(DEST));
});

// Reduced version of Emmet, contains snippets, no Can I Use database 
gulp.task('snippets', function() {
	return bundle('./bundles/snippets.js')
		.pipe(source('emmet-snippets.js'))
		.pipe(gulp.dest(DEST))
		.pipe(streamify(uglify()))
		.pipe(rename('emmet-snippets-min.js'))
		.pipe(gulp.dest(DEST));
});

// Full version of Emmet
gulp.task('full', function() {
	return bundle('./bundles/snippets.js', './bundles/caniuse.js')
		.pipe(source('emmet.js'))
		.pipe(gulp.dest(DEST))
		.pipe(streamify(uglify()))
		.pipe(rename('emmet-min.js'))
		.pipe(gulp.dest(DEST));
});

gulp.task('default', ['app', 'snippets', 'full']);