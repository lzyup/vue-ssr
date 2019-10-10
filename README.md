# vue-ssr
### practice1
渲染一个Vue实例

### practice2
服务器集成

### practice3
使用一个页面模板

`render`只从应用程序生成HTML标记（markup）,如果不提供模板的话，那么生成的HTML标记就应该是一个完整的html内容。

提供一个额外的HTML模板，作为页面包裹容器，来包裹`renderer`生成的HTML标记

同时，模板还支持简单插值。我们可以通过传入一个“渲染上下文对象”`context`,作为`renderToString`函数的第二个参数，来提供插值数据。

