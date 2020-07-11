<template>
  <div class="flex-column">
    <h2 class="title">Join Room</h2>
    <label>
      Nazwa pokoju
      <input type="text" v-model="roomName" />
    </label>
    <label>
      Hasło pokoju
      <input type="password" v-model="roomPassword" />
    </label>
    <button :disabled="!connected" @click="joinRoom">
      Join
    </button>
    <router-link class="new-room-link" to="/create-room"
      >or create your own room</router-link
    >
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
    const roomName = ref('');
    const roomPassword = ref('');
    async function joinRoom() {
      props.socket.emit('join', {
        name: roomName.value,
        password: roomPassword.value,
      });
    }
    function joinSuccess() {
      sessionStorage.setItem(
        'roomPassword',
        roomPassword.value,
      );
      router.push(`/room/${roomName.value}`);
    }
    function joinError(error) {
      emit('error', error);
    }
    return {
      roomName,
      roomPassword,
      joinRoom,
      ...useSocketConnect(props.socket),
      ...useSocketEvent(
        props.socket,
        'join/success',
        joinSuccess,
      ),
      ...useSocketEvent(
        props.socket,
        'join/error',
        joinError,
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
