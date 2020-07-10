<template>
  <div class="flex-column">
    <h2
      style="
      margin-top: 0;
    margin-bottom: 24px;
    font-size: 34px;
    font-weight: 500;
    line-height: 40px;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
    'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji',
    'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
    "
    >
      Join Room
    </h2>
    <label>
      Nazwa pokoju
      <input type="text" v-model="roomName" />
    </label>
    <label>
      Hasło pokoju
      <input type="password" v-model="roomPassword" />
    </label>
    <button :disabled="!connected" @click="joinRoom">Join</button>
    <router-link class="create-link" to="/create-room">or create your own room</router-link>
  </div>
</template>

<script>
import useSocketConnect from '../compositions/socketConnect';

export default {
  name: 'App',
  props: {
    socket: Object,
  },
  data() {
    return {
      roomName: '',
      roomPassword: '',
    };
  },
  setup(props) {
    return {
      ...useSocketConnect(props.socket),
    };
  },
  mounted() {
    this.socket.on('join/success', this.joinSuccess);
    this.socket.on('join/error', this.joinError);
  },
  beforeUnmount() {
    this.socket.off('join/success', this.joinSuccess);
    this.socket.off('join/error', this.joinError);
  },
  methods: {
    joinSuccess() {
      sessionStorage.setItem('roomPassword', this.roomPassword);
      this.$router.push(`/room/${this.roomName}`);
    },
    joinError(arg) {
      console.log(arg);
    },
    async joinRoom() {
      this.socket.emit('join', {
        name: this.roomName,
        password: this.roomPassword,
      });
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
.create-link {
  margin-top: 18px;
  color: #1c51a0;
  text-decoration: none;
  font-weight: 500;
}
</style>
