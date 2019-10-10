const fs = require('fs')
const Vue = require('vue')
const server = require('express')();
const VueServerRenderer = require('vue-server-renderer');
const renderer = VueServerRenderer.createRenderer({
    template: fs.readFileSync('./index.template.html', 'utf-8')
})

const context = {
    title: 'vue ssr practice3',
    meta: `<meta name="theme-color" content="#4285f4">`,
    content: '这是服务端插入的内容，由renderToString第二个参数context提供',
    footer: 'Final Content'
}

server.get('*', (req, res) => {
    const app = new Vue({
        data: {
            url: req.url,
            text: `项目仓库地址： <a href="https://github.com/lzyup/vue-ssr" target="_blank">vue-ssr-lessons</a>`,
        },
        template: `
            <div>
                <div>访问的URL是：{{url}}</div>
                <div v-htlm="text"></div>
                <br/>
            </div>
        `
    })

    renderer.renderToString(app, context).then(html => {
        //这里输出就是将内容插入到模板后的，整个html内容
        res.send(`${html}`)
    }).catch(err => {
        res.status(500).end("Internal Server Error")
        return;
    })
})

/**
 * 下面是两种server的方式
 */

server.set('port', process.env.PORT || 8888)
let hostname = '0.0.0.0';
server.listen(server.get('port'), hostname, () => {
    console.log(`Server running at http://${hostname}:${server.get('port')}`)
})

// const port = process.env.PORT || 8888
// server.listen(port, () => {
//   console.log(`server started at localhost:${port}`)
// })


