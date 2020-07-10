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
      Create Room
    </h2>
    <label>
      Nazwa pokoju
      <input type="text" v-model="roomName" />
    </label>
    <label>
      Hasło pokoju
      <input type="password" v-model="roomPassword" />
    </label>
    <button :disabled="!connected" @click="createRoom">Create room</button>
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
    this.socket.on('create/success', this.createSuccessHandler);
    this.socket.on('create/error', this.createErrorHandler);
  },
  beforeUnmount() {
    this.socket.off('create/success', this.createSuccessHandler);
    this.socket.off('create/error', this.createErrorHandler);
  },
  methods: {
    createSuccessHandler() {
      sessionStorage.setItem('roomPassword', this.roomPassword);
      this.$router.push(`/room/${this.roomName}`);
      this.socket.emit('join', {
        name: this.roomName,
        password: this.roomPassword,
      });
      this.$router.push(`/room/${this.roomName}`);
    },
    createErrorHandler(arg) {
      console.log(arg);
    },
    async createRoom() {
      this.socket.emit('create', {
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
</style>
