var gulp         = require('gulp');
var plumber      = require('gulp-plumber');
var browsersync  = require('browser-sync');
var sass         = require('gulp-ruby-sass');
var gulpFilter   = require('gulp-filter');
var autoprefixer = require('gulp-autoprefixer');
var sourcemaps   = require('gulp-sourcemaps');
var concat   = require('gulp-concat');
var config       = require('../../config');

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
        .on('error', sass.logError)
        // for inline sourcemaps
        .pipe(sourcemaps.write())
        // for file sourcemaps
        .pipe(sourcemaps.write('maps', {
            includeContent: false,
            sourceRoot: 'source'
        }))
        .pipe(concat('app.css'))
        .pipe(gulp.dest(config.sass.dest))
});
