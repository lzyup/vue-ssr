const merge = require('webpack-merge');
const base = require('./webpack.base.conf');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = merge(base,{
    //指定Node环境，避免非Node环境API报错
    target:'node',
    entry:{
        server:'./entry-server.js'
    },
    output:{
        filename:'[name].js',
        //此处告知 server bundel使用Node风格导出模块
        libraryTarget:'commonjs2'
    },
    plugins:[
        new HtmlWebpackPlugin({
            template:'./index.ssr.html',
            filename:'index.ssr.html',
            files:{
                js:'client.js'
            },
            excludeChunks:['server']
        })
    ]
})