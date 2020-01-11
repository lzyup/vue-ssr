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