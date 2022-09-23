const path = require("path");

module.exports = [
  {
    entry: "./client/index.tsx",
    resolve: {
      extensions: [".ts", ".tsx", ".js", ".jsx"],
    },
    output: {
      path: path.resolve(__dirname, "public"),
      filename: "bundle.js",
    },
    module: {
      rules: [
        {
          test: /\.(tsx|ts)$/,
          exclude: /node_modules/,
          loader: "ts-loader",
          options: {
            configFile: "client/tsconfig.json",
          },
        },
        {
          test: /\.css$/i,
          use: ["style-loader", "css-loader", "postcss-loader"],
        },
        {
          test: /\.(png|svg|jpg|jpeg|gif)$/i,
          type: "asset/resource",
        },
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/i,
          type: "asset/resource",
        },
      ],
    },
    mode:
      process.env.ENVIRONMENT === "development" ? "development" : "production",
    devServer: {
      static: {
        directory: path.join(__dirname, "./dist"),
      },
    },
  },
];
