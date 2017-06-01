var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var OfflinePlugin = require('offline-plugin');
var path = require('path');

module.exports = {
  entry: {
    app: './src/main.js'
  },
  output: {
    path: path.resolve(__dirname, './public'),
    publicPath: '/public/',
    filename: 'bundle.js'
  },
  resolve: {
    modules: [
      path.resolve(__dirname, "./node_modules"),
    ],
    extensions: ['.js', '.json'],
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          loaders: {
            scss: 'vue-style-loader!css-loader!sass-loader',
            sass: 'vue-style-loader!css-loader!sass-loader'
          },
          extractCSS: true
        }
      },
      { test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader'},
      { test: /\.json$/, loader: 'json-loader'},
      { test: /\.(png|jpg)$/, loader: 'file-loader' },
      { test: /\.(png|jpg)$/, loader: 'url-loader?limit=10000'},
      { test: /\.(woff|woff2)(\?v=\d+\.\d+\.\d+)?$/, loader: 'url-loader?limit=10000&mimetype=application/font-woff' },
      { test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, loader: 'url-loader?limit=10000&mimetype=application/octet-stream' },
      { test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: 'file-loader' },
      { test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: 'url-loader?limit=10000&mimetype=image/svg+xml' },
      { test: /\.css$/, loader: 'style-loader!css-loader' },
      {
        test: /\.scss$/,
        use: [{
            loader: "style-loader"
        }, {
            loader: "css-loader"
        }, {
            loader: "sass-loader",
            options: {
                includePaths: [
                  path.resolve(__dirname, "./node_modules/materialize-css/sass"),
                  path.resolve(__dirname, "./src/styles"),
                ]
            }
        }]
      }
    ]
  },
  node: {
    console: true,
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
  },
  plugins: [
    new webpack.IgnorePlugin(/regenerator|nodent|js-beautify/, /ajv/),
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
    new ExtractTextPlugin('[name].min.css'),
    // Usually good to put this plugin last
    new OfflinePlugin({
      publicPath: '/public/',
      relativePaths: false
    })
  ]
}
