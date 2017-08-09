var path = require('path'),
    config = require('./config')[process.env.NODE_ENV],
    ExtractTextPlugin = require('extract-text-webpack-plugin'),
    fs = require('fs'),
    iconv = require('iconv-lite');

exports.assetsPath = function(_path) {
    return path.posix.join(config.assetsSubDirectory, _path);
};

exports.cssLoaders = function(options) {
    options = options || {};

    function generateLoaders(loaders) {
        var sourceLoader = loaders.map(function(loader) {
            var extraParamChar;
            if (/\?/.test(loader)) {
                loader = loader.replace(/\?/, '-loader?');
                extraParamChar = '&';
            } else {
                loader = loader + '-loader';
                extraParamChar = '?';
            }
            return loader + (options.sourceMap ? extraParamChar + 'sourceMap' : '');
        }).join('!');

        // Extract CSS when that option is specified
        // (which is the case during production build)
        if (options.extract) {
            return ExtractTextPlugin.extract({
                use: sourceLoader,
                fallback: 'style-loader'
            });
        } else {
            return ['style-loader', sourceLoader].join('!');
        }
    }

    var result = {
        css: generateLoaders(['css'])
            // postcss: generateLoaders(['css']),
            // less: generateLoaders(['css', 'less']),
            // sass: generateLoaders(['css', 'sass?indentedSyntax']),
            // scss: generateLoaders(['css', 'sass']),
            // stylus: generateLoaders(['css', 'stylus']),
            // styl: generateLoaders(['css', 'stylus']
            // )
    };
    return result;
};

exports.styleLoaders = function(options) {
    var output = [],
        loaders = exports.cssLoaders(options);
    for (var extension in loaders) {
        var loader = loaders[extension];
        output.push({
            test: new RegExp('\\.' + extension + '$'),
            loader: loader
        });
    }
    return output;
};

/**
 * [UTF82GBK 将UTF8编码文件转换为GBK文件]
 */
exports.UTF82GBK = function(filename) {
    fs.readFile(filename, function(err, data) {
        if (err) {
            throw err
            return;
        }
        var strUTF8 = iconv.decode(data, 'utf-8');
        var strGBK = iconv.encode(strUTF8, 'gbk');
        fs.writeFile(filename, strGBK, null, function(err) {
            if (err) {
                throw err
            };
        });
    });
};
