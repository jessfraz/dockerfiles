var tsb = require('gulp-tsb'),
	gulp = require('gulp'),
	path = require('path');

var ROOT_FOLDER = __dirname;

function globPattern(workingDir) {
	return [
		workingDir + '/**/*.ts',
		path.join(ROOT_FOLDER, '../client/vs/monaco.d.ts'),
		path.join(ROOT_FOLDER, 'declares.d.ts'),
		path.join(ROOT_FOLDER, 'node.d.ts'),
	];
}

/**
 * Register two gulp pair tasks, one for compile and one for compile-watch and return their names.
 * @param opts Options. {`taskSuffix`, `dir`}
 * @return The names of the two tasks {compile, watch}
 */
var registerTasks = exports.registerTasks = function (opts) {
	// create and keep compiler
	var compilation = tsb.create({
		target: 'es5',
		module: 'amd',
		declaration: false
	});
	
	var compileTaskName = 'compile' + (opts.taskSuffix || '');
	var watchTaskName = 'compile-watch' + (opts.taskSuffix || '');
	
	gulp.task(compileTaskName, function () {
		var workingDir = path.resolve(path.join(ROOT_FOLDER, opts.dir));

		var src = gulp.src(globPattern(workingDir), { base: workingDir });

		return src
			.pipe(compilation()) // <- new compilation
			.pipe(gulp.dest(''));
	});

	// This is not currently used
	gulp.task(watchTaskName, [compileTaskName], function () {
		var workingDir = path.resolve(path.join(ROOT_FOLDER, opts.dir));

		gulp.watch(globPattern(workingDir), [compileTaskName]);
	});
	
	return {
		compile: compileTaskName,
		watch: watchTaskName
	};
}

var shouldRegisterGulpTasks = !process.env['DONT_REGISTER_GULP_TASKS'];

if (shouldRegisterGulpTasks) {
	
	registerTasks({
		dir: extractDirArg()
	})
	
	function extractDirArg() {
		for (var i = 0; i < process.argv.length; i++) {
			if (process.argv[i] === '--dir') {
				if (i + 1 < process.argv.length) {
					return process.argv[i + 1];
				}
			}
		}
		return '.';
	}
}

