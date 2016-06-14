var _ = require('underscore');
var config = require('../../config').webpack;
var gulp = require('gulp');
var webpack = require('webpack-stream');
var webpackConfig = require(config.configFile);
var webpackWatchConfig = _.extendOwn({}, webpackConfig, { watch: true });

gulp.task('webpack', function() {
    return gulp.src(config.src)
        .pipe(webpack(webpackConfig))
        .pipe(gulp.dest(config.dest));
});

gulp.task('webpack:watch', function() {
    return gulp.src(config.src)
        .pipe(webpack(webpackWatchConfig))
        .pipe(gulp.dest(config.dest));
});