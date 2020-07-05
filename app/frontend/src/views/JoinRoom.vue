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
    <button :disabled="!connected" @click="joinRoom">Join room</button>
  </div>
</template>

<script>
export default {
  name: 'App',
  props: {
    socket: Object,
  },
  data() {
    return {
      connected: this.socket.connected,
      roomName: '',
      roomPassword: '',
    };
  },
  mounted() {
    this.socket.on('connect', () => {
      this.connected = true;
    });
    this.socket.on('disconnect', () => {
      this.connected = false;
    });
    this.socket.on('join/success', (arg) => {
      console.log(arg);
      this.$router.push(`/room/${this.roomName}`);
    });
    this.socket.on('join/error', (arg) => {
      console.log(arg);
    });
  },
  methods: {
    async joinRoom() {
      this.socket.emit('join', { name: this.roomName, password: this.roomPassword });
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
