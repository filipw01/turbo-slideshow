<template>
  <img @click="createRoom" alt="Vue logo" src="./assets/logo.png" />
  <HelloWorld msg="Hello Vue 3.0 + Vite" />
</template>

<script>
import HelloWorld from "./components/HelloWorld.vue";

export default {
  name: "App",
  components: {
    HelloWorld,
  },
  methods: {
    createRoom() {
      fetch("http://localhost:8080/create", {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
        },
        // headers:
        body: JSON.stringify({
          name: "test",
          password: "test",
        }),
      });
    },
  },
};
</script>
