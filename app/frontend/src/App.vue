<template>
  <div class="flex-column">
    <label
      >Nazwa pokoju
      <input type="text" v-model="roomName" />
    </label>
    <label
      >Hasło pokoju
      <input type="password" v-model="roomPassword" />
    </label>
    <button @click="createRoom">Create room</button>
  </div>
</template>

<script>
import HelloWorld from "./components/HelloWorld.vue";

const webSocket = new WebSocket("ws://localhost/socket.io");
webSocket.onopen = (event) => {
  console.log(event);
};

export default {
  name: "App",
  components: {
    HelloWorld,
  },
  data() {
    return {
      roomName: "",
      roomPassword: "",
    };
  },
  methods: {
    async createRoom() {
      const response = await fetch("http://localhost:8080/create", {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: this.name,
          password: this.roomPassword,
        }),
      });
      const data = await response.json();
      if (data.success) {
      }
      console.log(data);
    },
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
