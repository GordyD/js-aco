var _ = require('lodash');

var gulp = require('gulp');
var gutil = require('gulp-util');
var sourcemaps = require('gulp-sourcemaps');

var babelify = require('babelify');
var browserify = require('browserify');
var watchify = require('watchify');

var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');

var opts = _.assign({}, watchify.args, {
  entries: './client/js/app.es6',
  debug: true
});

var wb = watchify(browserify(opts).transform(babelify));

function bundle() {
  return wb
    .bundle()
    .on('error', gutil.log.bind(gutil, 'Browserify Error'))
    .pipe(source('main.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: false}))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./dist/js'));
}

gulp.task('default', bundle);
wb.on('update', bundle);
wb.on('log', gutil.log);