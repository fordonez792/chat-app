const path=require('path')
const webpack = require('webpack');
const dotenv = require('dotenv').config({ path: __dirname + '/.env' })

module.exports={
  mode: 'development',
  entry: './index.js',
  output: {
    filename: 'main.js',
    publicPath: '/',
    path: path.resolve(__dirname, 'public')
  },
  
  target: 'web',
  devServer: {
    port: '3000',
    static: path.resolve(__dirname, "public"),
    open: true,
    hot: true,
    liveReload: true,
    historyApiFallback: true
  },
  resolve: {
    extensions: ['.js', '.jsx', '.json']
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.REACT_APP_URL': JSON.stringify(process.env.REACT_APP_URL),
    })
  ],
}