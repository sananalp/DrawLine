const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './src/app.ts',

  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: ''
  },

  resolve: {
    extensions: ['.ts', '.js']
  },

  module: {
    rules: [
      {
        test: /\.ts$/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true
          }
        },
        exclude: /node_modules/
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg)$/,
        type: 'asset/resource'
      }
    ]
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: './public/template.html',
      minify: false
    })
  ],

  devtool: 'eval-source-map',

  devServer: {
    static: path.resolve(__dirname, 'dist'),
    hot: true,
    open: false,
    port: 8080,
    allowedHosts: "all",
  }
};
