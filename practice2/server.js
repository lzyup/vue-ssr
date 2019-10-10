const Vue = require('vue');
const server = require('express')()
const VueServerRenderer = require('vue-server-renderer')
const renderer = VueServerRenderer.createRenderer();

server.get('*', (req, res) => {
    const app = new Vue({
        data: {
            url: req.url,
            text: `vue ssr lessons from: <a href="https://github.com/lzyup" target="_blank">`,
            repository: `项目仓库地址： <a href="https://github.com/lzyup/vue-ssr" target="_blank">vue-ssr-lessons</a>`
        },
        template: `
        <div>
            <div>当前访问的URL是：{{url}}</div>
            <div v-html="text"></div>
            <div v-html="repository"></div>
        </div>`
    })

    renderer.renderToString(app).then(html => {
        res.send(`
            <!DOCTYPE html>
            <html lang="en">
                <meta chartset="utf-8">
                <head><title>Vue ssr</title></head>
                <body>${html}</body>
            </html>
        `)
    }).catch(err => {
        res.status(500).end('Internal Server Error')
        return
    })
})


/**
 * 下面是两种起 server 的方式
 */

server.set('port', process.env.PORT || 8888)
let hostname = '0.0.0.0'
server.listen(server.get('port'), hostname, () => {
    console.log(`Server running at http://${hostname}:${server.get('port')}`)
})

 // const port = process.env.PORT || 8888
// server.listen(port, () => {
//   console.log(`server started at localhost:${port}`)
// })