<template>
  <div class="flex-column">
    <h2 class="title">
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
    <router-link class="new-room-link" to="/create-room">or create your own room</router-link>
  </div>
</template>

<script>
import useSocketConnect from '../compositions/socketConnect';
import useSocketEvent from '../compositions/socketEvent';

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
    function joinSuccess() {
      sessionStorage.setItem('roomPassword', this.roomPassword);
      this.$router.push(`/room/${this.roomName}`);
    }
    function joinError(arg) {
      console.log(arg);
    }
    return {
      ...useSocketConnect(props.socket),
      ...useSocketEvent(props.socket, 'join/success', joinSuccess),
      ...useSocketEvent(props.socket, 'join/error', joinError),
    };
  },
  methods: {
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
.title {
  margin-top: 0;
  margin-bottom: 24px;
  font-size: 34px;
  font-weight: 500;
  line-height: 40px;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue',
    Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol',
    'Noto Color Emoji';
}
.flex-column {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.new-room-link {
  margin-top: 18px;
  color: #1c51a0;
  text-decoration: none;
  font-weight: 500;
}
</style>
