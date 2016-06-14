var src = './';
var dist = '../src/static_collected';

module.exports = {
    clean: {
        src: [
            dist + '/index_react.html',
            dist + '/css',
            dist + '/images',
            dist + '/js']
    },
    html: {
        src: src + '/index_react.html',
        dest: dist
    },
    images: {
        src: src + '/images/**/*',
        dest: dist + '/images'
    },
    sass: {
        src: src + '/sass/**/*.scss',
        dest: dist + '/css',
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
        dest: dist + '/js/'
    }
};
