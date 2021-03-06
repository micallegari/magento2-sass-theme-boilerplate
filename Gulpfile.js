var gulp        = require('gulp');
var plumber     = require('gulp-plumber');
var concat      = require('gulp-concat');
var sass        = require('gulp-sass');
var browserSync = require('browser-sync').create();

var scripts = [
    'src/js/script.js'
];

var npmDependencies = {

};

var config = {

    browserSyncProxy: 'magento2-boilerplate.test'

};

function unicodeEscape(str) {
    for (var result = '', index = 0, charCode; !isNaN(charCode = str.charCodeAt(index));) {
        var x = str[index];
        if (x.match(new RegExp('[^a-z0-9,\._]'))) {
            result += '\\u' + ('0000' + charCode.toString(16)).slice(-4).toUpperCase();
        } else {
            result += x;
        }
        index++;
    }
    return result;
}

gulp.task('watch', function() {
    var regexProxyHttp = unicodeEscape('http://' + config.browserSyncProxy).replace(new RegExp('\\\\', 'g'), '\\\\');
    var regexProxy = unicodeEscape(config.browserSyncProxy).replace(new RegExp('\\\\', 'g'), '\\\\');
    browserSync.init({
        proxy: config.browserSyncProxy,
        "rewriteRules": [
            {
                match: new RegExp(regexProxyHttp, 'g'),
                fn: () => ''
            },
            {
                match: new RegExp('\\\.' + regexProxy, 'gi'),
                fn: () => ''
            }
        ]
    });
    gulp.watch("src/scss/**/*.scss", gulp.series('sass'));
    gulp.watch(scripts, gulp.series('scripts'));
    gulp.watch("**/*.phtml").on('change', browserSync.reload);
});

gulp.task('scripts', function() {
    var stream = gulp.src(scripts)
        .pipe(concat('scripts.js'));
    return stream
        .pipe(gulp.dest('web/js'))
        .pipe(browserSync.stream());
});

gulp.task('script-deps', function() {
    return new Promise(function (resolve) {
        for (var src in npmDependencies) {
            gulp.src(src)
                .pipe(gulp.dest('web/js/deps/' + npmDependencies[src]));
        }
        resolve();
    })
});

gulp.task('reload-js', function() {
    browserSync.reload();
});

gulp.task('sass', function() {
    return gulp.src("src/scss/style.scss")
        .pipe(plumber())
        .pipe(sass({
            errLogToConsole: true
        }))
        .pipe(gulp.dest('web/css'))
        .pipe(browserSync.stream());
});

gulp.task('build', gulp.series('sass', 'script-deps', 'scripts'));

gulp.task('default', gulp.series('build'));
