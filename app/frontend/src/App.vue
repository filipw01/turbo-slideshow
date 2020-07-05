<template>
  <div class="flex-column">
    <hello-world msg="test" />
    <router-link to="/">Home</router-link>
    <router-link to="/new-room">Create</router-link>
    <Suspense>
      <template #default>
        <router-view :name="viewName" v-slot="{ Component }">
          <transition
            name="fade"
            mode="out-in"
            @before-enter="flushWaiter"
            @before-leave="setupWaiter"
          >
            <keep-alive>
              <component :is="Component" />
            </keep-alive>
          </transition>
        </router-view>
      </template>
      <template #fallback>
        Loading...
      </template>
    </Suspense>
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
