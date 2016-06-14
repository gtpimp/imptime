var gulp = require('gulp');
var del = require('del');
var config = require('../../config').clean;

gulp.task('clean', function (callback) {
    return del(config.src, {force: true}, callback);
});
