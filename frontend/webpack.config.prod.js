const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const BrotliPlugin = require("brotli-webpack-plugin");
//const WebpackBundleAnalyzer = require('webpack-bundle-analyzer');

module.exports = {
    mode: "production",
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
    devtool: false,
    performance: {
        hints: false
    },
    plugins: [
        // new WebpackBundleAnalyzer.BundleAnalyzerPlugin(),
        new HtmlWebpackPlugin({ template: "index.html" }),
        new CopyWebpackPlugin({ patterns: [{ from: "public" }] }),
        new MiniCssExtractPlugin(),
        new BrotliPlugin({
            asset: "[path].br[query]",
            test: /\.(js|css|html|svg)$/,
            threshold: 10240,
            minRatio: 0.8
        })
    ]
};
