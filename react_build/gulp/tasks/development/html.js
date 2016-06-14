var changed = require('gulp-changed');
var config = require('../../config').html;
var gulp = require('gulp');

gulp.task('html', function () {
    return gulp.src(config.src)
        .pipe(changed(config.dest))
        .pipe(gulp.dest(config.dest));
});
