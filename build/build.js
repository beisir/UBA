require('./check-version')();

process.env.NODE_ENV = 'production';

var ora = require('ora'),
    path = require('path'),
    utils = require('./utils'),
    chalk = require('chalk'),
    shell = require('shelljs'),
    webpack = require('webpack'),
    config = require('./config')[process.env.NODE_ENV],
    webpackConfig = require('./webpack.prod.conf');

var spinner = ora('building for production...');
spinner.start();

var assetsPath = path.join(config.assetsRoot, config.assetsSubDirectory);

shell.rm('-rf', assetsPath);
shell.mkdir('-p', assetsPath);
shell.config.slient = true;
shell.cp('-R', 'static/*', assetsPath);
shell.config.slient = false;

webpack(webpackConfig, function(err, stats) {
    spinner.stop();

    if (err) {
        throw err;
    }

    process.stdout.write(stats.toString({
        colors: true,
        modules: false,
        children: false,
        chunks: false,
        chunkModules: false
    }) + '\n\n');

    console.log(chalk.cyan('  Build complete.\n'))
    console.log(chalk.yellow(
        '  Tip: built files are meant to be served over an HTTP server.\n' +
        '  Opening index.html over file:// won\'t work.\n'
    ));
});
