const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
//const WebpackBundleAnalyzer = require('webpack-bundle-analyzer');

module.exports = {
    mode: "development",
    entry: "./src/index.tsx",
    output: {
        path: __dirname + "/dist/",
        publicPath: "/"
    },
    module: {
        rules: [
            {
                test: /\.(ts|tsx)$/,
                exclude: /node_modules/,
                resolve: {
                    extensions: [".ts", ".tsx", ".js", ".json"]
                },
                use: "ts-loader"
            },
            {
                test: /\.css$/,
                use: [MiniCssExtractPlugin.loader, "css-loader"]
            },
            {
                test: /\.(jpg|png|svg)$/i,
                loader: "url-loader",
                options: {
                    outputPath: "images"
                }
            }
        ]
    },
    devServer: {
        historyApiFallback: true
    },
    devtool: "source-map",
    plugins: [
        // new WebpackBundleAnalyzer.BundleAnalyzerPlugin(),
        new HtmlWebpackPlugin({ template: "index.html" }),
        new CopyWebpackPlugin({ patterns: [{ from: "public" }] }),
        new MiniCssExtractPlugin()
    ]
};
