<template>
    <div class="foo">
        <h1>Foo</h1>
        <p>ajax数据:{{foo}}</p>
    </div>
</template>

<script>
export default {
    asyncData({store}){
        return store.dispatch('fetchFoo')
    },
    computed:{
        foo(){
            return this.$store.state.foo
        }
    },
    created(){
        console.log('foo created')
    }
}
</script>

<style>
    .foo{
        background:yellow;
    }
</style>
