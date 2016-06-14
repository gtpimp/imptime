var config = require('../../config');
var gulp = require('gulp');

gulp.task('watch', function () {
    gulp.watch(config.watch.html, ['html']);
    gulp.watch(config.watch.images, ['images']);
    gulp.watch(config.watch.sass, ['sass']);
    //gulp.watch(config.watch.webpack, ['webpack:watch']);
});
