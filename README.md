### SSR的作用
- seo问题，有利于搜索引擎蜘蛛抓取网站内容，利于网站的收录和排名
- 首屏加载过慢的问题，例如现在成熟的SPA项目中，打开首页需要加载很多资源，通过服务端渲染可以加速首屏渲染。

首屏的渲染是node发送过来的html字符串，并不依赖于js文件了，这就会使用户更快的看到页面的内容。

### 实战demo
[源码地址](https://github.com/lzyup/vue-ssr)

### 一、 简单的前端渲染demo(纯展示)

这个比较简单就直接上效果图了

![效果图](https://raw.githubusercontent.com/lzyup/vue-ssr/master/demo1/images/demo1.jpg)
### 二、后端渲染（纯展示）
#### 1、区分入口entry.js
#### `main.js`</br>
这是应用的通用`entry`。作用是使用`export`导出一个`createApp`函数
```
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
```

#### `entry-client.js`</br>
客户端创建应用并挂载到DOM上

```
const createApp = require('./main')
const app = createApp();
app.$mount('#app');
```

#### `entry-server.js`</br>
服务器entry使用工厂函数创建的实例，在每次渲染中重复调用此函数。此时，除了创建和返回应用程序实例之外，它不会做太多的事情。
```
const createApp = require('./main.js');
module.exports = createApp;
```

#### 2、区分`webpack`打包配置
分为三个配置文件：base,client和server。基本配置(base config)包含两个环境共享的配置，例如：输出路径(output path),别名(alias)和loader。服务器配置(server config)和客户端配置(client config)，可以通过使用`webpack-merge`来简单地扩展基本配置。

这里只贴出服务端配置
#### 服务器配置(Server Config)
```
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
```

![效果图](https://raw.githubusercontent.com/lzyup/vue-ssr/master/demo2/images/demo2.jpg)
#### 3、服务端渲染逻辑
`vue-server-render`提供一个`createBundleRenderer`的API，支持热重载（支持更新后的server的bundle文件，然后重新创建renderer实例）</br>
相关逻辑代码如下：
```
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
```
bundleRender在调用`renderToString`时，会自动执行「由bundle创建的应用程序实例」所导出的函数（传入上下文作为参数），然后渲染它。


### 三、后端渲染（包含网络请求数据）
#### 思路
- 在渲染之前，预先获取所有的网络数据，然后存储到Vuex的Store中
- 后端渲染的时候，通过Vuex将获取到的网络数据分别注入到各个组件中
- 将全部网络数据埋在`window.INITIAL_STATE`中，通过HTML传递到浏览器端
- 浏览器端通过Vuex将`window.INITIAL_STATE`里面的网络数据分别注入到各个组件

#### 配置带逻辑的组件
在组件上暴露一个自定义静态函数`asyncData`。需要注意的是，此函数会在组件实例化之前调用，所以它无法访问`this`
```
// store.js
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

function fetchBar(){
    return new Promise(function (resolve,reject) {
        resolve('bar ajax 返回数据')
    });
}

function fetchFoo() {
    return new Promise(function (resolve, reject) {
        resolve('foo ajax 返回数据');
    });
}

export default function createStore(){
    return new Vuex.Store({
        state:{
            bar:'',
            foo:''
        },
        actions:{
            fetchBar({commit}){
                return fetchBar().then(msg=>{
                    commit('setBar',{msg});
                })
            },
            fetchFoo({ commit }) {
                return fetchFoo().then(msg => {
                    commit('setFoo', { msg })
                })
            }
        },
        mutations:{
            setBar(state,{msg}){
                Vue.set(state,'bar',msg);
            },
            setFoo(state,{msg}){
                Vue.set(state,'foo',msg);
            }
        }
    })
}


// Bar.vue

<template>
    <div class="bar">
        <h1>Bar</h1>
        <p>ajax数据：{{bar}}</p>
    </div>
</template>

<script>
export default {
    asyncData({store}){
        return store.dispatch('fetchBar')
    },
    computed:{
        bar(){
            return this.$store.state.bar
        }
    },
    created(){
        console.log('bar created')
    }

}
</script>

<style>
    .bar{
        background:#9e9ecd
    }
</style>

```

#### 如何在渲染前预获取所有网络数据
```
//entry-server.js

import Vue from 'vue';
import App from './App.vue';
import createStore from './store';

export default function(context){
    //context 是 vue-server-render注入参数
    const store = createStore();
    let app = new Vue({
        store,
        render:h=>h(App)
    });

    //找到所有prefetchData方法
    let components = App.components;
    let prefetchFns = [];
    for(let key in components){
        if(!components.hasOwnProperty(key)) continue;
        let component = components[key];
        if(component.asyncData){
            prefetchFns.push(component.asyncData({
                store
            }))
        }
    }

    return Promise.all(prefetchFns).then((res)=>{
        //在所有组件的Ajax都返回之后，才最终返回app进行渲染
        context.state = store.state;
        //context.state 赋值成什么，windwo.__INITIAL_STATE__就是什么
        return app;
    })
}
```
#### 为何还需要将网络请求得到的数据通过`window.INITIAL_STATE`传递到前端？

可以看到我们打包出来的`dist`目录下的`index.ssr.html`文件
```
<body>
    <div id="app">
        <!--vue-ssr-outlet-->
    </div>
    <script type="text/javascript" src="client.js"></script>
</body>
```
注意到引入的`script`是`client.js`接管浏览器端的后续操作；而且客户端和浏览器也是通过工厂函数分别创建的`vue实例`和`store实例`，数据也是互不干扰的。浏览器中后续的操作是`client.js`来接管的，因此需要把网络数据写入`window.INITIAL_STATE`中，使`client.js`保持同样一份数据。

#### 参考链接
[link1](https://github.com/youngwind/blog/issues/112)</br>
[link2](https://segmentfault.com/a/1190000016637877#item-2-1)




