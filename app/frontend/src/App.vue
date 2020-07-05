<template>
  <div class="flex-column">
    <hello-world msg="test" />
    <router-link to="/">Home</router-link>
    <router-link to="/new-room">Create</router-link>
    <router-link to="/join-room">Join</router-link>
    <router-view></router-view>
  </div>
</template>

<script>
import HelloWorld from './components/HelloWorld.vue';

export default {
  name: 'App',
  components: {
    HelloWorld,
  },
};
</script>
<style scoped>
.flex-column {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.flex-column > * {
  margin: 6px 0;
}
</style>
