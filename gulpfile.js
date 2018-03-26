const gulp = require('gulp');
const log = require('fancy-log');
const intercept = require('gulp-intercept');
const concat = require('gulp-concat');
const jeditor = require('gulp-json-editor');
const bump = require('gulp-bump');
const webpack_stream = require('webpack-stream');
const webpack_config = require('./webpack.config.js');
const run = require('gulp-run');

// dependencies for npm publishing
const npmDeps = {
	'prop-types': '^15.6.0',
	react: '16.2.0',
	'react-dom': '^16.2.0',
	'render-if': '^0.1.1',
	util: '^0.10.3'
};
// additional dependencies for expo app
const expoDeps = {
	expo: '^25.0.0',
	'prop-types': '^15.6.0',
	react: '16.2.0',
	'react-dom': '^16.2.0',
	'react-native': 'https://github.com/expo/react-native/archive/sdk-25.0.0.tar.gz',
	'render-if': '^0.1.1',
	util: '^0.10.3'
};

// main for npm publishing
const npmMain = 'index.js';
// main for expo app
const expoMain = 'node_modules/expo/AppEntry.js';

const paths = {
	src: './Scripts/',
	build: './dist/'
};

/****package.json stuff****/
gulp.task('test', function() {
	console.log('Hello');
});

const updatePackageJSONforNPM = (json) => {};
// read the package.json and update it for npm publishing
gulp.task('forNPM', (done) => {
	gulp
    .src('./package.json')
    .pipe(bump())
		.pipe(
			jeditor(function(json) {
				json.dependencies = npmDeps;
				json.main = npmMain;
				return json;
			})
		)
		.pipe(concat('package.json'))
		.pipe(gulp.dest('./'));
	done();
});

// read and bump the package version in config.js so that it
// matches the version number about to be published
gulp.task('editConfigForProd', (done) => {
	gulp.src('./config.js').pipe(bump({ key: 'PACKAGE_VERSION' })).pipe(concat('config.js')).pipe(gulp.dest('./'));
	done();
});

// pack the files
gulp.task('webpack', (done) => {
	return run('webpack').exec();
	done();
});

gulp.task('npm-publish', (done) => {
	return run('npm publish').exec();
	done();
});

gulp.task('npm-publish-beta', (done) => {
	return run('npm publish --tag beta').exec();
	done();
});

gulp.task('git-add', (done) => {
	return run('git add .').exec();
	done();
});

gulp.task('git-commit', (done) => {
	return run('git commit -m "publishing"').exec();

	done();
});

gulp.task('git-push', (done) => {
	return run('git push origin master').exec();
	done();
});

gulp.task('git-push-inline-javascript-3', (done) => {
	return run('git push origin inline-javascript-3').exec();
	done();
});

gulp.task('forExpo', (done) => {
	gulp
		.src('./package.json')
		.pipe(
			jeditor({
				dependencies: expoDeps,
				main: expoMain
			})
		)
		.pipe(concat('package.json'))
		.pipe(gulp.dest('./'));
	done();
});

gulp.task(
	'prod',
	gulp.series(
		'forNPM',
		'webpack',
		gulp.parallel(gulp.series('git-add', 'git-commit', 'git-push'), 'npm-publish'),
		'forExpo'
	)
);

gulp.task(
	'beta',
	gulp.series(
		'forNPM',
		'webpack',
		gulp.parallel(gulp.series('git-add', 'git-commit', 'git-push-inline-javascript-3'), 'npm-publish-beta'),
		'forExpo'
	)
);

// read and bump the package version in config.js so that it
// matches the version number about to be published
gulp.task('editConfigForDev', (done) => {
	gulp
		.src('./config.js')
		.pipe(bump({ key: 'PACKAGE_VERSION' }))
		.pipe(
			jeditor(function(json) {
				USE_LOCAL_FILES: true;
				return json;
			})
		)
		.pipe(concat('config.js'))
		.pipe(gulp.dest('./'));
	done();
});

gulp.task(
	'test',
	gulp.series(
		'forNPM',
		'editConfigForProd',
		'webpack',
		gulp.parallel(gulp.series('git-add', 'git-commit', 'git-push'), 'npm-publish'),
		'forExpo'
	)
);
