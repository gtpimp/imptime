var src = './';
var static_dist = '../src/imptime/static/';
var html_dist = '../src/imptime/templates/imptime';

module.exports = {
    clean: {
        src: [
            html_dist + '/index_react.html',
            static_dist + '/css',
            static_dist + '/images',
            static_dist + '/js']
    },
    html: {
        src: src + '/index_react.html',
        dest: html_dist
    },
    images: {
        src: src + '/images/**/*',
        dest: static_dist + '/images'
    },
    sass: {
        src: src + '/sass/**/*.scss',
        dest: static_dist + '/css',
        options: {
            noCache: true,
            compass: false,
            bundleExec: true,
            sourcemapPath: '../sass'
        }
    },
    watch: {
        html: src + '/**/*.html',
        webpack: src + '/**/*.js',
        sass: src + '/sass/**/*.scss',
        images: src + '/images/**/*.png'
    },
    webpack: {
        configFile: '../../../webpack.config.js',
        src: src + '/index_react.js',
        dest: static_dist + '/js/'
    }
};
