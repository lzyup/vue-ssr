<template>
    <div>
        <h1>App.vue</h1>
        <p>vue with vue</p>
        <hr>
        <foo></foo>
        <bar></bar>
    </div>
</template>

<script>
import Foo from './components/Foo.vue'
import Bar from './components/Bar.vue'
export default {
    components:{
        Foo,
        Bar
    }
}
</script>

<style>

</style>
