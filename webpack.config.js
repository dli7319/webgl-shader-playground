const MonacoWebpackPlugin = require("monaco-editor-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const path = require("path");

const isDevelopment = process.env.NODE_ENV !== "production";

module.exports = {
  mode: isDevelopment ? "development" : "production",
  entry: "./src/index.tsx",
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        loader: "ts-loader",
      },
      {
        test: /\.css$/i,
        use: [
          "style-loader",
          {
            loader: "css-loader",
            options: {
              modules: {
                // Keep `import styles from "*.module.css"` working — css-loader 7
                // switched to named exports by default.
                namedExport: false,
              },
            },
          },
        ],
      },
      {
        test: /\.(vert|frag)$/,
        type: "asset/source",
      },
    ],
  },
  resolve: {
    extensions: ["*", ".tsx", ".ts", ".js", ".jsx"],
  },
  plugins: [
    new MonacoWebpackPlugin(),
    new CopyPlugin({
      patterns: [{ from: "public", to: "." }],
    }),
  ],
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "dist"),
    clean: true,
  },
  devServer: {
    hot: true,
    static: {
      directory: path.join(__dirname, "public"),
    },
    compress: true,
  },
};
