var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var OfflinePlugin = require('offline-plugin');
var path = require('path');

module.exports = {
  entry: {
    app: './src/main.js'
  },
  output: {
    path: './public',
    publicPath: '/public/',
    filename: 'bundle.js'
  },
  module: {
    noParse: /node_modules\/json-schema\/lib\/validate\.js/,
    preLoaders: [
      { test: /\.js$/, exclude: /node_modules/, loader: 'jscs-loader' }
    ],
    loaders: [
      { test: /\.vue$/, loader: 'vue' },
      { test: /\.js$/, exclude: /node_modules/, loader: 'babel'},
      { test: /\.json$/, loader: 'json'},
      { test: /\.(png|jpg)$/, loader: 'file' },
      { test: /\.(png|jpg)$/, loader: 'url?limit=10000'},
      { test: /\.(woff|woff2)(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&mimetype=application/font-woff' },
      { test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&mimetype=application/octet-stream' },
      { test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: 'file' },
      { test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&mimetype=image/svg+xml' },
      { test: /\.css$/, loader: 'style-loader!css-loader' },
      { test: /\.scss$/, loaders: ['style', 'css', 'sass'] }
    ]
  },
  node: {
    console: true,
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
  },
  sassLoader: {
    includePaths: [
      path.resolve(__dirname, "./node_modules/materialize-css/sass"),
      path.resolve(__dirname, "./src/styles")
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    }),
    new ExtractTextPlugin('[name].min.css', {
      allChunks: true
    }),
    // Usually good to put this plugin last
    new OfflinePlugin({
      publicPath: '/public/',
      relativePaths: false
    })
  ],
  vue: {
    loaders: {
      css: ExtractTextPlugin.extract('css')
    }
  }
}
