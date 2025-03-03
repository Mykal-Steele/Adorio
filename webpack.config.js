const path = require("path");
const Dotenv = require("dotenv-webpack");
const webpack = require("webpack");

module.exports = {
  mode: "development",
  entry: "./src/api/index.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.js",
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
          },
        },
      },
    ],
  },
  plugins: [
    new Dotenv(),
    new webpack.DefinePlugin({
      "process.env": JSON.stringify({
        DEBUG: process.env.DEBUG,
      }),
    }),
  ],
  resolve: {
    fallback: {
      fs: false,
      path: false,
    },
  },
};
