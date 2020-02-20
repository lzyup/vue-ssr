const Vue = require('vue');
const App = require('./App.vue').default;

//导出一个工厂函数，用于创建新的
//应用程序、router和store实例
function createApp(){
    const app = new Vue({
        render: h => h(App)
    })
    return app;
}

module.exports = createApp;