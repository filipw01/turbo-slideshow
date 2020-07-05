<template>
  <div class="flex-column">
    <hello-world msg="test" />
    <label
      >Nazwa pokoju
      <input type="text" v-model="roomName" />
    </label>
    <label
      >Hasło pokoju
      <input type="password" v-model="roomPassword" />
    </label>
    <button :disabled="!connected" @click="createRoom">Create room</button>
  </div>
</template>

<script>
import io from 'socket.io-client';
import HelloWorld from './components/HelloWorld.vue';

export default {
  name: 'App',
  components: {
    HelloWorld,
  },
  data() {
    return {
      roomName: '',
      roomPassword: '',
      socket: {},
      connected: false,
    };
  },
  mounted() {
    this.socket = io('http://localhost:8080');
    this.socket.on('connect', () => {
      this.connected = true;
    });
    this.socket.on('create/success', (arg) => {
      console.log(arg);
    });
    this.socket.on('create/error', (arg) => {
      console.log(arg);
    });
  },
  methods: {
    async createRoom() {
      this.socket.emit('create', { name: this.roomName, password: this.roomPassword });
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
