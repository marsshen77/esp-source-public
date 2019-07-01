const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
module.exports = {
    entry: "./src/index.jsx",
    output: {
        filename: "base.js",
        path: __dirname + "/dist"
    },
    resolve: {
        extensions: [".jsx", ".js", ".json"],
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader'
                ]
            },
            {
                test: /\.less$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    "postcss-loader",
                    'less-loader'
                ]
            },
            {
                test: /\.(png|svg|jpg|gif)$/,
                use: {
                    loader: 'url-loader',
                    options: {
                        outputPath: 'images/', // 图片输出的路径
                        limit: 10 * 1024
                    }
                }
            },
            { test: /\.jsx?$/, exclude: /node_modules/, loader: "babel-loader" }
        ]
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: "[name].css",
            chunkFilename: "[id].css"
        }),
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            filename: 'index.html', // 最终创建的文件名
            template: path.join(__dirname, 'src/template.html') // 指定模板路径
        })
    ],
    externals: {
        "react": "React", //外部引入React包，减少打包体积，同时可以供自定义组件使用全局下的React变量
        "react-dom": "ReactDOM"
    }
};