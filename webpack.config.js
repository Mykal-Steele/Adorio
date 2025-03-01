const path = require("path");
const Dotenv = require("dotenv-webpack");
const webpack = require("webpack");

module.exports = {
  mode: "development", // Change to "production" for production builds
  entry: "./src/api/index.js", // Adjust this to your entry file
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.js",
  },
  plugins: [
    new Dotenv(), // Loads variables from .env file
    new webpack.DefinePlugin({
      "process.env": JSON.stringify(process.env), // Inject process.env globally
    }),
  ],
  resolve: {
    fallback: {
      fs: false, // Disable "fs" module for the browser
      path: false,
    },
  },
};
