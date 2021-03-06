require('./check-version')();

process.env.NODE_ENV = 'development';

var opn = require('opn'),
    path = require('path'),
    express = require('express'),
    webpack = require('webpack'),
    proxyMiddleware = require('http-proxy-middleware'),
    config = require('./config')[process.env.NODE_ENV],
    webpackConfig = require('./webpack.dev.conf');

// default port where dev server listens for incoming traffic
var port = config.port,
    // automatically open browser, if not set will be false
    autoOpenBrowser = !!config.autoOpenBrowser,
    // Define HTTP proxies to your custom API backend
    // https://github.com/chimurai/http-proxy-middleware
    proxyTable = config.proxyTable;

var app = express(),

    compiler = webpack(webpackConfig),

    devMiddleware = require('webpack-dev-middleware')(compiler, {
        publicPath: webpackConfig.output.publicPath,
        quiet: true
    }),

    hotMiddleware = require('webpack-hot-middleware')(compiler, {
        log: () => {}
    });

    // force page reload when html-webpack-plugin template changes
    compiler.plugin('compilation', function(compilation) {
        compilation.plugin('html-webpack-plugin-after-emit', function(data, cb) {
            hotMiddleware.publish({ action: 'reload' });
            cb();
        });
    });

// proxy api requests
Object.keys(proxyTable).forEach(function(context) {
    var options = proxyTable[context];
    if (typeof options === 'string') {
        options = { target: options };
    }
    app.use(proxyMiddleware(options.filter || context, options));
});

// handle fallback for HTML5 history API
app.use(require('connect-history-api-fallback')());

// serve webpack bundle output
app.use(devMiddleware);

// enable hot-reload and state-preserving
// compilation error display
app.use(hotMiddleware);

// serve pure static assets
var staticPath = path.posix.join(config.assetsPublicPath, config.assetsSubDirectory);
app.use(staticPath, express.static('./static'));

var uri = 'http://localhost:' + port;

devMiddleware.waitUntilValid(function() {
    console.log('> Listening at ' + uri + '\n');
});

module.exports = app.listen(port, function(err) {
    if (err) {
        console.log(err);
        return;
    }

    if (autoOpenBrowser) {
        opn(uri);
    }
});
