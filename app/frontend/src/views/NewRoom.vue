<template>
  <div class="flex-column">
    <h2 class="title">Create Room</h2>
    <label>
      Nazwa pokoju
      <input type="text" v-model="roomName" />
    </label>
    <label>
      Hasło pokoju
      <input type="password" v-model="roomPassword" />
    </label>
    <button :disabled="!connected" @click="createRoom">
      Create room
    </button>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import useSocketConnect from '../compositions/socketConnect';
import useSocketEvent from '../compositions/socketEvent';

export default {
  name: 'App',
  props: {
    socket: Object,
  },
  setup(props, { emit }) {
    const router = useRouter();
    // TODO: Add mobile styling
    const roomName = ref('');
    const roomPassword = ref('');
    function createRoom() {
      props.socket.emit('create', {
        name: roomName.value,
        password: roomPassword.value,
      });
    }
    function createSuccess() {
      // Store in session for autojoin on reload in Room.vue
      sessionStorage.setItem(
        'roomPassword',
        roomPassword.value,
      );
      router.push(`/room/${roomName.value}/?admin=true`);
      props.socket.emit('join', {
        name: roomName.value,
        password: roomPassword.value,
      });
    }
    function createError(error) {
      emit('error', error);
    }
    return {
      roomName,
      roomPassword,
      createRoom,
      ...useSocketConnect(props.socket),
      ...useSocketEvent(
        props.socket,
        'create/success',
        createSuccess,
      ),
      ...useSocketEvent(
        props.socket,
        'create/error',
        createError,
      ),
    };
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
  font-family: system-ui, -apple-system, BlinkMacSystemFont,
    'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans',
    sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji',
    'Segoe UI Symbol', 'Noto Color Emoji';
}
.flex-column {
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
