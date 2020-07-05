<template>
  <div class="flex-column"><button @click="changePage">Change Page</button></div>
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
    this.socket.on('changePage', (arg) => {
      console.log(arg);
    });
  },
  methods: {
    changePage() {
      this.socket.emit('changePage', 1);
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
