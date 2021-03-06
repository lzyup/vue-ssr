const fs = require('fs');
const path = require('path');
const express = require('express');
const server = express();
server.use(express.static('dist'));
// const createApp = require(path.resolve(__dirname,'dist/server.js'))

const bundle = fs.readFileSync(path.resolve(__dirname,'dist/server.js'),'utf-8');
const renderer = require('vue-server-renderer').createBundleRenderer(bundle,{
    template:fs.readFileSync(path.resolve(__dirname,'dist/index.ssr.html'),'utf-8')
});

server.get('/index',(req,res)=>{
    // const app = createApp();
    const context = {url:req.url}
    //这里无需传入一个应用程序，因为在执行bundle时已经自动创建过了
    renderer.renderToString(context,(err,html)=>{
        if(err){
            console.error(err);
            res.status(500).end('服务器内部错误')
            return;
        } 
        res.end(html)
    })
})

server.listen(8002,()=>{
    console.log('后端渲染服务器启动，端口号为:8002')
})

const feServer = express();
feServer.use(express.static('dist'));

feServer.get('/index',(req,res)=>{
    //输出html
    let html = fs.readFileSync(path.resolve(__dirname,'dist/index.html'),'utf-8');
    res.end(html);
})

feServer.listen(8003,()=>{
    console.log('前端渲染服务器启动，端口号为：8003')
})