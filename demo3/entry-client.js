import createApp from './app'

const {app,store} = createApp();
console.log('测试window.__INITIAL_STATE__---->', window.__INITIAL_STATE__)
if(window.__INITIAL_STATE__){
    store.replaceState(window.__INITIAL_STATE__);
}

app.$mount('#app')