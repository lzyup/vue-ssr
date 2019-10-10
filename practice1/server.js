//第一步：创建一个Vue实例
const Vue = require('vue');
const app = new Vue({
    template: `<div>Hello World</div>`
})

//第二步：创建一个renderer
const renderer = require('vue-server-renderer').createRenderer()

//第三步：将Vue实例渲染为HTML
// renderer.renderToString(app, (err, html) => {
//     if (err) throw err
//     console.log(html);
//     // => <div data-server-renderer="true"></div>
// })

//在2.5.0+如果没有传入回调函数，则会返回Promise
renderer.renderToString(app).then(html => {
    console.log(html)
}).catch(err => {
    console.error(err)
})