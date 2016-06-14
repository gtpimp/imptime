var gulp = require('gulp');

var runSequence = require('run-sequence');

gulp.task('dev', function (callback) {
    runSequence(
        'build',
        'watch',
        callback);
});
