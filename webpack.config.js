// webpack.config.js
var webpack = require('webpack');

module.exports = {
    entry: {
        entry: __dirname + '/app.js'
    },
    output: {
        filename: '[name].bundle.js'
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
                query: {
                    presets: ['es2015']
                }
            }
        ]
    },
    plugins: [
        new webpack.optimize.UglifyJsPlugin()
    ]
}
