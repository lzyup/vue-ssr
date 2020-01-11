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
