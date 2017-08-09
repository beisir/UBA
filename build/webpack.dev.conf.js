var utils = require('./utils'),
    webpack = require('webpack'),
    config = require('./config')[process.env.NODE_ENV],
    merge = require('webpack-merge'),
    baseWebpackConfig = require('./webpack.base.conf'),
    HtmlWebpackPlugin = require('html-webpack-plugin'),
    FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin');


// add hot-reload related code to entry chunks
Object.keys(baseWebpackConfig.entry).forEach(function(name) {
    baseWebpackConfig.entry[name] = ['./build/dev-client'].concat(baseWebpackConfig.entry[name]);
});

module.exports = merge(baseWebpackConfig, {
    module: {
        rules: utils.styleLoaders({ sourceMap: config.cssSourceMap })
    },
    // cheap-module-eval-source-map is faster for development
    devtool: '#cheap-module-eval-source-map',
    plugins: [
        new webpack.DefinePlugin({
            'process.env': process.env.NODE_ENV
        }),
        // https://github.com/glenjamin/webpack-hot-middleware#installation--usage
        new webpack.HotModuleReplacementPlugin(),
        // new webpack.NoEmitOnErrorsPlugin(),
        // https://github.com/ampedandwired/html-webpack-plugin
        new HtmlWebpackPlugin({
            filename: config.index,
            template: config.template,
            inject: false
        }),
        new FriendlyErrorsPlugin()
    ]
});
