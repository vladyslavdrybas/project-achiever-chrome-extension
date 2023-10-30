const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
module.exports = {
  mode: "production",
  entry: {
    "firebase-messaging-sw": path.resolve(__dirname, "..", "src", "background.ts"),
    "assets/js/signin": path.resolve(__dirname, "..", "src", "auth", "signin.ts"),
  },
  output: {
    path: path.join(__dirname, "../dist"),
    filename: "[name].js",
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new CopyPlugin({
      patterns: [{from: ".", to: ".", context: "public"}]
    }),
  ],
};
