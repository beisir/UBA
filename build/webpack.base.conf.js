var path = require('path'),
    utils = require('./utils'),
    webpack = require('webpack'),
    autoprefixer = require('autoprefixer'),
    config = require('./config')[process.env.NODE_ENV],
    ExtractTextPlugin = require('extract-text-webpack-plugin');

function resolve(dir) {
    return path.join(__dirname, '..', dir);
}

module.exports = {
    entry: {
        uba: './src/uba.js'
    },
    output: {
        path: config.assetsRoot,
        filename: '[name].js',
        publicPath: config.assetsPublicPath
    },
    resolve: {
        extensions: ['', '.js', '.css']
    },
    module: {
        loaders: [{
            test: /\.css$/,
            loader: ExtractTextPlugin.extract('style-loader', 'css-loader?' + JSON.stringify({
                discardComments: {
                    removeAll: true
                }
            }))
        }, {
            test: /\.json$/,
            loader: 'json-loader'
        }, {
            test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
            loader: 'url-loader',
            query: {
                limit: 10000,
                name: utils.assetsPath('img/[name].[hash:7].[ext]')
            }
        }, {
            test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
            loader: 'url-loader',
            query: {
                limit: 10000,
                name: utils.assetsPath('fonts/[name].[hash:7].[ext]')
            }
        }, {
            test: /\.js?$/,
            loaders: ['es3ify-loader']
        }]
    },
    plugins: [
        new ExtractTextPlugin(utils.assetsPath('css/[name].[contenthash].css')),
    ],
    postcss: function() {
        return [autoprefixer];
    }
};
