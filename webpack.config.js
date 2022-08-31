const path = require("path");

module.exports = [
  {
    entry: "./client/index.tsx",
    output: {
      path: path.resolve(__dirname, "public"),
      filename: "bundle.js",
    },
    module: {
      rules: [
        {
          test: /\.tsx$/,
          exclude: /node_modules/,
          loader: "ts-loader",
          options: {
            configFile: "client/tsconfig.json",
          },
        },
      ],
    },
    mode: "development",
    devServer: {
      static: {
        directory: path.join(__dirname, "./dist"),
      },
    },
  },
];
