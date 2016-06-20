var gulp         = require('gulp');
var plumber      = require('gulp-plumber');
var browsersync  = require('browser-sync');
var sass         = require('gulp-ruby-sass');
var gulpFilter   = require('gulp-filter');
var autoprefixer = require('gulp-autoprefixer');
var sourcemaps   = require('gulp-sourcemaps');
var concat   = require('gulp-concat');
var config       = require('../../config');

var onError = function (err) {
  gutil.beep();
  console.log(err);
  this.emit('end');
};


/**
 * Generate CSS from SCSS
 * Build sourcemaps
 */
gulp.task('sass', function() {
    var sassConfig = config.sass.options;

    sassConfig.onError = browsersync.notify;
    sassConfig.bundleExec = false;

    // Don’t write sourcemaps of sourcemaps
    var filter = gulpFilter(['*.css', '!*.map']);

    browsersync.notify('Compiling Sass');

    return sass(config.sass.src, {sourcemap: true})
        .pipe(plumber({errorHandler: onError}))
        // .on('error', sass.logError)
        .pipe(sourcemaps.write())
        .pipe(sourcemaps.write('maps', {
            includeContent: false,
            sourceRoot: 'source'
        }))
        .pipe(concat('imptime.css'))
        .pipe(gulp.dest(config.sass.dest))
});
