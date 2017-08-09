var path = require('path'),
    utils = require('./utils'),
    webpack = require('webpack'),
    config = require('./config')[process.env.NODE_ENV],
    merge = require('webpack-merge'),
    baseWebpackConfig = require('./webpack.base.conf'),
    HtmlWebpackPlugin = require('html-webpack-plugin'),
    ExtractTextPlugin = require('extract-text-webpack-plugin');

var webpackConfig = merge(baseWebpackConfig, {
    module: {
        rules: utils.styleLoaders({
            sourceMap: config.productionSourceMap,
            extract: true
        })
    },
    devtool: config.productionSourceMap ? '#source-map' : false,
    output: {
        path: config.assetsRoot,
        // filename: utils.assetsPath('js/[name].js'),
        // chunkFilename: utils.assetsPath('js/[id].js')
        filename: utils.assetsPath('js/[name].js'),
        chunkFilename: utils.assetsPath('js/[id].js')
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env': process.env.NODE_ENV
        }),
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false,
                screw_ie8: false
            },
            output: {
                comments: false,
                ascii_only: true,
                screw_ie8: false
            },
            mangle: {
                screw_ie8: false
            }
        }),
        // extract css into its own file
        // new ExtractTextPlugin(utils.assetsPath('css/[name].[contenthash].css')),
        // generate dist index.html with correct asset hash for caching.
        // you can customize output by editing /index.html
        // see https://github.com/ampedandwired/html-webpack-plugin
        new HtmlWebpackPlugin({
            filename: config.index,
            template: config.template,
            inject: false,
            // minify: {
                // removeComments: true,
                // collapseWhitespace: true,
                // removeAttributeQuotes: true
                    // more options:
                    // https://github.com/kangax/html-minifier#options-quick-reference
            // },
            // necessary to consistently work with multiple chunks via CommonsChunkPlugin
            chunksSortMode: 'dependency'
        }),
        // split vendor js into its own file
        // new webpack.optimize.CommonsChunkPlugin({
        //     name: 'vendor',
        //     minChunks: function(module, count) {
        //         // any required modules inside node_modules are extracted to vendor
        //         return (
        //             module.resource &&
        //             /\.js$/.test(module.resource) &&
        //             ((module.resource.indexOf(path.join(__dirname, '../node_modules')) === 0) || (module.resource.indexOf(path.join(__dirname, '../src/components')) === 0) || (module.resource.indexOf(path.join(__dirname, '../src/common')) === 0))
        //         );
        //     }
        // }),
        // extract webpack runtime and module manifest to its own file in order to
        // prevent vendor hash from being updated whenever app bundle is updated
        // new webpack.optimize.CommonsChunkPlugin({
        //     name: 'manifest',
        //     chunks: ['vendor']
        // })
    ]
});

if (config.productionGzip) {
    var CompressionWebpackPlugin = require('compression-webpack-plugin')

    webpackConfig.plugins.push(
        new CompressionWebpackPlugin({
            asset: '[path].gz[query]',
            algorithm: 'gzip',
            test: new RegExp(
                '\\.(' +
                config.build.productionGzipExtensions.join('|') +
                ')$'
            ),
            threshold: 10240,
            minRatio: 0.8
        })
    );
}

if (config.bundleAnalyzerReport) {
    var BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
    webpackConfig.plugins.push(new BundleAnalyzerPlugin());
}

module.exports = webpackConfig;
