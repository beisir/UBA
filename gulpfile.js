var gulp = require('gulp'),
    path = require('path'),
    gulputil = require('gulp-util'),
    rename = require('gulp-rename'),
    ftp = require('vinyl-ftp'),

    /**
     * [uploadPathPrefix 上传文件路径前缀，包含测试路径环境名称，及项目目录名称]
     * @type {String}
     */
    uploadPathPrefix = '/Virgo/Project/dataBase/',

    /**
     * [uploadFullPath 上传文件目录网站路径]
     * @type {[type]}
     */
    uploadFullPath = [path.join(uploadPathPrefix, '/style/js/projects/UBA/'), path.join(uploadPathPrefix, '/styles/js/projects/UBA/')];

/**
 * [文件上传到中转机]
 */
gulp.task('upload', function() {

    /**
     * [conn 创建连接对象]
     * @type {Object}
     */
    var conn_assets = ftp.create({
        host: '192.168.249.2',
        user: 'csftp01',
        password: 'ftp01asd',
        parallel: 10,
        log: gulputil.log
    });

    /**
     * [上传文件到中转机style.org、styles目录]
     */
    uploadFullPath.forEach(function(uploadPath) {

        /**
         * [上传资源文件]
         */
        gulp.src([
                './dist/**/*.js',
                // './dist/**/*.css',
                // './dist/**/*.html'
            ], {
                base: '.',
                buffer: false
            })
            // .pipe(conn_assets.newer(uploadPath)) //注释后，不进行文件对比直接上传
            .pipe(conn_assets.dest(uploadPath));

    });
});

/**
 * [默认上传到测试环境]
 */
gulp.task('default', ['upload']);
